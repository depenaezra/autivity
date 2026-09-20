import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';

// Log in an existing user
export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    // If this parent registered while email confirmation was pending (no
    // session existed yet), the learner code couldn't be linked at signup
    // time. Finish that linking now that we have a real session.
    await completePendingLearnerLink();

    return data;
};

// Check if a learner code (AUT-0000) exists and is still available to link.
// Used by the parent signup screen to validate the code BEFORE creating the account.
export const checkLearnerCode = async (code: string) => {
    const { data, error } = await supabase.rpc('check_learner_code', {
        p_code: code.trim(),
    });

    if (error) {
        throw new Error(error.message);
    }

    return data as { valid: boolean; reason?: 'not_found' | 'already_linked'; student_name?: string };
};

// Link the currently signed-in parent to a student via their learner code.
// Must be called AFTER the parent has an active session (post signUp/login).
export const linkParentToLearner = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
        throw new Error('Please enter a learner code.');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    let res: { success: boolean; message: string; student_id?: string } | null = null;

    // 1. Try RPC link_parent_to_learner first
    try {
        const { data, error } = await supabase.rpc('link_parent_to_learner', {
            p_code: cleanCode,
        });
        if (!error && data) {
            res = data as any;
        }
    } catch {
        // Fall back to direct query below
    }

    // 2. If RPC did not succeed, perform direct table query and update
    if (!res || !res.success) {
        const { data: student, error: findError } = await supabase
            .from('students')
            .select('id, name, parent_id, teacher_id, learner_code')
            .ilike('learner_code', cleanCode)
            .maybeSingle();

        if (findError) {
            throw new Error(findError.message);
        }

        if (!student) {
            throw new Error(`Learner code "${cleanCode}" was not found. Please check with your teacher.`);
        }

        if (student.parent_id && student.parent_id !== user.id) {
            throw new Error('This learner code is already linked to another parent account.');
        }

        if (student.parent_id === user.id) {
            res = { success: true, message: 'This child is already linked to your account.', student_id: student.id };
        } else {
            const { error: updateError } = await supabase
                .from('students')
                .update({ parent_id: user.id })
                .eq('id', student.id);

            if (updateError) {
                throw new Error(updateError.message);
            }

            res = { success: true, message: 'Child linked successfully', student_id: student.id };
        }
    }

    if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to link learner code.');
    }

    // 3. Send notification to teacher
    if (res.student_id) {
        try {
            let parentName = 'A parent';
            const { data: parentProfile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .maybeSingle();
            if (parentProfile?.first_name) {
                parentName = `${parentProfile.first_name} ${parentProfile.last_name || ''}`.trim();
            }

            const { data: student } = await supabase
                .from('students')
                .select('name, teacher_id')
                .eq('id', res.student_id)
                .maybeSingle();

            const studentName = student?.name || 'student';

            if (student?.teacher_id) {
                await createNotification({
                    userId: student.teacher_id,
                    studentId: res.student_id,
                    title: 'Parent Connected 👨‍👩‍👧',
                    message: `${parentName} linked to ${studentName} via learner code.`,
                    type: 'general',
                    metadata: {
                        student_id: res.student_id,
                        parent_id: user.id,
                        student_name: studentName,
                        parent_name: parentName,
                    },
                });
            }
        } catch (notifErr) {
            console.error('[NOTIFICATIONS] Failed sending parent-linked notification to teacher:', notifErr);
        }
    }

    return res;
};

// Synchronize the comma-separated list of linked learner codes in profiles.learner_code
export const syncParentProfileLearnerCodes = async (userId: string) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('learner_code')
            .eq('parent_id', userId)
            .order('created_at', { ascending: true });

        if (error) return;

        const codes = (students || [])
            .map((s: any) => s.learner_code?.trim())
            .filter(Boolean);

        const joinedCodes = codes.join(', ');

        await supabase
            .from('profiles')
            .update({ learner_code: joinedCodes || null })
            .eq('id', userId);
    } catch {
        // Silently ignore sync error
    }
};

// If the logged-in user is a parent who hasn't been linked yet, but their
// signup carried one or more learner codes in their auth metadata (pending_learner_code),
// finish the link now. Safe to call any time there's a session — it's a no-op
// if there's nothing pending. This is what makes linking work even when
// Supabase requires email confirmation before a session exists.
export const completePendingLearnerLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const pendingCodesRaw = user.user_metadata?.pending_learner_code;
    if (!pendingCodesRaw) return;

    const pendingCodes = (Array.isArray(pendingCodesRaw) ? pendingCodesRaw : String(pendingCodesRaw).split(','))
        .map((c: string) => c.trim().toUpperCase())
        .filter(Boolean);

    if (pendingCodes.length === 0) return;

    try {
        for (const code of pendingCodes) {
            await linkParentToLearner(code).catch(() => null);
        }
        await syncParentProfileLearnerCodes(user.id);
        // Clear the pending code so we don't keep retrying/misreporting it
        await supabase.auth.updateUser({ data: { pending_learner_code: null } });
    } catch {
        // Silently ignore here — this is a best-effort background completion.
        // The parent can always retry manually from their profile.
    }
};

// Helper to convert JS array of strings to Postgres array literal format
const formatPostgresArray = (arr: string[]): string => {
    if (!arr || arr.length === 0) return '{}';
    return `{${arr.map(x => `"${x.replace(/"/g, '\\"')}"`).join(',')}}`;
};

// Register a new user
export const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    goals: string[],
    role: string,
    institutionOrLearnerCodes?: string | string[],
    prcNumber?: string
) => {
    let trimmedCodes: string[] = [];

    // Parents must provide at least one valid, unused learner code.
    // We check all codes BEFORE creating the auth account so bad codes never leave
    // behind an orphaned user.
    if (role === 'parent') {
        if (Array.isArray(institutionOrLearnerCodes)) {
            trimmedCodes = institutionOrLearnerCodes.map(c => (c || '').trim().toUpperCase()).filter(Boolean);
        } else if (typeof institutionOrLearnerCodes === 'string') {
            trimmedCodes = institutionOrLearnerCodes
                .split(',')
                .map(c => c.trim().toUpperCase())
                .filter(Boolean);
        }

        if (trimmedCodes.length === 0) {
            throw new Error('Please enter at least one learner code.');
        }

        for (const code of trimmedCodes) {
            const check = await checkLearnerCode(code);
            if (!check.valid) {
                if (check.reason === 'already_linked') {
                    throw new Error(`Learner code "${code}" is already linked to another parent account.`);
                }
                throw new Error(`Learner code "${code}" was not found. Please check with your teacher and try again.`);
            }
        }
    }

    const joinedCodes = trimmedCodes.join(', ');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                goals: formatPostgresArray(goals),
                user_role: role,
                role: role,
                university: role === 'teacher' ? (typeof institutionOrLearnerCodes === 'string' ? institutionOrLearnerCodes : undefined) : undefined,
                prc_number: prcNumber,
                learner_code: role === 'parent' ? joinedCodes : undefined,
                // stored so linking can be completed on first login, in case
                // this signUp doesn't return an active session (e.g. email
                // confirmation is required by the project's auth settings)
                pending_learner_code: role === 'parent' ? trimmedCodes.join(',') : null,
            }
        }
    });

    if (error) {
        // Supabase reports a used email exactly like this. Make it clear
        // this is about the EMAIL, not the learner code, since both are
        // entered on the same screen.
        if (/already registered/i.test(error.message)) {
            throw new Error(
                'That email address is already registered to an account. Please log in instead, or use a different email.'
            );
        }
        throw new Error(error.message);
    }

    // If we got an active session right away, finish linking now.
    // If not (e.g. email confirmation required), it'll complete automatically
    // the first time this parent successfully logs in (see login()).
    if (role === 'parent' && trimmedCodes.length > 0 && data.session && data.user) {
        try {
            for (const code of trimmedCodes) {
                await linkParentToLearner(code);
            }
            await syncParentProfileLearnerCodes(data.user.id);
        } catch (linkError: any) {
            // Account was created, but linking failed. Surface this clearly.
            throw new Error(
                `Your account was created, but we couldn't link the learner code: ${linkError.message} You can try again from your profile.`
            );
        }
    }
    return data;
};

// Log out the current user
export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
};
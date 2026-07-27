import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase.rpc('link_parent_to_learner', {
        p_code: code.trim(),
    });

    if (error) {
        throw new Error(error.message);
    }

    return data as { success: boolean; message: string; student_id?: string };
};

// If the logged-in user is a parent who hasn't been linked yet, but their
// signup carried a learner code in their auth metadata (pending_learner_code),
// finish the link now. Safe to call any time there's a session — it's a no-op
// if there's nothing pending. This is what makes linking work even when
// Supabase requires email confirmation before a session exists.
export const completePendingLearnerLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const pendingCode = user.user_metadata?.pending_learner_code;
    if (!pendingCode) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('learner_code')
        .eq('id', user.id)
        .single();

    if (profile?.learner_code) return; // already linked

    try {
        const link = await linkParentToLearner(pendingCode);
        if (link.success) {
            // Clear the pending code so we don't keep retrying/misreporting it
            await supabase.auth.updateUser({ data: { pending_learner_code: null } });
        }
    } catch {
        // Silently ignore here — this is a best-effort background completion.
        // The parent can always retry manually from their profile.
    }
};

// Register a new user
export const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    goals: string[],
    role: string,
    learnerCode?: string
) => {
    let trimmedCode = '';

    // Parents must provide a valid, unused learner code.
    // We check it BEFORE creating the auth account so a bad code never leaves
    // behind an orphaned user.
    if (role === 'parent') {
        trimmedCode = (learnerCode || '').trim().toUpperCase();
        if (!trimmedCode) {
            throw new Error('Please enter your learner code.');
        }

        const check = await checkLearnerCode(trimmedCode);
        if (!check.valid) {
            if (check.reason === 'already_linked') {
                throw new Error('This learner code is already linked to a parent account.');
            }
            throw new Error('This learner code was not found. Please check with your teacher and try again.');
        }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                goals: goals,
                user_role: role,
                // stored so linking can be completed on first login, in case
                // this signUp doesn't return an active session (e.g. email
                // confirmation is required by the project's auth settings)
                pending_learner_code: role === 'parent' ? trimmedCode : null,
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
    if (role === 'parent' && trimmedCode && data.session) {
        try {
            const link = await linkParentToLearner(trimmedCode);
            if (!link.success) {
                throw new Error(link.message || 'Could not link your learner code.');
            }
        } catch (linkError: any) {
            // Account was created, but linking failed (e.g. someone else claimed
            // the code in the last few seconds). Surface this clearly so the
            // user knows their login works but linking still needs to happen.
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
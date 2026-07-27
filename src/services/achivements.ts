import { supabase } from '../lib/supabase';

export const processActivityCompletion = async (
    studentId: string,
    score: number = 3
) => {
    try {
        // FETCH ALL PAST SESSIONS FOR BADGE LOGIC
        const { data: sessions } = await supabase
            .from('student_sessions')
            .select('id, created_at, duration_seconds')
            .eq('student_id', studentId);

        const sessionCount = sessions?.length || 0;
        const newlyUnlocked: string[] = [];

        // Helper function to safely award a badge
        const unlockBadge = async (badgeId: string) => {
            const { error } = await supabase.from('student_achievements').insert({
                student_id: studentId,
                achievement_id: badgeId
            });

            // If no error, new badge unlock
            // Error 23505 means they already own the badge
            if (!error) {
                newlyUnlocked.push(badgeId);
            } else if (error.code !== '23505') {
                console.error(`Error unlocking ${badgeId}:`, error);
            }
        };

        // Achievement: FIRST ADVENTURE
        // Has at least one session
        if (sessionCount >= 1) {
            await unlockBadge('first_adventure');
        }

        // Achievement: TRIPLE THREAT
        // Has at least 3 sessions total
        if (sessionCount >= 3) {
            await unlockBadge('triple_threat');
        }

        // Achievement: SPEEDY EXPLORER
        // Finished an activity in under 15 seconds
        const hasSpeedySession = sessions?.some(s => s.duration_seconds && s.duration_seconds <= 15);
        if (hasSpeedySession) {
            await unlockBadge('speedy_explorer');
        }

        // Achievement: DAILY HERO
        // Complete activities 3 days in a row
        if (sessions && sessions.length >= 3) {
            // 1. Get an array of unique dates (YYYY-MM-DD) from all sessions, sorted newest to oldest
            const uniqueDates = Array.from(
                new Set(sessions.map(s => new Date(s.created_at).toISOString().split('T')[0]))
            ).sort().reverse();

            // 2. Loop through and check if any 3 consecutive items are exactly 1 day apart
            let hasThreeDayStreak = false;
            for (let i = 0; i <= uniqueDates.length - 3; i++) {
                const d1 = new Date(uniqueDates[i]);
                const d2 = new Date(uniqueDates[i + 1]);
                const d3 = new Date(uniqueDates[i + 2]);

                // Calculate difference in days
                const diff1 = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
                const diff2 = Math.round((d2.getTime() - d3.getTime()) / (1000 * 3600 * 24));

                if (diff1 === 1 && diff2 === 1) {
                    hasThreeDayStreak = true;
                    break;
                }
            }

            if (hasThreeDayStreak) {
                await unlockBadge('daily_hero');
            }
        }

        // Update student's badges count in students table
        const { data: unlockedData } = await supabase
            .from('student_achievements')
            .select('achievement_id')
            .eq('student_id', studentId);

        const badgeCount = unlockedData?.length || 0;

        await supabase
            .from('students')
            .update({ badges: badgeCount })
            .eq('id', studentId);

        return { success: true, newlyUnlocked, badgeCount };
    } catch (error) {
        console.error("Error processing achievements:", error);
        return { success: false, error };
    }
};

export const getAllAchievements = async () => {
    const { data, error } = await supabase
        .from('achievements')
        .select('*');
    if (error) throw error;
    return data || [];
};

export const getUnlockedAchievements = async (studentId: string) => {
    const { data, error } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
};

export const updateStudentBadgesCount = async (studentId: string, count: number) => {
    const { error } = await supabase
        .from('students')
        .update({ badges: count })
        .eq('id', studentId);
    if (error) throw error;
};
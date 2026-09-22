import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';

export const processActivityCompletion = async (
    studentId: string,
    score: number = 3
) => {
    try {
        // FETCH ALL PAST SESSIONS FOR BADGE LOGIC
        const { data: sessions } = await supabase
            .from('student_sessions')
            .select('id, created_at, duration_seconds, category, sub_category, activity_path')
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

                // Send Achievement Notification
                try {
                    const { data: badgeData } = await supabase
                        .from('achievements')
                        .select('title')
                        .eq('id', badgeId)
                        .maybeSingle();

                    const { data: student } = await supabase
                        .from('students')
                        .select('name')
                        .eq('id', studentId)
                        .maybeSingle();

                    const badgeTitle = badgeData?.title || badgeId.replace(/_/g, ' ').toUpperCase();
                    const studentName = student?.name || 'Learner';

                    await createNotification({
                        studentId,
                        title: 'New Achievement Unlocked! 🎉',
                        message: `${studentName} earned the "${badgeTitle}" achievement!`,
                        type: 'achievement',
                        metadata: { badge_id: badgeId },
                    });
                } catch (notifErr) {
                    console.error('[NOTIFICATIONS] Error sending achievement notification:', notifErr);
                }
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

        // Collect all activity paths across all sessions
        const allActivityPaths: string[] = [];
        sessions?.forEach(s => {
            if (Array.isArray(s.activity_path)) {
                allActivityPaths.push(...s.activity_path.map((p: any) => String(p).toLowerCase()));
            } else if (typeof s.activity_path === 'string') {
                allActivityPaths.push(s.activity_path.toLowerCase());
            }
        });

        // Achievement: SHAPE SPECIALIST
        // Mastered tracing all 4 basic geometric shapes (circle, square, triangle, rectangle)
        const hasCircle = allActivityPaths.some(p => p.includes('circle'));
        const hasSquare = allActivityPaths.some(p => p.includes('square'));
        const hasTriangle = allActivityPaths.some(p => p.includes('triangle'));
        const hasRectangle = allActivityPaths.some(p => p.includes('rectangle'));
        if (hasCircle && hasSquare && hasTriangle && hasRectangle) {
            await unlockBadge('shape_specialist');
        }

        // Achievement: ALPHABET ADVENTURER
        // Successfully traced at least 10 letters of the alphabet
        const tracedLetters = new Set<string>();
        allActivityPaths.forEach(p => {
            const letterMatch = p.match(/(?:letters|letter)[/-]([a-z0-9])/i) || p.match(/letter_([a-z0-9])/i);
            if (letterMatch && letterMatch[1]) {
                tracedLetters.add(letterMatch[1].toLowerCase());
            }
        });
        if (tracedLetters.size >= 10) {
            await unlockBadge('alphabet_adventurer');
        }

        // Achievement: TRACING TRAILBLAZER
        // Completed 5 fine-motor tracing sessions
        const tracingSessionCount = sessions?.filter(s => {
            const cat = (s.category || '').toLowerCase();
            const sub = (s.sub_category || '').toLowerCase();
            const hasTracingPath = Array.isArray(s.activity_path)
                ? s.activity_path.some((p: any) => String(p).toLowerCase().includes('tracing'))
                : typeof s.activity_path === 'string' && s.activity_path.toLowerCase().includes('tracing');
            return cat.includes('tracing') || sub.includes('tracing') || hasTracingPath;
        }).length || 0;
        if (tracingSessionCount >= 5) {
            await unlockBadge('tracing_trailblazer');
        }

        // Achievement: PUZZLE PRODIGY
        // Solved 5 cognitive matching, drag-and-drop, pick-n-choose, or sequencing puzzle sessions
        const puzzleSessionCount = sessions?.filter(s => {
            const cat = (s.category || '').toLowerCase();
            const sub = (s.sub_category || '').toLowerCase();
            const hasPuzzlePath = Array.isArray(s.activity_path)
                ? s.activity_path.some((p: any) => {
                    const lp = String(p).toLowerCase();
                    return lp.includes('drag') || lp.includes('pick') || lp.includes('sequence') || lp.includes('puzzle') || lp.includes('match');
                })
                : typeof s.activity_path === 'string' && (
                    s.activity_path.toLowerCase().includes('drag') ||
                    s.activity_path.toLowerCase().includes('pick') ||
                    s.activity_path.toLowerCase().includes('sequence') ||
                    s.activity_path.toLowerCase().includes('puzzle') ||
                    s.activity_path.toLowerCase().includes('match')
                );
            return (
                cat.includes('drag') ||
                cat.includes('pick') ||
                cat.includes('sequence') ||
                cat.includes('puzzle') ||
                cat.includes('match') ||
                sub.includes('drag') ||
                sub.includes('pick') ||
                sub.includes('sequence') ||
                sub.includes('puzzle') ||
                sub.includes('match') ||
                hasPuzzlePath
            );
        }).length || 0;
        if (puzzleSessionCount >= 5) {
            await unlockBadge('puzzle_prodigy');
        }

        // Achievement: BUBBLE CHAMPION
        // Popped through 5 visual-motor bubble activities
        const bubbleSessionCount = sessions?.filter(s => {
            const cat = (s.category || '').toLowerCase();
            const sub = (s.sub_category || '').toLowerCase();
            const hasBubblePath = Array.isArray(s.activity_path)
                ? s.activity_path.some((p: any) => String(p).toLowerCase().includes('bubble'))
                : typeof s.activity_path === 'string' && s.activity_path.toLowerCase().includes('bubble');
            return cat.includes('bubble') || sub.includes('bubble') || hasBubblePath;
        }).length || 0;
        if (bubbleSessionCount >= 5) {
            await unlockBadge('bubble_champion');
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
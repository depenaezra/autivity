import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';
import { getEmotionMeta } from '../utils/emotionZones';
import { FilterPeriod, getDateRangeForFilter } from '../utils/dashboardFilters';

export interface StudentCheckIn {
  id?: string;
  student_id: string;
  emotion: string;
  check_in_date: string;
  created_at?: string;
}

/**
 * Gets today's date string in YYYY-MM-DD format (local timezone)
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks whether a student has already completed a check-in for today.
 */
export const hasCheckedInToday = async (studentId: string): Promise<boolean> => {
  if (!studentId) return true; // Fail-safe to avoid popping modal on missing ID

  const todayStr = getTodayDateString();

  try {
    const { data, error } = await supabase
      .from('student_check_ins')
      .select('id')
      .eq('student_id', studentId)
      .eq('check_in_date', todayStr)
      .maybeSingle();

    if (error) {
      console.warn('[CHECK-IN] Error querying student_check_ins:', error.message);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('[CHECK-IN] Exception checking daily check-in:', err);
    return false;
  }
};

/**
 * Saves or updates today's emotion check-in for a student (upsert on duplicate date).
 */
export const saveDailyCheckIn = async (studentId: string, emotion: string): Promise<StudentCheckIn | null> => {
  if (!studentId || !emotion) return null;

  const todayStr = getTodayDateString();

  const payload = {
    student_id: studentId,
    emotion,
    check_in_date: todayStr,
  };

  try {
    let savedRecord: StudentCheckIn | null = null;
    const { data, error } = await supabase
      .from('student_check_ins')
      .upsert([payload], { onConflict: 'student_id,check_in_date' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[CHECK-IN] Upsert note, trying standard insert:', error.message);
      const { data: insertData, error: insertErr } = await supabase
        .from('student_check_ins')
        .insert([payload])
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error('[CHECK-IN] Error saving daily check-in:', insertErr.message);
        return null;
      }
      savedRecord = insertData;
    } else {
      savedRecord = data;
    }

    // Trigger Notification for Parent
    if (savedRecord && studentId) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('name')
          .eq('id', studentId)
          .maybeSingle();

        const studentName = student?.name || 'Learner';
        const meta = getEmotionMeta(emotion);
        const emotionLabel = meta?.label || emotion.toUpperCase();
        const tagalogLabel = meta?.tagalogLabel ? ` (${meta.tagalogLabel})` : '';
        const zoneKey = meta?.zone || 'optimal';

        let title = 'Daily Emotion Check-in 😊';
        let contextNote = 'ready and focused for learning!';

        if (zoneKey === 'heightened') {
          title = 'Daily Emotion Check-in ⚡';
          contextNote = emotion.toLowerCase() === 'nervous'
            ? 'feeling nervous and may benefit from gentle encouragement.'
            : 'in a high-energy, excited state!';
        } else if (zoneKey === 'low_energy') {
          title = 'Daily Emotion Check-in 💙';
          contextNote = emotion.toLowerCase() === 'tired'
            ? 'feeling tired and may need extra rest or quiet moments.'
            : 'feeling sad today and may need extra warmth and comfort.';
        }

        const message = `${studentName} checked in feeling ${emotionLabel}${tagalogLabel} today — ${contextNote}`;

        await createNotification({
          studentId,
          targetRole: 'parent',
          title,
          message,
          type: 'general',
          metadata: {
            check_in_id: savedRecord.id,
            student_id: studentId,
            student_name: studentName,
            emotion: emotion.toLowerCase(),
            zone: zoneKey,
            check_in_date: todayStr,
          },
        });
      } catch (notifErr) {
        console.error('[CHECK-IN] Failed sending emotion check-in notification to parent:', notifErr);
      }
    }

    return savedRecord;
  } catch (err) {
    console.error('[CHECK-IN] Exception saving daily check-in:', err);
    return null;
  }
};

/**
 * Fetches today's check-in for a student if it exists.
 */
export const getTodayCheckIn = async (studentId: string): Promise<StudentCheckIn | null> => {
  if (!studentId) return null;

  const todayStr = getTodayDateString();

  try {
    const { data, error } = await supabase
      .from('student_check_ins')
      .select('*')
      .eq('student_id', studentId)
      .eq('check_in_date', todayStr)
      .maybeSingle();

    if (error) {
      console.warn('[CHECK-IN] Error fetching today check-in:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[CHECK-IN] Exception fetching today check-in:', err);
    return null;
  }
};

/**
 * Fetches all check-in records for a student across all dates or within a date range.
 */
export const getStudentCheckInsHistory = async (
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<StudentCheckIn[]> => {
  if (!studentId) return [];

  try {
    let query = supabase
      .from('student_check_ins')
      .select('*')
      .eq('student_id', studentId)
      .order('check_in_date', { ascending: true });

    if (startDate) {
      query = query.gte('check_in_date', startDate);
    }
    if (endDate) {
      query = query.lte('check_in_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[CHECK-IN] Error querying student check-in history:', error.message);
      return [];
    }

    return (data as StudentCheckIn[]) || [];
  } catch (err) {
    console.error('[CHECK-IN] Exception querying student check-in history:', err);
    return [];
  }
};

/**
 * Fetches and filters check-ins according to dashboard FilterPeriod (today, week, month, overall, academic quarters).
 */
export const getStudentCheckInsForFilter = async (
  studentId: string,
  filter: FilterPeriod = 'overall'
): Promise<StudentCheckIn[]> => {
  if (!studentId) return [];

  const allRecords = await getStudentCheckInsHistory(studentId);
  if (!allRecords || allRecords.length === 0) return [];
  if (filter === 'overall') return allRecords;

  if (filter === 'today') {
    const todayStr = getTodayDateString();
    return allRecords.filter((r) => r.check_in_date === todayStr);
  }

  const { startDate, endDate } = getDateRangeForFilter(filter);

  return allRecords.filter((r) => {
    const d = new Date(r.check_in_date);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
};


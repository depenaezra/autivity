import { supabase } from '../lib/supabase';

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
      return insertData;
    }

    return data;
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
  filter: string = 'overall'
): Promise<StudentCheckIn[]> => {
  if (!studentId) return [];

  const allRecords = await getStudentCheckInsHistory(studentId);
  if (!allRecords || allRecords.length === 0) return [];
  if (filter === 'overall') return allRecords;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === 'today') {
    const todayStr = getTodayDateString();
    return allRecords.filter((r) => r.check_in_date === todayStr);
  }

  if (filter === 'week') {
    const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    return allRecords.filter((r) => {
      const d = new Date(r.check_in_date);
      return d >= weekAgo;
    });
  }

  if (filter === 'month') {
    const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
    return allRecords.filter((r) => {
      const d = new Date(r.check_in_date);
      return d >= monthAgo;
    });
  }

  // If filter is sy- or legacy quarters, parse dates
  if (filter.startsWith('sy-')) {
    const parts = filter.replace('sy-', '').split('-');
    if (parts.length >= 2) {
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);
      const subScope = parts.length >= 3 ? parts[2] : 'full';

      if (!isNaN(startYear) && !isNaN(endYear)) {
        let startDate: Date;
        let endDate: Date;

        if (subScope === 'q1') {
          startDate = new Date(startYear, 7, 1);
          endDate = new Date(startYear, 9, 31, 23, 59, 59);
        } else if (subScope === 'q2') {
          startDate = new Date(startYear, 10, 1);
          endDate = new Date(endYear, 0, 31, 23, 59, 59);
        } else if (subScope === 'q3') {
          startDate = new Date(endYear, 1, 1);
          endDate = new Date(endYear, 3, 30, 23, 59, 59);
        } else if (subScope === 'q4') {
          startDate = new Date(endYear, 4, 1);
          endDate = new Date(endYear, 6, 31, 23, 59, 59);
        } else {
          startDate = new Date(startYear, 7, 1);
          endDate = new Date(endYear, 6, 31, 23, 59, 59);
        }

        return allRecords.filter((r) => {
          const d = new Date(r.check_in_date);
          return d >= startDate && d <= endDate;
        });
      }
    }
  }

  return allRecords;
};


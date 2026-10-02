import { ParentSessionRecord } from '../services/parentDashboard';

export type FilterPeriod =
  | 'today'
  | 'week'
  | 'last_week'
  | 'month'
  | 'last_month'
  | 'overall'
  | string; // e.g. 'sy-2024-2025-full', 'sy-2024-2025-q1', 'sy-2024-2025-q2', etc.

export function getCurrentSchoolYearStartYear(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0 = Jan, 5 = Jun)
  const date = now.getDate();
  // School year starts on June 8
  return month > 5 || (month === 5 && date >= 8) ? year : year - 1;
}

export function getSchoolYearLabel(startYear: number): string {
  return `SY ${startYear}–${startYear + 1}`;
}

export function getFilterLabel(period: FilterPeriod): string {
  if (period === 'today') return 'Today';
  if (period === 'week') return 'This Week';
  if (period === 'last_week') return 'Last Week';
  if (period === 'month') return 'This Month';
  if (period === 'last_month') return 'Last Month';
  if (period === 'overall') return 'All Time';

  if (period.startsWith('sy-')) {
    const parts = period.replace('sy-', '').split('-');
    if (parts.length >= 2) {
      const startYear = parts[0];
      const endYear = parts[1];
      const s2 = startYear.slice(-2);
      const e2 = endYear.slice(-2);

      if (parts.length === 3 && parts[2] !== 'full') {
        const qUpper = parts[2].toUpperCase();
        return `SY ${s2}–${e2} ${qUpper}`;
      }
      return `SY ${startYear}–${endYear}`;
    }
  }

  // Fallback legacy quarter strings
  if (period === 'q1') return 'Quarter 1 (Q1)';
  if (period === 'q2') return 'Quarter 2 (Q2)';
  if (period === 'q3') return 'Quarter 3 (Q3)';
  if (period === 'q4') return 'Quarter 4 (Q4)';

  return 'All Time';
}

/**
 * Calculates standard start and end date bounds for any given FilterPeriod.
 */
export function getDateRangeForFilter(period: FilterPeriod): {
  startDate: Date | null;
  endDate: Date | null;
} {
  if (!period || period === 'overall') {
    return { startDate: null, endDate: null };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (period === 'today') {
    return { startDate: startOfDay, endDate: null };
  }

  if (period === 'week') {
    // Current week: from 7 days ago at start of day until now
    const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { startDate: weekAgo, endDate: null };
  }

  if (period === 'last_week') {
    // Last week: from 14 days ago to 7 days ago
    const startOfLastWeek = new Date(startOfDay.getTime() - 14 * 24 * 60 * 60 * 1000);
    const endOfLastWeek = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { startDate: startOfLastWeek, endDate: endOfLastWeek };
  }

  if (period === 'month') {
    // Current month: from 30 days ago at start of day until now
    const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { startDate: monthAgo, endDate: null };
  }

  if (period === 'last_month') {
    // Previous calendar month: 1st of last month to last day of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { startDate: startOfLastMonth, endDate: endOfLastMonth };
  }

  // Composite Academic Key: sy-STARTYEAR-ENDYEAR or sy-STARTYEAR-ENDYEAR-QUARTER
  if (period.startsWith('sy-')) {
    const parts = period.replace('sy-', '').split('-');
    if (parts.length >= 2) {
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);
      const subScope = parts.length >= 3 ? parts[2] : 'full';

      if (!isNaN(startYear) && !isNaN(endYear)) {
        if (subScope === 'q1') {
          return {
            startDate: new Date(startYear, 5, 8, 0, 0, 0, 0), // June 8
            endDate: new Date(startYear, 8, 15, 23, 59, 59, 999), // September 15
          };
        } else if (subScope === 'q2') {
          return {
            startDate: new Date(startYear, 8, 16, 0, 0, 0, 0), // September 16
            endDate: new Date(startYear, 11, 18, 23, 59, 59, 999), // December 18
          };
        } else if (subScope === 'q3') {
          return {
            startDate: new Date(endYear, 0, 4, 0, 0, 0, 0), // January 4
            endDate: new Date(endYear, 3, 8, 23, 59, 59, 999), // April 8
          };
        } else {
          // Full school year: June 8 to April 8
          return {
            startDate: new Date(startYear, 5, 8, 0, 0, 0, 0), // June 8
            endDate: new Date(endYear, 3, 8, 23, 59, 59, 999), // April 8
          };
        }
      }
    }
  }

  // Fallback legacy quarters (assuming current school year)
  const currentSYStartYear = getCurrentSchoolYearStartYear();
  if (['q1', 'q2', 'q3'].includes(period)) {
    if (period === 'q1') {
      return {
        startDate: new Date(currentSYStartYear, 5, 8, 0, 0, 0, 0),
        endDate: new Date(currentSYStartYear, 8, 15, 23, 59, 59, 999),
      };
    } else if (period === 'q2') {
      return {
        startDate: new Date(currentSYStartYear, 8, 16, 0, 0, 0, 0),
        endDate: new Date(currentSYStartYear, 11, 18, 23, 59, 59, 999),
      };
    } else if (period === 'q3') {
      return {
        startDate: new Date(currentSYStartYear + 1, 0, 4, 0, 0, 0, 0),
        endDate: new Date(currentSYStartYear + 1, 3, 8, 23, 59, 59, 999),
      };
    }
  }

  return { startDate: null, endDate: null };
}

export function filterSessionsByPeriod(
  sessions: ParentSessionRecord[],
  period: FilterPeriod
): ParentSessionRecord[] {
  if (!sessions || sessions.length === 0) return [];
  if (period === 'overall') return sessions;

  const { startDate, endDate } = getDateRangeForFilter(period);

  return sessions.filter((s) => {
    const d = s.date instanceof Date ? s.date : new Date(s.date);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
}

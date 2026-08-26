import { ParentSessionRecord } from '../services/parentDashboard';

export type FilterPeriod =
  | 'today'
  | 'week'
  | 'month'
  | 'overall'
  | string; // e.g. 'sy-2024-2025-full', 'sy-2024-2025-q1', 'sy-2024-2025-q2', etc.

export function getCurrentSchoolYearStartYear(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0 = Jan, 7 = Aug)
  return month >= 7 ? year : year - 1;
}

export function getSchoolYearLabel(startYear: number): string {
  return `SY ${startYear}–${startYear + 1}`;
}

export function getFilterLabel(period: FilterPeriod): string {
  if (period === 'today') return 'Today';
  if (period === 'week') return 'This Week';
  if (period === 'month') return 'This Month';
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

export function filterSessionsByPeriod(
  sessions: ParentSessionRecord[],
  period: FilterPeriod
): ParentSessionRecord[] {
  if (!sessions || sessions.length === 0) return [];
  if (period === 'overall') return sessions;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    return sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= startOfDay;
    });
  }

  if (period === 'week') {
    const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= weekAgo;
    });
  }

  if (period === 'month') {
    const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
    return sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= monthAgo;
    });
  }

  // Composite Academic Key: sy-STARTYEAR-ENDYEAR or sy-STARTYEAR-ENDYEAR-QUARTER
  if (period.startsWith('sy-')) {
    const parts = period.replace('sy-', '').split('-');
    if (parts.length >= 2) {
      const startYear = parseInt(parts[0], 10);
      const endYear = parseInt(parts[1], 10);
      const subScope = parts.length >= 3 ? parts[2] : 'full';

      if (!isNaN(startYear) && !isNaN(endYear)) {
        let startDate: Date;
        let endDate: Date;

        if (subScope === 'q1') {
          startDate = new Date(startYear, 7, 1, 0, 0, 0); // Aug 1
          endDate = new Date(startYear, 9, 31, 23, 59, 59); // Oct 31
        } else if (subScope === 'q2') {
          startDate = new Date(startYear, 10, 1, 0, 0, 0); // Nov 1
          endDate = new Date(endYear, 0, 31, 23, 59, 59); // Jan 31
        } else if (subScope === 'q3') {
          startDate = new Date(endYear, 1, 1, 0, 0, 0); // Feb 1
          endDate = new Date(endYear, 3, 30, 23, 59, 59); // Apr 30
        } else if (subScope === 'q4') {
          startDate = new Date(endYear, 4, 1, 0, 0, 0); // May 1
          endDate = new Date(endYear, 6, 31, 23, 59, 59); // Jul 31
        } else {
          // Full School Year
          startDate = new Date(startYear, 7, 1, 0, 0, 0); // Aug 1
          endDate = new Date(endYear, 6, 31, 23, 59, 59); // Jul 31
        }

        return sessions.filter((s) => {
          const d = s.date instanceof Date ? s.date : new Date(s.date);
          return d >= startDate && d <= endDate;
        });
      }
    }
  }

  // Fallback legacy quarters (assuming current school year)
  const currentSYStartYear = getCurrentSchoolYearStartYear();
  if (['q1', 'q2', 'q3', 'q4'].includes(period)) {
    let startDate: Date;
    let endDate: Date;
    if (period === 'q1') {
      startDate = new Date(currentSYStartYear, 7, 1, 0, 0, 0);
      endDate = new Date(currentSYStartYear, 9, 31, 23, 59, 59);
    } else if (period === 'q2') {
      startDate = new Date(currentSYStartYear, 10, 1, 0, 0, 0);
      endDate = new Date(currentSYStartYear + 1, 0, 31, 23, 59, 59);
    } else if (period === 'q3') {
      startDate = new Date(currentSYStartYear + 1, 1, 1, 0, 0, 0);
      endDate = new Date(currentSYStartYear + 1, 3, 30, 23, 59, 59);
    } else {
      startDate = new Date(currentSYStartYear + 1, 4, 1, 0, 0, 0);
      endDate = new Date(currentSYStartYear + 1, 6, 31, 23, 59, 59);
    }

    return sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= startDate && d <= endDate;
    });
  }

  return sessions;
}

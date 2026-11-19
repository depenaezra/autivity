import type { ParentExportOptions } from '../../components/parent/parent-export-modal';
import { filterSessionsByCustomRange, getDateRangeForFilter } from '../utils/dashboardFilters';
import { exportChildReportPdf } from './exportReport';
import type { ParentDashboardData } from './parentDashboard';

export async function exportParentReport(data: ParentDashboardData, options: ParentExportOptions, language: 'en' | 'tl' = 'en') {
  const range = options.period === 'custom'
    ? { startDate: options.startDate || null, endDate: options.endDate || null }
    : getDateRangeForFilter(options.period);
  if (options.period !== 'overall' && !range.endDate) {
    range.endDate = new Date();
    range.endDate.setHours(23, 59, 59, 999);
  }
  const sessions = filterSessionsByCustomRange(data.sessions, range.startDate, range.endDate)
    .filter((session) => options.activityType === 'all' || (session.activityType || 'app') === options.activityType);
  const evaluated = sessions.filter((session) => session.status === 'validated' && session.rubricEvaluation);
  const total = evaluated.reduce((sum, session) => {
    const r = session.rubricEvaluation!;
    return sum + (r.looking_at_objects || 0) + (r.concentrating || 0) + (r.performing_task || 0)
      + (r.following_instructions || 0) + (r.completed_work || 0);
  }, 0);
  const durations = sessions.filter((session) => session.durationSeconds > 0);
  const avgSessionSeconds = durations.length
    ? Math.round(durations.reduce((sum, session) => sum + session.durationSeconds, 0) / durations.length)
    : 0;
  const format = (date: Date) => date.toLocaleDateString(language === 'tl' ? 'fil-PH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const label = range.startDate
    ? `${format(range.startDate)} - ${format(range.endDate || new Date())}`
    : options.timeframeLabel;
  return exportChildReportPdf(
    { ...data, sessions },
    { overallPerformance: evaluated.length ? Math.round(total / (evaluated.length * 25) * 100) : 0,
      avgSessionMinutes: Math.round(avgSessionSeconds / 60), avgSessionSeconds,
      totalSessions: sessions.length, skillBreakdown: [] },
    label, options.activityType, language, undefined, range
  );
}

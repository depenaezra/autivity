import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ParentDashboardData } from './parentDashboard';

interface ReportStats {
    overallPerformance: number;
    avgSessionMinutes: number;
    totalSessions: number;
    skillBreakdown: { label: string; value: number }[];
}

const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildReportHtml = (data: ParentDashboardData, stats: ReportStats) => {
    const student = data.student;
    const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const recentFeedback = data.sessions
        .filter((s) => s.teacherFeedback && s.teacherFeedback.trim().length > 0)
        .slice(-8)
        .reverse();

    const skillRows = stats.skillBreakdown
        .map(
            (s) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;">${escapeHtml(s.label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;">${Math.round(s.value)}%</td>
        </tr>`
        )
        .join('');

    const feedbackItems = recentFeedback
        .map(
            (f) => `
        <div style="margin-bottom:12px;padding:12px;background:#F5F8FA;border-radius:10px;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${f.date.toLocaleDateString()} • ${escapeHtml(f.category)}</div>
          <div style="font-size:13px;color:#374151;">${escapeHtml(f.teacherFeedback)}</div>
        </div>`
        )
        .join('') || `<div style="font-size:13px;color:#9CA3AF;">No teacher feedback recorded yet.</div>`;

    return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #374151; padding: 24px; }
        h1 { color: #62A9E6; font-size: 22px; margin-bottom: 2px; }
        h2 { font-size: 15px; color: #4B5563; margin-top: 24px; margin-bottom: 8px; }
        .meta { font-size: 12px; color: #9CA3AF; margin-bottom: 18px; }
        .stat-row { display: flex; gap: 12px; margin-bottom: 8px; }
        .stat-box { flex: 1; background: #EFF6FF; border-radius: 12px; padding: 14px; text-align: center; }
        .stat-value { font-size: 20px; font-weight: 700; color: #2563EB; }
        .stat-label { font-size: 11px; color: #6B7280; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(student?.name || 'Learner')} — Progress Report</h1>
      <div class="meta">
        ${escapeHtml(data.classInfo?.title || 'N/A')} (${escapeHtml(data.classInfo?.grade || '')}) &nbsp;•&nbsp;
        Teacher: ${escapeHtml(data.teacherName)} &nbsp;•&nbsp; Learner Code: ${escapeHtml(student?.learner_code || '')} &nbsp;•&nbsp;
        Generated ${generatedOn}
      </div>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-value">${stats.overallPerformance}%</div>
          <div class="stat-label">Overall Performance</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.avgSessionMinutes}m</div>
          <div class="stat-label">Avg Session Duration</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalSessions}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
      </div>

      <h2>Skill Development Breakdown</h2>
      <table>${skillRows || '<tr><td style="padding:8px 12px;color:#9CA3AF;">No sessions recorded yet.</td></tr>'}</table>

      <h2>Teacher Feedback</h2>
      ${feedbackItems}
    </body>
  </html>`;
};

// Generates a PDF summary of the child's analytics and opens the native
// share sheet so the parent can save or send it.
export const exportChildReportPdf = async (data: ParentDashboardData, stats: ReportStats) => {
    const html = buildReportHtml(data, stats);
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `${data.student?.name || 'Learner'} Progress Report`,
        });
    }

    return uri;
};

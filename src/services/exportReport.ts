import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ParentDashboardData, ParentSessionRecord } from './parentDashboard';

interface ReportStats {
  overallPerformance: number;
  avgSessionMinutes: number;
  totalSessions: number;
  skillBreakdown: { label: string; value: number }[];
}

const RUBRIC_CRITERIA = [
  { key: 'looking_at_objects', title: 'Looking at Objects' },
  { key: 'concentrating', title: 'Concentrating' },
  { key: 'performing_task', title: 'Performing Task' },
  { key: 'following_instructions', title: 'Following Instructions' },
  { key: 'completed_work', title: 'Completed Work' },
] as const;

const RUBRIC_SCALE: Record<number, { label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  0: { label: 'Try again', description: 'The task will be repeated by the pupil', color: '#B91C1C', bgColor: '#FEE2E2', borderColor: '#FCA5A5' },
  1: { label: 'Oh no', description: 'If a student is not focusing on an object', color: '#C2410C', bgColor: '#FFEDD5', borderColor: '#FDBA74' },
  2: { label: 'OK!', description: 'If the pupil views the object halfway when it is moving', color: '#B45309', bgColor: '#FEF3C7', borderColor: '#FDE68A' },
  3: { label: 'Good job!', description: 'The pupil looks at the object for a brief period of time', color: '#1D4ED8', bgColor: '#EFF6FF', borderColor: '#93C5FD' },
  4: { label: 'Great job!', description: 'If the pupil looks at the object for an extended period of time', color: '#15803D', bgColor: '#F0FDF4', borderColor: '#86EFAC' },
};

const DOMAIN_COLORS = ['#62A9E6', '#FFAE02', '#179D33', '#FF8870', '#A855F7', '#EC4899'];

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const generateTrendChartSvg = (sessions: ParentSessionRecord[]) => {
  if (!sessions || sessions.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No session trend data available for this timeframe.</div>`;
  }

  const dateMap: Record<string, { sum: number; count: number }> = {};
  const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach((s) => {
    let scorePct: number | null = null;
    if (s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      scorePct = Math.round((sum / 25) * 100);
    } else if (s.score != null) {
      scorePct = s.score;
    }
    if (scorePct != null) {
      const d = new Date(s.date);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!dateMap[key]) dateMap[key] = { sum: 0, count: 0 };
      dateMap[key].sum += scorePct;
      dateMap[key].count += 1;
    }
  });

  const chartData = Object.keys(dateMap).map((key) => ({
    date: key,
    score: Math.round(dateMap[key].sum / dateMap[key].count),
  })).slice(-10);

  if (chartData.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No scored sessions available for this timeframe.</div>`;
  }

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 25;
  const paddingRight = 25;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const step = chartData.length > 1 ? chartW / (chartData.length - 1) : chartW;

  const points = chartData.map((d, idx) => {
    const x = paddingLeft + (chartData.length > 1 ? idx * step : chartW / 2);
    const y = paddingTop + (chartH - (d.score / 100) * chartH);
    return { x, y, score: d.score, date: d.date };
  });

  let linePathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    linePathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPathD = `${linePathD} L ${lastPt.x.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${firstPt.x.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`;

  const dotsSvg = points.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#0284C7" stroke="#FFFFFF" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="11" font-weight="700" fill="#0284C7" text-anchor="middle">${p.score}%</text>
    <text x="${p.x.toFixed(1)}" y="${svgHeight - 8}" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">${p.date}</text>
  `).join('');

  const gridLines = [0, 25, 50, 75, 100].map((pct) => {
    const y = paddingTop + chartH - (pct / 100) * chartH;
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="4,4" stroke-width="1" />
      <text x="${paddingLeft - 8}" y="${y + 4}" font-size="10" font-weight="600" fill="#94A3B8" text-anchor="end">${pct}%</text>
    `;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:700; font-size:13px; color:#1E293B; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Progress Trend Over Time</div>
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;">
        <defs>
          <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284C7" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#0284C7" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPathD}" fill="url(#trendGrad)" />
        <path d="${linePathD}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" />
        ${dotsSvg}
      </svg>
    </div>
  `;
};

const generateActivityPerformanceSvg = (sessions: ParentSessionRecord[]) => {
  if (!sessions || sessions.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No activity performance data available for this timeframe.</div>`;
  }

  const byCategory: Record<string, number[]> = {};
  sessions.forEach((s) => {
    let scorePct: number | null = null;
    if (s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      scorePct = Math.round((sum / 25) * 100);
    } else if (s.score != null) {
      scorePct = s.score;
    }
    if (scorePct == null) return;
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(scorePct);
  });

  const activityData = Object.entries(byCategory)
    .map(([label, scores]) => ({
      label,
      value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (activityData.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No activity performance data available.</div>`;
  }

  const barsHtml = activityData.map((item) => {
    const val = Math.min(100, Math.max(0, item.value));
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-weight:700; font-size:13px; color:#334155;">${escapeHtml(item.label)}</span>
          <span style="font-weight:800; font-size:13px; color:#0284C7;">${val}%</span>
        </div>
        <div style="background:#F1F5F9; border-radius:8px; height:12px; width:100%; overflow:hidden; border:1px solid #E2E8F0;">
          <div style="background:linear-gradient(90deg, #38BDF8 0%, #0284C7 100%); height:100%; width:${val}%; border-radius:8px;"></div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:700; font-size:13px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Activity Performance</div>
      ${barsHtml}
    </div>
  `;
};

const generateSkillRadarSvg = (skillBreakdown: { label: string; value: number }[]) => {
  if (!skillBreakdown || skillBreakdown.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No skill performance data available.</div>`;
  }

  const progressBarsHtml = skillBreakdown.map((s, idx) => {
    const val = Math.min(100, Math.max(0, Math.round(s.value)));
    const domainColor = DOMAIN_COLORS[idx % DOMAIN_COLORS.length];

    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="background:${domainColor}; width:10px; height:10px; border-radius:50%; display:inline-block;"></span>
            <span style="font-weight:700; font-size:13px; color:#334155;">${escapeHtml(s.label)}</span>
          </div>
          <span style="font-weight:800; font-size:13px; color:${domainColor};">${val}%</span>
        </div>
        <div style="background:#F1F5F9; border-radius:8px; height:12px; width:100%; overflow:hidden; border:1px solid #E2E8F0;">
          <div style="background:${domainColor}; height:100%; width:${val}%; border-radius:8px;"></div>
        </div>
      </div>
    `;
  }).join('');

  let radarSvgHtml = '';
  if (skillBreakdown.length >= 3) {
    const size = 260;
    const center = size / 2;
    const radius = 80;
    const total = skillBreakdown.length;
    const angleStep = (Math.PI * 2) / total;

    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = levels.map((lvl) => {
      const points = skillBreakdown.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * lvl * Math.cos(angle);
        const y = center + radius * lvl * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="${lvl === 1.0 ? 'none' : '3,3'}" />`;
    }).join('');

    const axisLines = skillBreakdown.map((s, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];

      const lx = center + (radius + 24) * Math.cos(angle);
      const ly = center + (radius + 16) * Math.sin(angle);
      let textAnchor = 'middle';
      if (Math.cos(angle) > 0.2) textAnchor = 'start';
      if (Math.cos(angle) < -0.2) textAnchor = 'end';

      return `
        <line x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#CBD5E1" stroke-width="1" />
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="10" font-weight="700" fill="${color}" text-anchor="${textAnchor}">${escapeHtml(s.label)}</text>
      `;
    }).join('');

    const dataPoints = skillBreakdown.map((s, i) => {
      const pct = Math.min(100, Math.max(0, s.value)) / 100;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * pct * Math.cos(angle);
      const y = center + radius * pct * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const dataDots = skillBreakdown.map((s, i) => {
      const pct = Math.min(100, Math.max(0, s.value)) / 100;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * pct * Math.cos(angle);
      const y = center + radius * pct * Math.sin(angle);
      const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];
      return `
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${color}" fill-opacity="0.3" />
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" />
      `;
    }).join('');

    radarSvgHtml = `
      <div style="text-align:center; padding:10px;">
        <svg viewBox="0 0 ${size} ${size}" style="width:230px; height:230px; overflow:visible;">
          ${gridPolygons}
          ${axisLines}
          <polygon points="${dataPoints}" fill="rgba(98, 169, 230, 0.25)" stroke="#62A9E6" stroke-width="2.5" />
          ${dataDots}
        </svg>
      </div>
    `;
  }

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:700; font-size:13px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Skill Domain Mastery</div>
      <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:240px;">
          ${progressBarsHtml}
        </div>
        ${radarSvgHtml ? `<div style="flex:1; min-width:240px; display:flex; justify-content:center; align-items:center;">${radarSvgHtml}</div>` : ''}
      </div>
    </div>
  `;
};

const formatFeedbackHtml = (f: ParentSessionRecord) => {
  const rubricObj = f.rubricEvaluation || {};
  const totalPoints = Object.values(rubricObj).reduce(
    (sum: number, val: any) => sum + (Number(val) || 0),
    0
  );

  const rubricRowsHtml = RUBRIC_CRITERIA.map((criterion) => {
    const score = Number((rubricObj as any)?.[criterion.key]) || 0;
    const scaleInfo = RUBRIC_SCALE[score] || RUBRIC_SCALE[0];

    return `
      <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:10px 14px; margin-bottom:8px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-weight:700; font-size:13px; color:#1E293B;">${escapeHtml(criterion.title)}</span>
          <span style="font-weight:700; font-size:11px; text-transform:uppercase; padding:3px 10px; border-radius:6px; border:2px solid ${scaleInfo.borderColor}; background:${scaleInfo.bgColor}; color:${scaleInfo.color};">
            ${score} • ${scaleInfo.label}
          </span>
        </div>
        <div style="font-size:12px; color:#475569; font-weight:500; line-height:1.4;">${escapeHtml(scaleInfo.description)}</div>
      </div>`;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #CBD5E1; border-radius:20px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <!-- Header Row -->
      <div style="background:#F1F5F9; border-radius:12px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#1E293B;">Category: ${escapeHtml(f.category || 'General')}</div>
          <div style="font-size:12px; color:#475569; font-weight:500; margin-top:2px;">Validated on ${f.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style="background:#F0FDF4; border:2px solid #86EFAC; border-radius:8px; padding:6px 14px; text-align:center;">
          <div style="font-weight:700; font-size:15px; color:#15803D;">${totalPoints} / 20</div>
          <div style="font-weight:700; font-size:9px; color:#166534; text-transform:uppercase;">SCORE</div>
        </div>
      </div>

      <!-- Evaluation Scores -->
      <div style="font-weight:700; font-size:12px; color:#475569; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Scores</div>
      ${rubricRowsHtml}

      <!-- Teacher Remarks -->
      <div style="font-weight:700; font-size:12px; color:#475569; margin-top:14px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Teacher Remarks</div>
      <div style="background:#F1F5F9; border-radius:12px; padding:12px 16px; font-size:13px; color:#1E293B; font-weight:600; min-height:44px; line-height:1.4;">
        ${f.teacherFeedback && f.teacherFeedback.trim() ? `"${escapeHtml(f.teacherFeedback.trim())}"` : '<span style="color:#64748B; font-style:italic;">No teacher remarks entered.</span>'}
      </div>
    </div>`;
};

const buildReportHtml = (data: ParentDashboardData, stats: ReportStats, timeframeLabel?: string) => {
  const student = data.student;
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const recentFeedback = data.sessions
    .filter((s) => s.teacherFeedback && s.teacherFeedback.trim().length > 0)
    .reverse();

  const feedbackItems = recentFeedback
    .map((f) => formatFeedbackHtml(f))
    .join('') || `<div style="font-size:13px;color:#64748B;">No teacher feedback recorded for this timeframe.</div>`;

  const timeframeBadgeHtml = timeframeLabel
    ? `<div style="margin-top:8px;"><span style="background:#E0F2FE; border:1px solid #BBE8FB; color:#0284C7; border-radius:6px; padding:4px 10px; font-weight:700; font-size:11px; text-transform:uppercase;">TIMEFRAME: ${escapeHtml(timeframeLabel)}</span></div>`
    : '';

  const trendChartHtml = generateTrendChartSvg(data.sessions);
  const activityChartHtml = generateActivityPerformanceSvg(data.sessions);
  const skillChartHtml = generateSkillRadarSvg(stats.skillBreakdown);

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E293B; padding: 24px; background: #F8FAFC; }
        h1 { color: #0284C7; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
        h2 { font-size: 16px; font-weight: 700; color: #1E293B; margin-top: 24px; margin-bottom: 12px; }
        .meta { font-size: 13px; color: #475569; font-weight: 500; margin-bottom: 18px; }
        .stat-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .stat-box { flex: 1; background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 14px; padding: 14px; text-align: center; }
        .stat-value { font-size: 22px; font-weight: 800; color: #0284C7; }
        .stat-label { font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(student?.name || 'Learner')} — Progress Report</h1>
      <div class="meta">
        ${escapeHtml(data.classInfo?.title || 'N/A')} (${escapeHtml(data.classInfo?.grade || '')}) &nbsp;•&nbsp;
        Teacher: ${escapeHtml(data.teacherName)} &nbsp;•&nbsp; Learner Code: ${escapeHtml(student?.learner_code || '')} &nbsp;•&nbsp;
        Generated ${generatedOn}
        ${timeframeBadgeHtml}
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

      <h2>Analytics & Skill Domain Visualizations</h2>
      ${trendChartHtml}
      ${activityChartHtml}
      ${skillChartHtml}

      <h2>Teacher Feedback & Session Evaluations</h2>
      ${feedbackItems}
    </body>
  </html>`;
};

// Generates a PDF summary of the child's analytics and opens the native
// share sheet so the parent can save or send it.
export const exportChildReportPdf = async (
  data: ParentDashboardData,
  stats: ReportStats,
  timeframeLabel?: string
) => {
  const html = buildReportHtml(data, stats, timeframeLabel);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${data.student?.name || 'Learner'} Progress Report`,
    });
  }

  return uri;
};

// Generates a PDF report for a single feedback item and opens native share sheet.
export const exportSingleFeedbackPdf = async (
  studentName: string,
  teacherName: string,
  feedback: { category: string; date: Date; teacherFeedback: string; rubricEvaluation?: any }
) => {
  const generatedOn = feedback.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E293B; padding: 24px; background: #F8FAFC; }
        h1 { color: #0284C7; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .meta { font-size: 13px; color: #475569; font-weight: 500; margin-bottom: 18px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(studentName || 'Learner')} — Session Feedback</h1>
      <div class="meta">
        Teacher: ${escapeHtml(teacherName)} &nbsp;•&nbsp; Date: ${generatedOn} &nbsp;•&nbsp; Category: ${escapeHtml(feedback.category)}
      </div>

      ${formatFeedbackHtml({
        id: 'single',
        studentId: '',
        category: feedback.category,
        skill_domain: [],
        date: feedback.date,
        durationSeconds: 0,
        score: null,
        status: 'validated',
        teacherFeedback: feedback.teacherFeedback,
        validatedAt: null,
        rubricEvaluation: feedback.rubricEvaluation || null,
      })}
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${studentName || 'Learner'} Feedback - ${feedback.category}`,
    });
  }

  return uri;
};

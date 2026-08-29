import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import {
  getClassDevelopmentalSkillsExposure,
  getValidatedSessionsEvaluations,
  MasterDomainExposure,
  SessionEvaluation,
} from './class-analytics';
import { generateNarrativeHighlights, generateProgressForecast, NarrativeHighlight } from './parentAnalyticsEngine';
import { ParentDashboardData, ParentSessionRecord } from './parentDashboard';
import { calculateClassProgressForecast, generateClassRecommendations, calculateRubricScore, ClassRecommendation } from './classAnalyticsEngine';
import { generateStudentRecommendations, calculateStudentProgressForecast } from './studentAnalyticsEngine';
import {
  getStudentSessionStats,
  getStudentValidatedSessionsEvaluations,
  getStudentDevelopmentalSkillsExposure,
  getStudentSessions,
  getStudentMilestones,
  Milestone,
  StudentHeaderDetails,
} from './student-analytics';

interface ReportStats {
  overallPerformance: number;
  avgSessionMinutes?: number;
  avgSessionSeconds?: number;
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

const generateNarrativeSummaryHtml = (highlights: NarrativeHighlight[]) => {
  if (!highlights || highlights.length === 0) return '';

  const cardsHtml = highlights.map((h) => {
    let accentColor = '#62A9E6';
    let statusBg = '#E0F2FE';
    let statusBorder = '#BBE8FB';
    let statusText = '#62A9E6';

    if (h.type === 'growth') {
      accentColor = '#179D33';
      statusBg = '#CBFAC4';
      statusBorder = '#179D33';
      statusText = '#179D33';
    } else if (h.type === 'focus') {
      accentColor = '#FFAE02';
      statusBg = '#FFF3C4';
      statusBorder = '#FFAE02';
      statusText = '#D97706';
    } else if (h.type === 'consistency') {
      accentColor = '#62A9E6';
      statusBg = '#E0F2FE';
      statusBorder = '#62A9E6';
      statusText = '#62A9E6';
    }

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:14px; padding:12px 16px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:12px; height:12px; border-radius:50%; background:${accentColor}; flex-shrink:0;"></div>
            <span style="font-weight:700; font-size:14px; color:#374151;">${escapeHtml(h.title)}</span>
          </div>
          <span style="font-weight:700; font-size:10px; text-transform:uppercase; padding:3px 10px; border-radius:999px; border:1px solid ${statusBorder}; background:${statusBg}; color:${statusText};">
            ${escapeHtml(h.badgeLabel)}
          </span>
        </div>
        <div style="font-size:12px; color:#64748B; font-weight:500; line-height:1.5;">${escapeHtml(h.description)}</div>
      </div>
    `;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Summary</div>
      ${cardsHtml}
    </div>
  `;
};

const generateTrendChartSvg = (sessions: ParentSessionRecord[]) => {
  if (!sessions || sessions.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No session trend data available for this timeframe.</div>`;
  }

  const evaluatedSessions = sessions.filter((s) => s.status === 'validated' && s.rubricEvaluation);

  const dateMap: Record<string, { sum: number; count: number }> = {};
  const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach((s) => {
    let scorePct: number | null = null;
    if (s.status === 'validated' && s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      scorePct = Math.round((sum / 25) * 100);
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

  const averageScore = Math.round(chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length);
  const trendDiff = chartData.length >= 2 ? Math.round((chartData[chartData.length - 1].score - chartData[0].score) * 10) / 10 : null;

  const forecast = generateProgressForecast(sessions);

  const trendBadgeHtml = trendDiff !== null ? `
    <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:${trendDiff >= 0 ? '#E8F5E9' : '#FEE2E2'}; color:${trendDiff >= 0 ? '#179D33' : '#EF4444'}; border:1px solid ${trendDiff >= 0 ? '#86EFAC' : '#FCA5A5'};">
      ${trendDiff >= 0 ? '▲' : '▼'} ${trendDiff > 0 ? '+' : ''}${trendDiff}%
    </span>
  ` : '';

  const forecastBoxHtml = forecast.projected14DayScore !== null ? `
    <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:12px; padding:8px 14px; text-align:right;">
      <div style="font-weight:700; font-size:10px; color:#15803D; text-transform:uppercase; letter-spacing:0.5px;">2-WEEK OUTLOOK</div>
      <div style="font-weight:800; font-size:15px; color:#166534; margin-top:2px;">~${forecast.projected14DayScore}% Predicted</div>
      <div style="font-weight:700; font-size:10px; color:#15803D; margin-top:2px;">
        ${forecast.estimatedDaysToMastery ? `~${forecast.estimatedDaysToMastery} days to 85% goal` : 'Based on current pace'}
      </div>
    </div>
  ` : '';

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

  const baselineY = paddingTop + chartH;

  let linePathD = '';
  let areaPathD = '';

  if (points.length === 1) {
    const p = points[0];
    const halfWidth = 35;
    linePathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)}`;
    areaPathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${baselineY.toFixed(1)} L ${(p.x - halfWidth).toFixed(1)} ${baselineY.toFixed(1)} Z`;
  } else if (points.length > 1) {
    linePathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
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
    areaPathD = `${linePathD} L ${lastPt.x.toFixed(1)} ${baselineY.toFixed(1)} L ${firstPt.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
  }

  const dotsSvg = points.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#62A9E6" stroke="#FFFFFF" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="11" font-weight="700" fill="#62A9E6" text-anchor="middle">${p.score}%</text>
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
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Progress Over Time</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:32px; font-weight:800; color:#484A4B; line-height:1;">${averageScore}%</span>
            ${trendBadgeHtml}
          </div>
          <div style="font-weight:700; font-size:11px; color:#9CA3AF; text-transform:uppercase; tracking:0.5px; margin-top:4px;">Average Progress Score</div>
        </div>
        ${forecastBoxHtml}
      </div>

      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="${svgHeight}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#62A9E6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#62A9E6" stop-opacity="0.05" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPathD}" fill="rgba(98, 169, 230, 0.20)" />
        <path d="${areaPathD}" fill="url(#trendGrad)" />
        <path d="${linePathD}" fill="none" stroke="#62A9E6" stroke-width="3" stroke-linecap="round" />
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
    if (s.status === 'validated' && s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      scorePct = Math.round((sum / 25) * 100);
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

  const barsHtml = activityData.map((item, idx) => {
    const val = Math.min(100, Math.max(0, item.value));
    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:14px; padding:12px 14px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:14px; color:#374151;">${escapeHtml(item.label)}</span>
          <span style="font-weight:700; font-size:12px; color:#62A9E6; background:#E0F2FE; border:1px solid #BBE8FB; border-radius:999px; padding:3px 10px;">${val}%</span>
        </div>
        <div style="width:100%; height:12px; border-radius:999px; background:#F3F4F6; position:relative; overflow:hidden;">
          <div style="position:absolute; top:0; left:25%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          <div style="position:absolute; top:0; left:50%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          <div style="position:absolute; top:0; left:75%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          ${val > 0 ? `<div style="width:${val}%; height:100%; border-radius:999px; background:linear-gradient(90deg, #62A9E6 0%, #3B82F6 100%); position:relative; z-index:2;"></div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Activity Performance</div>
      ${barsHtml}
    </div>
  `;
};

const generateSkillRadarSvg = (skillBreakdown: { label: string; value: number }[]) => {
  if (!skillBreakdown || skillBreakdown.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No skill performance data available.</div>`;
  }

  const legendListHtml = skillBreakdown.map((s, idx) => {
    const val = Math.min(100, Math.max(0, Math.round(s.value)));
    const domainColor = DOMAIN_COLORS[idx % DOMAIN_COLORS.length];

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:12px; padding:10px 14px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${domainColor}; flex-shrink:0;"></div>
            <span style="font-weight:700; font-size:13px; color:#374151;">${escapeHtml(s.label)}</span>
          </div>
          <span style="font-weight:700; font-size:12px; color:${domainColor}; background:${domainColor}18; border:1px solid ${domainColor}50; border-radius:999px; padding:2px 10px;">${val}%</span>
        </div>
        <div style="width:100%; height:6px; background:#E5E7EB; border-radius:999px; overflow:hidden;">
          <div style="width:${val}%; height:100%; background:${domainColor}; border-radius:999px;"></div>
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

    const levels = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = levels.map((lvl) => {
      const points = skillBreakdown.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * lvl * Math.cos(angle);
        const y = center + radius * lvl * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${points}" fill="none" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="${lvl === 1.0 ? 'none' : '3,3'}" />`;
    }).join('');

    const axisLines = skillBreakdown.map((s, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];

      return `
        <line x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E2E8F0" stroke-width="1.5" />
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${color}" fill-opacity="0.35" />
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}" />
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
      return `
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#62A9E6" fill-opacity="0.3" />
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#FFFFFF" stroke="#62A9E6" stroke-width="2" />
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
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Skill Performance</div>
      <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:240px;">
          ${legendListHtml}
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

  const evaluatedSessions = data.sessions.filter((s) => s.status === 'validated' && s.rubricEvaluation);
  const narrativeHighlights = generateNarrativeHighlights(evaluatedSessions, data.masterDomains || []);
  const summaryHtml = generateNarrativeSummaryHtml(narrativeHighlights);

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
  const domainPracticeHtml = data.domainExposure && data.domainExposure.length > 0
    ? generateClassDevelopmentalDomainPracticeSvg(data.domainExposure)
    : '';

  const studentRecs = generateStudentRecommendations(
    data.sessions
      .filter((s) => s.status === 'validated' && s.rubricEvaluation)
      .map((s) => ({
        id: s.id,
        student_id: s.studentId,
        rubric_evaluation: s.rubricEvaluation,
        created_at: s.date.toISOString(),
      })),
    data.domainExposure || [],
    student?.name || 'Learner'
  );

  const studentRecsHtml = studentRecs.length > 0 ? `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Actionable Recommendations</div>
      ${studentRecs.map((rec) => `
        <div style="background:${rec.bgColor}; border:2px solid ${rec.borderColor}; border-radius:14px; padding:12px 16px; margin-bottom:10px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:10px; height:10px; border-radius:50%; background:${rec.accentColor}; flex-shrink:0;"></div>
              <span style="font-weight:800; font-size:14px; color:#1E293B;">${escapeHtml(rec.title)}</span>
            </div>
            <span style="font-weight:800; font-size:10px; color:${rec.textColor}; background:${rec.bgColor}; border:1px solid ${rec.borderColor}; border-radius:999px; padding:3px 10px; text-transform:uppercase;">
              ${escapeHtml(rec.badgeLabel)}
            </span>
          </div>
          <div style="font-size:12px; color:#475569; font-weight:600; line-height:1.4;">
            ${escapeHtml(rec.description)}
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
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
          <div class="stat-value">${stats.avgSessionSeconds !== undefined
      ? (Math.floor(stats.avgSessionSeconds / 60) > 0
        ? `${Math.floor(stats.avgSessionSeconds / 60)}m ${Math.round(stats.avgSessionSeconds % 60)}s`
        : `${Math.round(stats.avgSessionSeconds % 60)}s`)
      : `${stats.avgSessionMinutes ?? 0}m`
    }</div>
          <div class="stat-label">Avg Session Duration</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalSessions}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
      </div>

      ${summaryHtml}
      ${studentRecsHtml}

      <h2>Analytics</h2>
      ${trendChartHtml}
      ${domainPracticeHtml}
      ${activityChartHtml}
      ${skillChartHtml}

      <h2>Teacher Feedback</h2>
      ${feedbackItems}
    </body>
  </html>`;
};

// Generates a PDF summary of the child's analytics and opens native share sheet.
export const exportStudentAnalyticsReportPdf = async (
  studentId: string,
  studentDetails: StudentHeaderDetails,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  timeframeLabel: string = 'Overall'
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Fetch live metrics directly from database
  let stats = { averageDuration: 0, averageMistakes: 0, totalSessions: 0 };
  let evaluations: SessionEvaluation[] = [];
  let domainExposure: MasterDomainExposure[] = [];
  let rawSessions: any[] = [];
  let milestones: Milestone[] = [];

  try {
    const [statsRes, evalsRes, domRes, sessRes, milestonesRes] = await Promise.all([
      getStudentSessionStats(studentId, filter).catch(() => ({ averageDuration: 0, averageMistakes: 0, totalSessions: 0 })),
      getStudentValidatedSessionsEvaluations(studentId).catch(() => []),
      getStudentDevelopmentalSkillsExposure(studentId, filter).catch(() => []),
      getStudentSessions(studentId).catch(() => []),
      getStudentMilestones(studentId).catch(() => []),
    ]);
    stats = statsRes || stats;
    evaluations = evalsRes || [];
    domainExposure = domRes || [];
    rawSessions = sessRes || [];
    milestones = milestonesRes || [];
  } catch (err) {
    console.error('exportStudentAnalyticsReportPdf: error loading student data', err);
  }

  // 2. Check if student needs intervention (< 3.0 / 4.0 average rubric score)
  const validScores = evaluations
    .map((e) => calculateRubricScore(e.rubric_evaluation))
    .filter((s): s is number => s !== null);
  const avgRubricScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
  const needsIntervention = avgRubricScore !== null && avgRubricScore < 3.0;

  // 3. Format Duration Helper
  const formatDuration = (avgSec: number) => {
    if (!avgSec || avgSec <= 0) return '0s';
    const min = Math.floor(avgSec / 60);
    const sec = Math.round(avgSec % 60);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  // 4. Generate Sections
  const trendChartHtml = generateStudentEvaluationTrendChartSvg(evaluations, filter);
  const domainPracticeHtml = generateClassDevelopmentalDomainPracticeSvg(domainExposure);

  const recommendations = generateStudentRecommendations(evaluations, domainExposure, studentDetails.name);
  const recommendationsHtml = recommendations.length > 0 ? recommendations.map((rec) => {
    let accentColor = '#62A9E6';
    if (rec.type === 'strength') accentColor = '#179D33';
    else if (rec.type === 'focus') accentColor = '#FFAE02';

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:14px; padding:14px 16px; margin-bottom:10px; page-break-inside:avoid;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
          <div style="width:12px; height:12px; border-radius:50%; background:${accentColor}; flex-shrink:0;"></div>
          <span style="font-weight:800; font-size:15px; color:#374151;">${escapeHtml(rec.title)}</span>
        </div>
        <div style="font-size:12px; color:#4B5563; font-weight:600; line-height:1.5; padding-left:22px;">
          ${escapeHtml(rec.description)}
        </div>
      </div>
    `;
  }).join('') : '<div style="color:#64748B; font-size:13px;">No recommendations available for this timeframe.</div>';

  const milestonesHtml = milestones.length > 0 ? `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Developmental Milestones</div>
      ${milestones.map((m) => {
        let badgeBg = '#F1F5F9';
        let badgeBorder = '#CBD5E1';
        let badgeColor = '#475569';
        if (m.status === 'Achieved') {
          badgeBg = '#ECFDF5';
          badgeBorder = '#86EFAC';
          badgeColor = '#059669';
        } else if (m.status === 'In Progress') {
          badgeBg = '#E0F2FE';
          badgeBorder = '#BBE8FB';
          badgeColor = '#0284C7';
        } else if (m.status === 'Target Set') {
          badgeBg = '#FFF7ED';
          badgeBorder = '#FFDBD4';
          badgeColor = '#C2410C';
        }

        return `
          <div style="background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:12px; padding:12px 16px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-weight:800; font-size:14px; color:#1E293B;">${escapeHtml(m.title)}</div>
              <div style="font-size:11px; color:#64748B; font-weight:600; margin-top:3px;">
                Target Date: ${escapeHtml(m.targetDate || 'No Target Date')} ${m.startDate ? `• Started: ${escapeHtml(m.startDate)}` : ''}
              </div>
            </div>
            <span style="font-weight:800; font-size:11px; color:${badgeColor}; background:${badgeBg}; border:1px solid ${badgeBorder}; border-radius:999px; padding:4px 12px; text-transform:uppercase;">
              ${escapeHtml(m.status)}
            </span>
          </div>`;
      }).join('')}
    </div>
  ` : '<div style="color:#64748B; font-size:13px;">No milestones set for this student.</div>';

  const validatedSessionsList = rawSessions.filter((s: any) => s.status === 'validated' && s.rubric_evaluation);
  const validatedSessionsHtml = validatedSessionsList.length > 0 ? validatedSessionsList.map((s: any) => {
    const rubricObj = s.rubric_evaluation || {};
    const totalPoints = Object.values(rubricObj).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
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
        <div style="background:#F1F5F9; border-radius:12px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div>
            <div style="font-weight:700; font-size:15px; color:#1E293B;">Category: ${escapeHtml(s.category || 'General')}</div>
            <div style="font-size:12px; color:#475569; font-weight:500; margin-top:2px;">Validated on ${s.date}</div>
          </div>
          <div style="background:#F0FDF4; border:2px solid #86EFAC; border-radius:8px; padding:6px 14px; text-align:center;">
            <div style="font-weight:700; font-size:15px; color:#15803D;">${totalPoints} / 20</div>
            <div style="font-weight:700; font-size:9px; color:#166534; text-transform:uppercase;">SCORE</div>
          </div>
        </div>
        <div style="font-weight:700; font-size:12px; color:#475569; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Scores</div>
        ${rubricRowsHtml}
        <div style="font-weight:700; font-size:12px; color:#475569; margin-top:14px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Teacher Remarks</div>
        <div style="background:#F1F5F9; border-radius:12px; padding:12px 16px; font-size:13px; color:#1E293B; font-weight:600; min-height:44px; line-height:1.4;">
          ${s.teacher_feedback && s.teacher_feedback.trim() ? `"${escapeHtml(s.teacher_feedback.trim())}"` : '<span style="color:#64748B; font-style:italic;">No teacher remarks entered.</span>'}
        </div>
      </div>`;
  }).join('') : '<div style="color:#64748B; font-size:13px;">No validated evaluations recorded for this timeframe.</div>';

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
      <h1>${escapeHtml(studentDetails.name)} — Student Analytics Report</h1>
      <div class="meta">
        Grade: ${escapeHtml(studentDetails.grade || 'SPED')} &nbsp;•&nbsp;
        Learner Code: #${escapeHtml(studentDetails.learnerCode || 'AUT-000')} &nbsp;•&nbsp;
        Parent Account: ${studentDetails.isLinked ? 'LINKED' : 'NOT LINKED'} &nbsp;•&nbsp;
        Generated ${generatedOn}
        <div style="margin-top:8px;">
          <span style="background:#E0F2FE; border:1px solid #BBE8FB; color:#0284C7; border-radius:6px; padding:4px 10px; font-weight:700; font-size:11px; text-transform:uppercase;">RANGE: ${escapeHtml(timeframeLabel.toUpperCase())}</span>
        </div>
      </div>

      ${needsIntervention ? `
        <div style="background:#FFF7ED; border:2px solid #FFDBD4; border-radius:14px; padding:14px 16px; margin-bottom:20px;">
          <div style="font-weight:800; font-size:15px; color:#C2410C; margin-bottom:4px;">Attention Required</div>
          <div style="font-size:12px; color:#7C2D12; font-weight:600; line-height:1.4;">
            Learner is currently performing below target mastery (3.0 / 4.0). Review recommendations below and provide guided prompts during practice.
          </div>
        </div>
      ` : ''}

      <div class="stat-row">
        <div class="stat-box" style="border-color:#BBE8FB;">
          <div class="stat-value" style="color:#62A9E6;">${formatDuration(stats.averageDuration)}</div>
          <div class="stat-label">AVERAGE SESSION</div>
          <div style="font-size:11px; color:#9CA3AF; margin-top:2px;">Time spent per session</div>
        </div>
        <div class="stat-box" style="border-color:#FECDD3;">
          <div class="stat-value" style="color:#F43F5E;">${stats.averageMistakes.toFixed(1)}</div>
          <div class="stat-label">AVERAGE MISTAKES</div>
          <div style="font-size:11px; color:#9CA3AF; margin-top:2px;">Mistakes per session</div>
        </div>
        <div class="stat-box" style="border-color:#CBFAC4;">
          <div class="stat-value" style="color:#15803D;">${stats.totalSessions}</div>
          <div class="stat-label">COMPLETED SESSIONS</div>
          <div style="font-size:11px; color:#9CA3AF; margin-top:2px;">Total sessions recorded</div>
        </div>
      </div>

      ${recommendations.length > 0 ? `
        <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
          <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Actionable Recommendations</div>
          ${recommendationsHtml}
        </div>
      ` : ''}

      <h2>Developmental Milestones</h2>
      ${milestonesHtml}

      <h2>Evaluation Trend</h2>
      ${trendChartHtml}

      <h2>Developmental Domain Practice</h2>
      ${domainPracticeHtml}

      <h2>Validated Session Evaluations</h2>
      ${validatedSessionsHtml}
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${studentDetails.name || 'Learner'} Progress Report`,
    });
  }

  return uri;
};

export const exportClassAnalyticsReportExcel = async (
  classId: string,
  classTitle: string,
  classGrade: string,
  students: any[],
  stats: any,
  timeframeLabel: string = 'Overall',
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let evaluations: SessionEvaluation[] = [];
  let domainExposure: MasterDomainExposure[] = [];

  try {
    const [evalsRes, domRes] = await Promise.all([
      getValidatedSessionsEvaluations(classId).catch(() => []),
      getClassDevelopmentalSkillsExposure(classId, filter).catch(() => []),
    ]);
    evaluations = evalsRes || [];
    domainExposure = domRes || [];
  } catch (err) {
    console.error('exportClassAnalyticsReportExcel: error fetching data', err);
  }

  const wb = XLSX.utils.book_new();

  const forecastResult = calculateClassProgressForecast(evaluations, filter);

  // Sheet 1: Class Overview
  const needsAttentionCount = students.filter((s) => s.needsIntervention).length;
  const overviewData = [
    ['Class Analytics Report'],
    ['Generated On', generatedOn],
    ['Class Title', classTitle],
    ['Grade', classGrade || 'SPED'],
    ['Timeframe Range', timeframeLabel],
    [''],
    ['Metric', 'Value'],
    ['Total Enrolled Students', students.length],
    ['Students Needing Attention', needsAttentionCount],
    ['Average Session Duration', stats ? `${Math.floor(stats.averageDuration / 60)}m ${Math.round(stats.averageDuration % 60)}s` : 'N/A'],
    ['Average Mistakes per Session', stats ? stats.averageMistakes.toFixed(1) : 'N/A'],
    ['Total Validated Sessions', stats ? stats.totalSessions : 'N/A'],
    ['2-Week Forecast Projected Score', forecastResult.projected14DayScore !== null ? `~${forecastResult.projected14DayScore} / 4.0 Predicted` : 'N/A'],
    ['2-Week Forecast Outlook', forecastResult.estimatedDaysToMastery ? `~${forecastResult.estimatedDaysToMastery} days to ${forecastResult.targetBenchmark} benchmark` : 'Based on current trajectory'],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: Enrolled Students
  const studentsRows = [
    ['Student Name', 'Learner Code', 'Average Rubric Score (0-4)', 'Attention Needed Status'],
    ...students.map((st) => [
      st.name,
      st.learnerCode || st.learner_code || 'N/A',
      st.averageScore !== undefined ? st.averageScore.toFixed(2) : 'No evaluations',
      st.needsIntervention ? 'ATTENTION REQUIRED' : 'ON TRACK',
    ]),
  ];
  const wsStudents = XLSX.utils.aoa_to_sheet(studentsRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Enrolled Students');

  // Sheet 3: Validated Evaluations
  const evalsRows = [
    ['Session ID', 'Student ID', 'Evaluation Date', 'Looking at Objects', 'Concentrating', 'Performing Task', 'Following Instructions', 'Completed Work', 'Average Score', 'Teacher Remarks'],
    ...evaluations.map((e) => {
      const r = e.rubric_evaluation || {};
      const score = calculateRubricScore(r);
      return [
        e.id,
        e.student_id || 'N/A',
        new Date(e.created_at).toLocaleDateString('en-US'),
        r.looking_at_objects ?? 'N/A',
        r.concentrating ?? 'N/A',
        r.performing_task ?? 'N/A',
        r.following_instructions ?? 'N/A',
        r.completed_work ?? 'N/A',
        score !== null ? score.toFixed(2) : 'N/A',
        (e as any).teacher_remarks || (e as any).feedback || '',
      ];
    }),
  ];
  const wsEvals = XLSX.utils.aoa_to_sheet(evalsRows);
  XLSX.utils.book_append_sheet(wb, wsEvals, 'Validated Evaluations');

  // Sheet 4: Developmental Domain Exposure
  const domainRows = [
    ['Domain Title', 'Total Practices', 'Status'],
    ...domainExposure.map((d) => {
      const totalCount = d.skills ? d.skills.reduce((a, b) => a + b.count, 0) : 0;
      return [
        d.masterDomain,
        totalCount,
        totalCount < 5 ? 'FOCUS NEEDED' : 'ADEQUATE',
      ];
    }),
  ];
  const wsDomains = XLSX.utils.aoa_to_sheet(domainRows);
  XLSX.utils.book_append_sheet(wb, wsDomains, 'Domain Exposure');

  const setWorksheetColumnWidths = (ws: XLSX.WorkSheet, dataRows: (string | number)[][]) => {
    if (!dataRows || dataRows.length === 0) return;
    const colCount = Math.max(...dataRows.map((r) => r.length));
    const colWidths: { wch: number }[] = [];

    for (let c = 0; c < colCount; c++) {
      let maxLen = 14;
      for (let r = 0; r < dataRows.length; r++) {
        const val = dataRows[r][c];
        if (val !== undefined && val !== null) {
          const strVal = String(val);
          if (strVal.length > maxLen) {
            maxLen = strVal.length;
          }
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 6, 80) });
    }

    ws['!cols'] = colWidths;
  };

  setWorksheetColumnWidths(wsOverview, overviewData);
  setWorksheetColumnWidths(wsStudents, studentsRows);
  setWorksheetColumnWidths(wsEvals, evalsRows);
  setWorksheetColumnWidths(wsDomains, domainRows);

  // Write file and open share sheet
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const sanitizedTitle = classTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedTitle}_Class_Analytics_${Date.now()}.xlsx`;
  const uri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(uri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Export ${classTitle} Excel Report`,
      UTI: 'com.microsoft.excel.xlsx',
    });
  }

  return uri;
};

export const exportStudentAnalyticsReportExcel = async (
  studentId: string,
  studentDetails: StudentHeaderDetails,
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall',
  timeframeLabel: string = 'Overall'
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let stats = { averageDuration: 0, averageMistakes: 0, totalSessions: 0 };
  let evaluations: SessionEvaluation[] = [];
  let domainExposure: MasterDomainExposure[] = [];
  let rawSessions: any[] = [];
  let milestones: Milestone[] = [];

  try {
    const [statsRes, evalsRes, domRes, sessRes, milestonesRes] = await Promise.all([
      getStudentSessionStats(studentId, filter).catch(() => ({ averageDuration: 0, averageMistakes: 0, totalSessions: 0 })),
      getStudentValidatedSessionsEvaluations(studentId).catch(() => []),
      getStudentDevelopmentalSkillsExposure(studentId, filter).catch(() => []),
      getStudentSessions(studentId).catch(() => []),
      getStudentMilestones(studentId).catch(() => []),
    ]);
    stats = statsRes || stats;
    evaluations = evalsRes || [];
    domainExposure = domRes || [];
    rawSessions = sessRes || [];
    milestones = milestonesRes || [];
  } catch (err) {
    console.error('exportStudentAnalyticsReportExcel: error loading student data', err);
  }

  const validScores = evaluations
    .map((e) => calculateRubricScore(e.rubric_evaluation))
    .filter((s): s is number => s !== null);
  const avgRubricScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
  const needsIntervention = avgRubricScore !== null && avgRubricScore < 3.0;

  const wb = XLSX.utils.book_new();

  const formatDuration = (avgSec: number) => {
    if (!avgSec || avgSec <= 0) return '0s';
    const min = Math.floor(avgSec / 60);
    const sec = Math.round(avgSec % 60);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  const forecastResult = calculateStudentProgressForecast(evaluations, filter);

  const overviewData = [
    ['Student Analytics Report'],
    ['Generated On', generatedOn],
    ['Student Name', studentDetails.name],
    ['Learner Code', studentDetails.learnerCode || 'AUT-000'],
    ['Grade', studentDetails.grade || 'SPED'],
    ['Parent Account Linked', studentDetails.isLinked ? 'YES' : 'NO'],
    ['Timeframe Range', timeframeLabel],
    ['Overall Rubric Score Average', avgRubricScore !== null ? avgRubricScore.toFixed(2) : 'No evaluations'],
    ['Status', needsIntervention ? 'ATTENTION REQUIRED (< 3.0)' : 'ON TRACK'],
    [''],
    ['Metric', 'Value'],
    ['Average Session Duration', formatDuration(stats.averageDuration)],
    ['Average Mistakes per Session', stats.averageMistakes.toFixed(1)],
    ['Total Recorded Sessions', stats.totalSessions],
    ['2-Week Forecast Projected Score', forecastResult.projected14DayScore !== null ? `~${forecastResult.projected14DayScore} / 4.0 Predicted` : 'N/A'],
    ['2-Week Forecast Outlook', forecastResult.estimatedDaysToMastery ? `~${forecastResult.estimatedDaysToMastery} days to ${forecastResult.targetBenchmark} benchmark` : 'Based on current trajectory'],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  const recommendations = generateStudentRecommendations(evaluations, domainExposure, studentDetails.name);
  const recRows = [
    ['Title', 'Category / Badge', 'Recommendation Description'],
    ...recommendations.map((rec) => [
      rec.title,
      rec.badgeLabel,
      rec.description,
    ]),
  ];
  const wsRecs = XLSX.utils.aoa_to_sheet(recRows);
  XLSX.utils.book_append_sheet(wb, wsRecs, 'Recommendations');

  const milestoneRows = [
    ['Milestone Title', 'Target Date', 'Start Date', 'Status'],
    ...milestones.map((m) => [
      m.title,
      m.targetDate || 'No Target Date',
      m.startDate || 'N/A',
      m.status,
    ]),
  ];
  const wsMilestones = XLSX.utils.aoa_to_sheet(milestoneRows);
  XLSX.utils.book_append_sheet(wb, wsMilestones, 'Milestones');

  const validatedSessionsList = rawSessions.filter((s: any) => s.status === 'validated' && s.rubric_evaluation);
  const valRows = [
    ['Session Date', 'Activity Title', 'Looking at Objects', 'Concentrating', 'Performing Task', 'Following Instructions', 'Completed Work', 'Average Rubric Score', 'Teacher Remarks'],
    ...validatedSessionsList.map((s: any) => {
      const r = s.rubric_evaluation || {};
      const score = calculateRubricScore(r);
      return [
        new Date(s.created_at).toLocaleDateString('en-US'),
        s.activity_title || s.activityTitle || 'Practice Session',
        r.looking_at_objects ?? 'N/A',
        r.concentrating ?? 'N/A',
        r.performing_task ?? 'N/A',
        r.following_instructions ?? 'N/A',
        r.completed_work ?? 'N/A',
        score !== null ? score.toFixed(2) : 'N/A',
        s.teacher_remarks || s.feedback || '',
      ];
    }),
  ];
  const wsVal = XLSX.utils.aoa_to_sheet(valRows);
  XLSX.utils.book_append_sheet(wb, wsVal, 'Validated Evaluations');

  const domRows = [
    ['Domain Title', 'Total Practices', 'Status'],
    ...domainExposure.map((d) => {
      const totalCount = d.skills ? d.skills.reduce((a, b) => a + b.count, 0) : 0;
      return [
        d.masterDomain,
        totalCount,
        totalCount < 5 ? 'FOCUS NEEDED' : 'ADEQUATE',
      ];
    }),
  ];
  const wsDom = XLSX.utils.aoa_to_sheet(domRows);
  XLSX.utils.book_append_sheet(wb, wsDom, 'Domain Practice');

  const setWorksheetColumnWidths = (ws: XLSX.WorkSheet, dataRows: (string | number)[][]) => {
    if (!dataRows || dataRows.length === 0) return;
    const colCount = Math.max(...dataRows.map((r) => r.length));
    const colWidths: { wch: number }[] = [];

    for (let c = 0; c < colCount; c++) {
      let maxLen = 14;
      for (let r = 0; r < dataRows.length; r++) {
        const val = dataRows[r][c];
        if (val !== undefined && val !== null) {
          const strVal = String(val);
          if (strVal.length > maxLen) {
            maxLen = strVal.length;
          }
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 6, 80) });
    }

    ws['!cols'] = colWidths;
  };

  setWorksheetColumnWidths(wsOverview, overviewData);
  setWorksheetColumnWidths(wsRecs, recRows);
  setWorksheetColumnWidths(wsMilestones, milestoneRows);
  setWorksheetColumnWidths(wsVal, valRows);
  setWorksheetColumnWidths(wsDom, domRows);

  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const sanitizedName = studentDetails.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedName}_Student_Analytics_${Date.now()}.xlsx`;
  const uri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(uri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Export ${studentDetails.name} Excel Report`,
      UTI: 'com.microsoft.excel.xlsx',
    });
  }

  return uri;
};

// Generates a PDF summary of the child's analytics and opens the native share sheet.
export const exportChildReportPdf = async (
  data: ParentDashboardData,
  stats: ReportStats,
  timeframeLabel?: string
) => {
  if (data.student?.id) {
    return exportStudentAnalyticsReportPdf(
      data.student.id,
      {
        id: data.student.id,
        name: data.student.name || 'Learner',
        learnerCode: data.student.learner_code || 'AUT-000',
        grade: data.classInfo?.grade || 'SPED',
        lastSessionDate: null,
        isLinked: true,
      },
      'overall',
      timeframeLabel || 'Overall'
    );
  }
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

// Generates a combined PDF report for all teacher feedbacks and opens native share sheet.
export const exportAllFeedbacksPdf = async (
  studentName: string,
  teacherName: string,
  feedbackList: { category: string; date: Date; teacherFeedback: string; rubricEvaluation?: any }[]
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const itemsHtml = feedbackList
    .map((item) =>
      formatFeedbackHtml({
        id: item.category,
        studentId: '',
        category: item.category,
        skill_domain: [],
        date: item.date,
        durationSeconds: 0,
        score: null,
        status: 'validated',
        teacherFeedback: item.teacherFeedback,
        validatedAt: null,
        rubricEvaluation: item.rubricEvaluation || null,
      })
    )
    .join('<div style="height: 16px;"></div>');

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E293B; padding: 24px; background: #F8FAFC; }
        .header-title { color: #0284C7; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
        .meta { font-size: 13px; color: #475569; font-weight: 500; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="header-title">${escapeHtml(studentName || 'Learner')} — All Teacher Feedbacks</div>
      <div class="meta">
        Teacher: ${escapeHtml(teacherName || 'Teacher')} &nbsp;•&nbsp; Total Feedback Reports: ${feedbackList.length} &nbsp;•&nbsp; Exported: ${generatedOn}
      </div>

      ${itemsHtml}
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${studentName || 'Learner'} All Teacher Feedbacks`,
    });
  }

  return uri;
};

// Generates a PDF report for overall Teacher Analytics
export const exportTeacherAnalyticsReportPdf = async (
  teacherName: string,
  kpi: { pendingEvaluations: number; totalStudents: number; totalClasses: number; completedSessions: number },
  classes: { title: string; grade: string; studentsCount: number; completedSessions: number; pendingEvaluations: number; evaluatedPercentage: number }[],
  recentActivity: { studentName: string; category: string; status: string; createdAt: string }[],
  timeframeLabel?: string
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const classesRowsHtml = classes.length > 0 ? classes.map((c) => `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:12px 16px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-weight:800; font-size:15px; color:#1E293B;">${escapeHtml(c.title)} (${escapeHtml(c.grade)})</span>
        <span style="font-weight:700; font-size:12px; color:#0284C7; background:#E0F2FE; border:1px solid #BBE8FB; border-radius:999px; padding:3px 10px;">${c.evaluatedPercentage}% Evaluated</span>
      </div>
      <div style="font-size:12px; color:#64748B; font-weight:500;">
        Students: ${c.studentsCount} &nbsp;•&nbsp; Completed Sessions: ${c.completedSessions} &nbsp;•&nbsp; Pending: ${c.pendingEvaluations}
      </div>
    </div>
  `).join('') : '<div style="color:#64748B; font-size:13px;">No classes found.</div>';

  const activityRowsHtml = recentActivity.length > 0 ? recentActivity.slice(0, 10).map((a) => `
    <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:10px; padding:10px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:13px; color:#374151;">${escapeHtml(a.studentName)} — ${escapeHtml(a.category)}</div>
        <div style="font-size:11px; color:#9CA3AF; margin-top:2px;">${new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <span style="font-weight:700; font-size:10px; text-transform:uppercase; padding:3px 8px; border-radius:6px; background:${a.status === 'validated' ? '#DCFCE7' : '#FEF3C7'}; color:${a.status === 'validated' ? '#15803D' : '#D97706'};">
        ${escapeHtml(a.status)}
      </span>
    </div>
  `).join('') : '<div style="color:#64748B; font-size:13px;">No recent activity in this timeframe.</div>';

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
      <h1>Teacher Analytics Report</h1>
      <div class="meta">
        Teacher: ${escapeHtml(teacherName || 'Teacher')} &nbsp;•&nbsp; Generated ${generatedOn}
        ${timeframeLabel ? `<br/><span style="background:#E0F2FE; border:1px solid #BBE8FB; color:#0284C7; border-radius:6px; padding:3px 8px; font-weight:700; font-size:11px; text-transform:uppercase; display:inline-block; margin-top:6px;">TIMEFRAME: ${escapeHtml(timeframeLabel)}</span>` : ''}
      </div>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-value">${kpi.pendingEvaluations}</div>
          <div class="stat-label">Pending Evaluations</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${kpi.totalStudents}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${kpi.totalClasses}</div>
          <div class="stat-label">Active Classes</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${kpi.completedSessions}</div>
          <div class="stat-label">Completed Sessions</div>
        </div>
      </div>

      <h2>Class Performance Breakdown</h2>
      ${classesRowsHtml}

      <h2>Recent Activity Log</h2>
      ${activityRowsHtml}
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Teacher Analytics Summary Report`,
    });
  }
  return uri;
};

const generateClassEvaluationTrendChartSvg = (
  evaluations: SessionEvaluation[],
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
) => {
  if (!evaluations || evaluations.length === 0) {
    return `
      <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid; text-align:center;">
        <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Trend</div>
        <div style="color:#94A3B8; font-size:13px; font-weight:600;">No validated evaluation data recorded for this timeframe.</div>
      </div>
    `;
  }

  const now = new Date();
  let threshold = new Date(0);
  if (filter === 'today') {
    threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    threshold = new Date();
    threshold.setDate(now.getDate() - 7);
    threshold.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    threshold = new Date();
    threshold.setDate(now.getDate() - 30);
    threshold.setHours(0, 0, 0, 0);
  }

  const filtered = evaluations.filter((s) => new Date(s.created_at) >= threshold);

  const calculateSessionScore = (rubric: any): number | null => {
    if (!rubric) return null;
    let parsed = rubric;
    if (typeof rubric === 'string') {
      try { parsed = JSON.parse(rubric); } catch { return null; }
    }
    if (!parsed || typeof parsed !== 'object') return null;
    const values = Object.values(parsed).map((v) => Number(v));
    if (values.length === 0) return null;
    const sum = values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
    return sum / values.length;
  };

  const groups: Record<string, number[]> = {};
  filtered.forEach((s) => {
    const score = calculateSessionScore(s.rubric_evaluation);
    if (score === null) return;
    const dateKey = new Date(s.created_at).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(score);
  });

  const sortedDateKeys = Object.keys(groups).sort();
  const chartData = sortedDateKeys.map((dateKey) => {
    const scores = groups[dateKey];
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    const d = new Date(dateKey + 'T00:00:00');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      date: dateKey,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      score: Number(avg.toFixed(2)),
    };
  });

  if (chartData.length === 0) {
    return `
      <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid; text-align:center;">
        <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Trend</div>
        <div style="color:#94A3B8; font-size:13px; font-weight:600;">No evaluation scores recorded for this timeframe.</div>
      </div>
    `;
  }

  const averageScore = (chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length).toFixed(1);
  const trendDiff = chartData.length >= 2 ? Math.round(((chartData[chartData.length - 1].score - chartData[0].score) / chartData[0].score) * 1000) / 10 : null;

  const trendBadgeHtml = trendDiff !== null ? `
    <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:${trendDiff >= 0 ? '#E0F2FE' : '#FEE2E2'}; color:${trendDiff >= 0 ? '#62A9E6' : '#EF4444'}; border:1px solid ${trendDiff >= 0 ? '#BBE8FB' : '#FCA5A5'};">
      ${trendDiff >= 0 ? '▲' : '▼'} ${trendDiff > 0 ? '+' : ''}${trendDiff}%
    </span>
  ` : '';

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const step = chartData.length > 1 ? chartW / (chartData.length - 1) : chartW;

  const forecastResult = calculateClassProgressForecast(evaluations, filter);
  const hasForecast = forecastResult.points.length > chartData.length;
  const futurePtsData = hasForecast ? forecastResult.points.filter((p) => p.isForecast) : [];
  const totalPlotPoints = chartData.length + futurePtsData.length;

  const points = chartData.map((d, idx) => {
    const x = paddingLeft + (totalPlotPoints > 1 ? (idx / (totalPlotPoints - 1)) * chartW : chartW / 2);
    const clampedScore = Math.max(0, Math.min(4, d.score));
    const y = paddingTop + (chartH - (clampedScore / 4) * chartH);
    return { x, y, score: d.score, label: d.label };
  });

  const forecastPts = futurePtsData.map((d, idx) => {
    const i = chartData.length + idx;
    const x = paddingLeft + (totalPlotPoints > 1 ? (i / (totalPlotPoints - 1)) * chartW : chartW / 2);
    const clampedScore = Math.max(0, Math.min(4, d.forecastScore ?? 0));
    const y = paddingTop + (chartH - (clampedScore / 4) * chartH);
    return { x, y, score: d.forecastScore ?? 0, label: d.label };
  });

  const baselineY = paddingTop + chartH;

  let linePathD = '';
  let areaPathD = '';

  if (points.length === 1 && forecastPts.length === 0) {
    const p = points[0];
    const halfWidth = 35;
    linePathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)}`;
    areaPathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${baselineY.toFixed(1)} L ${(p.x - halfWidth).toFixed(1)} ${baselineY.toFixed(1)} Z`;
  } else {
    linePathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
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
    areaPathD = `${linePathD} L ${lastPt.x.toFixed(1)} ${baselineY.toFixed(1)} L ${firstPt.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
  }

  let forecastLinePathD = '';
  if (forecastPts.length > 0) {
    const startPt = points[points.length - 1];
    forecastLinePathD = `M ${startPt.x.toFixed(1)} ${startPt.y.toFixed(1)}`;
    forecastPts.forEach((fp) => {
      forecastLinePathD += ` L ${fp.x.toFixed(1)} ${fp.y.toFixed(1)}`;
    });
  }

  const dotsSvg = points.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#62A9E6" stroke="#FFFFFF" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="10" font-weight="700" fill="#62A9E6" text-anchor="middle">${p.score}</text>
  `).join('');

  const forecastDotsSvg = forecastPts.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#FFFFFF" stroke="#34D399" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="9" font-weight="700" fill="#10B981" text-anchor="middle">${p.score}</text>
  `).join('');

  const gridLines = [0, 1, 2, 3, 4].map((val) => {
    const y = paddingTop + chartH - (val / 4) * chartH;
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="#F3F4F6" stroke-dasharray="4,4" stroke-width="1" />
      <text x="${paddingLeft - 8}" y="${y + 3}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="end">${val}</text>
    `;
  }).join('');

  const xAxisLabels = (() => {
    const allPts = [...points, ...forecastPts];
    const total = allPts.length;
    if (total === 1) {
      return `<text x="${allPts[0].x.toFixed(1)}" y="${svgHeight - 8}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="middle">${allPts[0].label}</text>`;
    }
    const midIdx = Math.floor((total - 1) / 2);
    const indicesToShow = Array.from(new Set([0, midIdx, total - 1]));
    return indicesToShow.map((idx) => {
      const pt = allPts[idx];
      let anchor = 'middle';
      if (idx === 0) anchor = 'start';
      else if (idx === total - 1) anchor = 'end';
      return `<text x="${pt.x.toFixed(1)}" y="${svgHeight - 8}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="${anchor}">${pt.label}</text>`;
    }).join('');
  })();

  const forecastOutlookHtml = forecastResult.projected14DayScore !== null ? `
    <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:10px; padding:6px 12px; text-align:right;">
      <div style="font-weight:800; font-size:10px; color:#15803D; text-transform:uppercase;">2-Week Outlook</div>
      <div style="font-weight:800; font-size:13px; color:#166534; margin-top:2px;">~${forecastResult.projected14DayScore} / 4.0 Predicted</div>
      <div style="font-weight:700; font-size:10px; color:#15803D; margin-top:2px;">
        ${forecastResult.estimatedDaysToMastery ? `~${forecastResult.estimatedDaysToMastery} days to ${forecastResult.targetBenchmark} benchmark` : 'Based on current trajectory'}
      </div>
    </div>
  ` : '';

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Trend</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:32px; font-weight:800; color:#484A4B; line-height:1;">${averageScore}</span>
            ${trendBadgeHtml}
          </div>
          <div style="font-weight:700; font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Average Daily Evaluation Score (0–4 Scale)</div>
        </div>
        ${forecastOutlookHtml}
      </div>

      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;">
        <defs>
          <linearGradient id="classTrendGrad" x1="0" y1="0" x2="0" y2="${svgHeight}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#62A9E6" stop-opacity="0.28" />
            <stop offset="80%" stop-color="#62A9E6" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#62A9E6" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPathD}" fill="url(#classTrendGrad)" />
        <path d="${linePathD}" fill="none" stroke="#62A9E6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${forecastLinePathD ? `<path d="${forecastLinePathD}" fill="none" stroke="#34D399" stroke-width="2.5" stroke-dasharray="5,5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        ${dotsSvg}
        ${forecastDotsSvg}
        ${xAxisLabels}
      </svg>
    </div>
  `;
};

const generateStudentEvaluationTrendChartSvg = (
  evaluations: SessionEvaluation[],
  filter: 'today' | 'week' | 'month' | 'overall' = 'overall'
) => {
  const groups: Record<string, number[]> = {};
  const filtered = (evaluations || []).filter((s) => {
    if (filter === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      return new Date(s.created_at) >= start;
    }
    if (filter === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0);
      return new Date(s.created_at) >= d;
    }
    if (filter === 'month') {
      const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0, 0, 0, 0);
      return new Date(s.created_at) >= d;
    }
    return true;
  });

  filtered.forEach((s) => {
    const score = calculateRubricScore(s.rubric_evaluation);
    if (score === null) return;
    const dateKey = new Date(s.created_at).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(score);
  });

  const sortedKeys = Object.keys(groups).sort();
  const chartData = sortedKeys.map((dateKey) => {
    const scores = groups[dateKey];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const d = new Date(dateKey + 'T00:00:00');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      date: dateKey,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      score: Number(avg.toFixed(2)),
    };
  });

  if (chartData.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No evaluation trend data available for this timeframe.</div>`;
  }

  const averageScore = (chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length).toFixed(1);
  const trendDiff = chartData.length >= 2 ? Math.round(((chartData[chartData.length - 1].score - chartData[0].score) / chartData[0].score) * 1000) / 10 : null;

  const trendBadgeHtml = trendDiff !== null ? `
    <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:${trendDiff >= 0 ? '#E0F2FE' : '#FEE2E2'}; color:${trendDiff >= 0 ? '#62A9E6' : '#EF4444'}; border:1px solid ${trendDiff >= 0 ? '#BBE8FB' : '#FCA5A5'};">
      ${trendDiff >= 0 ? '▲' : '▼'} ${trendDiff > 0 ? '+' : ''}${trendDiff}%
    </span>
  ` : '';

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const forecastResult = calculateStudentProgressForecast(evaluations, filter);
  const hasForecast = forecastResult.points.length > chartData.length;
  const futurePtsData = hasForecast ? forecastResult.points.filter((p) => p.isForecast) : [];
  const totalPlotPoints = chartData.length + futurePtsData.length;

  const points = chartData.map((d, idx) => {
    const x = paddingLeft + (totalPlotPoints > 1 ? (idx / (totalPlotPoints - 1)) * chartW : chartW / 2);
    const clampedScore = Math.max(0, Math.min(4, d.score));
    const y = paddingTop + (chartH - (clampedScore / 4) * chartH);
    return { x, y, score: d.score, label: d.label };
  });

  const forecastPts = futurePtsData.map((d, idx) => {
    const i = chartData.length + idx;
    const x = paddingLeft + (totalPlotPoints > 1 ? (i / (totalPlotPoints - 1)) * chartW : chartW / 2);
    const clampedScore = Math.max(0, Math.min(4, d.forecastScore ?? 0));
    const y = paddingTop + (chartH - (clampedScore / 4) * chartH);
    return { x, y, score: d.forecastScore ?? 0, label: d.label };
  });

  const baselineY = paddingTop + chartH;

  let linePathD = '';
  let areaPathD = '';

  if (points.length === 1 && forecastPts.length === 0) {
    const p = points[0];
    const halfWidth = 35;
    linePathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)}`;
    areaPathD = `M ${(p.x - halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + halfWidth).toFixed(1)} ${baselineY.toFixed(1)} L ${(p.x - halfWidth).toFixed(1)} ${baselineY.toFixed(1)} Z`;
  } else {
    linePathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
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
    areaPathD = `${linePathD} L ${lastPt.x.toFixed(1)} ${baselineY.toFixed(1)} L ${firstPt.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
  }

  let forecastLinePathD = '';
  if (forecastPts.length > 0) {
    const startPt = points[points.length - 1];
    forecastLinePathD = `M ${startPt.x.toFixed(1)} ${startPt.y.toFixed(1)}`;
    forecastPts.forEach((fp) => {
      forecastLinePathD += ` L ${fp.x.toFixed(1)} ${fp.y.toFixed(1)}`;
    });
  }

  const dotsSvg = points.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#62A9E6" stroke="#FFFFFF" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="10" font-weight="700" fill="#62A9E6" text-anchor="middle">${p.score}</text>
  `).join('');

  const forecastDotsSvg = forecastPts.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#FFFFFF" stroke="#34D399" stroke-width="2" />
    <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="9" font-weight="700" fill="#10B981" text-anchor="middle">${p.score}</text>
  `).join('');

  const gridLines = [0, 1, 2, 3, 4].map((val) => {
    const y = paddingTop + chartH - (val / 4) * chartH;
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="#F3F4F6" stroke-dasharray="4,4" stroke-width="1" />
      <text x="${paddingLeft - 8}" y="${y + 3}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="end">${val}</text>
    `;
  }).join('');

  const xAxisLabels = (() => {
    const allPts = [...points, ...forecastPts];
    const total = allPts.length;
    if (total === 1) {
      return `<text x="${allPts[0].x.toFixed(1)}" y="${svgHeight - 8}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="middle">${allPts[0].label}</text>`;
    }
    const midIdx = Math.floor((total - 1) / 2);
    const indicesToShow = Array.from(new Set([0, midIdx, total - 1]));
    return indicesToShow.map((idx) => {
      const pt = allPts[idx];
      let anchor = 'middle';
      if (idx === 0) anchor = 'start';
      else if (idx === total - 1) anchor = 'end';
      return `<text x="${pt.x.toFixed(1)}" y="${svgHeight - 8}" font-size="10" font-weight="600" fill="#9CA3AF" text-anchor="${anchor}">${pt.label}</text>`;
    }).join('');
  })();

  const forecastOutlookHtml = forecastResult.projected14DayScore !== null ? `
    <div style="background:#ECFDF5; border:1px solid #86EFAC; border-radius:10px; padding:6px 12px; text-align:right;">
      <div style="font-weight:800; font-size:10px; color:#059669; text-transform:uppercase;">2-Week Outlook</div>
      <div style="font-weight:800; font-size:13px; color:#065F46; margin-top:2px;">~${forecastResult.projected14DayScore} / 4.0 Predicted</div>
      <div style="font-weight:700; font-size:10px; color:#059669; margin-top:2px;">
        ${forecastResult.estimatedDaysToMastery ? `~${forecastResult.estimatedDaysToMastery} days to ${forecastResult.targetBenchmark} benchmark` : 'Based on current trajectory'}
      </div>
    </div>
  ` : '';

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Evaluation Trend</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:32px; font-weight:800; color:#484A4B; line-height:1;">${averageScore}</span>
            ${trendBadgeHtml}
          </div>
          <div style="font-weight:700; font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Average Daily Evaluation Score (0–4 Scale)</div>
        </div>
        ${forecastOutlookHtml}
      </div>

      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;">
        <defs>
          <linearGradient id="studentTrendGrad" x1="0" y1="0" x2="0" y2="${svgHeight}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#62A9E6" stop-opacity="0.28" />
            <stop offset="80%" stop-color="#62A9E6" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#62A9E6" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPathD}" fill="url(#studentTrendGrad)" />
        <path d="${linePathD}" fill="none" stroke="#62A9E6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${forecastLinePathD ? `<path d="${forecastLinePathD}" fill="none" stroke="#34D399" stroke-width="2.5" stroke-dasharray="5,5" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        ${dotsSvg}
        ${forecastDotsSvg}
        ${xAxisLabels}
      </svg>
    </div>
  `;
};

const DOMAIN_THEMES_REPORT = [
  { startColor: '#BBE8FB', endColor: '#62A9E6', accentText: '#62A9E6', pillBg: '#F0F9FF', pillBorder: '#BBE8FB' },
  { startColor: '#CBFAC4', endColor: '#34D399', accentText: '#16A34A', pillBg: '#F0FDF4', pillBorder: '#CBFAC4' },
  { startColor: '#FFDBD4', endColor: '#FF8870', accentText: '#FF8870', pillBg: '#FFF7ED', pillBorder: '#FFDBD4' },
  { startColor: '#FFF3C4', endColor: '#FBBF24', accentText: '#D97706', pillBg: '#FFFBEB', pillBorder: '#FFF3C4' },
  { startColor: '#DDD6FE', endColor: '#A78BFA', accentText: '#7C3AED', pillBg: '#FAF5FF', pillBorder: '#DDD6FE' },
];

const generateClassDevelopmentalDomainPracticeSvg = (
  domainExposure: MasterDomainExposure[]
) => {
  if (!domainExposure || domainExposure.length === 0) {
    return `
      <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid; text-align:center;">
        <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Developmental Domain Practice</div>
        <div style="color:#94A3B8; font-size:13px; font-weight:600;">No developmental skills practice recorded for this timeframe.</div>
      </div>
    `;
  }

  let maxCount = 1;
  for (const domain of domainExposure) {
    for (const skill of domain.skills) {
      if (skill.count > maxCount) maxCount = skill.count;
    }
  }

  const calculateAxisTicks = (maxVal: number) => {
    const max = Math.max(1, maxVal);
    let step = 1;
    if (max <= 4) step = 1;
    else if (max <= 10) step = 2;
    else if (max <= 25) step = 5;
    else if (max <= 50) step = 10;
    else step = Math.ceil(max / 5 / 10) * 10;

    const maxScale = Math.max(step * 4, Math.ceil(max / step) * step);
    const ticks: number[] = [];
    for (let i = 0; i <= maxScale; i += step) ticks.push(i);
    return { ticks, maxScale };
  };

  const { ticks, maxScale } = calculateAxisTicks(maxCount);

  const lowestExposureDomainName = (() => {
    if (!domainExposure || domainExposure.length <= 1) return null;
    const sorted = [...domainExposure].sort((a, b) => {
      const sumA = a.skills.reduce((acc, s) => acc + s.count, 0);
      const sumB = b.skills.reduce((acc, s) => acc + s.count, 0);
      return sumA - sumB;
    });
    return sorted[0]?.masterDomain || null;
  })();

  const domainCardsHtml = domainExposure.map((domain, domainIdx) => {
    const theme = DOMAIN_THEMES_REPORT[domainIdx % DOMAIN_THEMES_REPORT.length];
    const totalDomainExposures = domain.skills.reduce((sum, s) => sum + s.count, 0);

    const skillRowsHtml = domain.skills.map((skill, skillIdx) => {
      const barWidthPercent = (skill.count / maxScale) * 100;
      const gradientId = `report-grad-${domainIdx}-${skillIdx}`;

      const gridLinesSvg = ticks.map((t) => {
        const leftPct = `${(t / maxScale) * 100}%`;
        return `<line x1="${leftPct}" y1="0" x2="${leftPct}" y2="100%" stroke="#F3F4F6" stroke-dasharray="4,4" stroke-width="1" />`;
      }).join('');

      return `
        <div style="margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:130px; font-weight:700; font-size:12px; color:#374151; flex-shrink:0;">
              ${escapeHtml(skill.name)}
            </div>
            <div style="flex:1; height:24px; position:relative; display:flex; align-items:center;">
              <svg style="position:absolute; top:0; left:0; width:100%; height:100%;">
                <defs>
                  <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${theme.startColor}" stop-opacity="1" />
                    <stop offset="100%" stop-color="${theme.endColor}" stop-opacity="1" />
                  </linearGradient>
                </defs>
                ${gridLinesSvg}
                ${barWidthPercent > 0 ? `<rect x="0" y="3" width="${Math.max(2, barWidthPercent)}%" height="18" rx="6" fill="url(#${gradientId})" />` : ''}
              </svg>
            </div>
            <div style="width:36px; text-align:right; font-weight:800; font-size:12px; color:${theme.accentText}; flex-shrink:0;">
              ${skill.count}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const tickLabelsHtml = ticks.map((t, idx) => {
      const leftPct = (t / maxScale) * 100;
      const align = idx === 0 ? 'left' : idx === ticks.length - 1 ? 'right' : 'center';
      return `<div style="position:absolute; left:${leftPct}%; transform:translateX(-50%); text-align:${align}; font-weight:700; font-size:10px; color:#9CA3AF;">${t}</div>`;
    }).join('');

    const focusBadgeHtml = domain.masterDomain === lowestExposureDomainName ? `
      <span style="background:#FFF3C4; border:1px solid #FFAE02; color:#D97706; border-radius:999px; padding:2px 8px; font-weight:800; font-size:10px; text-transform:uppercase; margin-right:6px;">
        FOCUS NEEDED
      </span>
    ` : '';

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:14px; padding:14px 16px; margin-bottom:12px; page-break-inside:avoid;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #E5E7EB;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:12px; height:12px; border-radius:50%; background:${theme.endColor}; flex-shrink:0;"></div>
            <span style="font-weight:800; font-size:15px; color:#374151;">${escapeHtml(domain.masterDomain)}</span>
          </div>
          <div style="display:flex; align-items:center;">
            ${focusBadgeHtml}
            <span style="background:${theme.pillBg}; border:1px solid ${theme.pillBorder}; color:${theme.accentText}; border-radius:999px; padding:3px 10px; font-weight:800; font-size:11px; text-transform:uppercase;">
              ${totalDomainExposures} PRACTICES
            </span>
          </div>
        </div>

        ${skillRowsHtml}

        <div style="display:flex; margin-top:14px; padding-top:6px; border-top:1px solid #E5E7EB;">
          <div style="width:130px; flex-shrink:0;"></div>
          <div style="flex:1; height:18px; position:relative;">
            ${tickLabelsHtml}
          </div>
          <div style="width:36px; flex-shrink:0;"></div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.5px;">Developmental Domain Practice</div>
      ${domainCardsHtml}
    </div>
  `;
};

// Generates a PDF report for Class Analytics
export const exportClassAnalyticsReportPdf = async (
  classIdOrTitle: string,
  classTitleOrGrade?: string,
  gradeOrStudents?: any,
  studentsOrStats?: any,
  statsOrTimeframeLabel?: any,
  timeframeLabelOrFilter?: string,
  filterArg: 'today' | 'week' | 'month' | 'overall' = 'overall'
) => {
  let realClassId = '';
  let realClassTitle = '';
  let realGrade = '';
  let realStudents: { name: string; avatar?: string }[] = [];
  let realStats: { averageDuration: number; averageMistakes: number; totalSessions: number } | null = null;
  let realTimeframeLabel: string | undefined = undefined;
  let realFilter: 'today' | 'week' | 'month' | 'overall' = 'overall';

  if (Array.isArray(gradeOrStudents)) {
    // Standard signature with classId: (classId, classTitle, grade, students, stats, timeframeLabel, filter)
    realClassId = classIdOrTitle;
    realClassTitle = classTitleOrGrade || '';
    realGrade = gradeOrStudents ? '' : ''; // Handled below
    realStudents = gradeOrStudents;
    realStats = studentsOrStats;
    realTimeframeLabel = statsOrTimeframeLabel;
    realFilter = timeframeLabelOrFilter as any || filterArg;
    if (typeof gradeOrStudents === 'string') {
      realGrade = gradeOrStudents;
    }
  } else {
    // Signature: (classId, classTitle, grade, students, stats, timeframeLabel, filter)
    realClassId = classIdOrTitle;
    realClassTitle = classTitleOrGrade || '';
    realGrade = typeof gradeOrStudents === 'string' ? gradeOrStudents : '';
    realStudents = Array.isArray(studentsOrStats) ? studentsOrStats : [];
    realStats = statsOrTimeframeLabel && typeof statsOrTimeframeLabel === 'object' ? statsOrTimeframeLabel : null;
    realTimeframeLabel = timeframeLabelOrFilter;
    realFilter = filterArg;
  }

  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let evaluations: SessionEvaluation[] = [];
  let domainExposure: MasterDomainExposure[] = [];

  if (realClassId) {
    try {
      const [evalRes, domRes] = await Promise.all([
        getValidatedSessionsEvaluations(realClassId),
        getClassDevelopmentalSkillsExposure(realClassId, realFilter),
      ]);
      evaluations = evalRes || [];
      domainExposure = domRes || [];
    } catch (err) {
      console.error('exportClassAnalyticsReportPdf: error loading chart data', err);
    }
  }

  const trendChartHtml = generateClassEvaluationTrendChartSvg(evaluations, realFilter);
  const domainPracticeHtml = generateClassDevelopmentalDomainPracticeSvg(domainExposure);

  const formatDuration = (avgSeconds: number) => {
    const min = Math.floor(avgSeconds / 60);
    const sec = Math.round(avgSeconds % 60);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  const studentListHtml = realStudents.length > 0 ? realStudents.map((s) => `
    <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:10px 14px; margin-bottom:6px; display:flex; align-items:center; gap:10px;">
      <div style="width:28px; height:28px; border-radius:50%; background:#E0F2FE; border:1px solid #62A9E6; display:flex; align-items:center; justify-content:center; font-size:14px;">
        ${escapeHtml(s.avatar || '🙂')}
      </div>
      <span style="font-weight:700; font-size:13px; color:#374151;">${escapeHtml(s.name)}</span>
    </div>
  `).join('') : '<div style="color:#64748B; font-size:13px;">No enrolled students.</div>';

  const recommendations = generateClassRecommendations(evaluations, domainExposure, realStats);

  const recommendationsHtml = recommendations.length > 0 ? recommendations.map((rec) => `
    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:12px 14px; margin-bottom:10px; page-break-inside:avoid;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <div style="width:10px; height:10px; border-radius:50%; background:${rec.accentColor}; flex-shrink:0;"></div>
        <span style="font-weight:800; font-size:14px; color:#374151;">${escapeHtml(rec.title)}</span>
      </div>
      <div style="font-size:12px; color:#475569; font-weight:500; line-height:1.5; padding-left:18px;">${escapeHtml(rec.description)}</div>
    </div>
  `).join('') : '<div style="color:#64748B; font-size:13px;">No recommendations available for this timeframe.</div>';

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
      <h1>${escapeHtml(realClassTitle)}${realGrade ? ` (${escapeHtml(realGrade)})` : ''} — Class Analytics Report</h1>
      <div class="meta">
        Enrolled Students: ${realStudents.length} &nbsp;•&nbsp; Generated ${generatedOn}
        ${realTimeframeLabel ? `<br/><span style="background:#E0F2FE; border:1px solid #BBE8FB; color:#0284C7; border-radius:6px; padding:3px 8px; font-weight:700; font-size:11px; text-transform:uppercase; display:inline-block; margin-top:6px;">TIMEFRAME: ${escapeHtml(realTimeframeLabel)}</span>` : ''}
      </div>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-value">${realStats ? realStats.totalSessions : 0}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${realStats ? formatDuration(realStats.averageDuration) : '0s'}</div>
          <div class="stat-label">Avg Session Duration</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${realStats ? realStats.averageMistakes.toFixed(1) : '0.0'}</div>
          <div class="stat-label">Avg Mistakes / Session</div>
        </div>
      </div>

      <h2>Recommendations</h2>
      ${recommendationsHtml}

      <h2>Evaluation Trend & Domain Practice</h2>
      ${trendChartHtml}
      ${domainPracticeHtml}

      <h2>Enrolled Students</h2>
      ${studentListHtml}
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${realClassTitle} Analytics Report`,
    });
  }
  return uri;
};


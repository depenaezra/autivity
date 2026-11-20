import { getEmotionMeta } from '../utils/emotionZones';
import { formatActivityTitle } from '../utils/format';
import { Platform } from 'react-native';
import * as StyledXLSX from 'xlsx-js-style';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import { ActivityTypeFilter } from './analytics';
import {
  getClassDevelopmentalSkillsExposure,
  getValidatedSessionsEvaluations,
  MasterDomainExposure,
  SessionEvaluation,
} from './class-analytics';
import { generateNarrativeHighlights, generateProgressForecast, generateHomeActivities, NarrativeHighlight } from './parentAnalyticsEngine';
import { ParentDashboardData, ParentSessionRecord } from './parentDashboard';
import {
  calculateClassProgressForecast,
  generateClassRecommendations,
  calculateRubricScore,
  ClassRecommendation,
} from './classAnalyticsEngine';
import {
  generateStudentRecommendations,
  calculateStudentProgressForecast,
  calculateStudentEmotionRegulationAnalytics,
} from './studentAnalyticsEngine';
import {
  getStudentSessionStats,
  getStudentValidatedSessionsEvaluations,
  getStudentDevelopmentalSkillsExposure,
  getStudentSessions,
  getStudentMilestones,
  Milestone,
  StudentHeaderDetails,
} from './student-analytics';
import { getStudentCheckInsForFilter, getStudentCheckInsHistory } from './check-ins';
import { parentReportIcon } from './parentReportIcon';
import { getDateRangeForFilter } from '../utils/dashboardFilters';
import {
  UNIVERSAL_BENCHMARK_TIERS,
  getAccuracyTier,
  getMistakesTier,
  getHintsTier,
  getRubricTier,
} from '../constants/benchmarkLegend';

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
  text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

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

  const groups: Record<string, number[]> = {};
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
    if (scorePct !== null) {
      const day = new Date(s.date);
      const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(scorePct);
    }
  });

  const sortedDateKeys = Object.keys(groups).sort();
  const chartData = sortedDateKeys.map((dateKey) => {
    const scores = groups[dateKey];
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    const d = new Date(dateKey + 'T00:00:00');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      date: dateKey,
      label,
      shortDate,
      score: Math.round(avg),
    };
  });

  if (chartData.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No scored sessions available for this timeframe.</div>`;
  }

  const averageScore = Math.round(chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length);
  const trendDiff = chartData.length >= 2 ? Math.round((chartData[chartData.length - 1].score - chartData[0].score) * 10) / 10 : null;

  const forecast = generateProgressForecast(sessions);

  const trendBadgeHtml = trendDiff !== null ? (
    trendDiff === 0 ? (
      averageScore >= 80 ? `
        <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:#E8F5E9; color:#179D33; border:1px solid #86EFAC;">
          ✓ Mastered
        </span>
      ` : `
        <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:#E0F2FE; color:#62A9E6; border:1px solid #BBE8FB;">
          — Steady
        </span>
      `
    ) : `
      <span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:${trendDiff > 0 ? '#E8F5E9' : '#FEE2E2'}; color:${trendDiff > 0 ? '#179D33' : '#EF4444'}; border:1px solid ${trendDiff > 0 ? '#86EFAC' : '#FCA5A5'};">
        ${trendDiff > 0 ? '▲ +' : '▼ '}${trendDiff}%
      </span>
    `
  ) : '';

  const forecastBoxHtml = forecast.projected14DayScore !== null ? `
    <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:12px; padding:8px 14px; text-align:right;">
      <div style="font-weight:700; font-size:10px; color:#15803D; text-transform:uppercase; letter-spacing:0.5px;">2-WEEK OUTLOOK</div>
      <div style="font-weight:800; font-size:15px; color:#166534; margin-top:2px;">~${forecast.projected14DayScore}% Predicted</div>
      <div style="font-weight:700; font-size:10px; color:#15803D; margin-top:2px;">
        ${forecast.estimatedDaysToMastery ? `~${forecast.estimatedDaysToMastery} days to 80% goal` : 'Based on current pace'}
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
    return { x, y, score: d.score, date: d.shortDate, label: d.label };
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

  const dotsSvg = points.map((p, idx) => {
    const showLabel = points.length <= 10 || idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 8) === 0;
    return `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#62A9E6" stroke="#FFFFFF" stroke-width="2" />
      <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="11" font-weight="700" fill="#62A9E6" text-anchor="middle">${p.score}%</text>
      ${showLabel ? `<text x="${p.x.toFixed(1)}" y="${svgHeight - 8}" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">${p.date}</text>` : ''}
    `;
  }).join('');

  const gridLines = [0, 25, 50, 75, 100].map((pct) => {
    const y = paddingTop + chartH - (pct / 100) * chartH;
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="4,4" stroke-width="1" />
      <text x="${paddingLeft - 8}" y="${y + 4}" font-size="10" font-weight="600" fill="#94A3B8" text-anchor="end">${pct}%</text>
    `;
  }).join('');

  const target80Y = paddingTop + chartH - (80 / 100) * chartH;
  const target80Line = `
    <line x1="${paddingLeft}" y1="${target80Y}" x2="${svgWidth - paddingRight}" y2="${target80Y}" stroke="#8B5CF6" stroke-dasharray="4,4" stroke-width="1.5" />
    <text x="${svgWidth - paddingRight}" y="${target80Y - 5}" font-size="10" font-weight="700" fill="#7C3AED" text-anchor="end">Goal Line (80%)</text>
  `;

  return `
    <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
      <div style="font-weight:800; font-size:14px; color:#1E293B; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Learning Progress</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:32px; font-weight:800; color:#484A4B; line-height:1;">${averageScore}%</span>
            ${trendBadgeHtml}
          </div>
          <div style="font-weight:700; font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Average Progress Score</div>
        </div>
        ${forecastBoxHtml}
      </div>

      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:10px; height:10px; border-radius:50%; background:#62A9E6;"></div>
          <span style="font-size:11px; font-weight:700; color:#64748B;">Daily Score</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:12px; height:2px; background:#8B5CF6; border-radius:1px;"></div>
          <span style="font-size:11px; font-weight:700; color:#7C3AED;">Goal Line (80%)</span>
        </div>
      </div>

      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="${svgHeight}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#62A9E6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#62A9E6" stop-opacity="0.05" />
          </linearGradient>
        </defs>
        ${gridLines}
        ${target80Line}
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
    const formatted = s.category
      ? s.category.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Activity';
    if (!byCategory[formatted]) byCategory[formatted] = [];
    byCategory[formatted].push(scorePct);
  });

  const activityData = Object.entries(byCategory)
    .map(([label, scores]) => ({
      label,
      value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (activityData.length === 0) {
    return `<div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:12px; padding:20px; text-align:center; color:#94A3B8; font-size:13px; font-weight:600;">No activity performance data available.</div>`;
  }

  const barsHtml = activityData.map((item) => {
    const val = Math.min(100, Math.max(0, item.value));
    const tier = getAccuracyTier(val);

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:14px; padding:12px 14px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:14px; color:#374151;">${escapeHtml(item.label)}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700; font-size:10px; text-transform:uppercase; padding:2px 8px; border-radius:999px; border:1px solid ${tier.borderColor}; background:${tier.bgColor}; color:${tier.accentColor};">
              ${tier.parentLabel}
            </span>
            <span style="font-weight:700; font-size:12px; color:${tier.accentColor}; background:${tier.bgColor}; border:1px solid ${tier.borderColor}; border-radius:999px; padding:3px 10px;">
              ${val}%
            </span>
          </div>
        </div>
        <div style="width:100%; height:12px; border-radius:999px; background:#F3F4F6; position:relative; overflow:hidden;">
          <div style="position:absolute; top:0; left:25%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          <div style="position:absolute; top:0; left:50%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          <div style="position:absolute; top:0; left:75%; height:100%; border-left:1px dashed #CBD5E1; z-index:1;"></div>
          ${val > 0 ? `<div style="width:${val}%; height:100%; border-radius:999px; background:${tier.accentColor}; position:relative; z-index:2;"></div>` : ''}
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
    const tier = getAccuracyTier(val);

    return `
      <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:12px; padding:10px 14px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${domainColor}; flex-shrink:0;"></div>
            <span style="font-weight:700; font-size:13px; color:#374151;">${escapeHtml(s.label)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700; font-size:10px; text-transform:uppercase; padding:2px 8px; border-radius:999px; border:1px solid ${tier.borderColor}; background:${tier.bgColor}; color:${tier.accentColor};">
              ${tier.parentLabel}
            </span>
            <span style="font-weight:700; font-size:12px; color:${domainColor}; background:${domainColor}18; border:1px solid ${domainColor}50; border-radius:999px; padding:2px 10px;">${val}%</span>
          </div>
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

const buildReportHtml = (
  data: ParentDashboardData,
  stats: ReportStats,
  timeframeLabel?: string,
  activityType: ActivityTypeFilter = 'all',
  language: 'en' | 'tl' = 'en',
  checkIns: any[] = []
) => {
  const isTl = language === 'tl';
  const student = data.student;
  const studentName = student?.name || 'Learner';
  const firstName = studentName.split(' ')[0] || studentName;
  const learnerCode = student?.learner_code || 'Not recorded';
  const classTitle = data.classInfo?.title || 'Not recorded';
  const classGrade = data.classInfo?.grade || '';
  const teacherName = data.teacherName || 'Not recorded';
  const parentName = [data.parentFirstName, data.parentLastName].filter(Boolean).join(' ') || (isTl ? 'Magulang / Tagapangalaga' : 'Parent / Guardian');
  const generatedOn = new Date().toLocaleDateString(isTl ? 'fil-PH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayTimeframe = timeframeLabel || (isTl ? 'Lahat ng Tala' : 'All Time');

  const evaluatedSessions = data.sessions.filter((s) => s.status === 'validated' && s.rubricEvaluation);
  const totalSessionsCount = data.sessions.length;

  const masteryPct = evaluatedSessions.length ? `${stats.overallPerformance}%` : 'N/A';
  const sessionMins = stats.avgSessionSeconds ? `${Math.max(1, Math.round(stats.avgSessionSeconds / 60))}m` : 'N/A';

  // Domain Exposure Breakdown
  const domainCounts = {
    cognitive: 0,
    motor: 0,
    social: 0,
    adaptive: 0,
  };
  data.sessions.forEach((s) => {
    const domains = (s.skill_domain || []).flatMap((tag) => {
      const name = tag.trim().toLowerCase();
      const master = (data.masterDomains || []).find((domain) => domain.name.toLowerCase() === name || domain.subSkills.some((skill) => skill.trim().toLowerCase() === name));
      return master ? [name, master.name.toLowerCase()] : [name];
    });
    if (domains.some((d) => d.includes('cog') || d.includes('sort') || d.includes('think'))) domainCounts.cognitive++;
    if (domains.some((d) => d.includes('motor') || d.includes('hand') || d.includes('movement'))) domainCounts.motor++;
    if (domains.some((d) => d.includes('soc') || d.includes('communicat') || d.includes('turn') || d.includes('share') || d.includes('emotion'))) domainCounts.social++;
    if (domains.some((d) => d.includes('adapt') || d.includes('calm') || d.includes('routine') || d.includes('sensory'))) domainCounts.adaptive++;

  });
  const maxDomainCount = Math.max(1, ...Object.values(domainCounts));

  // Emotional Check-ins Breakdown
  let greenCount = 0;
  let yellowCount = 0;
  let blueCount = 0;
  checkIns.forEach((c) => {
    const e = (c.emotion || '').toLowerCase();
    if (e.includes('happy') || e.includes('calm') || e.includes('focused') || e.includes('ready') || e.includes('masaya') || e.includes('kalmado')) greenCount++;
    else if (['excited', 'nervous', 'energetic', 'anxious', 'angry', 'surprised', 'masigla', 'kinakabahan'].some((value) => e.includes(value))) yellowCount++;
    else if (['tired', 'sad', 'sleepy', 'low', 'sick', 'pagod', 'malungkot'].some((value) => e.includes(value))) blueCount++;

  });
  const totalCheckIns = greenCount + yellowCount + blueCount;
  const greenPct = totalCheckIns > 0 ? Math.round((greenCount / totalCheckIns) * 100) : 0;
  const yellowPct = totalCheckIns > 0 ? Math.round((yellowCount / totalCheckIns) * 100) : 0;
  const bluePct = totalCheckIns > 0 ? Math.round((blueCount / totalCheckIns) * 100) : 0;
  const displayTotalDays = totalCheckIns;
  const displayGreenDays = greenCount;
  const displayYellowDays = yellowCount;
  const displayBlueDays = blueCount;

  // Generate 3 Home Activities
  const homeActivities = generateHomeActivities(data.sessions, data.masterDomains || [], checkIns, studentName, language, data.milestones || []);

  // Recent Sessions with Teacher Notes (Capped at 8 rows)
  const sessionsWithFeedback = data.sessions
    .filter((s) => s.teacherFeedback && s.teacherFeedback.trim().length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displaySessionsList = sessionsWithFeedback.length > 0
    ? sessionsWithFeedback
    : data.sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const topSessions = displaySessionsList.slice(0, 8);

  const celebrationText = isTl
    ? `Sa napiling panahon, may <strong>${totalSessionsCount} na naitalang gawain</strong> para kay ${escapeHtml(firstName)}. Salamat sa inyong pakikiisa sa kanyang pag-aaral.`
    : `During this period, <strong>${totalSessionsCount} activities</strong> were recorded for ${escapeHtml(firstName)}. Thank you for supporting their learning journey.`;

  // Trend Chart SVG
  const trendSvg = generateTrendChartSvg(data.sessions);

  return `<!DOCTYPE html>
<html lang="${isTl ? 'tl' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>Autivity — Child Learning Journey & Progress Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }

    /* Header & Branding */
    .report-header {
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0284C7;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 8pt;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }
    .badge-parent {
      background: #ECFDF5;
      color: #059669;
      border: 1.5px solid #86EFAC;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 7px;
      border-radius: 999px;
      display: inline-block;
    }

    /* Child Demographic Strip */
    .student-card {
      background: #F0F9FF;
      border: 1.5px solid #BBE8FB;
      border-radius: 14px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 12px;
    }
    .info-label {
      font-size: 7.5pt;
      font-weight: 800;
      color: #0369A1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 11pt;
      font-weight: 800;
      color: #0F172A;
      margin-top: 1px;
    }
    .info-sub {
      font-size: 8pt;
      color: #64748B;
      font-weight: 600;
    }

    /* Celebration Box */
    .celebration-box {
      background: linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%);
      border: 1.5px solid #FDE047;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }
    .celebration-title {
      font-size: 12pt;
      font-weight: 800;
      color: #854D0E;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .celebration-text {
      font-size: 9.5pt;
      color: #713F12;
      font-weight: 500;
      line-height: 1.5;
    }

    /* KPI Highlights */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }
    .kpi-val {
      font-size: 18pt;
      font-weight: 800;
      line-height: 1;
    }
    .kpi-lbl {
      font-size: 8pt;
      font-weight: 800;
      color: #475569;
      margin-top: 4px;
    }
    .kpi-pill {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 999px;
      margin-top: 4px;
    }

    /* Section Styling */
    .section-title {
      font-size: 11.5pt;
      font-weight: 800;
      color: #1E293B;
      border-left: 4px solid #0284C7;
      padding-left: 8px;
      margin-top: 14px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-subtitle {
      font-size: 8pt;
      color: #64748B;
      font-weight: 600;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .chart-box {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .chart-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #1E293B;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Emotion Cards */
    .emotion-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .emotion-card {
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .emotion-pct {
      font-size: 17pt;
      font-weight: 800;
      line-height: 1;
    }
    .emotion-name {
      font-size: 9pt;
      font-weight: 800;
      margin-top: 4px;
    }
    .emotion-sub {
      font-size: 7.5pt;
      font-weight: 600;
      margin-top: 2px;
    }
    .emotion-desc {
      font-size: 8pt;
      font-weight: 500;
      margin-top: 6px;
      line-height: 1.35;
      background: rgba(255, 255, 255, 0.75);
      padding: 6px;
      border-radius: 8px;
    }

    /* Parent Activity & Notes Table */
    .activity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 14px;
    }
    .activity-table th {
      background: #F1F5F9;
      color: #475569;
      font-weight: 800;
      text-align: left;
      padding: 7px 8px;
      border-bottom: 1.5px solid #CBD5E1;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .activity-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      font-weight: 500;
      vertical-align: middle;
    }
    .activity-table tr:nth-child(even) td {
      background: #F8FAFC;
    }

    /* Home Activities Card */
    .home-card {
      background: #F0FDF4;
      border: 1.5px solid #86EFAC;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .home-header {
      font-size: 10.5pt;
      font-weight: 800;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .home-item {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 8.5pt;
      color: #1E293B;
      line-height: 1.45;
    }
    .home-icon {
      font-size: 13pt;
      line-height: 1;
      flex-shrink: 0;
    }

    /* Warm Footer */
    .footer-box {
      border-top: 1.5px solid #E2E8F0;
      padding-top: 12px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748B;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: CELEBRATION, CORE HIGHLIGHTS & LEARNING CHARTS -->
  <div class="report-header">
    <div>
      <div class="brand-title">
        <img src="${parentReportIcon}" alt="Autivity" width="40" height="40" style="object-fit:contain; flex-shrink:0;" />
        AUTIVITY &nbsp;|&nbsp; ${isTl ? 'Paglalakbay sa Pagkatuto at Pag-unlad' : 'Child Learning Journey & Progress'}
      </div>
      <div class="brand-subtitle">${isTl ? 'Ulat ng Pag-unlad para sa mga Magulang at Tagapangalaga' : 'A Progress Update for Parents & Guardians'}</div>
    </div>
    <div style="text-align: right;">
      <span class="badge-parent">${isTl ? 'Ulat para sa Magulang' : 'Parent Progress Report'}</span>
      <div style="font-size: 8pt; color: #64748B; font-weight: 600; margin-top: 4px;">${escapeHtml(generatedOn)}</div>
    </div>
  </div>

  <!-- Child Demographic Strip -->
  <div class="student-card">
    <div>
      <div class="info-label">${isTl ? 'Mag-aaral' : 'Learner'}</div>
      <div class="info-value">${escapeHtml(studentName)}</div>
      <div class="info-sub">${escapeHtml(learnerCode)}</div>
    </div>
    <div>
      <div class="info-label">${isTl ? 'Klase at Baitang' : 'Class & Grade'}</div>
      <div class="info-value">${escapeHtml(classTitle)}</div>
      <div class="info-sub">${escapeHtml(classGrade)}</div>
    </div>
    <div>
      <div class="info-label">${isTl ? 'Guro sa Klase' : 'Class Teacher'}</div>
      <div class="info-value">${escapeHtml(teacherName)}</div>

    </div>
    <div>
      <div class="info-label">${isTl ? 'Saklaw ng Panahon' : 'Timeframe'}</div>
      <div class="info-value" style="color: #0284C7;">${escapeHtml(displayTimeframe)}</div>
      <div class="info-sub">${isTl ? 'Mga Nai-log na Tala' : 'Recorded Logs'}</div>
    </div>
  </div>

  <!-- 1. Warm Celebration Summary -->
  <div class="celebration-box">
    <div class="celebration-title">
      <span>🌟</span> ${isTl ? `Ipagdiwang ang Pag-unlad ni ${escapeHtml(firstName)}!` : `Celebrating ${escapeHtml(firstName)}'s Progress!`}
    </div>
    <div class="celebration-text">
      ${celebrationText}
    </div>
  </div>

  <!-- 2. Four Friendly Core Highlights -->
  <div class="kpi-grid">
    <div class="kpi-card" style="border-color: #86EFAC;">
      <div class="kpi-val" style="color: #15803D;">${masteryPct}</div>
      <div class="kpi-lbl">${isTl ? 'Pangkalahatang Husay' : 'Overall Mastery'}</div>
      <span class="kpi-pill" style="background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC;">
        ⭐ ${isTl ? 'Napakagaling!' : 'Great Job!'}
      </span>
    </div>
    <div class="kpi-card" style="border-color: #BBE8FB;">
      <div class="kpi-val" style="color: #0284C7;">${evaluatedSessions.length}</div>
      <div class="kpi-lbl">${isTl ? 'Nasuring Gawain' : 'Activities Evaluated'}</div>
      <span class="kpi-pill" style="background: #E0F2FE; color: #0284C7; border: 1px solid #BBE8FB;">
        🚀 ${isTl ? 'May Pagsusuri' : 'Teacher Evaluated'}
      </span>
    </div>
    <div class="kpi-card" style="border-color: #FED7AA;">
      <div class="kpi-val" style="color: #C2410C;">${sessionMins}</div>
      <div class="kpi-lbl">${isTl ? 'Tagal ng Sesyon' : 'Session Duration'}</div>
      <span class="kpi-pill" style="background: #FFEDD5; color: #C2410C; border: 1px solid #FED7AA;">
        ⏱️ ${isTl ? 'Karaniwang Tagal' : 'Average Duration'}
      </span>
    </div>
    <div class="kpi-card" style="border-color: #E9D5FF;">
      <div class="kpi-val" style="color: #7E22CE;">${totalSessionsCount}</div>
      <div class="kpi-lbl">${isTl ? 'Natapos na Gawain' : 'Activities Completed'}</div>
      <span class="kpi-pill" style="background: #F3E8FF; color: #7E22CE; border: 1px solid #E9D5FF;">
        🏆 ${isTl ? 'Aktibong Sesyon' : 'Active Sessions'}
      </span>
    </div>
  </div>

  <!-- 3. Side-by-Side Visual Charts -->
  <div class="charts-row">
    <!-- Chart 1: Learning Trend Chart -->
    <div class="chart-box">
      <div class="chart-title">
        <span>${isTl ? `Marka ng Pag-aaral ni ${escapeHtml(firstName)}` : `${escapeHtml(firstName)}'s Learning Score Over Time`}</span>
      </div>
      ${trendSvg}
    </div>

    <!-- Chart 2: Domain Exposure Bar Chart -->
    <div class="chart-box">
      <div class="chart-title">
        <span>${isTl ? `Mga Kasanayang Naisanay` : `Skills ${escapeHtml(firstName)} Practiced`}</span>
        <span style="font-size: 7.5pt; color: #64748B; font-weight: 700;">${totalSessionsCount} ${isTl ? 'Kabuuang Gawain' : 'Total Activities'}</span>
      </div>
      <div style="margin-top: 6px;">
        <!-- Domain 1: Cognitive -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>🧩 ${isTl ? 'Kaisipan at Pagbubukod' : 'Thinking & Sorting Skills'}</span>
          <span style="color: #0284C7;">${domainCounts.cognitive} ${isTl ? 'Gawain' : 'Activities'}</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: ${Math.round((domainCounts.cognitive / maxDomainCount) * 100)}%; background: #0284C7; border-radius: 5px;"></div>
        </div>

        <!-- Domain 2: Motor -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>🖐️ ${isTl ? 'Kamay at Paggalaw' : 'Hands & Movement Skills'}</span>
          <span style="color: #10B981;">${domainCounts.motor} ${isTl ? 'Gawain' : 'Activities'}</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: ${Math.round((domainCounts.motor / maxDomainCount) * 100)}%; background: #10B981; border-radius: 5px;"></div>
        </div>

        <!-- Domain 3: Social -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>💬 ${isTl ? 'Pakikipagkapwa at Pagbabahagi' : 'Sharing & Communication'}</span>
          <span style="color: #F59E0B;">${domainCounts.social} ${isTl ? 'Gawain' : 'Activities'}</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: ${Math.round((domainCounts.social / maxDomainCount) * 100)}%; background: #F59E0B; border-radius: 5px;"></div>
        </div>

        <!-- Domain 4: Adaptive -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>🧘 ${isTl ? 'Pagpapakalma at Pang-araw-araw' : 'Calming & Daily Routines'}</span>
          <span style="color: #8B5CF6;">${domainCounts.adaptive} ${isTl ? 'Gawain' : 'Activities'}</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden;">
          <div style="height: 100%; width: ${Math.round((domainCounts.adaptive / maxDomainCount) * 100)}%; background: #8B5CF6; border-radius: 5px;"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- CLEAN PAGE BREAK -->
  <div class="page-break"></div>

  <!-- PAGE 2: EMOTIONS, TEACHER NOTES & HOME ACTIVITIES -->
  <div class="report-header">
    <div>
      <div class="brand-title" style="font-size: 15pt;">
        AUTIVITY &nbsp;|&nbsp; ${isTl ? `Paglalakbay ni ${escapeHtml(firstName)} (Ipagpatuloy)` : `${escapeHtml(firstName)}'s Learning Journey (Continued)`}
      </div>
      <div class="brand-subtitle">${isTl ? 'Mga Tala ng Guro, Damdamin, at Pagtutulungan sa Tahanan' : 'Teacher Notes, Feelings & Home Collaboration'} &bull; ${escapeHtml(displayTimeframe)}</div>
    </div>
    <div style="text-align: right; font-size: 8pt; color: #64748B; font-weight: 700;">
      Page 2 of 2
    </div>
  </div>

  <!-- 4. How Liam Felt at School (Emotional Check-Ins) -->
  <div class="section-title">
    <span>${isTl ? `Pakiramdam ni ${escapeHtml(firstName)} sa Pang-araw-araw na Check-In` : `How ${escapeHtml(firstName)} Felt During Daily Check-Ins`}</span>
    <span class="section-subtitle">${displayTotalDays} ${isTl ? 'Araw na Naitala' : 'Check-Ins Recorded'}</span>
  </div>

  <div class="emotion-grid">
    <div class="emotion-card" style="background: #F0FDF4; border: 1.5px solid #86EFAC;">
      <div class="emotion-pct" style="color: #15803D;">${greenPct}%</div>
      <div class="emotion-name" style="color: #166534;">🟢 ${isTl ? 'Kalmado at Masaya' : 'Calm & Happy'}</div>
      <div class="emotion-sub" style="color: #15803D;">${displayGreenDays} of ${displayTotalDays} ${isTl ? 'Araw (Pinakamainam)' : 'Check-Ins'}</div>
      <div class="emotion-desc" style="color: #166534;">
        ${isTl ? 'Mga naitalang check-in.' : 'Recorded check-ins.'}
      </div>
    </div>
    <div class="emotion-card" style="background: #FEFCE8; border: 1.5px solid #FDE047;">
      <div class="emotion-pct" style="color: #A16207;">${yellowPct}%</div>
      <div class="emotion-name" style="color: #854D0E;">🟡 ${isTl ? 'Masigla o Kinakabahan' : 'Energetic or Anxious'}</div>
      <div class="emotion-sub" style="color: #A16207;">${displayYellowDays} of ${displayTotalDays} ${isTl ? 'Araw (Mataas na Enerhiya)' : 'Check-Ins'}</div>
      <div class="emotion-desc" style="color: #854D0E;">
        ${isTl ? 'Mga naitalang check-in.' : 'Recorded check-ins.'}
      </div>
    </div>
    <div class="emotion-card" style="background: #EFF6FF; border: 1.5px solid #BFDBFE;">
      <div class="emotion-pct" style="color: #1D4ED8;">${bluePct}%</div>
      <div class="emotion-name" style="color: #1E40AF;">🔵 ${isTl ? 'Pagod o Mababang Enerhiya' : 'Tired or Low Energy'}</div>
      <div class="emotion-sub" style="color: #1D4ED8;">${displayBlueDays} of ${displayTotalDays} ${isTl ? 'Araw (Mababang Sigla)' : 'Check-Ins'}</div>
      <div class="emotion-desc" style="color: #1E40AF;">
        ${isTl ? 'Mga naitalang check-in.' : 'Recorded check-ins.'}
      </div>
    </div>
  </div>

  <!-- 5. Recent Learning Activities & Teacher Notes Log -->
  <div class="section-title">
    <span>${isTl ? 'Mga Kamakailang Gawain at Tala ng Guro' : 'Recent Learning Activities & Teacher Notes'}</span>
    <span class="section-subtitle">${isTl ? 'Talaan ng mga Gawain kasama ang mga Puna ng Guro' : 'Chronological Activity Log with Teacher Remarks'}</span>
  </div>

  <table class="activity-table">
    <thead>
      <tr>
        <th style="width: 55px;">${isTl ? 'Petsa' : 'Date'}</th>
        <th style="width: 140px;">${isTl ? 'Gawain at Kasanayan' : 'Activity & Domain'}</th>
        <th style="width: 75px;">${isTl ? 'Saan' : 'Where'}</th>
        <th style="width: 95px;">${isTl ? 'Resulta' : 'Result'}</th>
        <th>${isTl ? 'Puna / Obserbasyon ng Guro' : 'Teacher Note / Observation'}</th>
      </tr>
    </thead>
    <tbody>
      ${topSessions.length === 0 ? `<tr><td colspan="5">${isTl ? 'Walang naitalang gawain sa panahong ito.' : 'No activities logged in this timeframe.'}</td></tr>` : ''}
      ${topSessions.map((s) => {
        const d = s.date instanceof Date ? s.date : new Date(s.date);
        const dateStr = d.toLocaleDateString(isTl ? 'fil-PH' : 'en-US', { month: 'short', day: 'numeric' });
        const isApp = (s.activityType || 'app') === 'app';
        const sourceBadge = isApp
          ? `<span style="background:#EFF6FF; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700; font-size:7pt;">📱 APP</span>`
          : `<span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700; font-size:7pt;">🏫 CLASS</span>`;

        // Show only recorded results.
        let resultHtml = isTl ? 'Walang resulta' : 'No result';
        if (s.status === 'validated' && s.rubricEvaluation) {
          const r = s.rubricEvaluation;
          const sum = (r.looking_at_objects || 0) + (r.concentrating || 0) + (r.performing_task || 0) + (r.following_instructions || 0) + (r.completed_work || 0);
          resultHtml = `${Math.round(sum / 25 * 100)}%`;
        } else if (s.stars != null) {
          resultHtml = `${s.stars} ${isTl ? 'bituin' : 'stars'}`;
        }

        const domainLabel = s.skill_domain && s.skill_domain[0] ? s.skill_domain[0] : (isTl ? 'Pangkalahatan' : 'General Skill');
        const feedbackText = s.teacherFeedback && s.teacherFeedback.trim().length > 0
          ? `"${escapeHtml(s.teacherFeedback.trim())}"`
          : (isTl ? 'Walang tala ng guro.' : 'No teacher note recorded.');

        return `<tr>
          <td><strong>${escapeHtml(dateStr)}</strong></td>
          <td>
            <div style="font-weight: 700; color: #1E293B;">${escapeHtml(s.category || 'Learning Activity')}</div>
            <div style="font-size: 7pt; color: #64748B;">${escapeHtml(domainLabel)}</div>
          </td>
          <td>${sourceBadge}</td>
          <td>${resultHtml}</td>
          <td style="font-style: italic; color: #334155;">${feedbackText}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  ${totalSessionsCount > topSessions.length ? `
    <div style="font-size: 7.5pt; color: #64748B; font-weight: 600; margin-top: -6px; margin-bottom: 12px; font-style: italic;">
      ${isTl
        ? `* Ipinapakita ang ${topSessions.length} na kamakailang tala mula sa ${totalSessionsCount} na gawain. Tingnan ang Feedback tab para sa iba pang tala.`
        : `* Showing ${topSessions.length} recent activity logs from ${totalSessionsCount} activities. Open the Feedback tab to review more.`}
    </div>
  ` : ''}

  <!-- 6. Fun Activities to Try at Home ("Bridge to Home") -->
  <div class="home-card">
    <div class="home-header">
      <span>🏡</span> ${isTl ? 'Mga Masasayang Gawain sa Bahay' : 'Fun Activities to Try Together at Home'}
    </div>
    ${homeActivities.map((act) => `
      <div class="home-item">
        <div class="home-icon">${act.icon}</div>
        <div>
          <strong>${escapeHtml(act.title)}:</strong> ${escapeHtml(act.description)}
        </div>
      </div>
    `).join('')}
  </div>

  <!-- 7. Warm Sign-Off Footer -->
  <div class="footer-box">
    <div>
      <strong>Autivity</strong><br/>
      ${escapeHtml(teacherName)} &bull; ${isTl ? 'Ugnayan sa pamamagitan ng Autivity Portal' : 'Contact via Autivity Parent Portal'}
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 800; color: #0284C7;">${isTl ? `Inihanda nang may pagmamalasakit para kay ${escapeHtml(parentName)} at ${escapeHtml(firstName)}` : `Prepared with care for ${escapeHtml(parentName)} & ${escapeHtml(firstName)}`}</div>
      <div>${isTl ? `Salamat sa pagiging aming katuwang sa pag-aaral ni ${escapeHtml(firstName)}! 💙` : `Thank you for being our partner in ${escapeHtml(firstName)}'s learning! 💙`}</div>
    </div>
  </div>

</body>
</html>`;
};

// Generates a PDF summary of the student's analytics and opens native share sheet.
export const exportStudentAnalyticsReportPdf = async (
  studentId: string,
  studentDetails: StudentHeaderDetails,
  filter: 'today' | 'week' | 'last_week' | 'month' | 'last_month' | 'overall' | string = 'overall',
  timeframeLabel: string = 'Overall',
  activityType: ActivityTypeFilter = 'all',
  customRange?: { startDate: Date | null; endDate: Date | null }
) => {
  if (filter === 'last_week') filter = 'week';
  const effectiveRange = customRange || getDateRangeForFilter(filter);
  const resolvedLabel = effectiveRange.startDate
    ? `${effectiveRange.startDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} - ${(effectiveRange.endDate || new Date()).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
    : timeframeLabel;
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Fetch live metrics directly from database
  let stats = { averageDuration: 0, averageMistakes: 0, averageHints: 0, totalSessions: 0 };
  let evaluations: SessionEvaluation[] = [];
  let domainExposure: MasterDomainExposure[] = [];
  let rawSessions: any[] = [];
  let milestones: Milestone[] = [];
  let checkIns: any[] = [];

  try {
    const [statsRes, evalsRes, domRes, sessRes, milestonesRes, checkInsRes] = await Promise.all([
      getStudentSessionStats(studentId, filter, activityType, customRange).catch(() => ({ averageDuration: 0, averageMistakes: 0, averageHints: 0, totalSessions: 0 })),
      getStudentValidatedSessionsEvaluations(studentId, activityType, customRange).catch(() => []),
      getStudentDevelopmentalSkillsExposure(studentId, filter, activityType, customRange).catch(() => []),
      getStudentSessions(studentId, activityType, customRange).catch(() => []),
      getStudentMilestones(studentId).catch(() => []),
      getStudentCheckInsForFilter(studentId, filter, customRange).catch(() => []),
    ]);
    stats = statsRes || stats;
    evaluations = evalsRes || [];
    domainExposure = domRes || [];
    rawSessions = sessRes || [];
    milestones = milestonesRes || [];
    checkIns = checkInsRes || [];
  } catch (err) {
    console.error('exportStudentAnalyticsReportPdf: error loading student data', err);
  }

  if (customRange) {
    const start = customRange.startDate ? customRange.startDate.toISOString().slice(0,10) : null;
    const end = customRange.endDate ? customRange.endDate.toISOString().slice(0,10) : null;
    checkIns = checkIns.filter((c:any) => (!start || c.check_in_date >= start) && (!end || c.check_in_date <= end));
  }
  const emotionAnalytics = calculateStudentEmotionRegulationAnalytics(checkIns, evaluations, studentDetails.name);

  // 2. Determine rubric benchmark tier (Mastered >= 3.2, Developing 2.6 - 3.19, Needs Support < 2.6)
  const validScores = evaluations
    .map((e) => calculateRubricScore(e.rubric_evaluation))
    .filter((s): s is number => s !== null);
  const avgRubricScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
  const rubricTier = avgRubricScore !== null ? getRubricTier(avgRubricScore) : null;
  const mistakesTier = getMistakesTier(stats.averageMistakes);
  const hintsTier = getHintsTier(stats.averageHints);

  // 3. Format Duration Helper
  const formatDuration = (avgSec: number) => {
    if (!avgSec || avgSec <= 0) return '0s';
    const min = Math.floor(avgSec / 60);
    const sec = Math.round(avgSec % 60);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  // 4. Generate Sections
  const trendChartHtml = generateStudentEvaluationTrendChartSvg(evaluations, (filter === 'last_week' || filter === 'last_month' || filter === 'custom' || filter.startsWith('sy-')) ? 'overall' : filter as any);
  const domainTotals = domainExposure.map((domain) => ({ ...domain, total: domain.skills.reduce((sum, skill) => sum + skill.count, 0) }));
  const maxDomainTotal = Math.max(1, ...domainTotals.map((domain) => domain.total));
  const domainColors = ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6'];
  const domainPracticeHtml = `<div style="border:1px solid #E2E8F0;border-radius:12px;padding:14px;break-inside:avoid"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:12px"><strong style="font-size:13px">Developmental Domain Practice</strong><span style="color:#64748B;font-weight:700">${domainTotals.reduce((sum, d) => sum + d.total, 0)} Total Practices</span></div>${domainTotals.length ? domainTotals.map((d, i) => { const color = domainColors[i % domainColors.length]; const score = d.averageScore; return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:4px;font-size:10px;font-weight:700"><span>${escapeHtml(d.masterDomain)}</span><span style="color:${color};text-align:right">${d.total} practices${score != null ? ` · ${score.toFixed(2)} Avg (${escapeHtml(getRubricTier(score).shortLabel)})` : ''}</span></div><div style="height:9px;background:#F1F5F9;border-radius:6px;margin-top:4px"><div style="height:9px;width:${d.total / maxDomainTotal * 100}%;background:${color};border-radius:6px"></div></div></div>`; }).join('') : '<div>No domain practice recorded for this period.</div>'}</div>`;

  const recommendations = generateStudentRecommendations(evaluations, domainExposure, studentDetails.name);
  const recommendationsHtml = recommendations.length > 0 ? recommendations.map((rec) => {
    return `
      <div style="background:${rec.bgColor}; border:2px solid ${rec.borderColor}; border-radius:14px; padding:14px 16px; margin-bottom:10px; page-break-inside:avoid;">
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
  const scoresSorted = validatedSessionsList.slice().sort((a:any,b:any)=>(calculateRubricScore(b.rubric_evaluation)||0)-(calculateRubricScore(a.rubric_evaluation)||0));
  const sessionsWithHintCounts = validatedSessionsList.filter((s:any) => s.hints_used != null && Number.isFinite(Number(s.hints_used)));
  const independenceRate = sessionsWithHintCounts.length ? Math.round(sessionsWithHintCounts.filter((s:any)=>Number(s.hints_used)===0).length/sessionsWithHintCounts.length*100) : null;
  const spotlights = [scoresSorted[0]?{label:'Highest Mastery Breakthrough',s:scoresSorted[0],bg:'#F0FDF4',border:'#86EFAC',color:'#15803D'}:null,scoresSorted.length>1?{label:'Key Support Session',s:scoresSorted[scoresSorted.length-1],bg:'#FFFBEB',border:'#FDE68A',color:'#B45309'}:null].filter(Boolean).map((x:any)=>`<div style="flex:1;background:${x.bg};border:1px solid ${x.border};border-radius:10px;padding:10px 12px"><strong style="font-size:10px;color:${x.color};text-transform:uppercase">${x.label}</strong><div style="font-weight:700;margin-top:4px">${escapeHtml(x.s.title||x.s.category||'Learning Activity')}</div><div style="font-size:10px;color:#475569;margin-top:3px">${new Date(x.s.created_at).toLocaleDateString('en-US')} - ${calculateRubricScore(x.s.rubric_evaluation)?.toFixed(2)||'N/A'} / 4.0${x.s.teacher_feedback?` ? ${escapeHtml(x.s.teacher_feedback)}`:''}</div></div>`).join('');
  const validatedSessionsHtml = validatedSessionsList.length ? `<table class="session-table"><thead><tr><th>Date</th><th>Source</th><th>Domain & Activity Name</th><th>Rubric Score</th><th>Mastery Status</th><th>Hints & Mistakes</th><th>Teacher Remarks</th></tr></thead><tbody>${validatedSessionsList.slice().sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,12).map((s:any)=>{const score=calculateRubricScore(s.rubric_evaluation);const cls=s.activity_type==='classroom';const domain=Array.isArray(s.skill_domain)?s.skill_domain.join(', '):String(s.skill_domain||'General');return `<tr><td>${new Date(s.created_at).toLocaleDateString('en-US')}</td><td><span class="source ${cls?'class':'app'}">${cls?'CLASS':'APP'}</span></td><td><strong>${escapeHtml(domain)}</strong><br/>${escapeHtml(s.title||s.category||'Activity')}</td><td>${score?.toFixed(2)||'N/A'} / 4.0</td><td>${score===null?'Not scored':`<span style="display:inline-block;border-radius:999px;padding:3px 6px;background:${getRubricTier(score).bgColor};color:${getRubricTier(score).accentColor};border:1px solid ${getRubricTier(score).borderColor};font-weight:700">${escapeHtml(getRubricTier(score).shortLabel)}</span>`}</td><td>${Number(s.hints_used||0)} hints ? ${Number(s.mistakes||0)} mistakes</td><td>${s.teacher_feedback?escapeHtml(s.teacher_feedback):'No remarks recorded'}</td></tr>`}).join('')}</tbody></table>${validatedSessionsList.length>12?`<p class="table-note">Showing 12 of ${validatedSessionsList.length} evaluations. Open student analytics for full history.</p>`:''}`:'<div class="empty-state">No validated evaluations were recorded during this period.</div>';

  // Benchmark overview banner
  let benchmarkBannerHtml = '';
  if (rubricTier) {
    benchmarkBannerHtml = `
      <div style="background:${rubricTier.bgColor}; border:2px solid ${rubricTier.borderColor}; border-radius:14px; padding:14px 16px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-weight:800; font-size:15px; color:${rubricTier.accentColor};">${rubricTier.label}</span>
          <span style="font-weight:800; font-size:11px; text-transform:uppercase; padding:3px 10px; border-radius:999px; background:#FFFFFF; border:1px solid ${rubricTier.borderColor}; color:${rubricTier.accentColor};">
            Rubric Avg: ${avgRubricScore!.toFixed(2)} / 4.0
          </span>
        </div>
        <div style="font-size:12px; color:#374151; font-weight:600; line-height:1.4;">
          ${escapeHtml(rubricTier.teacherDescription)}
        </div>
      </div>
    `;
  }

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing:border-box; }
        @page { size:A4 portrait; margin:12mm 14mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E293B; padding: 0; background: #FFFFFF; font-size:10px; }
        h1 { color: #0284C7; font-size: 17px; font-weight: 800; margin:0; }
        h2 { font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 14px; margin-bottom: 7px; }
        .meta { font-size: 13px; color: #475569; font-weight: 500; margin-bottom: 18px; }
        .stat-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .stat-box { flex: 1; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 8px; text-align: center; }
        .stat-value { font-size: 16px; font-weight: 800; }
        .stat-label { font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px; }
        .report-head{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-bottom:10px}.brand{display:flex;align-items:center;gap:6px}.subtitle{font-size:8px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}.report-pill{font-size:8px;font-weight:800;text-transform:uppercase;padding:3px 6px;border-radius:999px;background:#ECFDF5;color:#059669;border:1px solid #86EFAC}.spotlights{display:flex;gap:8px;margin:8px 0}.session-table{width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed}.session-table th{background:#F1F5F9;text-align:left;padding:7px 5px;font-size:9px;text-transform:uppercase}.session-table td{padding:7px 5px;border-bottom:1px solid #E2E8F0;vertical-align:top;overflow-wrap:anywhere}.session-table tbody tr:nth-child(even){background:#F8FAFC}.source{font-weight:800;padding:2px 4px;border-radius:4px}.source.app{background:#EFF6FF;color:#0369A1}.source.class{background:#FAF5FF;color:#7E22CE}.table-note,.empty-state{font-size:10px;color:#64748B;font-style:italic;margin:6px 0}
        .metric-pill { display:inline-block; margin-top:4px; padding:3px 6px; border-radius:999px; background:#E0F2FE; color:#0369A1; font-size:9px; font-weight:700; }
        .summary { background:#F0F9FF; border:1px solid #BBE8FB; border-radius:10px; padding:10px 12px; margin:10px 0; line-height:1.5; }
        .summary h2 { margin:0 0 4px; color:#0369A1; }
        .signature-row { display:flex; gap:20px; margin-top:30px; break-inside:avoid; page-break-inside:avoid; }
        .signature-row div { flex:1; border-top:1px solid #94A3B8; padding-top:5px; color:#475569; font-size:10px; }
        .spotlights, .summary { break-inside:avoid; page-break-inside:avoid; }
        .session-table tr { break-inside:avoid; page-break-inside:avoid; }
      </style>
    </head>
    <body>
      <div class="report-head"><div><div class="brand"><img src="${parentReportIcon}" width="32" height="32" style="object-fit:contain"/><h1>AUTIVITY | Comprehensive Learner Progress Report</h1></div><div class="subtitle">Special Education &amp; Developmental Analytics</div></div><div style="text-align:right"><span class="report-pill">Student Report</span><div style="font-size:8px;color:#64748B;margin-top:3px">Reporting Date: ${generatedOn}</div></div></div>
      <div style="display:flex;gap:14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:18px;margin-bottom:14px;font-size:12px;line-height:1.6">
        <div style="flex:1"><div class="subtitle">Learner Profile</div><strong>${escapeHtml(studentDetails.name)}</strong><div>Learner Code: ${escapeHtml(studentDetails.learnerCode || 'Not available')}</div></div>
        <div style="flex:1"><div class="subtitle">Grade / Class</div><strong>${escapeHtml(studentDetails.grade || 'SPED')}</strong><div>${escapeHtml(studentDetails.className || 'No class assigned')}</div></div>
        <div style="flex:1"><div class="subtitle">Evaluation Period</div><strong>${escapeHtml(timeframeLabel)}</strong><div>${escapeHtml(resolvedLabel)}</div></div>
        <div style="flex:1"><div class="subtitle">Parent Portal</div><strong>${studentDetails.isLinked ? 'Linked' : 'Not linked'}</strong></div>
      </div>

      <div class="summary"><h2>Executive Developmental Summary</h2>
        ${escapeHtml(studentDetails.name)} completed ${stats.totalSessions} sessions during this period.
        ${avgRubricScore === null ? 'No scored evaluations were recorded.' : `The average evaluation score was ${avgRubricScore.toFixed(2)} out of 4.0.`}
        ${independenceRate === null ? 'No validated sessions were available to assess recorded hints.' : `${independenceRate}% of sessions with recorded hint counts had zero hints.`}
      </div>

      <div class="stat-row">
        <div class="stat-box" style="border-color:#86EFAC"><div class="stat-value" style="color:#15803D">${avgRubricScore===null?'N/A':avgRubricScore.toFixed(2)+' / 4.0'}</div><div class="stat-label">RUBRIC AVERAGE</div><span class="metric-pill" style="color:${rubricTier?.accentColor || '#64748B'};background:${rubricTier?.bgColor || '#F1F5F9'}">${rubricTier?.shortLabel || 'No score'}</span></div>
        <div class="stat-box" style="border-color:#BBE8FB"><div class="stat-value" style="color:#0284C7">${independenceRate===null?'N/A':independenceRate+'%'}</div><div class="stat-label">SESSIONS WITHOUT HINTS</div><span class="metric-pill">${sessionsWithHintCounts.length} sessions with hint data</span></div>
        <div class="stat-box" style="border-color:${hintsTier.borderColor};">
          <div class="stat-value" style="color:${hintsTier.accentColor};">${stats.averageHints.toFixed(1)}</div>
          <div class="stat-label">AVG HINTS</div>
          <div style="margin-top:3px;">
            <span style="font-weight:800; font-size:9px; text-transform:uppercase; padding:2px 6px; border-radius:999px; border:1px solid ${hintsTier.borderColor}; background:${hintsTier.bgColor}; color:${hintsTier.accentColor};">
              ${stats.averageHints <= 1 ? 'Low dependency' : hintsTier.shortLabel}
            </span>
          </div>
        </div>
        <div class="stat-box" style="border-color:#FED7AA;">
          <div class="stat-value" style="color:#C2410C;">${formatDuration(stats.averageDuration)}</div>
          <div class="stat-label">AVERAGE SESSION</div>
          <span class="metric-pill" style="background:#FFF7ED;color:#C2410C;border:1px solid #FFEDD5">Session duration</span>
        </div>
      </div>

      <h2>Level of Independence &amp; Support Needed</h2>
      <div class="summary">${independenceRate === null ? 'No validated sessions are available for this period.' : `${independenceRate}% of sessions with recorded hint counts had zero hints. Hint counts do not identify the type of prompting used.`}</div>
      <h2>Progress Trend &amp; Practice Across Skill Domains</h2>
      <div style="display:flex;gap:10px;align-items:flex-start"><div style="width:50%;min-width:0">${trendChartHtml}</div><div style="width:50%;min-width:0">${domainPracticeHtml}</div></div>

      <div style="background:#FFFFFF; border:2px solid #E2E8F0; border-radius:16px; padding:18px; margin-bottom:20px; page-break-inside:avoid;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:800; font-size:14px; color:#1E293B; text-transform:uppercase; letter-spacing:0.5px;">Mood & Focus During Activities</div>
          <span style="font-weight:800; font-size:11px; color:#179D33; background:#F0FDF4; border:1px solid #CBFAC4; border-radius:999px; padding:3px 10px; text-transform:uppercase;">
            ${emotionAnalytics.totalCheckIns} Total Check-Ins
          </span>
        </div>

        <div style="display:flex; gap:8px; margin-bottom:14px;">
          ${emotionAnalytics.zoneDistribution.map((z) => `
            <div style="flex:1; background:${z.bgColor}; border:1.5px solid ${z.borderColor}; border-radius:12px; padding:10px; text-align:center;">
              <div style="font-size:18px; font-weight:800; color:${z.color};">${z.percentage}%</div>
              <div style="font-size:11px; font-weight:800; color:#374151; margin-top:2px;">${escapeHtml(z.title)}</div>
              <div style="font-size:10px; color:#6B7280; font-weight:600; margin-top:1px;">${z.count} ${z.count === 1 ? 'Day' : 'Days'}</div>
              ${z.averageScore !== null ? `
                <div style="margin-top:6px; background:#FFFFFF; border:1px solid ${z.borderColor}; border-radius:6px; padding:2px 4px; font-size:10px; font-weight:800; color:${z.color};">
                  Avg: ${z.averageScore.toFixed(1)} / 4.0
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div style="background:#F0F9FF; border:1px solid #BBE8FB; border-radius:12px; padding:12px 14px;">
          <div style="font-weight:800; font-size:12px; color:#0369A1; text-transform:uppercase;">Behavioral Insight</div>
          <div style="font-size:12px; color:#334155; font-weight:500; margin-top:4px; line-height:1.4;">
            ${escapeHtml(emotionAnalytics.insightSummary)}
          </div>
          <div style="font-size:12px; color:#0284C7; font-weight:700; margin-top:6px;">
            💡 Strategy: ${escapeHtml(emotionAnalytics.pedagogicalTip)}
          </div>
        </div>
      </div>

      <h2 style="font-size:17px">Session Evaluation Summary</h2>
      ${spotlights ? `<h2>Key Session Highlights</h2><div class="spotlights">${spotlights}</div>` : ''}
      ${validatedSessionsHtml}

      <h2>Recommended Activities for Home</h2>
      <div class="summary">
        <div><strong>Sort together:</strong> Invite ${escapeHtml(studentDetails.name)} to sort familiar household objects by color or shape.</div>
        <div><strong>Practice turn-taking:</strong> Take turns choosing or counting items during a snack or game.</div>
        <div><strong>Follow a routine:</strong> Use pictures or short instructions to practice a daily task, offering help when needed.</div>
      </div>
      <div class="signature-row"><div>SPED Teacher / Date</div><div>Therapist or Guidance / Date</div><div>Parent or Guardian / Date</div></div>
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
    ['Universal Mastery Benchmark Target', '≥ 3.2 / 4.0 (80% Mastery Goal)'],
    [''],
    ['Metric', 'Value'],
    ['Total Enrolled Students', students.length],
    ['Students Needing Attention (< 3.2)', needsAttentionCount],
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
    ['Student Name', 'Learner Code', 'Average Rubric Score (0-4)', 'Benchmark Tier', 'Attention Needed Status'],
    ...students.map((st) => {
      const avg = st.averageScore !== undefined ? st.averageScore : null;
      const tier = avg !== null ? getRubricTier(avg).shortLabel : 'No evaluations';
      return [
        st.name,
        st.learnerCode || st.learner_code || 'N/A',
        avg !== null ? avg.toFixed(2) : 'N/A',
        tier,
        st.needsIntervention ? 'ATTENTION REQUIRED' : 'ON TRACK',
      ];
    }),
  ];
  const wsStudents = XLSX.utils.aoa_to_sheet(studentsRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Enrolled Students');

  // Sheet 3: Validated Evaluations
  const evalsRows = [
    ['Session ID', 'Student ID', 'Evaluation Date', 'Looking at Objects', 'Concentrating', 'Performing Task', 'Following Instructions', 'Completed Work', 'Average Score', 'Benchmark Tier', 'Teacher Remarks'],
    ...evaluations.map((e) => {
      const r = e.rubric_evaluation || {};
      const score = calculateRubricScore(r);
      const tier = score !== null ? getRubricTier(score).shortLabel : 'N/A';
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
        tier,
        (e as any).teacher_remarks || (e as any).feedback || '',
      ];
    }),
  ];
  const wsEvals = XLSX.utils.aoa_to_sheet(evalsRows);
  XLSX.utils.book_append_sheet(wb, wsEvals, 'Validated Evaluations');

  // Sheet 4: Developmental Domain Exposure
  const domainRows = [
    ['Domain Title', 'Total Practices', 'Average Rubric Score (0-4)', 'Benchmark Status'],
    ...domainExposure.map((d) => {
      const totalCount = d.skills ? d.skills.reduce((a, b) => a + b.count, 0) : 0;
      const score = d.averageScore;
      const tier = score !== null && score !== undefined ? getRubricTier(score).shortLabel : 'No evaluations';
      return [
        d.masterDomain,
        totalCount,
        score !== null && score !== undefined ? score.toFixed(2) : 'N/A',
        tier,
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
  filter: string = 'overall',
  timeframeLabel: string = 'Overall',
  activityType: ActivityTypeFilter = 'all',
  customRange?: { startDate: Date | null; endDate: Date | null }
) => {
  type Session = {
    created_at: string; activity_type: string | null; skill_domain: unknown;
    category: string | null; title: string | null; activity_path: unknown;
    duration_seconds: number | null; mistakes: number | null; hints_used: number | null;
    status: string | null; rubric_evaluation: unknown; teacher_feedback: string | null;
  };
  type CellValue = string | number | null;
  const range = customRange || getDateRangeForFilter(filter);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');
  let query = supabase.from('student_sessions').select('*').eq('student_id', studentId)
    .eq('teacher_id', user.id).order('created_at', { ascending: true });
  if (activityType !== 'all') query = query.eq('activity_type', activityType);
  if (range.startDate) query = query.gte('created_at', range.startDate.toISOString());
  if (range.endDate) query = query.lte('created_at', range.endDate.toISOString());
  const localDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  const [sessionResult, domains, checkIns, milestones, templateResult] = await Promise.all([
    query,
    getStudentDevelopmentalSkillsExposure(studentId, filter, activityType, range),
    getStudentCheckInsHistory(studentId, range.startDate ? localDate(range.startDate) : undefined, range.endDate ? localDate(range.endDate) : undefined),
    getStudentMilestones(studentId),
    supabase.from('teacher_milestone_templates').select('id, category').eq('teacher_id', user.id),
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (templateResult.error) throw templateResult.error;
  const sessions = (sessionResult.data || []) as Session[];
  const evaluated = sessions.filter(s => s.status === 'validated' && s.rubric_evaluation);
  const templates = new Map((templateResult.data || []).map(t => [t.id, t.category]));
  const wb = StyledXLSX.utils.book_new();
  const border = { style: 'thin', color: { rgb: 'CBD5E1' } };
  const header = { fill: { fgColor: { rgb: '0284C7' } }, font: { name: 'Segoe UI', bold: true, color: { rgb: 'FFFFFF' } }, alignment: { wrapText: true, vertical: 'center', horizontal: 'center' }, border: { top: border, bottom: border, left: border, right: border } };
  const table = (name: string, rows: CellValue[][], widths: number[], headerRows = [0]) => {
    const ws = StyledXLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = widths.map(wch => ({ wch }));
    ws['!rows'] = rows.map((_, i) => ({ hpt: headerRows.includes(i) ? 34 : 30 }));
    const bounds = StyledXLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let r = 0; r <= bounds.e.r; r++) for (let c = 0; c < widths.length; c++) {
      const address = StyledXLSX.utils.encode_cell({ r, c });
      const cell = ws[address] || (ws[address] = { t: 's', v: '' });
      cell.s = headerRows.includes(r) ? header : {
        font: { name: 'Segoe UI', sz: 10, color: { rgb: '1E293B' } },
        fill: { fgColor: { rgb: r % 2 ? 'F8FAFC' : 'FFFFFF' } },
        alignment: { vertical: 'center', wrapText: true, horizontal: cell.t === 'n' ? 'right' : 'left' },
        border: { top: border, bottom: border, left: border, right: border },
      };
    }
    StyledXLSX.utils.book_append_sheet(wb, ws, name);
    return ws;
  };
  const formula = (ws: StyledXLSX.WorkSheet, address: string, expression: string, value: number | null, format = '0.00') => {
    const existing = ws[address];
    ws[address] = { t: value === null ? 's' : 'n', v: value === null ? '' : value, f: expression, z: format, s: existing?.s };
  };
  const average = (values: (number | null | undefined)[]) => {
    const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
  const asNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const parseRubric = (value: unknown): Record<string, unknown> => {
    if (typeof value === 'string') { try { value = JSON.parse(value); } catch { return {}; } }
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  };
  const rubricValue = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 4 ? n : null;
  };
  const score = (s: Session) => s.status === 'validated' ? average(RUBRIC_CRITERIA.map(c => rubricValue(parseRubric(s.rubric_evaluation)[c.key]))) : null;
  const sessionDate = (s: Session) => s.created_at && !Number.isNaN(new Date(s.created_at).getTime()) ? localDate(new Date(s.created_at)) : '';
  const domain = (s: Session) => {
    const v = s.skill_domain;
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'string') {
      try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) return parsed.join(', '); } catch { /* plain text */ }
      return v.replace(/^\{|\}$/g, '').replace(/"/g, '');
    }
    return s.category || '';
  };
  const title = (s: Session) => {
    if (s.title?.trim()) return s.title.trim();
    if (Array.isArray(s.activity_path) && s.activity_path.length) {
      return s.activity_path.map((path: string) => formatActivityTitle(path)).join(', ');
    }
    if (typeof s.activity_path === 'string' && s.activity_path.trim()) return formatActivityTitle(s.activity_path);
    return s.category || 'Classroom Activity';
  };
  const status = (v: number | null) => v === null ? '' : getRubricTier(v).shortLabel;
  const prompt = (hints: number | null) => hints === null ? '' : hints === 0 ? '0 hints: Independent' : hints <= 2 ? '1–2 hints: Low Prompting' : '3+ hints: High Prompting';
  const masterRows: CellValue[][] = [['Session Date','Activity Source','Skill Domain','Activity Title','Duration (Sec)','Duration (Formatted)','Mistakes','Hints Used','Prompt Fading (Hint Count)','Prompt-Free Rate','Rubric Score (0-4)','Mastery Status','Teacher Remarks'],
    ...sessions.map(s => { const duration = asNumber(s.duration_seconds); const hints = asNumber(s.hints_used); const result = score(s); return [sessionDate(s), s.activity_type === 'classroom' ? 'Classroom' : 'App', domain(s), title(s), duration, duration === null ? '' : `${Math.floor(duration / 60)}m ${duration % 60}s`, asNumber(s.mistakes), hints, prompt(hints), hints === null ? null : hints === 0 ? 1 : 0, result, status(result), s.teacher_feedback || '']; }),
    ['AVERAGE / TOTAL SUMMARY']];
  const master = table('All Sessions Master Log', masterRows, [13,15,20,25,16,16,14,14,25,16,18,20,45]);
  const last = sessions.length + 1;
  const masterSummary = sessions.length + 2;
  master['!autofilter'] = { ref: `A1:M${Math.max(1, last)}` };
  const masterAverage = (column: string, values: (number | null)[], format: string) => {
    if (sessions.length) formula(master, `${column}${masterSummary}`, `IFERROR(AVERAGE(${column}2:${column}${last}),"")`, average(values), format);
  };
  masterAverage('E', sessions.map(s => asNumber(s.duration_seconds)), '0');
  masterAverage('G', sessions.map(s => asNumber(s.mistakes)), '0.0');
  masterAverage('H', sessions.map(s => asNumber(s.hints_used)), '0.0');
  masterAverage('J', sessions.map(s => s.hints_used == null ? null : s.hints_used === 0 ? 1 : 0), '0.0%');
  masterAverage('K', sessions.map(score), '0.00');
  const rubricRows: CellValue[][] = [['Session Date','Activity Source','Skill Domain','Activity Title',...RUBRIC_CRITERIA.map(c => c.title),'Rubric Score (0-4)','Mastery Status','Teacher Remarks'],
    ...evaluated.map(s => [sessionDate(s), s.activity_type === 'classroom' ? 'Classroom' : 'App', domain(s), title(s), ...RUBRIC_CRITERIA.map(c => rubricValue(parseRubric(s.rubric_evaluation)[c.key])), score(s), status(score(s)), s.teacher_feedback || '']), ['AVERAGE']];
  const rubric = table('Rubric Criteria Matrix', rubricRows, [13,14,20,24,18,18,18,20,18,16,18,42]);
  rubric['!autofilter'] = { ref: `A1:L${evaluated.length + 1}` };
  if (evaluated.length) ['E','F','G','H','I','J'].forEach((col, i) => {
    const values = evaluated.map(s => i === 5 ? score(s) : rubricValue(parseRubric(s.rubric_evaluation)[RUBRIC_CRITERIA[i].key]));
    formula(rubric, `${col}${evaluated.length + 2}`, `IFERROR(AVERAGE(${col}2:${col}${evaluated.length + 1}),"")`, average(values));
  });
  const domainRows: CellValue[][] = [['Master Domain','Sub-Skills Evaluated','Total Practices','Average Score (0-4)','Mastery Status','Clinical Observation','Next Target'],
    ...domains.map(d => [d.masterDomain, d.skills.map(s => s.name).join(', '), d.skills.reduce((a, s) => a + s.count, 0), d.averageScore ?? null, status(d.averageScore ?? null), '', '']), ['TOTAL / COMPOSITE AVERAGE']];
  const domainSheet = table('Skill Domains', domainRows, [22,35,18,18,18,38,42]);
  domainSheet['!autofilter'] = { ref: `A1:G${domains.length + 1}` };
  if (domains.length) {
    formula(domainSheet, `C${domains.length + 2}`, `SUM(C2:C${domains.length + 1})`, domains.reduce((a,d) => a + d.skills.reduce((sum,s) => sum + s.count,0),0), '0');
    formula(domainSheet, `D${domains.length + 2}`, `IFERROR(AVERAGE(D2:D${domains.length + 1}),"")`, average(domains.map(d => d.averageScore)));
  }
  const zone = (emotion: string) => {
    const meta = getEmotionMeta(emotion);
    if (!meta) return '';
    if (meta.zone === 'optimal') return 'Green';
    if (meta.zone === 'low_energy') return 'Blue';
    return emotion.toLowerCase() === 'angry' ? 'Red' : 'Yellow';
  };
  const daySessions = (day: string) => sessions.filter(s => sessionDate(s) === day);
  const dayScores = (day: string) => average(daySessions(day).map(score));
  const zoneNames = ['Green','Yellow','Blue','Red'];
  const moodRows: CellValue[][] = [['EMOTIONAL REGULATION ZONE SUMMARY'], ['Regulation Zone','Emotions Included','Distribution %','Days Count','Average Day Score (0-4)','Average Hints',''],
    ...zoneNames.map(z => { const entries = checkIns.filter(c => zone(c.emotion) === z); return [z, Array.from(new Set(entries.map(c => c.emotion))).join(', '), checkIns.length ? entries.length / checkIns.length : null, entries.length, average(entries.map(c => dayScores(c.check_in_date))), average(entries.flatMap(c => daySessions(c.check_in_date).map(s => asNumber(s.hints_used)))), '']; }),
    [], ['DAILY CHECK-IN CORRELATION LOG'], ['Check-In Date','Reported Emotion','Tagalog Equivalent','Regulation Zone','Activity Evaluated','Day Score (0-4)','Hint-Based Prompting','Teacher Remarks'],
    ...checkIns.map(c => { const onDay = daySessions(c.check_in_date); return [c.check_in_date, c.emotion, getEmotionMeta(c.emotion)?.tagalogLabel || '', zone(c.emotion), onDay.map(title).filter(Boolean).join(', '), dayScores(c.check_in_date), onDay.map(s => prompt(asNumber(s.hints_used))).filter(Boolean).join(', '), onDay.map(s => s.teacher_feedback).filter(Boolean).join(' | ')]; }),
    ['TOTAL / AVERAGE']];
  const mood = table('Mood & Check-Ins Log', moodRows, [16,25,20,18,35,18,25,45], [0,1,7,8]);
  const moodLast = 9 + checkIns.length;
  mood['!autofilter'] = { ref: `A9:H${moodLast}` };
  for (let i = 0; i < 4; i++) { const row = i + 3; mood[`C${row}`].z = '0.0%'; mood[`E${row}`].z = '0.00'; mood[`F${row}`].z = '0.0'; }
  if (checkIns.length) formula(mood, `F${moodLast + 1}`, `IFERROR(AVERAGE(F10:F${moodLast}),"")`, average(checkIns.map(c => dayScores(c.check_in_date))));
  const relevantMilestones = milestones.filter(m => {
    const start = m.startDate ? new Date(m.startDate) : null;
    const end = m.targetDate ? new Date(m.targetDate) : null;
    return (!range.startDate || !end || end >= range.startDate) && (!range.endDate || !start || start <= range.endDate);
  });
  const milestoneRows: CellValue[][] = [['Goal / Skill Description','Category / Domain','Created','Target Date','Status','Description'],
    ...relevantMilestones.map(m => [m.title, (m.templateId && templates.get(m.templateId)) || '', m.startDate || '', m.targetDate || '', m.status, m.description || '']), ['TOTAL MILESTONES']];
  const milestoneSheet = table('IEP Milestones Tracker', milestoneRows, [38,22,16,16,18,45]);
  milestoneSheet['!autofilter'] = { ref: `A1:F${relevantMilestones.length + 1}` };
  formula(milestoneSheet, `B${relevantMilestones.length + 2}`, relevantMilestones.length ? `COUNTA(A2:A${relevantMilestones.length + 1})` : '0', relevantMilestones.length, '0');
  const markSummary = (ws: StyledXLSX.WorkSheet, row: number, columns: number) => {
    for (let c = 0; c < columns; c++) {
      const cell = ws[StyledXLSX.utils.encode_cell({ r: row - 1, c })];
      if (cell) cell.s = { ...cell.s, fill: { fgColor: { rgb: 'F1F5F9' } }, font: { name: 'Segoe UI', bold: true, color: { rgb: '0F172A' } }, border: { top: border, bottom: { style: 'double', color: { rgb: '0F172A' } }, left: border, right: border } };
    }
  };
  markSummary(master, masterSummary, 13);
  markSummary(rubric, evaluated.length + 2, 12);
  markSummary(domainSheet, domains.length + 2, 7);
  markSummary(mood, moodLast + 1, 8);
  markSummary(milestoneSheet, relevantMilestones.length + 2, 6);
  for (let row = 2; row <= last; row++) {
    if (master['J' + row]) master['J' + row].z = '0.0%';
    if (master['K' + row]) master['K' + row].z = '0.00';
  }
  for (let row = 2; row <= evaluated.length + 1; row++) if (rubric['J' + row]) rubric['J' + row].z = '0.00';
  for (let row = 2; row <= domains.length + 1; row++) if (domainSheet['D' + row]) domainSheet['D' + row].z = '0.00';
  for (let row = 10; row <= moodLast; row++) if (mood['F' + row]) mood['F' + row].z = '0.00';
  if (checkIns.length) zoneNames.forEach((z, i) => {
    const row = i + 3;
    const entries = checkIns.filter(c => zone(c.emotion) === z);
    formula(mood, 'D' + row, `COUNTIF(D10:D${moodLast},A${row})`, entries.length, '0');
    formula(mood, 'C' + row, `IFERROR(D${row}/COUNTA(A10:A${moodLast}),"")`, entries.length / checkIns.length, '0.0%');
    formula(mood, 'E' + row, `IFERROR(AVERAGEIF(D10:D${moodLast},A${row},F10:F${moodLast}),"")`, average(entries.map(c => dayScores(c.check_in_date))));
  });
  const cognitiveIndex = domains.findIndex(d => /cognitiv/i.test(d.masterDomain));
  const cognitive = cognitiveIndex < 0 ? undefined : domains[cognitiveIndex];
  const green = checkIns.filter(c => zone(c.emotion) === 'Green').length;
  const summary = table('Summary & KPIs', [
    ['AUTIVITY — COMPREHENSIVE LEARNER ANALYTICS SUMMARY'], ['Student Name',studentDetails.name], ['Learner Code',studentDetails.learnerCode || ''], ['Grade',studentDetails.grade || ''], ['Evaluation Period',timeframeLabel], ['Reporting Date',localDate(new Date())], [],
    ['Metric Category','Aggregated Value','Reporting Unit','Target Benchmark','Interpretation'],
    ['Overall Mean Score',null,'0–4','3.2','Validated sessions'], ['Independence / Prompt-Free Rate',null,'%','','Sessions with zero recorded hints'], ['Average Hints',null,'per session','','Recorded hint counts'], ['Average Mistakes',null,'per session','','Recorded mistakes'], ['Average Duration',null,'seconds','','Recorded duration'], ['Total Sessions',null,'sessions','','All recorded sessions'], ['Cognitive Mastery Score',cognitive?.averageScore ?? null,'0–4','','Cognitive domain session average'], ['Green Zone Frequency',checkIns.length ? green / checkIns.length : null,'%','','Share of check-ins in Green Zone'],
  ], [30,18,18,20,45], [0,7]);
  const dataEnd = Math.max(2, last);
  const crossAvg = (address: string, column: string, values: (number | null)[], format: string) => {
    if (sessions.length) formula(summary, address, `IFERROR(AVERAGE('All Sessions Master Log'!${column}2:${column}${dataEnd}),"")`, average(values), format);
  };
  crossAvg('B9','K',sessions.map(score),'0.00');
  crossAvg('B10','J',sessions.map(s => s.hints_used == null ? null : s.hints_used === 0 ? 1 : 0),'0.0%');
  crossAvg('B11','H',sessions.map(s => asNumber(s.hints_used)),'0.0');
  crossAvg('B12','G',sessions.map(s => asNumber(s.mistakes)),'0.0');
  crossAvg('B13','E',sessions.map(s => asNumber(s.duration_seconds)),'0');
  formula(summary,'B14',sessions.length ? `COUNTA('All Sessions Master Log'!A2:A${dataEnd})` : '0',sessions.length,'0');
  if (cognitiveIndex >= 0 && cognitive?.averageScore != null) formula(summary, 'B15', `'Skill Domains'!D${cognitiveIndex + 2}`, cognitive.averageScore);
  if (checkIns.length) formula(summary, 'B16', "'Mood & Check-Ins Log'!C3", green / checkIns.length, '0.0%');
  summary.B15.z = '0.00'; summary.B16.z = '0.0%';
  wb.SheetNames = ['Summary & KPIs','All Sessions Master Log','Rubric Criteria Matrix','Skill Domains','Mood & Check-Ins Log','IEP Milestones Tracker'];
  const filename = `${studentDetails.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Student_Analytics_${Date.now()}.xlsx`;
  if (Platform.OS === 'web') { StyledXLSX.writeFile(wb, filename); return filename; }
  const uri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, StyledXLSX.write(wb, { type: 'base64', bookType: 'xlsx' }), { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: `Export ${studentDetails.name} Excel Report`, UTI: 'com.microsoft.excel.xlsx' });
  return uri;
};

// Generates a PDF summary of the child's analytics and opens the native share sheet.
export const exportChildReportPdf = async (
  data: ParentDashboardData,
  stats: ReportStats,
  timeframeLabel?: string,
  activityType: ActivityTypeFilter = 'all',
  language: 'en' | 'tl' = 'en',
  customCheckIns?: any[],
  dateRange?: { startDate: Date | null; endDate: Date | null }
) => {
  let checkIns = customCheckIns;
  if (!checkIns && data.student?.id) {
    try {
      checkIns = await getStudentCheckInsHistory(data.student.id);
    } catch (_) {
      checkIns = [];
    }
  }

  if (dateRange) {
    const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const start = dateRange.startDate && localDateKey(dateRange.startDate);
    const end = dateRange.endDate && localDateKey(dateRange.endDate);
    checkIns = (checkIns || []).filter((c) => c.check_in_date && (!start || c.check_in_date >= start) && (!end || c.check_in_date <= end));
  }
  const html = buildReportHtml(data, stats, timeframeLabel, activityType, language, checkIns || []);
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
    stars: null,
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
        stars: null,
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
  kpi: {
    pendingEvaluations: number;
    totalStudents: number;
    totalClasses: number;
    completedSessions: number;
    totalSessions?: number;
    evaluatedSessions?: number;
    evaluatedPercentage?: number;
  },
  classes: { title: string; grade: string; studentsCount: number; completedSessions: number; pendingEvaluations: number; evaluatedPercentage: number }[],
  recentActivity: { studentName: string; category: string; status: string; createdAt: string; activityType?: string; activityTitle?: string }[],
  timeframeLabel?: string,
  activityType: ActivityTypeFilter = 'all'
) => {
  const generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalSessionsCount = kpi.totalSessions ?? (kpi.completedSessions + kpi.pendingEvaluations);
  const evalPct = kpi.evaluatedPercentage !== undefined
    ? kpi.evaluatedPercentage
    : (totalSessionsCount > 0 ? Math.round((kpi.completedSessions / totalSessionsCount) * 100) : 100);

  let complianceBadge = {
    label: 'Target Met (100% Goal)',
    bg: '#F0FDF4',
    border: '#86EFAC',
    text: '#15803D',
  };
  if (evalPct < 70) {
    complianceBadge = {
      label: 'Action Needed (< 70%)',
      bg: '#FFF7ED',
      border: '#FFDBD4',
      text: '#C2410C',
    };
  } else if (evalPct < 90) {
    complianceBadge = {
      label: 'In Progress (70–89%)',
      bg: '#FFFBEB',
      border: '#FFF3C4',
      text: '#D97706',
    };
  }

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

  const activityRowsHtml = recentActivity.length > 0 ? recentActivity.slice(0, 10).map((a) => {
    const isClassroom = a.activityType === 'classroom';
    return `
    <div style="background:#F9FAFB; border:1px solid #F3F4F6; border-radius:10px; padding:10px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700; font-size:13px; color:#374151;">${escapeHtml(a.studentName)} — ${escapeHtml(a.category)}</span>
          <span style="font-size:9px; font-weight:800; text-transform:uppercase; padding:1px 6px; border-radius:4px; border:1px solid ${isClassroom ? '#E9D5FF' : '#BBE8FB'}; background:${isClassroom ? '#FAF5FF' : '#EFF6FF'}; color:${isClassroom ? '#A855F7' : '#3B82F6'};">
            ${isClassroom ? '🏫 CLASSROOM' : '📱 APP'}
          </span>
        </div>
        ${a.activityTitle ? `<div style="font-size:12px; color:#64748B; font-weight:600; margin-top:2px;">${escapeHtml(a.activityTitle)}</div>` : ''}
        <div style="font-size:11px; color:#9CA3AF; margin-top:2px;">${new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <span style="font-weight:700; font-size:10px; text-transform:uppercase; padding:3px 8px; border-radius:6px; background:${a.status === 'validated' ? '#DCFCE7' : '#FEF3C7'}; color:${a.status === 'validated' ? '#15803D' : '#D97706'};">
        ${escapeHtml(a.status)}
      </span>
    </div>
  `;
  }).join('') : '<div style="color:#64748B; font-size:13px;">No recent activity in this timeframe.</div>';

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
        <div style="margin-top:8px; display:flex; gap:8px;">
          ${timeframeLabel ? `<span style="background:#E0F2FE; border:1px solid #BBE8FB; color:#0284C7; border-radius:6px; padding:3px 8px; font-weight:700; font-size:11px; text-transform:uppercase;">TIMEFRAME: ${escapeHtml(timeframeLabel)}</span>` : ''}
          ${activityType !== 'all' ? `<span style="background:${activityType === 'classroom' ? '#FAF5FF' : '#EFF6FF'}; border:1px solid ${activityType === 'classroom' ? '#E9D5FF' : '#BBE8FB'}; color:${activityType === 'classroom' ? '#A855F7' : '#0284C7'}; border-radius:6px; padding:3px 8px; font-weight:700; font-size:11px; text-transform:uppercase;">SOURCE: ${activityType === 'classroom' ? 'CLASSROOM ONLY' : 'APP ONLY'}</span>` : ''}
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-box" style="border-color:#FDBA74;">
          <div class="stat-value" style="color:#C2410C;">${kpi.pendingEvaluations}</div>
          <div class="stat-label">Pending Evaluations</div>
        </div>
        <div class="stat-box" style="border-color:#BBE8FB;">
          <div class="stat-value" style="color:#0284C7;">${kpi.totalStudents}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-box" style="border-color:#DDD6FE;">
          <div class="stat-value" style="color:#7C3AED;">${kpi.totalClasses}</div>
          <div class="stat-label">Active Classes</div>
        </div>
        <div class="stat-box" style="border-color:#86EFAC;">
          <div class="stat-value" style="color:#15803D;">${kpi.completedSessions}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
      </div>

      <div style="background:${complianceBadge.bg}; border:2px solid ${complianceBadge.border}; border-radius:14px; padding:12px 16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-weight:800; font-size:14px; color:${complianceBadge.text};">Evaluation Compliance Rate</span>
          <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">
            ${kpi.completedSessions} of ${totalSessionsCount} sessions fully evaluated & validated.
          </div>
        </div>
        <span style="font-weight:800; font-size:11px; text-transform:uppercase; padding:4px 12px; border-radius:999px; background:#FFFFFF; border:1px solid ${complianceBadge.border}; color:${complianceBadge.text};">
          ${evalPct}% • ${complianceBadge.label}
        </span>
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

  const targetMasteryY = paddingTop + chartH - (3.2 / 4) * chartH;
  const targetMasteryLine = `
    <line x1="${paddingLeft}" y1="${targetMasteryY}" x2="${svgWidth - paddingRight}" y2="${targetMasteryY}" stroke="#8B5CF6" stroke-dasharray="4,4" stroke-width="1.5" />
    <text x="${svgWidth - paddingRight}" y="${targetMasteryY - 5}" font-size="10" font-weight="700" fill="#7C3AED" text-anchor="end">Mastery Target (3.2)</text>
  `;

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

      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:10px; height:10px; border-radius:50%; background:#62A9E6;"></div>
          <span style="font-size:11px; font-weight:700; color:#64748B;">Evaluation Score</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:12px; height:2px; background:#8B5CF6; border-radius:1px;"></div>
          <span style="font-size:11px; font-weight:700; color:#7C3AED;">Mastery Target (3.2 • 80%)</span>
        </div>
        ${hasForecast ? `
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:12px; height:2px; background:#34D399; border-radius:1px;"></div>
            <span style="font-size:11px; font-weight:700; color:#059669;">Forecast</span>
          </div>
        ` : ''}
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
        ${targetMasteryLine}
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

  const targetMasteryY = paddingTop + chartH - (3.2 / 4) * chartH;
  const targetMasteryLine = `
    <line x1="${paddingLeft}" y1="${targetMasteryY}" x2="${svgWidth - paddingRight}" y2="${targetMasteryY}" stroke="#8B5CF6" stroke-dasharray="4,4" stroke-width="1.5" />
    <text x="${svgWidth - paddingRight}" y="${targetMasteryY - 5}" font-size="10" font-weight="700" fill="#7C3AED" text-anchor="end">Mastery Target (3.2)</text>
  `;

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

      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:10px; height:10px; border-radius:50%; background:#62A9E6;"></div>
          <span style="font-size:11px; font-weight:700; color:#64748B;">Evaluation Score</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="width:12px; height:2px; background:#8B5CF6; border-radius:1px;"></div>
          <span style="font-size:11px; font-weight:700; color:#7C3AED;">Mastery Target (3.2 • 80%)</span>
        </div>
        ${hasForecast ? `
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:12px; height:2px; background:#34D399; border-radius:1px;"></div>
            <span style="font-size:11px; font-weight:700; color:#059669;">Forecast</span>
          </div>
        ` : ''}
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
        ${targetMasteryLine}
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
    const score = domain.averageScore;
    const hasScore = score !== null && score !== undefined;
    const tier = hasScore ? getRubricTier(score) : null;

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
                ${barWidthPercent > 0 ? `<rect x="0" y="3" width="${Math.max(2, barWidthPercent)}%" height="18" rx="6" fill="${theme.startColor}" />` : ''}
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
        LOWEST EXPOSURE
      </span>
    ` : '';

    const scoreBadgeHtml = hasScore && tier ? `
      <span style="background:${tier.bgColor}; border:1px solid ${tier.borderColor}; color:${tier.accentColor}; border-radius:999px; padding:3px 10px; font-weight:800; font-size:10px; text-transform:uppercase; margin-right:6px;">
        ${score.toFixed(1)} / 4.0 • ${tier.shortLabel}
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
            ${scoreBadgeHtml}
            <span style="background:${theme.pillBg}; border:1px solid ${theme.pillBorder}; color:${theme.accentText}; border-radius:999px; padding:3px 10px; font-weight:800; font-size:11px; text-transform:uppercase;">
              ${totalDomainExposures} ${totalDomainExposures === 1 ? 'PRACTICE' : 'PRACTICES'}
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
    realGrade = typeof gradeOrStudents === 'string' ? gradeOrStudents : '';
    realStudents = gradeOrStudents;
    realStats = studentsOrStats;
    realTimeframeLabel = statsOrTimeframeLabel;
    realFilter = (timeframeLabelOrFilter as any) || filterArg;
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

  const mistakeTier = realStats ? getMistakesTier(realStats.averageMistakes) : null;

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
        <div class="stat-box" style="border-color:#CBFAC4;">
          <div class="stat-value" style="color:#15803D;">${realStats ? realStats.totalSessions : 0}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-box" style="border-color:#BBE8FB;">
          <div class="stat-value" style="color:#0284C7;">${realStats ? formatDuration(realStats.averageDuration) : '0s'}</div>
          <div class="stat-label">Avg Session Duration</div>
        </div>
        <div class="stat-box" style="border-color:${mistakeTier ? mistakeTier.borderColor : '#FECDD3'};">
          <div class="stat-value" style="color:${mistakeTier ? mistakeTier.accentColor : '#F43F5E'};">${realStats ? realStats.averageMistakes.toFixed(1) : '0.0'}</div>
          <div class="stat-label">Avg Mistakes / Session</div>
          ${mistakeTier ? `
            <div style="margin-top:3px;">
              <span style="font-weight:800; font-size:9px; text-transform:uppercase; padding:2px 6px; border-radius:999px; border:1px solid ${mistakeTier.borderColor}; background:${mistakeTier.bgColor}; color:${mistakeTier.accentColor};">
                ${mistakeTier.shortLabel}
              </span>
            </div>
          ` : ''}
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

import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { ActivityTypeFilter } from '../../../../src/services/analytics';
import { getStudentValidatedSessionsEvaluations, SessionEvaluation } from '../../../../src/services/student-analytics';
import { calculateStudentProgressForecast } from '../../../../src/services/studentAnalyticsEngine';
import { FilterPeriod, getDateRangeForFilter, getFilterLabel } from '../../../../src/utils/dashboardFilters';
import { ParentFilterModal } from '../../../parent/parent-filter-modal';

interface StudentEvaluationTrendProps {
  studentId: string;
  filter?: string;
  refreshTrigger?: number;
  activityType?: ActivityTypeFilter;
}

type FilterType = FilterPeriod;

export default function StudentEvaluationTrend({ studentId, filter: externalFilter, refreshTrigger, activityType }: StudentEvaluationTrendProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [sessions, setSessions] = useState<SessionEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>((externalFilter as any) || 'overall');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [showForecast, setShowForecast] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter as any);
    }
  }, [externalFilter]);

  useEffect(() => {
    setSelectedPointIdx(null);
  }, [filter]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getStudentValidatedSessionsEvaluations(studentId, activityType);
        setSessions(data);
        setError(null);
      } catch (err: any) {
        console.error('StudentEvaluationTrend: failed to load evaluations', err);
        setError('Could not load evaluation trend data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [studentId, refreshTrigger, activityType]);

  // Helper to compute average rubric evaluation score (0-4)
  const calculateSessionScore = (rubric: any): number | null => {
    if (!rubric) return null;
    let parsed = rubric;
    if (typeof rubric === 'string') {
      try {
        parsed = JSON.parse(rubric);
      } catch {
        return null;
      }
    }
    if (!parsed || typeof parsed !== 'object') return null;
    const values = Object.values(parsed).map((v) => Number(v));
    if (values.length === 0) return null;

    const sum = values.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
    return sum / values.length;
  };

  // Filter & process data
  const chartData = useMemo(() => {
    const now = new Date();
    const { startDate, endDate } = getDateRangeForFilter(filter);

    const filtered = sessions.filter((s) => {
      const sessionDate = new Date(s.created_at);
      if (startDate && sessionDate < startDate) return false;
      if (endDate && sessionDate > endDate) return false;
      return true;
    });

    // Group by date YYYY-MM-DD
    const groups: Record<string, { scores: number[]; hints: number[] }> = {};
    filtered.forEach((s) => {
      const score = calculateSessionScore(s.rubric_evaluation);
      if (score === null) return;

      const dateKey = new Date(s.created_at).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { scores: [], hints: [] };
      }
      groups[dateKey].scores.push(score);
      groups[dateKey].hints.push(s.hints_used ?? 0);
    });

    // Sort and average daily scores and hints
    const sortedDateKeys = Object.keys(groups).sort();
    return sortedDateKeys.map((dateKey) => {
      const { scores, hints } = groups[dateKey];
      const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      const avgHints = hints.reduce((sum, val) => sum + val, 0) / hints.length;

      const d = new Date(dateKey + 'T00:00:00');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;

      return {
        date: dateKey,
        label,
        shortDate,
        score: Number(avgScore.toFixed(2)),
        hints: Number(avgHints.toFixed(1)),
      };
    });
  }, [sessions, filter]);

  // Dynamic scale ceiling for the right Y-axis (Hints)
  const maxHintsScale = useMemo(() => {
    if (chartData.length === 0) return 4;
    const maxH = Math.max(...chartData.map((d) => d.hints), 0);
    return Math.max(4, Math.ceil(maxH));
  }, [chartData]);

  // Overall average score calculation
  const averageScore = useMemo(() => {
    if (chartData.length === 0) return '0.0';
    const sum = chartData.reduce((acc, d) => acc + d.score, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  // Trend percentage calculation vs first data point
  const trendPercentage = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    if (first === 0) return null;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const forecastResult = useMemo(() => {
    return calculateStudentProgressForecast(sessions, filter);
  }, [sessions, filter]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Overall', value: 'overall' },
  ];

  // SVG Chart Layout Metrics
  const chartHeight = 185;
  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 20;
  const paddingBottom = 30;

  const svgWidth = Math.max(300, isTablet ? width - 144 : width - 72);
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + graphHeight;

  // Generate SVG Points & Smooth Bezier Curves for both Score & Hints
  const { linePath, areaPath, forecastLinePath, hintsLinePath, points, hintPoints, forecastPoints } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        linePath: '',
        areaPath: '',
        forecastLinePath: '',
        hintsLinePath: '',
        points: [],
        hintPoints: [],
        forecastPoints: [],
      };
    }

    const hasForecast = showForecast && forecastResult.points.length > chartData.length;
    const futurePtsData = hasForecast ? forecastResult.points.filter((p) => p.isForecast) : [];
    const totalPlotPoints = chartData.length + futurePtsData.length;

    // Score points (scaled 0 to 4)
    const pts = chartData.map((d, i) => {
      const x =
        totalPlotPoints === 1
          ? paddingLeft + graphWidth / 2
          : paddingLeft + (i / (totalPlotPoints - 1)) * graphWidth;

      const clampedScore = Math.max(0, Math.min(4, d.score));
      const y = paddingTop + graphHeight - (clampedScore / 4) * graphHeight;

      return { x, y, score: d.score, hints: d.hints, label: d.label, isForecast: false };
    });

    // Hints points (scaled 0 to maxHintsScale)
    const hPts = chartData.map((d, i) => {
      const x =
        totalPlotPoints === 1
          ? paddingLeft + graphWidth / 2
          : paddingLeft + (i / (totalPlotPoints - 1)) * graphWidth;

      const clampedHints = Math.max(0, Math.min(maxHintsScale, d.hints));
      const y = paddingTop + graphHeight - (clampedHints / maxHintsScale) * graphHeight;

      return { x, y, hints: d.hints, score: d.score, label: d.label };
    });

    // Forecast points
    const fPts = futurePtsData.map((d, i) => {
      const idx = chartData.length + i;
      const x = paddingLeft + (idx / (totalPlotPoints - 1)) * graphWidth;
      const clampedScore = Math.max(0, Math.min(4, d.forecastScore ?? 0));
      const y = paddingTop + graphHeight - (clampedScore / 4) * graphHeight;

      return { x, y, score: d.forecastScore ?? 0, hints: 0, label: d.label, isForecast: true };
    });

    // Score Line Path
    let lPath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      lPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const first = pts[0];
    const last = pts[pts.length - 1];
    const aPath = `${lPath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    // Hints Line Path
    let hlPath = `M ${hPts[0].x} ${hPts[0].y}`;
    for (let i = 0; i < hPts.length - 1; i++) {
      const curr = hPts[i];
      const next = hPts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      hlPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    // Forecast Line Path
    let fLinePath = '';
    if (fPts.length > 0) {
      const startPt = pts[pts.length - 1];
      fLinePath = `M ${startPt.x} ${startPt.y}`;
      fPts.forEach((fp) => {
        fLinePath += ` L ${fp.x} ${fp.y}`;
      });
    }

    return {
      linePath: lPath,
      areaPath: aPath,
      forecastLinePath: fLinePath,
      hintsLinePath: hlPath,
      points: pts,
      hintPoints: hPts,
      forecastPoints: fPts,
    };
  }, [chartData, forecastResult, showForecast, graphWidth, graphHeight, paddingLeft, paddingTop, baselineY, maxHintsScale]);

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Evaluation Trend
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2 flex-wrap">
            {/* Forecast Toggle Tactile Button */}
            <Pressable
              onPress={() => setShowForecast(!showForecast)}
              className="flex-row items-center justify-center px-3 h-[34px] rounded-xl active:scale-95 transition-transform border-[2px]"
              style={{
                backgroundColor: showForecast ? '#CBFAC4' : '#FFFFFF',
                borderColor: showForecast ? '#179D33' : '#F1F1F1',
                shadowColor: showForecast ? '#179D33' : '#F1F1F1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Text
                className={`font-fredoka-one uppercase ${
                  showForecast ? 'text-[#179D33]' : 'text-[#9CA3AF]'
                } text-[11px]`}
              >
                FORECAST: {showForecast ? 'ON' : 'OFF'}
              </Text>
            </Pressable>

            {/* Compact Tactile Filter Dropdown Trigger */}
            <Pressable
              onPress={() => setIsFilterModalOpen(true)}
              className="flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[34px] rounded-xl active:scale-95 transition-transform"
              style={{
                borderColor: '#BBE8FB',
                shadowColor: '#BBE8FB',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              <Feather name="calendar" size={13} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase" numberOfLines={1}>
                {getFilterLabel(filter).toUpperCase()}
              </Text>
              <Feather name="chevron-down" size={13} color="#62A9E6" />
            </Pressable>
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#F0F9FF] border-[2px] border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" style={{ marginTop: 2 }} />
            <View className="flex-1 flex-col gap-1.5">
              <Text className={`font-fredoka-one text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                WHAT DOES THIS CHART MEAN?
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Dual-Axis Trend:</Text> The blue line tracks the 5-criterion rubric evaluation score (1.0–4.0 scale), while the amber line tracks hints used per session.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#8B5CF6]">Mastery Target (3.2 • 80%):</Text> Scores at or above 3.2 signify stimulus acquisition and autonomous task performance.
              </Text>
              <Text className={`font-quicksand-medium text-[#484A4B] leading-relaxed ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                • <Text className="font-quicksand-bold text-[#62A9E6]">Prompt Fading:</Text> A decreasing amber line alongside an increasing blue line indicates successful fading of teacher prompts.
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Loading skeleton */}
      {isLoading && (
        <View
          style={{
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            height: isTablet ? 192 : 160,
          }}
        >
          <View style={{ width: '83.33%', height: 2, backgroundColor: '#E5E7EB', marginVertical: 12 }} />
          <View style={{ width: '83.33%', height: 2, backgroundColor: '#E5E7EB', marginVertical: 12 }} />
          <View style={{ width: '83.33%', height: 2, backgroundColor: '#E5E7EB', marginVertical: 12 }} />
        </View>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
          <Feather name="alert-circle" size={32} color="#EF4444" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            Error Loading Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* Empty state */}
      {!isLoading && !error && chartData.length === 0 && (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="trending-up" size={isTablet ? 44 : 32} color="#9CA3AF" />
          <Text className="font-fredoka-one text-lg text-[#4B5563] mt-3 text-center">
            No Evaluation Data
          </Text>
          <Text className="font-quicksand-medium text-sm text-[#9CA3AF] mt-1 text-center">
            There are no validated evaluations recorded for this student in this time range.
          </Text>
        </View>
      )}

      {/* Modern Line Chart Card — Dual Y-Axis */}
      {!isLoading && !error && chartData.length > 0 && (
        <View
          className={`w-full bg-white border-[4px] border-[#F1F1F1] ${
            isTablet ? 'rounded-[32px] p-6' : 'rounded-[20px] p-4'
          }`}
          style={{
            shadowColor: '#F1F1F1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
        >
          {/* Metric Header (Big Score + Trend Badge + 2-Week Outlook Card) */}
          <View className="flex-row items-center justify-between mb-2 px-1 flex-wrap gap-2">
            <View className="flex-col">
              <View className="flex-row items-center gap-3">
                <Text className="font-fredoka-one text-[32px] sm:text-[36px] text-[#484A4B] leading-tight">
                  {averageScore}
                </Text>
                {trendPercentage !== null && (
                  <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${trendPercentage >= 0 ? 'bg-[#BBE8FB]' : 'bg-[#FFDBD4]'}`}>
                    <Feather
                      name={trendPercentage >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={trendPercentage >= 0 ? '#62A9E6' : '#FF8870'}
                      strokeWidth={2.5}
                    />
                    <Text className={`font-fredoka-one text-xs ${trendPercentage >= 0 ? 'text-[#62A9E6]' : 'text-[#FF8870]'}`}>
                      {`${Math.abs(trendPercentage).toFixed(1)}%`}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mt-0.5">
                AVERAGE EVALUATION SCORE
              </Text>
            </View>

            {/* 2-Week Outlook Forecast Badge Card when Forecast is ON */}
            {showForecast && forecastResult.projected14DayScore !== null && (
              <View className="bg-[#F0FDF4] border border-[#CBFAC4] rounded-xl px-3 py-1.5 items-end">
                <Text className="font-fredoka-one text-[10px] text-[#179D33] uppercase tracking-wide">
                  2-WEEK OUTLOOK
                </Text>
                <Text className="font-fredoka-one text-sm text-[#179D33] mt-0.5">
                  ~{forecastResult.projected14DayScore} / 4.0 Predicted
                </Text>
                <Text className="font-quicksand-bold text-[10px] text-[#179D33] mt-0.5">
                  {forecastResult.estimatedDaysToMastery
                    ? `~${forecastResult.estimatedDaysToMastery} days to ${forecastResult.targetBenchmark}`
                    : 'Current trajectory'}
                </Text>
              </View>
            )}
          </View>

          {/* Dual-Axis Visual Legend */}
          <View className="flex-row items-center justify-between mb-3 px-1 flex-wrap gap-2">
            <View className="flex-row items-center gap-3 flex-wrap">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-[#62A9E6]" />
                <Text className="font-quicksand-bold text-[11px] text-[#484A4B]">
                  Score (0 - 4.0)
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-0.5 bg-[#8B5CF6]" style={{ borderRadius: 1 }} />
                <Text className="font-quicksand-bold text-[11px] text-[#484A4B]">
                  Mastery Target (3.2)
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-[#FFAE02]" />
                <Text className="font-quicksand-bold text-[11px] text-[#484A4B]">
                  Hints (Right Axis)
                </Text>
              </View>
            </View>
            {showForecast && (
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-1 rounded-sm bg-[#179D33]" />
                <Text className="font-quicksand-bold text-[11px] text-[#179D33]">
                  Forecast
                </Text>
              </View>
            )}
          </View>

          {/* SVG Chart Area */}
          <View className="items-center justify-center w-full">
            <Svg width={svgWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id="studentChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#62A9E6" stopOpacity={0.28} />
                  <Stop offset="80%" stopColor="#62A9E6" stopOpacity={0.04} />
                  <Stop offset="100%" stopColor="#62A9E6" stopOpacity={0.0} />
                </LinearGradient>
              </Defs>

              {/* Left Y-Axis Legend Scale & Horizontal Gridlines (0 to 4) */}
              {[0, 1, 2, 3, 4].map((scoreVal) => {
                const y = paddingTop + graphHeight - (scoreVal / 4) * graphHeight;
                return (
                  <React.Fragment key={`grid-${scoreVal}`}>
                    <Line
                      x1={paddingLeft}
                      y1={y}
                      x2={paddingLeft + graphWidth}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                    <SvgText
                      x={paddingLeft - 8}
                      y={y + 3}
                      fill="#9CA3AF"
                      fontSize="10"
                      fontFamily="Quicksand-Bold"
                      textAnchor="end"
                    >
                      {scoreVal}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* 3.2 ABA Mastery Benchmark Line (80%) */}
              {(() => {
                const masteryY = paddingTop + graphHeight - (3.2 / 4) * graphHeight;
                return (
                  <React.Fragment key="teacher-mastery-line">
                    <Line
                      x1={paddingLeft}
                      y1={masteryY}
                      x2={paddingLeft + graphWidth}
                      y2={masteryY}
                      stroke="#8B5CF6"
                      strokeDasharray="6,4"
                      strokeWidth="1.5"
                      strokeOpacity={0.85}
                    />
                    <SvgText
                      x={paddingLeft + graphWidth - 4}
                      y={masteryY - 4}
                      fill="#8B5CF6"
                      fontSize="9"
                      fontFamily="Quicksand-Bold"
                      textAnchor="end"
                    >
                      Mastery Target
                    </SvgText>
                  </React.Fragment>
                );
              })()}

              {/* Right Y-Axis Scale (Hints 0 to maxHintsScale) */}
              {[0, 1, 2, 3, 4].map((stepIdx) => {
                const fraction = stepIdx / 4;
                const hintVal = Math.round(fraction * maxHintsScale);
                const y = paddingTop + graphHeight - fraction * graphHeight;
                return (
                  <SvgText
                    key={`hint-axis-${stepIdx}`}
                    x={paddingLeft + graphWidth + 8}
                    y={y + 3}
                    fill="#FFAE02"
                    fontSize="10"
                    fontFamily="Quicksand-Bold"
                    textAnchor="start"
                  >
                    {hintVal}
                  </SvgText>
                );
              })}

              {/* Gradient Area Fill */}
              {points.length > 0 && areaPath !== '' && (
                <Path d={areaPath} fill="url(#studentChartGradient)" />
              )}

              {/* Smooth Line Graph (Score - Blue) */}
              {points.length > 0 && linePath !== '' && (
                <Path
                  d={linePath}
                  stroke="#62A9E6"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Hints Line Graph (Amber - Dashed) */}
              {hintPoints.length > 0 && hintsLinePath !== '' && (
                <Path
                  d={hintsLinePath}
                  stroke="#FFAE02"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dashed Forecast Projection Line */}
              {showForecast && forecastLinePath !== '' && (
                <Path
                  d={forecastLinePath}
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeDasharray="5,5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Score Interactive Data Points */}
              {points.map((pt, idx) => {
                const isSelected = selectedPointIdx === idx;
                return (
                  <React.Fragment key={`point-${idx}`}>
                    {/* Outer circle for selected point */}
                    {isSelected && (
                      <Circle cx={pt.x} cy={pt.y} r="9" fill="#62A9E6" fillOpacity="0.25" />
                    )}

                    {/* Standard point dot */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill="#62A9E6"
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />

                    {/* Touch hit target */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r="18"
                      fill="transparent"
                      onPress={() => setSelectedPointIdx(isSelected ? null : idx)}
                    />
                  </React.Fragment>
                );
              })}

              {/* Hints Interactive Data Points (Amber) */}
              {hintPoints.map((hpt, idx) => {
                const isSelected = selectedPointIdx === idx;
                return (
                  <React.Fragment key={`hint-point-${idx}`}>
                    {/* Outer circle for selected hint point */}
                    {isSelected && (
                      <Circle cx={hpt.x} cy={hpt.y} r="9" fill="#FFAE02" fillOpacity="0.25" />
                    )}

                    {/* Amber hint marker */}
                    <Circle
                      cx={hpt.x}
                      cy={hpt.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill="#FFAE02"
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />

                    {/* Touch hit target */}
                    <Circle
                      cx={hpt.x}
                      cy={hpt.y}
                      r="18"
                      fill="transparent"
                      onPress={() => setSelectedPointIdx(isSelected ? null : idx)}
                    />
                  </React.Fragment>
                );
              })}

              {/* Forecast Node Dots */}
              {showForecast && forecastPoints.map((fp, i) => {
                const fIdx = points.length + i;
                const isSelected = selectedPointIdx === fIdx;
                return (
                  <React.Fragment key={`fpoint-${i}`}>
                    {isSelected && (
                      <Circle cx={fp.x} cy={fp.y} r="10" fill="#34D399" fillOpacity="0.25" />
                    )}
                    <Circle
                      cx={fp.x}
                      cy={fp.y}
                      r={isSelected ? 5.5 : 4.5}
                      fill="#FFFFFF"
                      stroke="#34D399"
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <Circle
                      cx={fp.x}
                      cy={fp.y}
                      r="18"
                      fill="transparent"
                      onPress={() => setSelectedPointIdx(isSelected ? null : fIdx)}
                    />
                  </React.Fragment>
                );
              })}

              {/* Selected Point Vertical Guide Line */}
              {selectedPointIdx !== null && (points[selectedPointIdx] || forecastPoints[selectedPointIdx - points.length]) && (() => {
                const activePt = points[selectedPointIdx] || forecastPoints[selectedPointIdx - points.length];
                return (
                  <Line
                    x1={activePt.x}
                    y1={activePt.y + 6}
                    x2={activePt.x}
                    y2={baselineY}
                    stroke={selectedPointIdx < points.length ? "#BBE8FB" : "#86EFAC"}
                    strokeDasharray="3,3"
                    strokeWidth="1.5"
                  />
                );
              })()}

              {/* X-Axis Date Increment Legends (Start, Mid, End) */}
              {points.length > 0 && (() => {
                const total = points.length;
                if (total === 1) {
                  return (
                    <SvgText
                      x={points[0].x}
                      y={baselineY + 20}
                      fill="#9CA3AF"
                      fontSize="10"
                      fontFamily="Quicksand-Bold"
                      textAnchor="middle"
                    >
                      {points[0].label.toUpperCase()}
                    </SvgText>
                  );
                }

                const midIdx = Math.floor((total - 1) / 2);
                const indicesToShow = Array.from(new Set([0, midIdx, total - 1]));

                return indicesToShow.map((idx) => {
                  const pt = points[idx];
                  let anchor: 'start' | 'middle' | 'end' = 'middle';
                  if (idx === 0) anchor = 'start';
                  else if (idx === total - 1) anchor = 'end';

                  return (
                    <SvgText
                      key={`xaxis-${idx}`}
                      x={pt.x}
                      y={baselineY + 20}
                      fill="#9CA3AF"
                      fontSize="10"
                      fontFamily="Quicksand-Bold"
                      textAnchor={anchor}
                    >
                      {pt.label.toUpperCase()}
                    </SvgText>
                  );
                });
              })()}
            </Svg>

            {/* Microanimated Floating Tooltip Bubble with Clear Dual Metrics */}
            {selectedPointIdx !== null && (points[selectedPointIdx] || forecastPoints[selectedPointIdx - points.length]) && (() => {
              const isForecast = selectedPointIdx >= points.length;
              const activePt = isForecast ? forecastPoints[selectedPointIdx - points.length] : points[selectedPointIdx];
              const activeHint = isForecast ? null : hintPoints[selectedPointIdx];

              const tooltipWidth = isForecast ? 130 : (isTablet ? 250 : 210);
              const rawLeft = activePt.x - tooltipWidth / 2;
              const clampedLeft = Math.max(8, Math.min(rawLeft, svgWidth - tooltipWidth - 8));
              const topPos = Math.max(Math.min(activePt.y, activeHint ? activeHint.y : activePt.y) - 56, 2);

              const hintCount = activeHint?.hints ?? 0;
              const hintDescriptor = hintCount === 0
                ? 'Independent'
                : hintCount === 1
                ? '1 Audio Prompt'
                : `${hintCount} Visual Prompts`;

              return (
                <Animated.View
                  key={`tooltip-${selectedPointIdx}`}
                  entering={FadeInDown.duration(200)}
                  exiting={FadeOutDown.duration(150)}
                  style={{
                    position: 'absolute',
                    left: clampedLeft,
                    top: topPos,
                    width: tooltipWidth,
                    zIndex: 30,
                    shadowColor: '#62A9E6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  className={`border rounded-2xl py-1.5 px-3 items-center justify-center pointer-events-none ${
                    isForecast ? 'bg-[#ECFDF5] border-[#86EFAC]' : 'bg-white border-[#BBE8FB]'
                  }`}
                >
                  <Text className="font-fredoka-one text-[11px] text-[#475569] mb-0.5">
                    {activePt.label}
                  </Text>
                  {isForecast ? (
                    <Text className="font-quicksand-bold text-[11px] text-[#059669]">
                      Predicted Score: ~{activePt.score} / 4.0
                    </Text>
                  ) : (
                    <View className="flex-row items-center gap-2 flex-wrap justify-center">
                      <Text className="font-quicksand-bold text-[11px] text-[#62A9E6]">
                        ★ {activePt.score} / 4.0
                      </Text>
                      <Text className="text-[#CBD5E1] text-[10px]">•</Text>
                      <Text className="font-quicksand-bold text-[11px] text-[#D97706]">
                        💡 {hintDescriptor}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              );
            })()}
          </View>
        </View>
      )}

      {/* PER-CHART FILTER MODAL */}
      <ParentFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        isTablet={isTablet}
        selectedFilter={filter}
        onSelectFilter={(newFilter) => setFilter(newFilter)}
      />
    </View>
  );
}

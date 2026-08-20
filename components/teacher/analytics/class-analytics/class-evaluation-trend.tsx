import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { getValidatedSessionsEvaluations, SessionEvaluation } from '../../../../src/services/class-analytics';

interface ClassEvaluationTrendProps {
  classId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

export default function ClassEvaluationTrend({ classId }: ClassEvaluationTrendProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [sessions, setSessions] = useState<SessionEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('overall');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);

  useEffect(() => {
    setSelectedPointIdx(null);
  }, [filter]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getValidatedSessionsEvaluations(classId);
        setSessions(data);
        setError(null);
      } catch (err: any) {
        console.error('ClassEvaluationTrend: failed to load evaluations', err);
        setError('Could not load evaluation trend data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId]);

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
    let threshold = new Date(0); // Overall default

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

    const filtered = sessions.filter((s) => {
      const sessionDate = new Date(s.created_at);
      return sessionDate >= threshold;
    });

    // Group by date YYYY-MM-DD
    const groups: Record<string, number[]> = {};
    filtered.forEach((s) => {
      const score = calculateSessionScore(s.rubric_evaluation);
      if (score === null) return;

      const dateKey = new Date(s.created_at).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(score);
    });

    // Sort and average daily scores
    const sortedDateKeys = Object.keys(groups).sort();
    return sortedDateKeys.map((dateKey) => {
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
        score: Number(avg.toFixed(2)),
      };
    });
  }, [sessions, filter]);

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

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Overall', value: 'overall' },
  ];

  // SVG Chart Layout Metrics
  const chartHeight = 185;
  const paddingLeft = 36;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const svgWidth = Math.max(300, isTablet ? width - 144 : width - 72);
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + graphHeight;

  // Generate SVG Points & Smooth Bezier Curves
  const { linePath, areaPath, points } = useMemo(() => {
    if (chartData.length === 0) return { linePath: '', areaPath: '', points: [] };

    const pts = chartData.map((d, i) => {
      const x =
        chartData.length === 1
          ? paddingLeft + graphWidth / 2
          : paddingLeft + (i / (chartData.length - 1)) * graphWidth;

      // Score ranges 0 to 4
      const clampedScore = Math.max(0, Math.min(4, d.score));
      const y = paddingTop + graphHeight - (clampedScore / 4) * graphHeight;

      return { x, y, score: d.score, label: d.label };
    });

    if (pts.length === 1) {
      const p = pts[0];
      const lPath = `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`;
      const aPath = `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${baselineY} L ${p.x - 20} ${baselineY} Z`;
      return { linePath: lPath, areaPath: aPath, points: pts };
    }

    // Smooth Bezier Curve interpolation
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

    return { linePath: lPath, areaPath: aPath, points: pts };
  }, [chartData, graphWidth, graphHeight, paddingLeft, paddingTop, baselineY]);

  const lastPoint = points.length > 0 ? points[points.length - 1] : null;

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="flex-row flex-wrap items-center justify-between gap-4 mb-4">
        <View className="flex-1 min-w-[200px]">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
              Evaluation Trend
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 mt-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>
          {showInfo && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              exiting={FadeOutUp.duration(150)}
              className="bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-2 flex-row items-center gap-2.5 overflow-hidden"
            >
              <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
              <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                Average daily evaluation score across all activities (0–4 scale).
              </Text>
            </Animated.View>
          )}
        </View>

        <View className="flex-row items-center gap-1.5 flex-wrap">
          {filters.map((f) => {
            const isActive = filter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={{
                  borderWidth: 2,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: isTablet ? 16 : 12,
                  paddingVertical: isTablet ? 8 : 6,
                  backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                  borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                  shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Loading skeleton — rendered without unmounting the Svg below */}
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
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
          <Feather name="trending-up" size={36} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Evaluation Data
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            There are no validated evaluations recorded for this time range.
          </Text>
        </View>
      )}

      {/* Modern Line Chart Card — matching reference design */}
      <View
        style={[
          {
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 24 : 20,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 1,
          },
          (isLoading || error || chartData.length === 0) && { display: 'none' },
        ]}
      >
        {/* Metric Header (Big Score + Trend Badge + Description) */}
        <View className="flex-col mb-1 px-2">
          <View className="flex-row items-center gap-3">
            <Text className="font-fredoka-one text-[36px] text-[#484A4B] leading-tight">
              {averageScore}
            </Text>
            {trendPercentage !== null && (
              <View className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${trendPercentage >= 0 ? 'bg-[#E0F2FE]' : 'bg-[#FEE2E2]'}`}>
                <Feather
                  name={trendPercentage >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={trendPercentage >= 0 ? '#62A9E6' : '#EF4444'}
                  strokeWidth={2.5}
                />
                <Text className={`font-quicksand-bold text-sm ${trendPercentage >= 0 ? 'text-[#62A9E6]' : 'text-[#EF4444]'}`}>
                  {`${Math.abs(trendPercentage).toFixed(1)}%`}
                </Text>
              </View>
            )}
          </View>
          <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mt-0.5">
            AVERAGE EVALUATION SCORE
          </Text>
        </View>

        {/* SVG Chart Area — always mounted to prevent css-interop crash */}
        <View className="items-center justify-center w-full">
          <Svg width={svgWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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

            {/* Gradient Area Fill */}
            {points.length > 0 && areaPath !== '' && (
              <Path d={areaPath} fill="url(#chartGradient)" />
            )}

            {/* Smooth Line Graph */}
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

            {/* Interactive Data Points */}
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
                    fill={isSelected ? '#62A9E6' : '#62A9E6'}
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

            {/* Selected Point Vertical Guide Line */}
            {selectedPointIdx !== null && points[selectedPointIdx] && (
              <Line
                x1={points[selectedPointIdx].x}
                y1={points[selectedPointIdx].y + 6}
                x2={points[selectedPointIdx].x}
                y2={baselineY}
                stroke="#BBE8FB"
                strokeDasharray="3,3"
                strokeWidth="1.5"
              />
            )}

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

          {/* Microanimated Floating Tooltip Bubble */}
          {selectedPointIdx !== null && points[selectedPointIdx] && (() => {
            const activePt = points[selectedPointIdx];
            const tooltipWidth = 80;
            const rawLeft = activePt.x - tooltipWidth / 2;
            const clampedLeft = Math.max(8, Math.min(rawLeft, svgWidth - tooltipWidth - 8));
            const topPos = Math.max(activePt.y - 36, 2);

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
                  zIndex: 20,
                  shadowColor: '#62A9E6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                className="bg-white border border-[#BBE8FB] rounded-full py-1 px-2 items-center justify-center pointer-events-none"
              >
                <Text className="font-quicksand-bold text-[11px] text-[#475569]">
                  {activePt.label}: <Text className="font-fredoka-one text-[#62A9E6]">{activePt.score}</Text>
                </Text>
              </Animated.View>
            );
          })()}
        </View>
      </View>
    </View>
  );
}

import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { ParentSessionRecord } from '../../src/services/parentDashboard';
import { filterSessionsByPeriod, FilterPeriod } from '../../src/utils/dashboardFilters';

interface ParentProgressTrendProps {
  sessions: ParentSessionRecord[];
  globalFilter?: FilterPeriod;
  isTablet: boolean;
}

export function ParentProgressTrend({ sessions, globalFilter, isTablet }: ParentProgressTrendProps) {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<FilterPeriod>(globalFilter || 'overall');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);

  useEffect(() => {
    if (globalFilter !== undefined) {
      setFilter(globalFilter);
    }
  }, [globalFilter]);

  useEffect(() => {
    setSelectedPointIdx(null);
  }, [filter]);

  // Helper to compute session score percentage from rubric or session score
  const calculateSessionScore = (s: ParentSessionRecord): number | null => {
    if (s.rubricEvaluation) {
      const r = s.rubricEvaluation;
      const sum =
        (r.looking_at_objects || 0) +
        (r.concentrating || 0) +
        (r.performing_task || 0) +
        (r.following_instructions || 0) +
        (r.completed_work || 0);
      return Math.round((sum / 25) * 100);
    }
    if (s.score != null) return s.score;
    return null;
  };

  // Filter & process chart data points
  const chartData = useMemo(() => {
    const filtered = filterSessionsByPeriod(sessions, filter);

    // Group by date YYYY-MM-DD
    const groups: Record<string, number[]> = {};
    filtered.forEach((s) => {
      const score = calculateSessionScore(s);
      if (score === null) return;

      const dateKey = new Date(s.date).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(score);
    });

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
        score: Math.round(avg),
      };
    });
  }, [sessions, filter]);

  // Overall average score calculation
  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.score, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  // Trend percentage calculation vs first data point
  const trendPercentage = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    if (first === 0) return null;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const filters: { label: string; value: FilterPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Overall', value: 'overall' },
  ];

  // SVG Chart Layout Metrics
  const chartHeight = 185;
  const paddingLeft = 40;
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

      const clampedScore = Math.max(0, Math.min(100, d.score));
      const y = paddingTop + graphHeight - (clampedScore / 100) * graphHeight;

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

  return (
    <View className="flex-col mt-6">
      {/* Header and Filter Selector */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <View className="flex-row items-center gap-2">
            <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[28px]' : 'text-[20px]'}`}>
              Progress Over Time
            </Text>
            <Pressable
              onPress={() => setShowInfo(!showInfo)}
              className="active:opacity-75 p-1"
            >
              <Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" />
            </Pressable>
          </View>

          {/* Filter Buttons */}
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
                    paddingHorizontal: isTablet ? 14 : 10,
                    paddingVertical: isTablet ? 7 : 5,
                    backgroundColor: isActive ? '#BBE8FB' : '#FFFFFF',
                    borderColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowColor: isActive ? '#62A9E6' : '#BBE8FB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }}
                >
                  <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Full-width Info Banner Row below Title & Filters */}
        {showInfo && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className="w-full bg-[#E0F2FE] border border-[#BBE8FB] rounded-xl p-3 mt-3 flex-row items-center gap-2.5 overflow-hidden"
          >
            <Feather name="info" size={isTablet ? 22 : 18} color="#62A9E6" />
            <Text className={`font-quicksand-bold text-[#62A9E6] flex-1 leading-normal ${isTablet ? 'text-sm' : 'text-[11px]'}`}>
              Average daily performance percentage based on evaluated learning sessions.
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Empty State */}
      {chartData.length === 0 ? (
        <View className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 items-center justify-center">
          <Feather name="trending-up" size={isTablet ? 40 : 30} color="#9CA3AF" />
          <Text className="font-fredoka-one text-base text-[#4B5563] mt-3 text-center">
            No Progress Data Yet
          </Text>
          <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
            Progress points will appear as session evaluations are recorded.
          </Text>
        </View>
      ) : (
        /* Line Chart Card — matching class-evaluation-trend design */
        <View
          style={{
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
          }}
        >
          {/* Metric Header */}
          <View className="flex-col mb-1 px-2">
            <View className="flex-row items-center gap-3">
              <Text className="font-fredoka-one text-[34px] text-[#484A4B] leading-tight">
                {averageScore}%
              </Text>
              {trendPercentage !== null && (
                <View className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${trendPercentage >= 0 ? 'bg-[#E0F2FE]' : 'bg-[#FEE2E2]'}`}>
                  <Feather
                    name={trendPercentage >= 0 ? 'trending-up' : 'trending-down'}
                    size={15}
                    color={trendPercentage >= 0 ? '#62A9E6' : '#EF4444'}
                    strokeWidth={2.5}
                  />
                  <Text className={`font-quicksand-bold text-xs ${trendPercentage >= 0 ? 'text-[#62A9E6]' : 'text-[#EF4444]'}`}>
                    {`${Math.abs(trendPercentage).toFixed(1)}%`}
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mt-0.5">
              AVERAGE PROGRESS SCORE
            </Text>
          </View>

          {/* SVG Chart Area */}
          <View className="items-center justify-center w-full">
            <Svg width={svgWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id="parentChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#62A9E6" stopOpacity={0.28} />
                  <Stop offset="80%" stopColor="#62A9E6" stopOpacity={0.04} />
                  <Stop offset="100%" stopColor="#62A9E6" stopOpacity={0.0} />
                </LinearGradient>
              </Defs>

              {/* Gridlines (0% to 100%) */}
              {[0, 25, 50, 75, 100].map((scoreVal) => {
                const y = paddingTop + graphHeight - (scoreVal / 100) * graphHeight;
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
                      {`${scoreVal}%`}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Gradient Area Fill */}
              {points.length > 0 && areaPath !== '' && (
                <Path d={areaPath} fill="url(#parentChartGradient)" />
              )}

              {/* Line Graph */}
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

              {/* Data Points */}
              {points.map((pt, idx) => {
                const isSelected = selectedPointIdx === idx;
                return (
                  <React.Fragment key={`point-${idx}`}>
                    {isSelected && (
                      <Circle cx={pt.x} cy={pt.y} r="9" fill="#62A9E6" fillOpacity="0.25" />
                    )}

                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill="#62A9E6"
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />

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

              {/* Vertical Guide Line for Selected Point */}
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

              {/* X-Axis Date Labels */}
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

            {/* Microanimated Floating Tooltip */}
            {selectedPointIdx !== null && points[selectedPointIdx] && (() => {
              const activePt = points[selectedPointIdx];
              const tooltipWidth = 90;
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
                    {activePt.label}: <Text className="font-fredoka-one text-[#62A9E6]">{activePt.score}%</Text>
                  </Text>
                </Animated.View>
              );
            })()}
          </View>
        </View>
      )}
    </View>
  );
}

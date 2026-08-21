import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { getStudentValidatedSessionsEvaluations, SessionEvaluation } from '../../../../src/services/student-analytics';

interface StudentEvaluationTrendProps {
    studentId: string;
}

type FilterType = 'today' | 'week' | 'month' | 'overall';

export default function StudentEvaluationTrend({ studentId }: StudentEvaluationTrendProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [sessions, setSessions] = useState<SessionEvaluation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('overall');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const data = await getStudentValidatedSessionsEvaluations(studentId);
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
    }, [studentId]);

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
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
                dateKey,
                label,
                value: avg,
            };
        });
    }, [sessions, filter]);

    if (isLoading) {
        return (
            <View key="trend-loading" className="bg-white border border-[#E5E7EB] rounded-2xl p-6 items-center justify-center min-h-[260px]">
                <ActivityIndicator size="large" color="#62A9E6" />
                <Text className="mt-3 font-quicksand-semibold text-sm text-[#9CA3AF]">
                    Loading trend data...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View key="trend-error" className="bg-white border border-[#E5E7EB] rounded-2xl p-6 items-center justify-center min-h-[260px]">
                <Feather name="alert-circle" size={32} color="#EF4444" />
                <Text className="font-fredoka-one text-[#4B5563] text-base mt-2">
                    Failed to load trend
                </Text>
                <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-1 text-center">
                    {error}
                </Text>
            </View>
        );
    }

    // Layout calculations
    const chartWidth = isTablet ? width - 96 : width - 48;
    const chartHeight = 220;
    const padding = { top: 20, right: 24, bottom: 35, left: 35 };
    const chartW = chartWidth - padding.left - padding.right;
    const chartH = chartHeight - padding.top - padding.bottom;
    const n = chartData.length;

    const xFor = (i: number) => padding.left + (n <= 1 ? chartW / 2 : (i / (n - 1)) * chartW);
    const yFor = (v: number) => padding.top + chartH - (Math.max(0, Math.min(4, v)) / 4) * chartH;

    const pathD = n > 0 ? chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.value)}`).join(' ') : '';

    const gridLines = [0, 1, 2, 3, 4];

    // Helper to determine label step to prevent overlaps on small devices
    const step = n > 7 ? Math.ceil(n / 6) : 1;

    const filterButtons: { label: string; value: FilterType }[] = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Overall', value: 'overall' },
    ];

    return (
        <View key="trend-content" className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm mt-6">
            {/* Header and Filter Controls */}
            <View className="flex-row flex-wrap justify-between items-start mb-6 gap-3">
                <View className="flex-1 min-w-[200px]">
                    <Text className="font-fredoka-one text-xl text-[#4B5563]">
                        Evaluation Trend
                    </Text>
                    <Text className="font-quicksand-medium text-xs text-[#9CA3AF] mt-0.5">
                        Only evaluated sessions are included.
                    </Text>
                </View>

                {/* Filter Pills */}
                <View className="flex-row items-center gap-1.5 flex-wrap">
                    {filterButtons.map((btn) => {
                        const isActive = filter === btn.value;
                        return (
                            <Pressable
                                key={btn.value}
                                onPress={() => setFilter(btn.value)}
                                className={`px-3 py-1.5 rounded-full active:opacity-90 border ${isActive ? 'bg-[#62A9E6] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
                                    }`}
                            >
                                <Text
                                    className={`font-quicksand-bold text-[11px] ${isActive ? 'text-white' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {btn.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Chart Area */}
            {n === 0 ? (
                <View className="h-[220px] justify-center items-center">
                    <Feather name="bar-chart" size={36} color="#D1D5DB" />
                    <Text className="font-quicksand-semibold text-sm text-[#9CA3AF] mt-3">
                        No evaluated sessions in this period.
                    </Text>
                </View>
            ) : (
                <View className="items-center">
                    <Svg width={chartWidth} height={chartHeight}>
                        {/* Grid lines and y-axis labels */}
                        {gridLines.map((g) => (
                            <React.Fragment key={g}>
                                <Line
                                    x1={padding.left}
                                    y1={yFor(g)}
                                    x2={chartWidth - padding.right}
                                    y2={yFor(g)}
                                    stroke="#F3F4F6"
                                    strokeWidth={1.5}
                                />
                                <SvgText
                                    x={padding.left - 8}
                                    y={yFor(g) + 3}
                                    fontSize={10}
                                    fill="#9CA3AF"
                                    textAnchor="end"
                                    fontWeight="bold"
                                >
                                    {g.toFixed(1)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {/* Line Trend Path */}
                        {n > 1 && (
                            <Path
                                d={pathD}
                                stroke="#62A9E6"
                                strokeWidth={3}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data Point Dots */}
                        {chartData.map((d, i) => (
                            <Circle
                                key={d.dateKey}
                                cx={xFor(i)}
                                cy={yFor(d.value)}
                                r={n === 1 ? 6 : 4.5}
                                fill="#3B82F6"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                            />
                        ))}

                        {/* X-axis Date Labels */}
                        {chartData.map((d, i) => {
                            // Print labels with step spacing to avoid overlap if too many points
                            if (i === 0 || i === n - 1 || i % step === 0) {
                                return (
                                    <SvgText
                                        key={`label-${d.dateKey}`}
                                        x={xFor(i)}
                                        y={chartHeight - 10}
                                        fontSize={9.5}
                                        fill="#9CA3AF"
                                        textAnchor="middle"
                                        fontWeight="600"
                                    >
                                        {d.label}
                                    </SvgText>
                                );
                            }
                            return null;
                        })}
                    </Svg>
                </View>
            )}
        </View>
    );
}

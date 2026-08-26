import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

// ---------------------------------------------------------------------
// Daily Progress Over Time — dual-line trend chart
// ---------------------------------------------------------------------
interface LineTrendChartProps {
  labels: string[];
  seriesA: number[]; // Engagement (avg score %)
  seriesB: number[]; // Goal Completion (%)
  width?: number;
  height?: number;
}

export function LineTrendChart({ labels, seriesA, seriesB, width = 320, height = 180 }: LineTrendChartProps) {
  const padding = { top: 10, right: 10, bottom: 24, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const n = Math.max(labels.length, 1);

  const xFor = (i: number) => padding.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const yFor = (v: number) => padding.top + chartH - (Math.max(0, Math.min(100, v)) / 100) * chartH;

  const pathFor = (series: number[]) => series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <View>
      <Svg width={width} height={height}>
        {gridLines.map((g) => (
          <React.Fragment key={g}>
            <Line
              x1={padding.left}
              y1={yFor(g)}
              x2={width - padding.right}
              y2={yFor(g)}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
            <SvgText x={2} y={yFor(g) + 4} fontSize={9} fill="#9CA3AF">
              {g}%
            </SvgText>
          </React.Fragment>
        ))}

        {seriesA.length > 0 && <Path d={pathFor(seriesA)} stroke="#62A9E6" strokeWidth={2.5} fill="none" />}
        {seriesB.length > 0 && <Path d={pathFor(seriesB)} stroke="#FACC15" strokeWidth={2.5} fill="none" />}

        {seriesA.map((v, i) => (
          <Circle key={`a-${i}`} cx={xFor(i)} cy={yFor(v)} r={3.5} fill="#62A9E6" />
        ))}
        {seriesB.map((v, i) => (
          <Circle key={`b-${i}`} cx={xFor(i)} cy={yFor(v)} r={3.5} fill="#FACC15" />
        ))}

        {labels.map((label, i) => (
          <SvgText
            key={label + i}
            x={xFor(i)}
            y={height - 6}
            fontSize={9}
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------------
// Activity Performance — simple bar chart
// ---------------------------------------------------------------------
interface ActivityBarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}

export function ActivityBarChart({ data, width = 300, height = 160, color = '#62A9E6' }: ActivityBarChartProps) {
  const padding = { top: 10, bottom: 26, left: 6, right: 6 };
  const chartH = height - padding.top - padding.bottom;
  const barCount = Math.max(data.length, 1);
  const gap = 12;
  const barW = Math.max(18, (width - padding.left - padding.right - gap * (barCount - 1)) / barCount);

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const barH = (Math.max(0, Math.min(100, d.value)) / 100) * chartH;
        const x = padding.left + i * (barW + gap);
        const y = padding.top + (chartH - barH);
        return (
          <React.Fragment key={d.label + i}>
            <Path
              d={`M ${x} ${y + barH} L ${x} ${y + 6} Q ${x} ${y} ${x + 6} ${y} L ${x + barW - 6} ${y} Q ${x + barW} ${y} ${x + barW} ${y + 6} L ${x + barW} ${y + barH} Z`}
              fill={color}
              opacity={0.85}
            />
            <SvgText x={x + barW / 2} y={y - 4} fontSize={10} fill="#4B5563" textAnchor="middle" fontWeight="bold">
              {Math.round(d.value)}%
            </SvgText>
            <SvgText
              x={x + barW / 2}
              y={height - 8}
              fontSize={8.5}
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {d.label.length > 10 ? d.label.slice(0, 9) + '…' : d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ---------------------------------------------------------------------
// Skill Performance — radar / spider chart
// ---------------------------------------------------------------------
interface SkillRadarChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}

export function SkillRadarChart({ data, size = 260 }: SkillRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 34;
  const sides = Math.max(data.length, 3);
  const angleFor = (i: number) => (Math.PI * 2 * i) / sides - Math.PI / 2;

  const ringLevels = [0.25, 0.5, 0.75, 1];

  const pointAt = (i: number, fraction: number) => {
    const angle = angleFor(i);
    return {
      x: cx + Math.cos(angle) * radius * fraction,
      y: cy + Math.sin(angle) * radius * fraction,
    };
  };

  const valuePoints = data
    .map((d, i) => {
      const p = pointAt(i, Math.max(0, Math.min(100, d.value)) / 100);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <Svg width={size} height={size}>
      {/* concentric grid rings */}
      {ringLevels.map((f) => {
        const pts = Array.from({ length: sides }, (_, i) => {
          const p = pointAt(i, f);
          return `${p.x},${p.y}`;
        }).join(' ');
        return <Polygon key={f} points={pts} stroke="#E5E7EB" strokeWidth={1} fill="none" />;
      })}

      {/* spokes */}
      {data.map((_, i) => {
        const p = pointAt(i, 1);
        return <Line key={`spoke-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth={1} />;
      })}

      {/* value polygon */}
      <Polygon points={valuePoints} fill="#62A9E6" fillOpacity={0.35} stroke="#62A9E6" strokeWidth={2} />

      {/* value dots */}
      {data.map((d, i) => {
        const p = pointAt(i, Math.max(0, Math.min(100, d.value)) / 100);
        return <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3} fill="#3B82F6" />;
      })}

      {/* labels */}
      {data.map((d, i) => {
        const p = pointAt(i, 1.18);
        return (
          <SvgText
            key={`label-${i}`}
            x={p.x}
            y={p.y}
            fontSize={9.5}
            fill="#4B5563"
            fontWeight="bold"
            textAnchor="middle"
          >
            {d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

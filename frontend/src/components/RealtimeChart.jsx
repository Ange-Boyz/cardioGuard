import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

/**
 * RealtimeChart — smooth wavy line chart for streaming vitals.
 *
 * Props:
 *   data       — array of numbers (newest values at the END of the array)
 *   width      — chart width
 *   height     — chart height
 *   color      — line color
 *   minY/maxY  — optional axis bounds (auto-calculated if omitted)
 *   showDot    — show indicator dot at the latest point
 *   fillBelow  — gradient fill below the line
 *
 * Uses cubic Bézier curves through points to get the curvy aesthetic
 * from the design reference, instead of jagged straight-line connections.
 */
export default function RealtimeChart({
  data = [],
  width = 320,
  height = 140,
  color = COLORS.black,
  minY,
  maxY,
  showDot = true,
  fillBelow = true,
  showGrid = false,
}) {
  const { pathD, areaD, lastPoint, yMin, yMax } = useMemo(() => {
    if (data.length < 2) {
      return { pathD: '', areaD: '', lastPoint: null, yMin: 0, yMax: 100 };
    }

    const padX = 8;
    const padY = 16;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const computedMin = minY !== undefined ? minY : Math.min(...data) - 4;
    const computedMax = maxY !== undefined ? maxY : Math.max(...data) + 4;
    const range = computedMax - computedMin || 1;

    // Convert each value to (x, y)
    const points = data.map((v, i) => ({
      x: padX + (i / (data.length - 1)) * innerW,
      y: padY + (1 - (v - computedMin) / range) * innerH,
    }));

    // Smooth curve through points using Catmull-Rom → Bézier conversion
    // Tension factor 0.5 gives a natural wavy look without overshoot
    const tension = 0.4;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = points[points.length - 1];
    const area = `${d} L ${last.x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    return {
      pathD: d,
      areaD: area,
      lastPoint: last,
      yMin: computedMin,
      yMax: computedMax,
    };
  }, [data, width, height, minY, maxY]);

  if (data.length < 2) {
    return (
      <View style={{ width, height }} className="items-center justify-center">
        <Text className="text-ink-faint text-xs">Waiting for data...</Text>
      </View>
    );
  }

  const gradientId = `grad-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={color} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Optional faint horizontal gridlines */}
      {showGrid && (
        <G>
          {[0.25, 0.5, 0.75].map((t, i) => (
            <Line
              key={i}
              x1={8}
              x2={width - 8}
              y1={16 + t * (height - 32)}
              y2={16 + t * (height - 32)}
              stroke={COLORS.inkLine}
              strokeWidth={1}
              strokeDasharray="2,4"
            />
          ))}
        </G>
      )}

      {/* Area fill */}
      {fillBelow && (
        <Path d={areaD} fill={`url(#${gradientId})`} />
      )}

      {/* Line */}
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Latest point indicator — outer halo + inner dot */}
      {showDot && lastPoint && (
        <>
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={8} fill={color} fillOpacity={0.18} />
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={color} />
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill="white" />
        </>
      )}
    </Svg>
  );
}

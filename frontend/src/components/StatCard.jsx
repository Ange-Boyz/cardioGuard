import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import RealtimeChart from './RealtimeChart';

/**
 * StatCard — vital sign card with icon, label, big value, and mini chart.
 *
 * Matches the reference image's "Blood pressure 102/80" and
 * "Heart rate 72 bpm" cards. The accent variant uses the lime
 * background (like the reference's selected/highlighted card).
 *
 * Props:
 *   icon       — Ionicons name
 *   label      — small label above value
 *   value      — main value (string)
 *   unit       — small unit suffix
 *   chartData  — optional array of numbers for the mini sparkline
 *   accent     — true → lime background (highlighted variant)
 *   onPress    — optional tap handler
 */
export default function StatCard({
  icon,
  label,
  value,
  unit,
  chartData,
  accent = false,
  onPress,
  size = 'normal', // 'normal' | 'large'
}) {
  const Container = onPress ? Pressable : View;
  const bgClass    = accent ? 'bg-lime' : 'bg-white';
  const labelColor = accent ? COLORS.black : COLORS.inkMuted;
  const iconBg     = accent ? 'bg-black/10' : 'bg-cream';
  const iconColor  = accent ? COLORS.black : COLORS.ink;
  const lineColor  = accent ? COLORS.black : COLORS.ink;

  return (
    <Container
      onPress={onPress}
      className={`${bgClass} rounded-3xl p-5 ${onPress ? 'active:opacity-80' : ''}`}
      style={{ minHeight: size === 'large' ? 180 : 150 }}
    >
      {/* Header row: icon + label */}
      <View className="flex-row items-center mb-2">
        <View className={`w-9 h-9 rounded-2xl ${iconBg} items-center justify-center`}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text className="ml-2 text-xs font-medium" style={{ color: labelColor }}>
          {label}
        </Text>
      </View>

      {/* Mini chart */}
      {chartData && chartData.length > 1 && (
        <View className="my-1">
          <RealtimeChart
            data={chartData}
            width={size === 'large' ? 280 : 130}
            height={42}
            color={lineColor}
            showDot={false}
            fillBelow={false}
          />
        </View>
      )}

      {/* Value */}
      <View className="flex-row items-baseline mt-auto pt-2">
        <Text
          className="text-3xl font-bold"
          style={{ color: accent ? COLORS.black : COLORS.ink }}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            className="ml-1 text-xs"
            style={{ color: accent ? COLORS.black : COLORS.inkMuted }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </Container>
  );
}

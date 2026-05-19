import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRiskLevel, COLORS } from '../constants/theme';

/**
 * RiskCard — main risk-level display for the home screen.
 *
 * Visual language: a round dial on the left showing the percentage,
 * label and recommendation on the right, color-tinted background
 * matching the risk level (subtle, not alarmist).
 */
export default function RiskCard({ probability = 0, onPress }) {
  const risk = getRiskLevel(probability);
  const pct = Math.round(probability * 100);

  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl p-5 active:opacity-90"
      style={{ backgroundColor: risk.bgColor }}
    >
      <View className="flex-row items-center">
        {/* Big circular score */}
        <View
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: 'white' }}
        >
          <Text className="text-2xl font-bold" style={{ color: risk.color }}>
            {pct}
          </Text>
          <Text className="text-[10px] font-semibold" style={{ color: risk.color }}>
            %
          </Text>
        </View>

        {/* Label + text */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold tracking-wider text-ink-muted">
              CVD RISK
            </Text>
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: risk.color }}
            >
              <Text className="text-[10px] font-bold text-white">
                {risk.shortLabel.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-ink mt-1">{risk.label}</Text>
          <Text className="text-xs text-ink-muted mt-1 leading-4" numberOfLines={2}>
            {risk.recommendation}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.inkMuted} />
      </View>
    </Pressable>
  );
}

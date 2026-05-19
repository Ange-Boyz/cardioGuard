import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const VARIANTS = {
  tip:     { icon: 'bulb-outline',         color: '#5b8def', tint: '#e6efff' },
  warning: { icon: 'warning-outline',      color: '#f4a93a', tint: '#fdeed2' },
  alert:   { icon: 'alert-circle-outline', color: '#e85a4f', tint: '#fad9d6' },
  good:    { icon: 'checkmark-circle-outline', color: '#86c34c', tint: '#eaf3dc' },
};

/**
 * AlertCard — daily insight, alert, or info message for the home feed.
 *
 * Props:
 *   variant   — 'tip' | 'warning' | 'alert' | 'good'
 *   title     — headline
 *   message   — body text
 *   time      — relative time string (e.g. "2h ago")
 */
export default function AlertCard({
  variant = 'tip',
  title,
  message,
  time,
  onPress,
}) {
  const v = VARIANTS[variant] || VARIANTS.tip;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className="bg-white rounded-3xl p-4 flex-row active:opacity-80"
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center"
        style={{ backgroundColor: v.tint }}
      >
        <Ionicons name={v.icon} size={20} color={v.color} />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-ink font-semibold text-sm flex-1" numberOfLines={1}>
            {title}
          </Text>
          {time ? (
            <Text className="text-ink-faint text-[10px] ml-2">{time}</Text>
          ) : null}
        </View>
        <Text className="text-ink-muted text-xs mt-1 leading-4" numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Container>
  );
}

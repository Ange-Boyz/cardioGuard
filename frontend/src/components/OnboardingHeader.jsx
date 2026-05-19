import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * OnboardingHeader — top bar with back button + progress dots.
 */
export default function OnboardingHeader({ step, totalSteps, onBack }) {
  return (
    <View className="px-5 py-3 flex-row items-center">
      {onBack ? (
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-white items-center justify-center active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}

      <View className="flex-1 flex-row items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const completed = i + 1 <= step;
          return (
            <View
              key={i}
              className={`h-1.5 rounded-full ${completed ? 'bg-ink' : 'bg-ink-line'}`}
              style={{ width: completed ? 24 : 16 }}
            />
          );
        })}
      </View>

      <View className="w-10" />
    </View>
  );
}

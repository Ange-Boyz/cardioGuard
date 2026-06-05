import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * PrimaryButton — the main CTA button.
 *
 * Variants:
 *   filled    → black bg, white text (default)
 *   accent    → lime bg, black text (for big positive actions)
 *   ghost     → transparent, dark border
 */
export default function PrimaryButton({
  title,
  label,
  onPress,
  variant = 'filled',
  loading = false,
  disabled = false,
  icon,
  iconRight,
}) {
  const base = 'rounded-3xl py-4 px-6 flex-row items-center justify-center';

  const styles = {
    filled: { container: 'bg-ink active:opacity-80',         text: 'text-white' },
    accent: { container: 'bg-lime active:opacity-80',        text: 'text-ink' },
    ghost:  { container: 'bg-transparent border border-ink', text: 'text-ink' },
  }[variant];

  const textColor =
    variant === 'filled' ? 'white' :
    variant === 'accent' ? COLORS.ink :
    COLORS.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${styles.container} ${disabled ? 'opacity-50' : ''}`}
      style={{ minHeight: 56 }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Ionicons name={icon} size={20} color={textColor} style={{ marginRight: 8 }} />
          ) : null}
          <Text className={`font-bold text-base ${styles.text}`}>{title ?? label}</Text>
          {iconRight ? (
            <Ionicons name={iconRight} size={20} color={textColor} style={{ marginLeft: 8 }} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

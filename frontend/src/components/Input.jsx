import { View, Text, TextInput, Pressable } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Input — onboarding-style input.
 * Big, rounded, cream-soft background. Matches the wellness aesthetic.
 *
 * Props:
 *   label, value, onChange, type, placeholder, unit, error, options (segmented)
 */
export default function Input({
  label,
  value,
  onChange,
  type = 'text', // 'text' | 'number' | 'segmented'
  placeholder,
  unit,
  error,
  options = [],
  hint,
}) {
  return (
    <View className="mb-5">
      {label ? (
        <Text className="text-ink font-semibold text-sm mb-2 ml-1">{label}</Text>
      ) : null}

      {type === 'segmented' ? (
        <View className="flex-row bg-white rounded-3xl p-1.5 border border-ink-line">
          {options.map((opt) => {
            const selected = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onChange(opt.value)}
                className={`flex-1 py-3.5 rounded-2xl items-center ${
                  selected ? 'bg-ink' : ''
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected ? 'text-white' : 'text-ink-muted'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View
          className={`bg-white rounded-3xl flex-row items-center px-5 ${
            error ? 'border border-risk-high' : 'border border-ink-line'
          }`}
          style={{ height: 60 }}
        >
          <TextInput
            value={value !== null && value !== undefined ? String(value) : ''}
            onChangeText={(t) => {
              if (type === 'number') {
                onChange(t.replace(/[^0-9.]/g, ''));
              } else {
                onChange(t);
              }
            }}
            keyboardType={type === 'number' ? 'decimal-pad' : 'default'}
            placeholder={placeholder}
            placeholderTextColor={COLORS.inkFaint}
            className="flex-1 text-lg text-ink"
          />
          {unit ? (
            <Text className="text-ink-muted text-sm ml-2">{unit}</Text>
          ) : null}
        </View>
      )}

      {hint && !error ? (
        <Text className="text-ink-faint text-xs mt-2 ml-1">{hint}</Text>
      ) : null}
      {error ? (
        <Text className="text-risk-high text-xs mt-2 ml-1">{error}</Text>
      ) : null}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export { default as PrimaryButton } from './PrimaryButton';
import Input from './Input';
export { Input };

// `Field` is an alias for the Input used across the app
// Map common prop `onChangeText` (used in screens) to `onChange` expected by `Input`.
export const Field = ({ onChangeText, ...props }) => <Input onChange={onChangeText} {...props} />;

export function LogoMark({ size = 'md' }) {
  const px = size === 'lg' ? 72 : size === 'sm' ? 28 : 44;
  return (
    <View style={{ width: px, height: px, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="heart" size={Math.round(px * 0.5)} color={COLORS.lime} />
    </View>
  );
}

export function Toast({ message = '', visible = false, type = 'info' }) {
  if (!visible) return null;
  const bg = type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#fff8e1';
  return (
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: 30, padding: 12, borderRadius: 12, backgroundColor: bg, borderWidth: 1, borderColor: '#ddd' }}>
      <Text style={{ textAlign: 'center' }}>{message}</Text>
    </View>
  );
}

export function TermsText() {
  return (
    <Text style={{ textAlign: 'center', color: COLORS.inkFaint, fontSize: 12, marginTop: 8 }}>
      By creating an account you agree to our Terms and Privacy Policy.
    </Text>
  );
}

export default null;

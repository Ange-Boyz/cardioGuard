// src/screens/SignInScreen.jsx
// ─── Sign In ─────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import {
  LogoMark, Field, PrimaryButton,
  Toast, TermsText,
} from '../../components';
import { signIn } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../constants/AppContext';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const { completeOnboarding } = useApp();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(28);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true, delay: 60 }),
        Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true, delay: 60 }),
      ]).start();
    }, [])
  );

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const validate = () => {
    if (!email.trim()) { showToast('Email is required.', 'error'); return false; }
    if (!email.includes('@')) { showToast('Enter a valid email address.', 'error'); return false; }
    if (!password) { showToast('Password is required.', 'error'); return false; }
    return true;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = await signIn({ email: email.trim().toLowerCase(), password });
      // persist tokens
      await AsyncStorage.setItem('@cg_access_token', payload.access_token);
      await AsyncStorage.setItem('@cg_refresh_token', payload.refresh_token);
      showToast('Signed in!', 'success');
      completeOnboarding();
    } catch (err) {
      showToast(err?.detail || err?.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', marginBottom: 28 }}>
            <LogoMark size="lg" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 24, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.card }}>
            <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.black, letterSpacing: -0.5, marginBottom: 6 }}>Welcome back</Text>
            <Text style={{ fontFamily: FONTS.sansLt, fontSize: 14, color: COLORS.muted, marginBottom: 18 }}>Sign in to continue to CardioGuard.</Text>

            <Field
              label="Email address"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              inputRef={emailRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              inputRef={passwordRef}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />

            <PrimaryButton label="Sign in" onPress={handleSignIn} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 12, alignSelf: 'flex-end' }}>
              <Text style={{ fontFamily: FONTS.bodyMd, color: COLORS.muted }}>Forgot password?</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.muted }}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ marginLeft: 8 }}>
              <Text style={{ fontFamily: FONTS.bodyMd, fontSize: 14, color: COLORS.black, textDecorationLine: 'underline' }}>Create account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </View>
  );
}
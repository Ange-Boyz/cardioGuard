// src/screens/SignUpScreen.js
// ─── Sign Up ──────────────────────────────────────────────────────────────────

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
import { signUp } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from '../../constants/theme';


export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState({ visible: false, message: '', type: 'info' });

  const lastNameRef  = useRef(null);
  const emailRef     = useRef(null);
  const passwordRef  = useRef(null);
  const passwordConfirmRef = useRef(null);

  // ── Entrance animation ────────────────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(28);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true, delay: 80 }),
        Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true, delay: 80 }),
      ]).start();
    }, [])
  );

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const validate = () => {
    if (!firstName.trim())      { showToast('First name is required.', 'error');         return false; }
    if (!lastName.trim())       { showToast('Last name is required.', 'error');          return false; }
    if (!email.trim())          { showToast('Email is required.', 'error');              return false; }
    if (!email.includes('@'))   { showToast('Enter a valid email address.', 'error');    return false; }
    if (!password)              { showToast('Password is required.', 'error');           return false; }
    if (password.length < 8)    { showToast('Password must be at least 8 characters.', 'error'); return false; }
    if (!passwordConfirm)       { showToast('Please confirm your password.', 'error');    return false; }
    if (password !== passwordConfirm) { showToast('Passwords do not match.', 'error');       return false; }
    return true;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = await signUp({
        email:     email.trim().toLowerCase(),
        password,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      });

      // persist tokens for authenticated requests
      await AsyncStorage.setItem('@cg_access_token', payload.access_token);
      await AsyncStorage.setItem('@cg_refresh_token', payload.refresh_token);
      showToast('Account created!', 'success');
      setTimeout(() => navigation.navigate('PersonalInfo'), 800);
    } catch (err) {
      showToast(err?.detail || err?.message || 'Something went wrong.', 'error');
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
          {/* Logo */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              marginBottom: 36,
            }}
          >
            <LogoMark size="lg" />
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xl,
              padding: 24,
              borderWidth: 0.5,
              borderColor: COLORS.border,
              ...SHADOW.card,
            }}
          >
            {/* Header */}
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 26,
                color: COLORS.black,
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              Create account
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sansLt,
                fontSize: 14,
                color: COLORS.muted,
                marginBottom: 24,
              }}
            >
              Your cardiovascular health companion.
            </Text>

            {/* Name row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="First name"
                  icon="person-outline"
                  placeholder="Jane"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Last name"
                  icon="person-outline"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  inputRef={lastNameRef}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

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
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              inputRef={passwordRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordConfirmRef.current?.focus()}
              showStrength
            />

            <Field
              label="Confirm password"
              icon="lock-closed-outline"
              placeholder="Re-enter password"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              autoComplete="new-password"
              inputRef={passwordConfirmRef}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            <PrimaryButton
              label="Create account"
              onPress={handleSignUp}
              loading={loading}
              style={{ marginTop: 8}}
            />

            <TermsText />
          </Animated.View>

          {/* Switch to Sign In */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 24,
              gap: 4,
            }}
          >
            <Text style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.muted }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text
                style={{
                  fontFamily: FONTS.bodyMd,
                  fontSize: 14,
                  color: COLORS.black,
                  textDecorationLine: 'underline',
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </View>
  );
}
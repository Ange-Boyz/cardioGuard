// src/screens/ForgotPasswordScreen.js
// ─── Forgot Password ──────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
  Animated, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../constants/theme';
import { Field, PrimaryButton, Toast } from '../../components';

export default function ForgotPasswordScreen({ navigation }) {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ visible: false, message: '', type: 'info' });

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true, delay: 60 }),
        Animated.spring(slideAnim, { toValue: 0, speed: 16, bounciness: 3, useNativeDriver: true, delay: 60 }),
      ]).start();
    }, [])
  );

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    // TODO: call your backend reset endpoint
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
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
          {/* Back button */}
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 32 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.black} />
              <Text style={{ fontFamily: FONTS.bodyMd, fontSize: 14, color: COLORS.black }}>
                Back
              </Text>
            </TouchableOpacity>
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
            {!sent ? (
              <>
                {/* Icon */}
                <View
                  style={{
                    width: 52, height: 52,
                    backgroundColor: COLORS.creamSoft,
                    borderRadius: RADIUS.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                    borderWidth: 0.5,
                    borderColor: COLORS.border,
                  }}
                >
                  <Ionicons name="key-outline" size={24} color={COLORS.black} />
                </View>

                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 24,
                    color: COLORS.black,
                    letterSpacing: -0.4,
                    marginBottom: 6,
                  }}
                >
                  Forgot password?
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.sansLt,
                    fontSize: 14,
                    color: COLORS.muted,
                    lineHeight: 20,
                    marginBottom: 26,
                  }}
                >
                  No worries — we'll send a reset link to your email address.
                </Text>

                <Field
                  label="Email address"
                  icon="mail-outline"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <PrimaryButton
                  label="Send reset link"
                  onPress={handleSubmit}
                  loading={loading}
                  style={{ marginTop: 8 }}
                />
              </>
            ) : (
              /* ── Success state ─────────────────────────────────────────── */
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <View
                  style={{
                    width: 64, height: 64,
                    backgroundColor: 'rgba(29,158,117,0.10)',
                    borderRadius: RADIUS.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={32} color={COLORS.low} />
                </View>

                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    color: COLORS.black,
                    letterSpacing: -0.4,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Check your inbox
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.sansLt,
                    fontSize: 14,
                    color: COLORS.muted,
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: 28,
                  }}
                >
                  We've sent a reset link to{'\n'}
                  <Text style={{ fontFamily: FONTS.bodyMd, color: COLORS.black }}>{email}</Text>
                </Text>

                <PrimaryButton
                  label="Back to sign in"
                  onPress={() => navigation.navigate('SignIn')}
                />

                <TouchableOpacity
                  onPress={() => { setSent(false); setEmail(''); }}
                  style={{ marginTop: 14 }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 13,
                      color: COLORS.muted,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Try a different email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
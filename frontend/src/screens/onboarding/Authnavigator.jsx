// src/navigation/AuthNavigator.js
// ─── Auth Navigation Stack ────────────────────────────────────────────────────

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignInScreen       from '../screens/SignInScreen';
import SignUpScreen       from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown:      false,
        animation:        'fade_from_bottom',
        gestureEnabled:   true,
        contentStyle:     { backgroundColor: '#f5f1ea' },
      }}
    >
      <Stack.Screen name="SignIn"          component={SignInScreen} />
      <Stack.Screen name="SignUp"          component={SignUpScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
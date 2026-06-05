/**
 * Minimal auth service for signup/login.
 * Detects emulator host for Android and adds basic network error handling.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

// Determine API host in this order:
// 1. Expo debugger host (gives your PC LAN IP when using LAN in Expo)
// 2. Android emulator loopback (10.0.2.2)
// 3. localhost
// `API_BASE` is exported from src/config.js

async function handleResponse(res) {
  const contentType = (res.headers && res.headers.get)
    ? (res.headers.get('content-type') || '')
    : '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    const text = await res.text().catch(() => 'Server error');
    throw { message: text };
  }

  if (!isJson) {
    const text = await res.text().catch(() => 'Invalid server response');
    try {
      return JSON.parse(text);
    } catch (e) {
      throw { message: text };
    }
  }

  return await res.json();
}

export async function signUp(payload) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (e) {
    throw { message: e?.message || 'Network request failed' };
  }
}

export async function signIn(payload) {
  try {
    // backend expects /auth/login
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (e) {
    throw { message: e?.message || 'Network request failed' };
  }
}

export async function refreshTokens() {
  try {
    const refresh = await AsyncStorage.getItem('@cg_refresh_token');
    if (!refresh) throw { message: 'No refresh token available' };

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    const payload = await handleResponse(res);
    // persist new tokens
    await AsyncStorage.setItem('@cg_access_token', payload.access_token);
    await AsyncStorage.setItem('@cg_refresh_token', payload.refresh_token);
    return payload;
  } catch (e) {
    throw { message: e?.message || 'Failed to refresh tokens' };
  }
}

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokens } from './authService';
import { API_BASE } from '../config';

export async function updateProfile(profile) {
  const token = await AsyncStorage.getItem('@cg_access_token');
  if (!token) throw { message: 'No auth token' };

  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  if (res.status === 401) {
    // try refresh once
    try {
      await refreshTokens();
      const newToken = await AsyncStorage.getItem('@cg_access_token');
      const retry = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
        body: JSON.stringify(profile),
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw err;
      }
      return retry.json();
    } catch (e) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }

  return res.json();
}

export async function getProfile() {
  const token = await AsyncStorage.getItem('@cg_access_token');
  if (!token) throw { message: 'No auth token' };

  const res = await fetch(`${API_BASE}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) {
    try {
      await refreshTokens();
      const newToken = await AsyncStorage.getItem('@cg_access_token');
      const retry = await fetch(`${API_BASE}/profile`, { headers: { 'Authorization': `Bearer ${newToken}` } });
      if (!retry.ok) return {};
      return retry.json();
    } catch (e) {
      return {};
    }
  }

  if (!res.ok) return {};
  return res.json();
}

export async function getMe() {
  const token = await AsyncStorage.getItem('@cg_access_token');
  if (!token) throw { message: 'No auth token' };

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) {
    try {
      await refreshTokens();
      const newToken = await AsyncStorage.getItem('@cg_access_token');
      const retry = await fetch(`${API_BASE}/auth/me`, { headers: { 'Authorization': `Bearer ${newToken}` } });
      if (!retry.ok) return {};
      return retry.json();
    } catch (e) {
      return {};
    }
  }

  if (!res.ok) return {};
  return res.json();
}

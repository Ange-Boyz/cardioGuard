import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokens } from './authService';

function resolveApiHost() {
  try {
    const dbg = Constants?.manifest?.debuggerHost;
    if (dbg) {
      const host = dbg.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
    }
  } catch (e) {}
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}

const API_BASE = `http://${resolveApiHost()}:8000`;

export async function syncHistory(entries) {
  const token = await AsyncStorage.getItem('@cg_access_token');
  if (!token) throw { message: 'No auth token' };

  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ entries }),
  });
  if (res.status === 401) {
    try {
      await refreshTokens();
      const newToken = await AsyncStorage.getItem('@cg_access_token');
      const retry = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
        body: JSON.stringify({ entries }),
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

export async function fetchHistory(limit = 100) {
  const token = await AsyncStorage.getItem('@cg_access_token');
  if (!token) throw { message: 'No auth token' };

  const res = await fetch(`${API_BASE}/history?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) {
    try {
      await refreshTokens();
      const newToken = await AsyncStorage.getItem('@cg_access_token');
      const retry = await fetch(`${API_BASE}/history?limit=${limit}`, { headers: { 'Authorization': `Bearer ${newToken}` } });
      if (!retry.ok) return null;
      return retry.json();
    } catch (e) {
      return null;
    }
  }

  if (!res.ok) return null;
  return res.json();
}

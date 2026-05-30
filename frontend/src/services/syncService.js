import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from '../constants/theme';
import { updateProfile, getProfile as fetchProfileFromServer } from './profileService';
import { syncHistory } from './historyService';

let unsubscribeNetInfo = null;

async function syncAll() {
  // Sync profile
  try {
    const rawProfile = await AsyncStorage.getItem(STORAGE.PROFILE);
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      // send to server (non-blocking)
      await updateProfile(profile);
      // refresh authoritative server profile and merge
      try {
        const server = await fetchProfileFromServer();
        if (server && Object.keys(server).length > 0) {
          const mapped = {
            age: server.age,
            sex: server.gender,
            height: server.height,
            weight: server.weight,
            bmi: server.bmi,
            smoking: server.smoking,
            alcohol: server.alcohol,
            family_history: server.family_history,
            systolic_bp: server.systolic_bp,
            diastolic_bp: server.diastolic_bp,
          };
          // keep local name/email if present
          const existing = JSON.parse(rawProfile);
          const merged = { ...existing, ...mapped };
          await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify(merged));
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore profile sync errors
  }

  // Sync history
  try {
    const raw = await AsyncStorage.getItem(STORAGE.HISTORY);
    const history = raw ? JSON.parse(raw) : [];
    if (history.length > 0) {
      // map to server expected shape
      const entries = history.map((e) => ({
        id: e.id || `${e.timestamp}-${Math.random().toString(36).slice(2,8)}`,
        timestamp: e.timestamp,
        probability: e.result?.probability ?? 0,
        cvd_detected: e.result?.cvd_detected ?? false,
        snapshot: e.snapshot || null,
      }));
      // send in one batch
      await syncHistory(entries);
    }
  } catch (e) {
    // ignore history sync errors
  }
}

export function startAutoSync() {
  // Try to use NetInfo if available (react-native), otherwise fallback to online event (web)
  try {
    // dynamic import to avoid hard dependency in environments where NetInfo isn't installed
    // eslint-disable-next-line global-require
    const NetInfo = require('@react-native-community/netinfo');
    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncAll();
      }
    });
  } catch (e) {
    // fallback for web: listen to window 'online'
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handler = () => syncAll();
      window.addEventListener('online', handler);
      unsubscribeNetInfo = () => window.removeEventListener('online', handler);
    }
  }

  // also run an initial attempt
  setTimeout(() => {
    syncAll();
  }, 1000);

  return () => {
    if (typeof unsubscribeNetInfo === 'function') unsubscribeNetInfo();
  };
}

export function stopAutoSync() {
  if (typeof unsubscribeNetInfo === 'function') unsubscribeNetInfo();
}

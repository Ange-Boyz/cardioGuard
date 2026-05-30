import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Central API base detection.
// Priority:
// 1. `process.env.API_BASE_URL` (requires app build-time env plugin)
// 2. Expo debugger host (when using LAN)
// 3. Android emulator loopback
// 4. localhost
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

const API_BASE = (process.env && process.env.API_BASE_URL)
  ? process.env.API_BASE_URL
  : `http://${resolveApiHost()}:8000`;

export { API_BASE };

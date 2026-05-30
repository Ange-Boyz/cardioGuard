import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from './theme';
import { getMe } from '../services/profileService';
import { startAutoSync } from '../services/syncService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [onboarded, setOnboarded] = useState(null); // null = loading
  const [profile, setProfile]     = useState(null);

  useEffect(() => {
    (async () => {
      const flag = await AsyncStorage.getItem(STORAGE.ONBOARDED);
      setOnboarded(flag === 'true');

      // Load local profile first
      const prof = await AsyncStorage.getItem(STORAGE.PROFILE);
      let parsed = prof ? JSON.parse(prof) : null;

      // If we have an access token, try to fetch user's name from server and merge
      try {
        const me = await getMe();
        if (me && me.full_name) {
          parsed = { ...(parsed || {}), name: me.full_name, email: me.email };
          // persist merged profile locally
          await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify(parsed));
        }
      } catch (e) {
        // no token or network — ignore
      }

      if (parsed) setProfile(parsed);
      // start background sync (fires when connectivity is restored)
      try {
        startAutoSync();
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const completeOnboarding = async () => {
    const prof = await AsyncStorage.getItem(STORAGE.PROFILE);
    if (prof) setProfile(JSON.parse(prof));
    setOnboarded(true);
  };

  const resetApp = async () => {
    await AsyncStorage.multiRemove([
      STORAGE.PROFILE,
      STORAGE.HISTORY,
      STORAGE.LATEST_RISK,
      STORAGE.ONBOARDED,
    ]);
    setProfile(null);
    setOnboarded(false);
  };

  return (
    <AppContext.Provider value={{ onboarded, profile, completeOnboarding, resetApp }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

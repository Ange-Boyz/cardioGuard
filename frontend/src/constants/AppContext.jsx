import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from './theme';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [onboarded, setOnboarded] = useState(null); // null = loading
  const [profile, setProfile]     = useState(null);

  useEffect(() => {
    (async () => {
      const flag = await AsyncStorage.getItem(STORAGE.ONBOARDED);
      const prof = await AsyncStorage.getItem(STORAGE.PROFILE);
      setOnboarded(flag === 'true');
      if (prof) setProfile(JSON.parse(prof));
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

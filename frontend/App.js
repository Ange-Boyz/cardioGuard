import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/constants/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initInference } from './src/services/inference';  

export default function App() {
  useEffect(() => {
    initInference();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

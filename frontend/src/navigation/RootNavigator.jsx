import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import OnboardingStack from './OnboardingStack';
import MainTabs from './MainTabs';
import { useApp } from '../constants/AppContext';
import { COLORS } from '../constants/theme';

export default function RootNavigator() {
  const { onboarded } = useApp();

  // Loading splash while we read AsyncStorage
  if (onboarded === null) {
    return (
      <View className="flex-1 bg-cream items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
        <ActivityIndicator size="large" color={COLORS.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {onboarded ? <MainTabs /> : <OnboardingStack />}
    </NavigationContainer>
  );
}

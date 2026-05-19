import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/onboarding/SplashScreen';
import PersonalInfoScreen from '../screens/onboarding/PersonalInfoScreen';
import HealthInfoScreen from '../screens/onboarding/HealthInfoScreen';
import MeasureBPScreen from '../screens/onboarding/MeasureBPScreen';
import ConnectDeviceScreen from '../screens/onboarding/ConnectDeviceScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f1ea' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="HealthInfo" component={HealthInfoScreen} />
      <Stack.Screen name="MeasureBP" component={MeasureBPScreen} />
      <Stack.Screen name="ConnectDevice" component={ConnectDeviceScreen} />
    </Stack.Navigator>
  );
}

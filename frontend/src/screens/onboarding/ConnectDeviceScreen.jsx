import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { pairDevice } from '../../services/wearable';
import { COLORS, STORAGE } from '../../constants/theme';
import { useApp } from '../../constants/AppContext';

export default function ConnectDeviceScreen({ navigation, route }) {
  const { profile } = route.params;
  const { completeOnboarding } = useApp();

  const [status, setStatus] = useState('idle'); // idle | searching | connected
  const [device, setDevice] = useState(null);

  // Pulsing animation for the device icon
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'searching') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.3,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [status, pulse]);

  const handleConnect = async () => {
    setStatus('searching');
    try {
      const result = await pairDevice();
      setDevice(result);
      setStatus('connected');
    } catch {
      setStatus('idle');
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify({
      ...profile,
      device: device,
      createdAt: Date.now(),
    }));
    await AsyncStorage.setItem(STORAGE.ONBOARDED, 'true');
    completeOnboarding();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify({
      ...profile,
      device: null,
      createdAt: Date.now(),
    }));
    await AsyncStorage.setItem(STORAGE.ONBOARDED, 'true');
    completeOnboarding();
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <OnboardingHeader
        step={4}
        totalSteps={4}
        onBack={status === 'idle' ? () => navigation.goBack() : null}
      />

      <View className="flex-1 px-6">
        <Text className="text-3xl font-bold text-ink mt-2">
          {status === 'connected' ? "You're all set!" : 'Connect your wearable'}
        </Text>
        <Text className="text-base text-ink-muted mt-2">
          {status === 'idle' && 'Pair your CardioBand or compatible device for live monitoring.'}
          {status === 'searching' && 'Make sure your device is on and nearby...'}
          {status === 'connected' && 'Your device is connected. Live data is now streaming.'}
        </Text>

        {/* Animated device illustration */}
        <View className="flex-1 items-center justify-center">
          {/* Pulse rings — only during searching */}
          {status === 'searching' && (
            <>
              <Animated.View
                className="absolute w-72 h-72 rounded-full bg-lime/30"
                style={{ transform: [{ scale: pulse }] }}
              />
              <View className="absolute w-56 h-56 rounded-full bg-lime/40" />
            </>
          )}

          {status === 'connected' && (
            <View className="absolute w-72 h-72 rounded-full bg-risk-low/15" />
          )}

          {/* Device icon */}
          <View
            className={`w-40 h-40 rounded-full items-center justify-center ${
              status === 'connected' ? 'bg-risk-low' : 'bg-ink'
            }`}
          >
            <Ionicons
              name={
                status === 'connected'
                  ? 'checkmark'
                  : status === 'searching'
                  ? 'bluetooth'
                  : 'watch-outline'
              }
              size={80}
              color={status === 'connected' ? 'white' : COLORS.lime}
            />
          </View>

          {/* Device info card */}
          {status === 'connected' && device && (
            <View className="bg-white rounded-3xl p-5 mt-8 w-full">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-ink-muted font-medium">DEVICE</Text>
                  <Text className="text-lg font-bold text-ink mt-0.5">
                    {device.deviceName}
                  </Text>
                </View>
                <View className="bg-risk-low/15 px-3 py-1.5 rounded-full">
                  <Text className="text-risk-low font-bold text-xs">
                    ✓ Connected
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-4 gap-3">
                <View className="flex-1 bg-cream rounded-2xl p-3">
                  <Text className="text-[10px] text-ink-muted">Battery</Text>
                  <Text className="text-base font-bold text-ink mt-1">
                    {device.battery}%
                  </Text>
                </View>
                <View className="flex-1 bg-cream rounded-2xl p-3">
                  <Text className="text-[10px] text-ink-muted">Signal</Text>
                  <Text className="text-base font-bold text-ink mt-1">
                    {device.signalStrength}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View className="pb-6 gap-3">
          {status === 'idle' && (
            <>
              <PrimaryButton
                title="Search for Device"
                icon="bluetooth"
                onPress={handleConnect}
              />
              <PrimaryButton
                title="Skip for now"
                variant="ghost"
                onPress={handleSkip}
              />
            </>
          )}
          {status === 'searching' && (
            <PrimaryButton title="Searching..." loading={true} disabled={true} />
          )}
          {status === 'connected' && (
            <PrimaryButton
              title="Enter App"
              variant="accent"
              iconRight="arrow-forward"
              onPress={handleFinish}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

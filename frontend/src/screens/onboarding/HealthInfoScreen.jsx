import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE } from '../../constants/theme';
import { updateProfile } from '../../services/profileService';

export default function HealthInfoScreen({ navigation, route }) {
  const { profile } = route.params;

  const [familyHistory, setFamilyHistory] = useState('No');
  const [smoking, setSmoking]             = useState('No');
  const [alcohol, setAlcohol]             = useState('No');

  const handleNext = () => {
    const updated = {
      ...profile,
      family_history: familyHistory,
      smoking,
      alcohol,
    };

    (async () => {
      try {
        await updateProfile(updated);
      } catch (e) {
        // ignore network/auth errors — persist locally
      } finally {
        await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify(updated));
        navigation.navigate('MeasureBP', { profile: updated });
      }
    })();
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <OnboardingHeader step={2} totalSteps={4} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-ink mt-2">
          Lifestyle factors
        </Text>
        <Text className="text-base text-ink-muted mt-2 mb-8">
          A few quick questions about your habits and family.
        </Text>

        <Input
          label="Family history of heart disease?"
          value={familyHistory}
          onChange={setFamilyHistory}
          type="segmented"
          options={[
            { label: 'No', value: 'No' },
            { label: 'Yes', value: 'Yes' },
          ]}
          hint="Parents or siblings diagnosed with heart disease."
        />

        <Input
          label="Do you smoke?"
          value={smoking}
          onChange={setSmoking}
          type="segmented"
          options={[
            { label: 'No', value: 'No' },
            { label: 'Yes', value: 'Yes' },
          ]}
        />

        <Input
          label="Alcohol consumption"
          value={alcohol}
          onChange={setAlcohol}
          type="segmented"
          options={[
            { label: 'None', value: 'No' },
            { label: 'Moderate', value: 'Moderate' },
            { label: 'Heavy', value: 'Heavy' },
          ]}
          hint="Moderate: 1–2 drinks/day. Heavy: 3+ drinks/day."
        />

        {/* Privacy reassurance */}
        <View className="bg-white rounded-3xl p-4 mt-4 flex-row items-start">
          <View className="w-9 h-9 rounded-2xl bg-lime-soft items-center justify-center">
            <Ionicons name="lock-closed" size={16} color={COLORS.ink} />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-ink font-semibold text-sm">
              Private and yours alone
            </Text>
            <Text className="text-ink-muted text-xs mt-1 leading-4">
              All your information stays on your device. Nothing is shared without your permission.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-2 bg-cream">
        <PrimaryButton
          title="Continue"
          iconRight="arrow-forward"
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

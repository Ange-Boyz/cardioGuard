import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { COLORS, isNormal } from '../../constants/theme';

export default function MeasureBPScreen({ navigation, route }) {
  const { profile } = route.params;

  const [systolic, setSystolic]   = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [errors, setErrors]       = useState({});

  const sysOk = systolic && Number(systolic) >= 70 && Number(systolic) <= 250;
  const diaOk = diastolic && Number(diastolic) >= 40 && Number(diastolic) <= 150;
  const bothValid = sysOk && diaOk;

  const bpNormal = bothValid &&
    isNormal.sysBp(Number(systolic)) &&
    isNormal.diaBp(Number(diastolic));

  const handleNext = () => {
    const e = {};
    if (!sysOk) e.systolic = 'Systolic: 70–250 mmHg';
    if (!diaOk) e.diastolic = 'Diastolic: 40–150 mmHg';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    navigation.navigate('ConnectDevice', {
      profile: {
        ...profile,
        systolic_bp: Number(systolic),
        diastolic_bp: Number(diastolic),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <OnboardingHeader step={3} totalSteps={4} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-3xl font-bold text-ink mt-2">
            Measure your{'\n'}blood pressure
          </Text>
          <Text className="text-base text-ink-muted mt-2 mb-6">
            Use a cuff or visit a clinic, then enter the reading below.
          </Text>

          {/* Big visual indicator */}
          <View className="bg-white rounded-3xl p-6 items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-cream items-center justify-center mb-3">
              <Ionicons name="medical" size={36} color={COLORS.ink} />
            </View>

            <Text className="text-xs font-semibold tracking-wider text-ink-muted">
              CURRENT READING
            </Text>

            <View className="flex-row items-baseline mt-1">
              <Text className="text-5xl font-bold text-ink">
                {systolic || '—'}
              </Text>
              <Text className="text-2xl text-ink-faint mx-1">/</Text>
              <Text className="text-5xl font-bold text-ink">
                {diastolic || '—'}
              </Text>
            </View>
            <Text className="text-xs text-ink-muted mt-1">mmHg</Text>

            {bothValid && (
              <View
                className="mt-3 px-4 py-1.5 rounded-full"
                style={{ backgroundColor: bpNormal ? '#eaf3dc' : '#fdeed2' }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: bpNormal ? COLORS.riskLow : COLORS.riskMed }}
                >
                  {bpNormal ? '✓ Normal range' : 'Above normal range'}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Systolic"
                value={systolic}
                onChange={setSystolic}
                type="number"
                placeholder="120"
                unit="mmHg"
                error={errors.systolic}
                hint="Top number"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Diastolic"
                value={diastolic}
                onChange={setDiastolic}
                type="number"
                placeholder="80"
                unit="mmHg"
                error={errors.diastolic}
                hint="Bottom number"
              />
            </View>
          </View>

          {/* Tip card */}
          <View className="bg-lime-soft rounded-3xl p-4 mt-2 flex-row items-start">
            <Ionicons name="bulb" size={18} color={COLORS.ink} />
            <Text className="ml-2 flex-1 text-ink text-xs leading-4">
              <Text className="font-bold">Tip · </Text>
              Sit quietly for 5 minutes before measuring. Keep your back supported and feet flat on the floor.
            </Text>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-2 bg-cream">
          <PrimaryButton
            title="Continue"
            iconRight="arrow-forward"
            onPress={handleNext}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { computeBMI } from '../../services/api';
import { COLORS, isNormal } from '../../constants/theme';

export default function PersonalInfoScreen({ navigation, route }) {
  const [name, setName]     = useState('');
  const [age, setAge]       = useState('');
  const [sex, setSex]       = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});

  const bmi = useMemo(() => computeBMI(height, weight), [height, weight]);
  const bmiNormal = bmi && isNormal.bmi(bmi);

  const handleNext = () => {
    const e = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!age || Number(age) < 1 || Number(age) > 120) e.age = 'Age must be 1–120';
    if (!height || Number(height) < 50 || Number(height) > 250) e.height = 'Height in cm (50–250)';
    if (!weight || Number(weight) < 20 || Number(weight) > 300) e.weight = 'Weight in kg (20–300)';

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    navigation.navigate('HealthInfo', {
      profile: {
        name: name.trim(),
        age: Number(age),
        sex,
        height: Number(height),
        weight: Number(weight),
        bmi,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <OnboardingHeader step={1} totalSteps={4} onBack={() => navigation.goBack()} />

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
            Tell us about you
          </Text>
          <Text className="text-base text-ink-muted mt-2 mb-8">
            We'll use this to personalize your risk assessment.
          </Text>

          <Input
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="e.g. Saint"
            error={errors.name}
          />

          <Input
            label="Age"
            value={age}
            onChange={setAge}
            type="number"
            placeholder="25"
            unit="years"
            error={errors.age}
          />

          <Input
            label="Sex"
            value={sex}
            onChange={setSex}
            type="segmented"
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
            ]}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Height"
                value={height}
                onChange={setHeight}
                type="number"
                placeholder="170"
                unit="cm"
                error={errors.height}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Weight"
                value={weight}
                onChange={setWeight}
                type="number"
                placeholder="65"
                unit="kg"
                error={errors.weight}
              />
            </View>
          </View>

          {/* Auto-calculated BMI display */}
          {bmi > 0 && (
            <View
              className="rounded-3xl p-4 mt-2 mb-2 flex-row items-center justify-between"
              style={{
                backgroundColor: bmiNormal ? '#eaf3dc' : '#fdeed2',
              }}
            >
              <View>
                <Text className="text-xs text-ink-muted font-medium">
                  Your BMI
                </Text>
                <Text className="text-2xl font-bold text-ink mt-1">
                  {bmi.toFixed(1)}
                </Text>
              </View>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: bmiNormal ? COLORS.riskLow : COLORS.riskMed,
                }}
              >
                <Text className="text-white font-bold text-xs">
                  {bmi < 18.5 ? 'Underweight' :
                   bmi < 25   ? 'Normal'      :
                   bmi < 30   ? 'Overweight'  : 'Obese'}
                </Text>
              </View>
            </View>
          )}
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

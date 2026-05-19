import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { computeBMI } from '../services/api';
import { COLORS, STORAGE, isNormal } from '../constants/theme';
import { useApp } from '../constants/AppContext';

export default function ProfileScreen({ navigation }) {
  const { resetApp } = useApp();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({});

  const loadProfile = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE.PROFILE);
    if (raw) {
      const p = JSON.parse(raw);
      setProfile(p);
      setDraft(p);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    const updated = {
      ...draft,
      bmi: computeBMI(draft.height, draft.weight),
    };
    await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'This will clear all your data and return to the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: resetApp,
        },
      ]
    );
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-ink-muted">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (editing) {
    return <EditView draft={draft} setDraft={setDraft} onSave={handleSave} onCancel={() => { setDraft(profile); setEditing(false); }} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View className="px-5 pt-2">
          <View className="bg-lime rounded-3xl p-6 items-center">
            <View className="w-20 h-20 rounded-full bg-ink items-center justify-center">
              <Text className="text-lime font-bold text-3xl">
                {profile.name?.[0]?.toUpperCase() || 'C'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-ink mt-3">
              {profile.name}
            </Text>
            <Text className="text-ink-muted text-sm mt-1">
              {profile.age} years · {profile.sex}
            </Text>

            <Pressable
              onPress={() => setEditing(true)}
              className="bg-ink mt-4 px-5 py-2.5 rounded-full flex-row items-center active:opacity-80"
            >
              <Ionicons name="create-outline" size={16} color={COLORS.lime} />
              <Text className="text-lime font-bold text-sm ml-2">Edit profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats overview */}
        <View className="px-5 mt-4">
          <Text className="text-ink font-bold text-lg mb-3">Body metrics</Text>

          <View className="flex-row gap-3 mb-3">
            <MetricBox label="BMI" value={profile.bmi?.toFixed(1)} unit="kg/m²" normal={isNormal.bmi(profile.bmi)} />
            <MetricBox label="Height" value={profile.height} unit="cm" />
          </View>
          <View className="flex-row gap-3">
            <MetricBox label="Weight" value={profile.weight} unit="kg" />
            <MetricBox
              label="Blood pressure"
              value={`${profile.systolic_bp}/${profile.diastolic_bp}`}
              unit="mmHg"
              normal={isNormal.sysBp(profile.systolic_bp) && isNormal.diaBp(profile.diastolic_bp)}
            />
          </View>
        </View>

        {/* Lifestyle */}
        <View className="px-5 mt-4">
          <Text className="text-ink font-bold text-lg mb-3">Lifestyle</Text>
          <View className="bg-white rounded-3xl p-2">
            <DataRow label="Family history" value={profile.family_history} />
            <DataRow label="Smoking" value={profile.smoking} />
            <DataRow label="Alcohol" value={profile.alcohol} isLast />
          </View>
        </View>

        {/* Device */}
        <View className="px-5 mt-4">
          <Text className="text-ink font-bold text-lg mb-3">Connected device</Text>
          {profile.device ? (
            <View className="bg-white rounded-3xl p-5 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-lime-soft items-center justify-center">
                <Ionicons name="watch" size={22} color={COLORS.ink} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-ink font-bold">{profile.device.deviceName}</Text>
                <Text className="text-ink-muted text-xs mt-0.5">
                  Battery {profile.device.battery}% · {profile.device.signalStrength}
                </Text>
              </View>
              <View className="w-2.5 h-2.5 rounded-full bg-risk-low" />
            </View>
          ) : (
            <Pressable
              className="bg-white rounded-3xl p-5 flex-row items-center active:opacity-80"
            >
              <View className="w-12 h-12 rounded-2xl bg-cream items-center justify-center">
                <Ionicons name="add" size={22} color={COLORS.ink} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-ink font-bold">Connect a wearable</Text>
                <Text className="text-ink-muted text-xs mt-0.5">
                  Pair your CardioBand for real-time vitals.
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Settings */}
        <View className="px-5 mt-4">
          <Text className="text-ink font-bold text-lg mb-3">Settings</Text>
          <View className="bg-white rounded-3xl p-2">
            <SettingRow icon="notifications-outline" label="Notifications" />
            <SettingRow icon="shield-checkmark-outline" label="Privacy" />
            <SettingRow icon="information-circle-outline" label="About" isLast />
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 mt-6 mb-2">
          <Pressable
            onPress={handleLogout}
            className="bg-white rounded-3xl p-4 flex-row items-center justify-center gap-2 active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.riskHigh} />
            <Text className="text-risk-high font-semibold text-base">Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function MetricBox({ label, value, unit, normal = null }) {
  return (
    <View className="flex-1 bg-white rounded-3xl p-4">
      <Text className="text-ink-muted text-xs">{label}</Text>
      <View className="flex-row items-baseline mt-2">
        <Text className="text-2xl font-bold text-ink">{value}</Text>
        <Text className="text-ink-muted text-xs ml-1">{unit}</Text>
      </View>
      {normal !== null && (
        <View
          className="self-start px-2 py-0.5 rounded-full mt-2"
          style={{
            backgroundColor: normal ? '#eaf3dc' : '#fdeed2',
          }}
        >
          <Text
            className="text-[10px] font-bold"
            style={{ color: normal ? COLORS.riskLow : COLORS.riskMed }}
          >
            {normal ? 'Normal' : 'Watch'}
          </Text>
        </View>
      )}
    </View>
  );
}

function DataRow({ label, value, isLast = false }) {
  return (
    <View className={`px-3 py-3.5 flex-row items-center justify-between ${isLast ? '' : 'border-b border-ink-line'}`}>
      <Text className="text-ink-muted text-sm">{label}</Text>
      <Text className="text-ink font-semibold text-sm">{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, isLast = false }) {
  return (
    <Pressable className={`px-3 py-3.5 flex-row items-center ${isLast ? '' : 'border-b border-ink-line'} active:opacity-60`}>
      <View className="w-9 h-9 rounded-2xl bg-cream items-center justify-center">
        <Ionicons name={icon} size={16} color={COLORS.ink} />
      </View>
      <Text className="flex-1 ml-3 text-ink font-medium">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.inkFaint} />
    </Pressable>
  );
}

// ─── Edit mode ───────────────────────────────────────────────────────────────
function EditView({ draft, setDraft, onSave, onCancel }) {
  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Pressable onPress={onCancel} className="active:opacity-60">
          <Text className="text-ink-muted text-base">Cancel</Text>
        </Pressable>
        <Text className="text-ink font-bold text-base">Edit Profile</Text>
        <Pressable onPress={onSave} className="active:opacity-60">
          <Text className="text-ink font-bold text-base">Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-ink-muted text-xs uppercase tracking-wider mt-2 mb-2 ml-1">
            Personal
          </Text>
          <Input label="Name" value={draft.name} onChange={(v) => update('name', v)} />
          <Input label="Age" type="number" value={draft.age} onChange={(v) => update('age', v)} unit="years" />
          <Input label="Sex" type="segmented" value={draft.sex} onChange={(v) => update('sex', v)}
            options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'}]} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Height" type="number" value={draft.height} onChange={(v) => update('height', v)} unit="cm" />
            </View>
            <View className="flex-1">
              <Input label="Weight" type="number" value={draft.weight} onChange={(v) => update('weight', v)} unit="kg" />
            </View>
          </View>

          <Text className="text-ink-muted text-xs uppercase tracking-wider mt-4 mb-2 ml-1">
            Vitals
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Systolic BP" type="number" value={draft.systolic_bp} onChange={(v) => update('systolic_bp', v)} unit="mmHg" />
            </View>
            <View className="flex-1">
              <Input label="Diastolic BP" type="number" value={draft.diastolic_bp} onChange={(v) => update('diastolic_bp', v)} unit="mmHg" />
            </View>
          </View>

          <Text className="text-ink-muted text-xs uppercase tracking-wider mt-4 mb-2 ml-1">
            Lifestyle
          </Text>
          <Input label="Family history" type="segmented" value={draft.family_history} onChange={(v) => update('family_history', v)}
            options={[{label:'No',value:'No'},{label:'Yes',value:'Yes'}]} />
          <Input label="Smoking" type="segmented" value={draft.smoking} onChange={(v) => update('smoking', v)}
            options={[{label:'No',value:'No'},{label:'Yes',value:'Yes'}]} />
          <Input label="Alcohol" type="segmented" value={draft.alcohol} onChange={(v) => update('alcohol', v)}
            options={[{label:'None',value:'No'},{label:'Mod',value:'Moderate'},{label:'Heavy',value:'Heavy'}]} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

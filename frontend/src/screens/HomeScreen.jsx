import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import RealtimeChart from '../components/RealtimeChart';
import StatCard from '../components/StatCard';
import RiskCard from '../components/RiskCard';
import AlertCard from '../components/AlertCard';

import { startStream, stopStream } from '../services/wearable';
import { predictRisk } from '../services/api';
import { syncHistory } from '../services/historyService';
import { getProfile as fetchProfileFromServer } from '../services/profileService';
import { COLORS, STORAGE, isNormal, getRiskLevel } from '../constants/theme';

const BUFFER_SIZE = 30;          // points held in the chart
const PREDICT_EVERY_MS = 30000;  // refresh risk score every 30s

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [hrBuffer, setHrBuffer]     = useState([]);
  const [spo2Buffer, setSpo2Buffer] = useState([]);
  const [latestHr, setLatestHr]     = useState(null);
  const [latestSpo2, setLatestSpo2] = useState(null);
  const [risk, setRisk] = useState({ probability: 0.25 }); // safe default
  const [refreshing, setRefreshing] = useState(false);

  const lastPredictRef = useRef(0);

  // Load profile once at mount
  useEffect(() => {
    (async () => {
      // Prefer server profile when available
      try {
        const server = await fetchProfileFromServer();
        if (server && Object.keys(server).length > 0) {
          const mapped = {
            age: server.age,
            sex: server.gender,
            height: server.height,
            weight: server.weight,
            bmi: server.bmi,
            smoking: server.smoking,
            alcohol: server.alcohol,
            family_history: server.family_history,
            systolic_bp: server.systolic_bp,
            diastolic_bp: server.diastolic_bp,
          };
          await AsyncStorage.setItem(STORAGE.PROFILE, JSON.stringify(mapped));
          setProfile(mapped);
          return;
        }
      } catch (e) {
        // ignore — fallback to local
      }

      const raw = await AsyncStorage.getItem(STORAGE.PROFILE);
      if (raw) setProfile(JSON.parse(raw));
    })();
  }, []);

  // Start/stop the wearable stream based on screen focus
  useFocusEffect(
    useCallback(() => {
      const stop = startStream((reading) => {
        setLatestHr(reading.hr);
        setLatestSpo2(reading.spo2);

        setHrBuffer((prev) => {
          const next = [...prev, reading.hr];
          return next.length > BUFFER_SIZE ? next.slice(-BUFFER_SIZE) : next;
        });
        setSpo2Buffer((prev) => {
          const next = [...prev, reading.spo2];
          return next.length > BUFFER_SIZE ? next.slice(-BUFFER_SIZE) : next;
        });

        // Predict risk periodically (not on every tick — too expensive)
        const now = Date.now();
        if (now - lastPredictRef.current > PREDICT_EVERY_MS && profile) {
          lastPredictRef.current = now;
          requestRiskUpdate(profile, reading.hr, reading.spo2);
        }
      });
      return () => stop();
    }, [profile])
  );

  const requestRiskUpdate = async (prof, hr, spo2) => {
    try {
      const result = await predictRisk({
        age: prof.age,
        gender: prof.sex,
        bmi: prof.bmi,
        smoking: prof.smoking,
        alcohol: prof.alcohol,
        family_history: prof.family_history,
        systolic_bp: prof.systolic_bp,
        diastolic_bp: prof.diastolic_bp,
        heart_rate: hr,
        oxygen_saturation: spo2,
      });
      setRisk(result);

      // Append to history once per prediction
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        timestamp: Date.now(),
        result,
        snapshot: { hr, spo2, sys: prof.systolic_bp, dia: prof.diastolic_bp },
      };
      const raw = await AsyncStorage.getItem(STORAGE.HISTORY);
      const history = raw ? JSON.parse(raw) : [];
      history.unshift(entry);
      await AsyncStorage.setItem(STORAGE.HISTORY, JSON.stringify(history.slice(0, 100)));
      await AsyncStorage.setItem(STORAGE.LATEST_RISK, JSON.stringify(result));
      // Try to sync this single entry to the server (non-blocking)
      try {
        await syncHistory([
          {
            id: entry.id,
            timestamp: entry.timestamp,
            probability: result.probability,
            cvd_detected: result.cvd_detected,
            snapshot: entry.snapshot,
          },
        ]);
      } catch (e) {
        // ignore sync failures
      }
    } catch (e) {
      // silent — don't disrupt the UI on transient errors
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (profile && latestHr) {
      await requestRiskUpdate(profile, latestHr, latestSpo2);
    }
    setRefreshing(false);
  };

  const greeting =
    new Date().getHours() < 12 ? 'Good morning' :
    new Date().getHours() < 18 ? 'Good afternoon' :
    'Good evening';

  const riskLevel = getRiskLevel(risk.probability);
  const hrIsNormal   = latestHr && isNormal.hr(latestHr);
  const spo2IsNormal = latestSpo2 && isNormal.spo2(latestSpo2);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.ink} />
        }
      >
        {/* ─────── Header bar ─────── */}
        <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-full bg-ink items-center justify-center">
              <Text className="text-lime font-bold text-base">
                {profile?.name?.[0]?.toUpperCase() || 'C'}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-ink-muted text-xs">{greeting},</Text>
              <Text className="text-ink font-bold text-base">
                {profile?.name || 'there'} 👋
              </Text>
            </View>
          </View>

          <Pressable
            className="w-11 h-11 rounded-full bg-white items-center justify-center active:opacity-70 relative"
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.ink} />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-risk-high border-2 border-white" />
          </Pressable>
        </View>

        {/* ─────── Health overview heading ─────── */}
        <View className="px-5 mt-2 mb-5">
          <Text className="text-4xl font-bold text-ink leading-tight">
            Health{'\n'}overview
          </Text>
        </View>

        {/* ─────── Risk card ─────── */}
        <View className="px-5 mb-4">
          <RiskCard
            probability={risk.probability}
            onPress={() => navigation.navigate('History')}
          />
        </View>

        {/* ─────── Live monitoring section ─────── */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-ink font-bold text-lg">Live monitoring</Text>
            <View className="flex-row items-center bg-white px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-risk-low mr-2" />
              <Text className="text-xs text-ink-muted font-medium">Live</Text>
            </View>
          </View>

          {/* Big HR chart card with lime accent */}
          <View className="bg-lime rounded-3xl p-5 mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold text-ink/70">HEART RATE</Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-5xl font-bold text-ink">
                    {latestHr ?? '—'}
                  </Text>
                  <Text className="text-base text-ink ml-1">bpm</Text>
                </View>
              </View>

              <View className="bg-ink rounded-full px-3 py-1.5 flex-row items-center">
                <Ionicons
                  name={hrIsNormal ? 'checkmark-circle' : 'alert-circle'}
                  size={14}
                  color={COLORS.lime}
                />
                <Text className="text-lime font-bold text-xs ml-1">
                  {hrIsNormal ? 'Normal' : 'Watch'}
                </Text>
              </View>
            </View>

            <View className="mt-3 -mx-2">
              <RealtimeChart
                data={hrBuffer}
                width={300}
                height={110}
                color={COLORS.black}
                showDot={true}
                fillBelow={false}
              />
            </View>
          </View>

          {/* SpO2 chart card */}
          <View className="bg-white rounded-3xl p-5 mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold text-ink-muted">
                  OXYGEN (SpO₂)
                </Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-4xl font-bold text-ink">
                    {latestSpo2 ?? '—'}
                  </Text>
                  <Text className="text-base text-ink-muted ml-1">%</Text>
                </View>
              </View>

              <View
                className="rounded-full px-3 py-1.5 flex-row items-center"
                style={{ backgroundColor: spo2IsNormal ? '#eaf3dc' : '#fdeed2' }}
              >
                <Ionicons
                  name={spo2IsNormal ? 'checkmark-circle' : 'alert-circle'}
                  size={14}
                  color={spo2IsNormal ? COLORS.riskLow : COLORS.riskMed}
                />
                <Text
                  className="font-bold text-xs ml-1"
                  style={{ color: spo2IsNormal ? COLORS.riskLow : COLORS.riskMed }}
                >
                  {spo2IsNormal ? 'Normal' : 'Low'}
                </Text>
              </View>
            </View>

            <View className="mt-3 -mx-2">
              <RealtimeChart
                data={spo2Buffer}
                width={300}
                height={70}
                color={COLORS.spo2Color}
                minY={92}
                maxY={100}
              />
            </View>
          </View>
        </View>

        {/* ─────── Today's vitals section ─────── */}
        <View className="px-5 mt-4">
          <Text className="text-ink font-bold text-lg mb-3">Today's vitals</Text>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <StatCard
                icon="water-outline"
                label="Blood pressure"
                value={profile ? `${profile.systolic_bp}/${profile.diastolic_bp}` : '—'}
                unit="mmHg"
              />
            </View>
            <View className="flex-1">
              <StatCard
                icon="body-outline"
                label="BMI"
                value={profile?.bmi?.toFixed(1) ?? '—'}
                unit="kg/m²"
              />
            </View>
          </View>
        </View>

        {/* ─────── Insights & alerts ─────── */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-ink font-bold text-lg">Insights</Text>
            <Pressable>
              <Text className="text-ink-muted text-sm">View all</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            <AlertCard
              variant={riskLevel.level === 'LOW' ? 'good' : 'warning'}
              title={`${riskLevel.label} today`}
              message={riskLevel.recommendation}
              time="Just now"
            />
            <AlertCard
              variant="tip"
              title="Hydration reminder"
              message="Aim for 8 glasses of water today. Good hydration supports healthy circulation."
              time="2h ago"
            />
            <AlertCard
              variant="tip"
              title="Movement check-in"
              message="A 20-minute walk after lunch can lower your blood pressure by up to 5 mmHg."
              time="4h ago"
            />
          </View>
        </View>

        {/* ─────── Footer disclaimer ─────── */}
        <View className="px-5 mt-6">
          <Text className="text-ink-faint text-[10px] text-center leading-4">
            CardioGuard is for educational use and does not replace medical advice.{'\n'}
            For emergencies, contact your local health services immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

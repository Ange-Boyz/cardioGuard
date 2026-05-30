import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';

import { COLORS, STORAGE, getRiskLevel } from '../constants/theme';

const RANGE_OPTIONS = [
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'All',   value: 'all' },
];

export default function HistoryScreen() {
  const [history, setHistory]   = useState([]);
  const [range, setRange]       = useState('week');

  const loadHistory = useCallback(async () => {
    // Try fetching server history first (if authenticated), otherwise fallback to local
    try {
      const server = await (await import('../services/historyService')).fetchHistory();
      if (server && server.entries) {
        const mapped = server.entries.map((e) => ({
          timestamp: new Date(e.timestamp).getTime(),
          result: { probability: e.probability, cvd_detected: e.cvd_detected },
          snapshot: e.snapshot,
        }));
        setHistory(mapped);
        await AsyncStorage.setItem(STORAGE.HISTORY, JSON.stringify(mapped));
        return;
      }
    } catch (e) {
      // ignore and fall back to local history
    }

    const raw = await AsyncStorage.getItem(STORAGE.HISTORY);
    setHistory(raw ? JSON.parse(raw) : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  // Filter by range
  const filtered = useMemo(() => {
    if (range === 'all') return history;
    const now = Date.now();
    const cutoff = range === 'week'
      ? now - 7 * 86400000
      : now - 30 * 86400000;
    return history.filter((e) => e.timestamp >= cutoff);
  }, [history, range]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const probs = filtered.map((e) => e.result.probability);
    const avg = probs.reduce((s, p) => s + p, 0) / probs.length;
    const max = Math.max(...probs);
    const min = Math.min(...probs);
    return { avg, max, min, count: filtered.length };
  }, [filtered]);

  // Build daily bar chart for the past 7 days
  const weeklyBars = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;

      const inDay = history.filter(
        (e) => e.timestamp >= dayStart && e.timestamp < dayEnd
      );

      const avgProb = inDay.length > 0
        ? inDay.reduce((s, e) => s + e.result.probability, 0) / inDay.length
        : null;

      days.push({
        label: ['S','M','T','W','T','F','S'][d.getDay()],
        date: d.getDate(),
        prob: avgProb,
        count: inDay.length,
      });
    }
    return days;
  }, [history]);

  const handleClear = () => {
    Alert.alert(
      'Clear history',
      'Delete all past assessments? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE.HISTORY);
            setHistory([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-ink">History</Text>
          {history.length > 0 && (
            <Pressable onPress={handleClear} className="active:opacity-60">
              <Text className="text-risk-high text-sm font-semibold">Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Range tabs */}
        <View className="px-5 mb-4">
          <View className="flex-row bg-white rounded-full p-1.5">
            {RANGE_OPTIONS.map((opt) => {
              const active = range === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setRange(opt.value)}
                  className={`flex-1 py-2.5 rounded-full items-center ${
                    active ? 'bg-ink' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? 'text-white' : 'text-ink-muted'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Summary stats */}
        {stats && (
          <View className="px-5 mb-4">
            <View className="bg-white rounded-3xl p-5">
              <Text className="text-xs font-semibold text-ink-muted tracking-wider">
                AVERAGE RISK
              </Text>
              <Text className="text-5xl font-bold text-ink mt-2">
                {Math.round(stats.avg * 100)}
                <Text className="text-2xl text-ink-muted">%</Text>
              </Text>

              <View className="flex-row mt-4 gap-3">
                <View className="flex-1 bg-cream rounded-2xl p-3">
                  <Text className="text-[10px] text-ink-muted">Lowest</Text>
                  <Text className="text-base font-bold text-risk-low mt-1">
                    {Math.round(stats.min * 100)}%
                  </Text>
                </View>
                <View className="flex-1 bg-cream rounded-2xl p-3">
                  <Text className="text-[10px] text-ink-muted">Highest</Text>
                  <Text className="text-base font-bold text-risk-high mt-1">
                    {Math.round(stats.max * 100)}%
                  </Text>
                </View>
                <View className="flex-1 bg-cream rounded-2xl p-3">
                  <Text className="text-[10px] text-ink-muted">Readings</Text>
                  <Text className="text-base font-bold text-ink mt-1">
                    {stats.count}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Weekly bar chart */}
        <View className="px-5 mb-4">
          <View className="bg-white rounded-3xl p-5">
            <Text className="text-ink font-bold mb-1">Last 7 days</Text>
            <Text className="text-ink-muted text-xs mb-4">
              Daily average risk score
            </Text>
            <WeekBarChart days={weeklyBars} />
          </View>
        </View>

        {/* Recent entries list */}
        <View className="px-5">
          <Text className="text-ink font-bold text-lg mb-3">Recent assessments</Text>

          {filtered.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center">
              <View className="w-16 h-16 bg-cream rounded-full items-center justify-center mb-3">
                <Ionicons name="time-outline" size={28} color={COLORS.inkMuted} />
              </View>
              <Text className="text-ink font-semibold mb-1">No assessments yet</Text>
              <Text className="text-ink-muted text-sm text-center">
                Your wearable will start logging your{'\n'}risk score automatically.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {filtered.slice(0, 20).map((entry) => (
                <HistoryEntry key={entry.timestamp} entry={entry} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Week bar chart ──────────────────────────────────────────────────────────
function WeekBarChart({ days }) {
  const width = 300;
  const height = 140;
  const barWidth = 24;
  const gap = (width - barWidth * 7) / 8;
  const maxBar = height - 40;

  return (
    <View className="items-center">
      <Svg width={width} height={height + 24}>
        {days.map((day, i) => {
          const x = gap + i * (barWidth + gap);
          const filled = day.prob !== null;
          const h = filled ? Math.max(4, day.prob * maxBar) : 4;
          const y = height - 24 - h;
          const color = !filled
            ? COLORS.inkLine
            : day.prob < 0.35
            ? COLORS.riskLow
            : day.prob < 0.65
            ? COLORS.riskMed
            : COLORS.riskHigh;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={6}
                ry={6}
                fill={color}
                opacity={filled ? 1 : 0.6}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 4}
                fontSize={10}
                fill={COLORS.inkMuted}
                textAnchor="middle"
              >
                {day.label}
              </SvgText>
              {filled && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize={9}
                  fontWeight="bold"
                  fill={COLORS.ink}
                  textAnchor="middle"
                >
                  {Math.round(day.prob * 100)}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ─── Entry list item ─────────────────────────────────────────────────────────
function HistoryEntry({ entry }) {
  const risk = getRiskLevel(entry.result.probability);
  const date = new Date(entry.timestamp);
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="bg-white rounded-3xl p-4 flex-row items-center">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center"
        style={{ backgroundColor: risk.bgColor }}
      >
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: risk.color }}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-ink font-semibold text-sm">{risk.label}</Text>
        <Text className="text-ink-muted text-xs mt-0.5">
          {dateStr} · {time}
          {entry.snapshot ? ` · HR ${entry.snapshot.hr}` : ''}
        </Text>
      </View>

      <Text className="text-2xl font-bold" style={{ color: risk.color }}>
        {Math.round(entry.result.probability * 100)}%
      </Text>
    </View>
  );
}

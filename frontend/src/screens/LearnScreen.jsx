import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CHAPTERS } from '../data/chapters';
import { COLORS } from '../constants/theme';

export default function LearnScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-2 pb-4">
          <Text className="text-3xl font-bold text-ink">Learn CVD</Text>
          <Text className="text-ink-muted text-base mt-1">
            Understand your heart, chapter by chapter.
          </Text>
        </View>

        {/* Featured chapter — bigger card */}
        <View className="px-5 mb-5">
          <Pressable
            onPress={() => navigation.navigate('LearnChapter', { chapterId: CHAPTERS[0].id })}
            className="bg-lime rounded-3xl p-6 active:opacity-90"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="bg-ink px-3 py-1.5 rounded-full">
                <Text className="text-lime text-[10px] font-bold tracking-wider">
                  START HERE
                </Text>
              </View>
              <Text className="text-3xl">{CHAPTERS[0].icon}</Text>
            </View>

            <Text className="text-ink/60 text-xs font-semibold tracking-wider">
              CHAPTER {CHAPTERS[0].number}
            </Text>
            <Text className="text-2xl font-bold text-ink mt-2 leading-tight">
              {CHAPTERS[0].title}
            </Text>
            <Text className="text-ink-muted text-sm mt-2 leading-5">
              {CHAPTERS[0].summary}
            </Text>

            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color={COLORS.ink} />
                <Text className="text-ink text-xs font-medium ml-1">
                  {CHAPTERS[0].duration}
                </Text>
              </View>

              <View className="bg-ink rounded-full w-10 h-10 items-center justify-center">
                <Ionicons name="arrow-forward" size={18} color={COLORS.lime} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* All chapters */}
        <View className="px-5">
          <Text className="text-ink font-bold text-lg mb-3">All chapters</Text>

          <View className="gap-3">
            {CHAPTERS.slice(1).map((ch) => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                onPress={() => navigation.navigate('LearnChapter', { chapterId: ch.id })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChapterCard({ chapter, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-4 flex-row items-center active:opacity-80"
    >
      <View className="w-14 h-14 rounded-2xl bg-cream items-center justify-center">
        <Text className="text-2xl">{chapter.icon}</Text>
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-ink-faint text-[10px] font-bold tracking-wider">
          CHAPTER {chapter.number}
        </Text>
        <Text className="text-ink font-bold mt-0.5" numberOfLines={1}>
          {chapter.title}
        </Text>
        <Text className="text-ink-muted text-xs mt-1" numberOfLines={1}>
          {chapter.duration} · {chapter.sections.length} sections
        </Text>
      </View>

      <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color={COLORS.ink} />
      </View>
    </Pressable>
  );
}

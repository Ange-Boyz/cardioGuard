import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CHAPTERS } from '../data/chapters';
import { COLORS } from '../constants/theme';

export default function LearnChapterScreen({ route, navigation }) {
  const { chapterId } = route.params;
  const chapter = CHAPTERS.find((c) => c.id === chapterId);

  if (!chapter) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-ink-muted">Chapter not found</Text>
      </SafeAreaView>
    );
  }

  const currentIndex = CHAPTERS.findIndex((c) => c.id === chapterId);
  const nextChapter = CHAPTERS[currentIndex + 1];

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'bottom']}>
      {/* Top bar */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </Pressable>
        <Text className="text-ink-muted text-sm font-medium">
          {currentIndex + 1} / {CHAPTERS.length}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-5 pt-4 pb-6">
          <View className="bg-lime rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="bg-ink px-3 py-1.5 rounded-full">
                <Text className="text-lime text-[10px] font-bold tracking-wider">
                  CHAPTER {chapter.number}
                </Text>
              </View>
              <Text className="text-4xl">{chapter.icon}</Text>
            </View>

            <Text className="text-2xl font-bold text-ink leading-tight">
              {chapter.title}
            </Text>

            <View className="flex-row items-center mt-3">
              <Ionicons name="time-outline" size={14} color={COLORS.ink} />
              <Text className="text-ink text-xs font-medium ml-1">
                {chapter.duration}
              </Text>
              <Text className="text-ink/40 mx-2">·</Text>
              <Text className="text-ink text-xs font-medium">
                {chapter.sections.length} sections
              </Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        <View className="px-5 gap-5">
          {chapter.sections.map((section, idx) => (
            <View key={idx} className="bg-white rounded-3xl p-5">
              <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 rounded-full bg-ink items-center justify-center">
                  <Text className="text-lime font-bold text-xs">{idx + 1}</Text>
                </View>
                <Text className="text-ink font-bold text-base ml-3 flex-1">
                  {section.heading}
                </Text>
              </View>
              <Text className="text-ink-muted text-sm leading-6 mt-2">
                {section.body}
              </Text>
            </View>
          ))}
        </View>

        {/* Next chapter CTA */}
        {nextChapter && (
          <View className="px-5 mt-6">
            <Pressable
              onPress={() =>
                navigation.replace('LearnChapter', { chapterId: nextChapter.id })
              }
              className="bg-ink rounded-3xl p-5 flex-row items-center active:opacity-80"
            >
              <View className="flex-1">
                <Text className="text-lime text-[10px] font-bold tracking-wider">
                  UP NEXT — CHAPTER {nextChapter.number}
                </Text>
                <Text className="text-white font-bold text-base mt-1" numberOfLines={1}>
                  {nextChapter.title}
                </Text>
              </View>
              <View className="w-11 h-11 rounded-full bg-lime items-center justify-center">
                <Ionicons name="arrow-forward" size={20} color={COLORS.ink} />
              </View>
            </Pressable>
          </View>
        )}

        {/* Disclaimer */}
        <View className="px-5 mt-6">
          <Text className="text-ink-faint text-[10px] text-center leading-4">
            Educational information adapted from WHO, AHA, and CDC.{'\n'}
            Always consult a healthcare professional for personal advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

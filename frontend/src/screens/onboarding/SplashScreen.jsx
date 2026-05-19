import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { APP_INFO, COLORS } from '../../constants/theme';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-12">
        {/* Top — brand mark */}
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-ink rounded-2xl items-center justify-center">
            <Ionicons name="heart" size={20} color={COLORS.lime} />
          </View>
          <Text className="ml-2 text-base font-bold text-ink">
            {APP_INFO.name}
          </Text>
        </View>

        {/* Middle — illustration block */}
        <View className="flex-1 items-center justify-center">
          {/* Big circular hero */}
          <View className="w-72 h-72 rounded-full bg-lime items-center justify-center relative">
            {/* decorative inner rings */}
            <View className="absolute w-56 h-56 rounded-full bg-cream-soft" />
            <View className="absolute w-40 h-40 rounded-full bg-white items-center justify-center">
              <Ionicons name="pulse" size={64} color={COLORS.ink} />
            </View>
            {/* floating heart accent */}
            <View
              className="absolute -top-4 -right-2 w-16 h-16 bg-ink rounded-full items-center justify-center"
              style={{ transform: [{ rotate: '-12deg' }] }}
            >
              <Ionicons name="heart" size={28} color={COLORS.lime} />
            </View>
            {/* floating "72 bpm" badge */}
            <View className="absolute bottom-2 -left-3 bg-white rounded-2xl px-4 py-2 flex-row items-center shadow-md">
              <View className="w-2 h-2 rounded-full bg-risk-low mr-2" />
              <Text className="font-bold text-ink">72</Text>
              <Text className="text-xs text-ink-muted ml-1">bpm</Text>
            </View>
          </View>
        </View>

        {/* Bottom — copy + CTA */}
        <View className="pb-4">
          <Text className="text-4xl font-bold text-ink leading-tight">
            Your heart,{'\n'}always in tune.
          </Text>
          <Text className="text-base text-ink-muted mt-3 leading-6">
            AI-powered cardiovascular monitoring with real-time wearable insights.
            Catch the signs early. Live longer.
          </Text>

          <View className="mt-8">
            <PrimaryButton
              title="Get Started"
              variant="accent"
              iconRight="arrow-forward"
              onPress={() => navigation.navigate('PersonalInfo')}
            />
          </View>

          <Text className="text-center text-ink-faint text-xs mt-4">
            By {APP_INFO.author} · Final Year Project
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

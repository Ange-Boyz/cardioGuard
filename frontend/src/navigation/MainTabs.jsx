import { View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LearnScreen from '../screens/LearnScreen';
import LearnChapterScreen from '../screens/LearnChapterScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../constants/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Learn has its own internal stack (list → chapter detail)
function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnList" component={LearnScreen} />
      <Stack.Screen name="LearnChapter" component={LearnChapterScreen} />
    </Stack.Navigator>
  );
}

// Custom floating tab bar — pill-shaped, lime accent on active tab
function CustomTabBar({ state, descriptors, navigation }) {
  const tabIcons = {
    Home:    'home',
    History: 'time',
    Learn:   'book',
    Profile: 'person',
  };

  return (
    <View
      className="absolute bottom-5 left-5 right-5 bg-ink rounded-full flex-row items-center justify-around px-3 py-2"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = tabIcons[route.name] || 'ellipse';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className={`flex-row items-center rounded-full ${
              isFocused ? 'bg-lime px-4 py-2.5' : 'p-3'
            }`}
          >
            <Ionicons
              name={isFocused ? iconName : `${iconName}-outline`}
              size={20}
              color={isFocused ? COLORS.ink : COLORS.lime}
            />
            {isFocused && (
              <Text className="text-ink font-bold ml-2 text-sm">
                {route.name}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Learn" component={LearnStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

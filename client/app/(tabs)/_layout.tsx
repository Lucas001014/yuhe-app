import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

// 天蓝色主题色
const SKY_BLUE = '#38BDF8';
const SKY_BLUE_LIGHT = '#E0F2FE';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 50 + insets.bottom,
          paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom,
          paddingTop: Platform.OS === 'web' ? 0 : Spacing.sm,
        },
        tabBarActiveTintColor: SKY_BLUE,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarItemStyle: {
          height: Platform.OS === 'web' ? 60 : undefined,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name="house" 
              size={20} 
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: '合作对接',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name="comments" 
              size={20} 
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={styles.centerButton}>
              <FontAwesome6 name="plus" size={26} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: '消息',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name="comment-dots" 
              size={20} 
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name="user" 
              size={20} 
              color={color}
              solid={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const Spacing = {
  sm: 8,
  md: 12,
};

const styles = StyleSheet.create({
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SKY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 0 : -28,
    shadowColor: SKY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

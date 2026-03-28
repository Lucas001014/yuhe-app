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
          // 移动端：增加高度确保文字不被截断
          height: Platform.OS === 'web' ? 60 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'web' ? 8 : insets.bottom,
          paddingTop: Platform.OS === 'web' ? 8 : 8,
        },
        tabBarActiveTintColor: SKY_BLUE,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarItemStyle: {
          height: Platform.OS === 'web' ? 60 : 50,
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SKY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 0 : -20,
    shadowColor: SKY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

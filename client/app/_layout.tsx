import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from "@/contexts/AuthContext";
import { ColorSchemeProvider } from '@/hooks/useColorScheme';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark"></StatusBar>
          <Stack screenOptions={{
            // 设置所有页面的切换动画为从右侧滑入，适用于iOS 和 Android
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // 隐藏自带的头部
            headerShown: false
          }}>
            <Stack.Screen name="(tabs)" options={{ title: "" }} />
            <Stack.Screen name="login" options={{ title: "登录" }} />
            <Stack.Screen name="post-detail" options={{ title: "帖子详情" }} />
            <Stack.Screen name="admin" options={{ title: "管理控制台" }} />
            <Stack.Screen name="chat-list" options={{ title: "私信" }} />
            <Stack.Screen name="follow-list" options={{ title: "关注列表" }} />
            <Stack.Screen name="my-favorites" options={{ title: "我的收藏" }} />
            <Stack.Screen name="my-posts" options={{ title: "我的发布" }} />
            <Stack.Screen name="orders" options={{ title: "订单" }} />
            <Stack.Screen name="settings" options={{ title: "设置" }} />
            <Stack.Screen name="wallet" options={{ title: "钱包" }} />
            <Stack.Screen name="wallet-transactions" options={{ title: "交易记录" }} />
            <Stack.Screen name="wallet-withdraw" options={{ title: "提现" }} />
            <Stack.Screen name="user-agreement" options={{ title: "用户协议" }} />
            <Stack.Screen name="privacy-policy" options={{ title: "隐私政策" }} />
            <Stack.Screen name="phone-binding" options={{ title: "绑定手机号" }} />
          </Stack>
          <Toast />
        </GestureHandlerRootView>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

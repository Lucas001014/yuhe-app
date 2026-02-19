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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ title: "" }} />
            <Stack.Screen name="login" options={{ title: "登录" }} />
            <Stack.Screen name="post-detail" options={{ title: "帖子详情" }} />
            <Stack.Screen name="admin/index" options={{ title: "管理控制台" }} />
            <Stack.Screen name="admin/posts" options={{ title: "帖子管理" }} />
            <Stack.Screen name="admin/users" options={{ title: "用户管理" }} />
            <Stack.Screen name="admin/categories" options={{ title: "类别管理" }} />
            <Stack.Screen name="admin-web" options={{ title: "管理后台" }} />
            <Stack.Screen name="control-panel" options={{ title: "控制面板" }} />
          </Stack>
          <Toast />
        </GestureHandlerRootView>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

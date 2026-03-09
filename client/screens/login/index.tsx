import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 登录
  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('提示', '请填写手机号和密码');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 存储用户信息
        await AsyncStorage.setItem('userId', String(data.user.id));
        await AsyncStorage.setItem('username', data.user.username || '用户' + data.user.id);
        await AsyncStorage.setItem('avatar', data.user.avatar || 'https://i.pravatar.cc/150');
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
        
        router.replace('/(tabs)');
      } else {
        Alert.alert('登录失败', data.error || '账号或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      Alert.alert('错误', '网络请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到注册页
  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* 品牌区域 */}
        <View style={styles.brandContainer}>
          <ThemedText variant="h1" color={theme.primary} style={styles.brandTitle}>
            遇合
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.brandSubtitle}>
            书写属于自己的商业山河
          </ThemedText>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="手机号"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={styles.loginButtonText}>
              {loading ? '登录中...' : '登录'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 注册引导 */}
        <View style={styles.registerContainer}>
          <ThemedText variant="body" color={theme.textSecondary}>
            没有账号？
          </ThemedText>
          <TouchableOpacity onPress={handleGoToRegister} activeOpacity={0.6}>
            <ThemedText variant="body" color={theme.primary} style={styles.registerLink}>
              立即注册
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

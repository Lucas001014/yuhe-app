import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function LoginScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('成功', data.message);
      } else {
        Alert.alert('失败', data.error || '发送失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

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
        await AsyncStorage.setItem('userId', String(data.user.id));
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('失败', data.error || '登录失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!phone || !code || !password) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, password, username }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('userId', String(data.user.id));
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('失败', data.error || '注册失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <View style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText variant="h1" color={theme.primary}>
            遇合
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.subtitle}>
            {isLogin ? '书写属于自己的商业山河' : '加入我们，与更多创业者交流'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="手机号"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
          />

          {!isLogin && (
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.codeInput, { color: theme.textPrimary }]}
                placeholder="验证码"
                placeholderTextColor={theme.textMuted}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.codeButton} onPress={handleSendCode}>
                <ThemedText variant="small" color={theme.primary}>
                  发送验证码
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="密码"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="用户名（可选）"
              placeholderTextColor={theme.textMuted}
              value={username}
              onChangeText={setUsername}
              maxLength={20}
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <ThemedText variant="small" color={theme.primary}>
              {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Screen>
  );
}

import { useMemo } from 'react';

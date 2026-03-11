import React, { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PhoneBindingScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
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

  // 绑定手机号
  const handleBindPhone = async () => {
    if (!phone || !code) {
      Alert.alert('提示', '请填写手机号和验证码');
      return;
    }

    setLoading(true);
    try {
      // 微信绑定接口
      /**
       * 服务端接口：server/src/routes/auth.ts
       * 微信绑定：POST /api/v1/auth/wechat/bind-phone
       * Body 参数：
       *   - phone: string
       *   - code: string
       *   - openid: string
       *   - unionid?: string
       *   - wechatUserInfo?: object
       *   - existingUserId?: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/wechat/bind-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          openid: params.openid || '',
          unionid: params.unionid || '',
          existingUserId: params.existingUserId || undefined,
          wechatUserInfo: params.wechatUserInfo ? JSON.parse(params.wechatUserInfo as string) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('userId', String(data.user.id));
        await AsyncStorage.setItem('username', data.user.username || '');
        await AsyncStorage.setItem('avatar', data.user.avatar_url || '');
        router.replace('/');
      } else {
        Alert.alert('失败', data.error || '绑定失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
            绑定手机号
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.subtitle}>
            使用微信登录后，需要绑定手机号以完善账号信息
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="手机号"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />

          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="验证码"
              placeholderTextColor={theme.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.codeButton}
              onPress={handleSendCode}
            >
              <ThemedText variant="bodyMedium" color={theme.primary}>
                获取验证码
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleBindPhone}
            disabled={loading}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
              {loading ? '绑定中...' : '确认绑定'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

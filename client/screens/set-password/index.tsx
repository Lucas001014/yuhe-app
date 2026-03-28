import React, { useState, useMemo, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';

export default function SetPasswordScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ phone: string; code: string }>();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
  const phone = params?.phone || '';
  const code = params?.code || '';

  // 验证密码强度
  const validatePassword = useCallback((pwd: string): string | null => {
    if (pwd.length < 8) {
      return '密码长度不能低于8位';
    }
    
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    
    if (!hasLetter || !hasNumber) {
      return '密码需包含数字和字母';
    }
    
    return null;
  }, []);

  // 完成注册
  const handleComplete = useCallback(async () => {
    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('提示', '请确认密码');
      return;
    }

    // 验证密码强度
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('密码格式错误', passwordError);
      return;
    }

    // 验证两次密码是否一致
    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    if (!phone || !code) {
      Alert.alert('错误', '页面参数缺失，请重新开始注册');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/register
       * Body 参数：phone: string, password: string, code: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, code }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('注册成功', '欢迎来到遇合！', [
          {
            text: '开始使用',
            onPress: async () => {
              await login({
                id: data.user.id,
                username: data.user.username,
                avatar: data.user.avatar_url,
                phone: data.user.phone,
              });
              router.replace('/');
            }
          }
        ]);
      } else {
        Alert.alert('注册失败', data.error || '请稍后重试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, phone, code, API_BASE_URL, validatePassword, login, router]);

  // 返回登录页
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 标题 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <ThemedText variant="display" color={theme.primary} style={styles.logo}>
                遇合
              </ThemedText>
            </View>
            <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
              设置密码
            </ThemedText>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.subtitle}>
              完成注册即可开始使用
            </ThemedText>
            <ThemedText variant="body" color={theme.textMuted} style={styles.phoneHint}>
              手机号：{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
            </ThemedText>
          </View>

          {/* 表单 */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="设置密码（不低于8位，含数字+字母）"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="确认密码"
                placeholderTextColor={theme.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <ThemedText variant="caption" color={theme.textMuted} style={styles.passwordHint}>
              密码长度不低于8位，需包含数字和字母
            </ThemedText>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.buttonPrimaryText} />
              ) : (
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                  完成注册
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backContainer}
              onPress={handleBack}
            >
              <ThemedText variant="body" color={theme.primary} style={styles.backText}>
                返回上一步
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

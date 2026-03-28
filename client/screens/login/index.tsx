import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { weChatLogin, initWeChat, isWeChatInstalled, isWeChatAvailable } from '@/services/wechat';
import { API_BASE_URL } from '@/config/api';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [wechatInstalled, setWechatInstalled] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // 初始化微信SDK
  useEffect(() => {
    const initWx = async () => {
      if (!isWeChatAvailable()) {
        console.log('微信SDK不可用，隐藏微信登录按钮');
        setWechatInstalled(false);
        return;
      }
      
      const initialized = await initWeChat();
      if (initialized) {
        const installed = await isWeChatInstalled();
        setWechatInstalled(installed);
      } else {
        setWechatInstalled(false);
      }
    };
    initWx();
  }, []);

  // 倒计时
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (!phone) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (countdown > 0) return;

    // 调试日志：显示实际请求的 URL
    const requestUrl = `${API_BASE_URL}/api/v1/auth/send-code`;
    console.log('发送验证码请求 URL:', requestUrl);
    console.log('API_BASE_URL:', API_BASE_URL);

    try {
      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/send-code
       * Body 参数：phone: string
       */
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      console.log('响应状态:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (data.success) {
        setCountdown(60);
        Alert.alert('成功', '验证码已发送');
        // 开发环境显示验证码
        if (data.devCode) {
          console.log('验证码:', data.devCode);
        }
      } else {
        Alert.alert('失败', data.error || '发送失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Alert.alert('错误', '网络请求失败，请检查网络连接');
    }
  }, [phone, countdown, API_BASE_URL]);

  // 验证验证码并跳转到设置密码页面
  const handleVerifyCode = useCallback(async () => {
    if (!phone) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (!code) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    setVerifyLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/verify-code
       * Body 参数：phone: string, code: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (data.success) {
        // 验证通过，跳转到设置密码页面
        router.push('/set-password', { phone, code });
      } else {
        Alert.alert('验证失败', data.error || '验证码错误');
      }
    } catch (error) {
      console.error('验证验证码失败:', error);
      Alert.alert('错误', '网络请求失败');
    } finally {
      setVerifyLoading(false);
    }
  }, [phone, code, API_BASE_URL, router]);

  // 登录
  const handleLogin = useCallback(async () => {
    if (!phone || !password) {
      Alert.alert('提示', '请填写手机号和密码');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/login
       * Body 参数：phone: string, password: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        await login({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar_url,
          phone: data.user.phone,
        });
        router.replace('/');
      } else {
        Alert.alert('失败', data.error || '登录失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  }, [phone, password, API_BASE_URL, login, router]);

  // 社交登录处理
  const handleSocialLogin = useCallback(async () => {
    setWechatLoading(true);

    try {
      const result = await weChatLogin();
      
      if (!result.success) {
        Alert.alert('微信登录失败', result.error || '请稍后重试');
        setWechatLoading(false);
        return;
      }

      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/wechat/login
       * Body 参数：code: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/wechat/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: result.code }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('登录失败', data.error || '请稍后重试');
        setWechatLoading(false);
        return;
      }

      if (data.needBindPhone) {
        router.push('/phone-binding', {
          openid: data.openid,
          unionid: data.unionid,
          wechatUserInfo: JSON.stringify(data.wechatUserInfo),
          existingUserId: data.existingUserId,
        });
      } else {
        await login({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar_url,
          phone: data.user.phone,
        });
        router.replace('/');
      }
    } catch (error: any) {
      console.error('微信登录错误:', error);
      Alert.alert('登录失败', error.message || '微信登录失败');
    } finally {
      setWechatLoading(false);
    }
  }, [API_BASE_URL, login, router]);

  // 切换登录/注册模式
  const toggleMode = useCallback(() => {
    setIsLogin(!isLogin);
    setCode('');
    setPassword('');
  }, [isLogin]);

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
          {/* Logo 和 标题 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <ThemedText variant="display" color={theme.primary} style={styles.logo}>
                遇合
              </ThemedText>
            </View>
            <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
              {isLogin ? '欢迎回来' : '新用户注册'}
            </ThemedText>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.subtitle}>
              书写属于自己的商业山河
            </ThemedText>
          </View>

          {/* 表单 */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
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
            </View>

            {/* 注册模式：显示验证码输入框 */}
            {!isLogin && (
              <View style={styles.codeContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="验证码"
                  placeholderTextColor={theme.textMuted}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.codeButton, countdown > 0 && styles.codeButtonDisabled]}
                  onPress={handleSendCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? (
                    <ThemedText variant="bodyMedium" color={theme.textMuted}>
                      {countdown}s
                    </ThemedText>
                  ) : (
                    <ThemedText variant="bodyMedium" color={theme.primary}>
                      获取验证码
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* 登录模式：显示密码输入框 */}
            {isLogin && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="密码"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* 提交按钮 */}
            <TouchableOpacity
              style={[styles.submitButton, (loading || verifyLoading) && styles.disabledButton]}
              onPress={isLogin ? handleLogin : handleVerifyCode}
              disabled={loading || verifyLoading}
            >
              {loading || verifyLoading ? (
                <ActivityIndicator color={theme.buttonPrimaryText} />
              ) : (
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                  {isLogin ? '登录' : '下一步'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={toggleMode}
            >
              <ThemedText variant="body" color={theme.primary}>
                {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
              </ThemedText>
            </TouchableOpacity>

            {/* 社交登录 - 仅登录时显示 */}
            {isLogin && (
              <View style={styles.socialLoginContainer}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <ThemedText variant="body" color={theme.textMuted} style={styles.dividerText}>
                    或使用以下方式登录
                  </ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={[styles.socialButton, !wechatInstalled && styles.socialButtonDisabled]}
                    onPress={handleSocialLogin}
                    disabled={wechatLoading || !wechatInstalled}
                  >
                    {wechatLoading ? (
                      <ActivityIndicator size="small" color="#07C160" />
                    ) : (
                      <FontAwesome6 name="weixin" size={28} color="#07C160" />
                    )}
                  </TouchableOpacity>
                </View>

                <ThemedText variant="caption" color={theme.textMuted} style={styles.socialHint}>
                  {!wechatInstalled ? '请先安装微信客户端' : '微信登录后需要绑定手机号'}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { weChatLogin, initWeChat, isWeChatInstalled, isWeChatAvailable } from '@/services/wechat';

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
  const [wechatLoading, setWechatLoading] = useState(false);
  const [wechatInstalled, setWechatInstalled] = useState(true);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 初始化微信SDK
  useEffect(() => {
    const initWx = async () => {
      // 先检查微信SDK是否可用
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

    if (password.length < 6) {
      Alert.alert('提示', '密码长度必须至少6位');
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
        // 使用 AuthContext 的 login 方法保存登录状态
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
  };

  // 注册
  const handleRegister = async () => {
    if (!phone || !code || !password) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码长度必须至少6位');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 使用 AuthContext 的 login 方法保存登录状态
        await login({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar_url,
          phone: data.user.phone,
        });
        router.replace('/');
      } else {
        Alert.alert('失败', data.error || '注册失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 社交登录处理
  const handleSocialLogin = async () => {
    setWechatLoading(true);

    try {
      // 1. 调用微信登录获取code
      const result = await weChatLogin();
      
      if (!result.success) {
        Alert.alert('微信登录失败', result.error || '请稍后重试');
        setWechatLoading(false);
        return;
      }

      // 2. 将code发送到后端换取用户信息
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

      // 3. 检查是否需要绑定手机号
      if (data.needBindPhone) {
        // 跳转到手机号绑定页面
        router.push('/phone-binding', {
          openid: data.openid,
          unionid: data.unionid,
          wechatUserInfo: JSON.stringify(data.wechatUserInfo),
          existingUserId: data.existingUserId,
        });
      } else {
        // 直接登录成功
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
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo 和 标题 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ThemedText variant="display" color={theme.primary} style={styles.logo}>
              遇合
            </ThemedText>
          </View>
          <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
            {isLogin ? '' : ''}
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.subtitle}>
            书写属于自己的商业山河
          </ThemedText>
        </View>

        {/* 表单 */}
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
          )}

          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setCode('');
            }}
          >
            <ThemedText variant="body" color={theme.primary}>
              {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
            </ThemedText>
          </TouchableOpacity>

          {/* 社交登录 */}
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
      </KeyboardAvoidingView>
    </Screen>
  );
}

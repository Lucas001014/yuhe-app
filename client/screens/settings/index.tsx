import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleChangePassword = () => {
    Alert.alert('提示', '修改密码功能开发中...');
  };

  const handleClearCache = async () => {
    Alert.alert('提示', '确定要清除缓存吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            // 清除 AsyncStorage 中的缓存数据
            await AsyncStorage.clear();
            Alert.alert('成功', '缓存已清除');
          } catch (error) {
            Alert.alert('错误', '清除缓存失败');
          }
        }
      }
    ]);
  };

  const handleCheckUpdate = () => {
    Alert.alert('检查更新', '当前已是最新版本');
  };

  const handleAbout = () => {
    Alert.alert(
      '关于遇合',
      '遇合，开拓属于自己的商业山河\n\n版本：1.0.0\n\n专为创业者打造的交流平台，支持知识付费、悬赏求助、产品推广等功能。'
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('隐私政策', '隐私政策内容开发中...');
  };

  const handleUserAgreement = () => {
    Alert.alert('用户协议', '用户协议内容开发中...');
  };

  const handleContactUs = () => {
    Alert.alert('联系我们', '邮箱：support@example.com\n电话：400-123-4567');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '注销账号',
      '注销账号后，您的所有数据将被永久删除且无法恢复。确定要注销吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定注销',
          style: 'destructive',
          onPress: () => {
            Alert.alert('提示', '账号注销功能开发中...');
          }
        }
      ]
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 账号设置 */}
        <View style={styles.section}>
          <ThemedText variant="smallMedium" color={theme.textMuted} style={styles.sectionTitle}>
            账号设置
          </ThemedText>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="lock" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>修改密码</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 通用设置 */}
        <View style={styles.section}>
          <ThemedText variant="smallMedium" color={theme.textMuted} style={styles.sectionTitle}>
            通用设置
          </ThemedText>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="broom" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>清除缓存</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleCheckUpdate}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="rotate" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>检查更新</ThemedText>
              </View>
              <ThemedText variant="caption" color={theme.textMuted}>v1.0.0</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <ThemedText variant="smallMedium" color={theme.textMuted} style={styles.sectionTitle}>
            关于
          </ThemedText>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="circle-info" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>关于我们</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="shield" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>隐私政策</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleUserAgreement}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="file-contract" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>用户协议</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="headset" size={20} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textPrimary}>联系我们</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 危险操作 */}
        <View style={styles.section}>
          <ThemedText variant="smallMedium" color={theme.textMuted} style={styles.sectionTitle}>
            危险操作
          </ThemedText>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
              <View style={styles.menuItemLeft}>
                <FontAwesome6 name="user-xmark" size={20} color={theme.error} />
                <ThemedText variant="body" color={theme.error}>注销账号</ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 版本信息 */}
        <View style={styles.versionContainer}>
          <ThemedText variant="caption" color={theme.textMuted}>
            遇合 v1.0.0
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            遇合，开拓属于自己的商业山河
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {Platform.OS === 'web' ? 'Web 版' : Platform.OS === 'ios' ? 'iOS 版' : 'Android 版'}
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

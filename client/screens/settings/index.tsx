import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Pressable, Switch } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useAuth } from '@/contexts/AuthContext';

interface UserInfo {
  id: number;
  username: string;
  avatar: string;
  email: string;
}

// 设置项组件
interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  value?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  theme: any;
  styles: any;
}

function SettingItem({ 
  icon, 
  iconColor, 
  title, 
  value, 
  onPress,
  rightComponent,
  theme,
  styles,
}: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !rightComponent}
      activeOpacity={rightComponent ? 1 : 0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
          <FontAwesome6 name={icon} size={18} color={iconColor} />
        </View>
        <ThemedText variant="bodyMedium" color={theme.textPrimary}>
          {title}
        </ThemedText>
      </View>
      
      {rightComponent || (
        <View style={styles.settingItemRight}>
          {value && (
            <ThemedText variant="body" color={theme.textMuted} style={styles.settingValue}>
              {value}
            </ThemedText>
          )}
          <FontAwesome6 
            name="chevron-right" 
            size={16} 
            color={theme.textMuted} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

// 开关项组件
interface SwitchSettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  theme: any;
  styles: any;
}

function SwitchSettingItem({
  icon,
  iconColor,
  title,
  value,
  onToggle,
  theme,
  styles,
}: SwitchSettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
          <FontAwesome6 name={icon} size={18} color={iconColor} />
        </View>
        <ThemedText variant="bodyMedium" color={theme.textPrimary}>
          {title}
        </ThemedText>
      </View>
      
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor={theme.border}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const { logout } = useAuth();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // 隐私设置
  const [privacySettings, setPrivacySettings] = useState({
    showPhone: true,
    showEmail: false,
    allowStrangerMessage: true,
  });

  // 消息通知
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotification: true,
    likeNotification: true,
    commentNotification: true,
    systemNotification: true,
  });

  // 模拟用户信息
  const mockUserInfo: UserInfo = {
    id: 1,
    username: '张三',
    avatar: 'https://i.pravatar.cc/150?img=68',
    email: 'zhangsan@example.com',
  };

  React.useEffect(() => {
    setUserInfo(mockUserInfo);
  }, []);

  // 处理退出登录
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      setShowLogoutModal(false);
      alert('退出失败，请重试');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // 更新隐私设置
  const updatePrivacySetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 更新通知设置
  const updateNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!userInfo) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 账户信息 */}
        <View style={styles.section}>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.sectionTitle}>
            账户
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => router.push('/profile-edit')}
          >
            <Image
              source={{ uri: userInfo.avatar }}
              style={styles.profileAvatar}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <ThemedText variant="h4" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                {userInfo.username}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                {userInfo.email}
              </ThemedText>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <SettingItem
            icon="id-card"
            iconColor="#38BDF8"
            title="身份认证"
            value="查看认证状态"
            onPress={() => router.push('/certification')}
            theme={theme}
            styles={styles}
          />
        </View>

        {/* 隐私设置 */}
        <View style={styles.section}>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.sectionTitle}>
            隐私设置
          </ThemedText>
          
          <SwitchSettingItem
            icon="phone"
            iconColor="#10B981"
            title="手机号可见"
            value={privacySettings.showPhone}
            onToggle={() => updatePrivacySetting('showPhone')}
            theme={theme}
            styles={styles}
          />
          
          <SwitchSettingItem
            icon="envelope"
            iconColor="#F59E0B"
            title="邮箱可见"
            value={privacySettings.showEmail}
            onToggle={() => updatePrivacySetting('showEmail')}
            theme={theme}
            styles={styles}
          />
          
          <SwitchSettingItem
            icon="message"
            iconColor="#38BDF8"
            title="允许陌生人私信"
            value={privacySettings.allowStrangerMessage}
            onToggle={() => updatePrivacySetting('allowStrangerMessage')}
            theme={theme}
            styles={styles}
          />
        </View>

        {/* 消息通知 */}
        <View style={styles.section}>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.sectionTitle}>
            消息通知
          </ThemedText>
          
          <SwitchSettingItem
            icon="bell"
            iconColor="#EF4444"
            title="推送通知"
            value={notificationSettings.pushNotification}
            onToggle={() => updateNotificationSetting('pushNotification')}
            theme={theme}
            styles={styles}
          />
          
          <SwitchSettingItem
            icon="heart"
            iconColor="#FF6B6B"
            title="点赞通知"
            value={notificationSettings.likeNotification}
            onToggle={() => updateNotificationSetting('likeNotification')}
            theme={theme}
            styles={styles}
          />
          
          <SwitchSettingItem
            icon="comments"
            iconColor="#3B82F6"
            title="评论通知"
            value={notificationSettings.commentNotification}
            onToggle={() => updateNotificationSetting('commentNotification')}
            theme={theme}
            styles={styles}
          />
          
          <SwitchSettingItem
            icon="circle-info"
            iconColor="#0EA5E9"
            title="系统通知"
            value={notificationSettings.systemNotification}
            onToggle={() => updateNotificationSetting('systemNotification')}
            theme={theme}
            styles={styles}
          />
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.sectionTitle}>
            关于
          </ThemedText>
          
          <SettingItem
            icon="circle-question"
            iconColor="#3B82F6"
            title="帮助与反馈"
            onPress={() => router.push('/help')}
            theme={theme}
            styles={styles}
          />
          
          <SettingItem
            icon="file-contract"
            iconColor="#059669"
            title="用户协议"
            onPress={() => router.push('/user-agreement')}
            theme={theme}
            styles={styles}
          />
          
          <SettingItem
            icon="shield-halved"
            iconColor="#6B7280"
            title="隐私政策"
            onPress={() => router.push('/privacy-policy')}
            theme={theme}
            styles={styles}
          />
          
          <SettingItem
            icon="circle-info"
            iconColor="#0EA5E9"
            title="关于我们"
            value="版本 1.0.0"
            onPress={() => router.push('/about')}
            theme={theme}
            styles={styles}
          />
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="right-from-bracket" size={18} color="#EF4444" />
          <ThemedText variant="bodyMedium" color="#EF4444" style={styles.logoutText}>
            退出登录
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText variant="caption" color={theme.textMuted}>
            遇合 · 书写属于自己的商业山河
          </ThemedText>
        </View>
      </ScrollView>

      {/* 退出登录确认弹窗 */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={cancelLogout}
        >
          <View style={styles.modalContent}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.modalTitle}>
              退出登录
            </ThemedText>
            <ThemedText variant="bodyMedium" color={theme.textSecondary} style={styles.modalMessage}>
              确定要退出登录吗？
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelLogout}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                  取消
                </ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmLogout}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  确定
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

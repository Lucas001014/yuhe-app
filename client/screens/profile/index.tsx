import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Text, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  arrow?: boolean;
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  
  // 控制退出登录确认对话框
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // 模拟用户信息
  const userInfo = {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    name: '张三',
    verified: true,
    membership: 'gold', // 'silver', 'gold', 'platinum'
  };

  const getMembershipText = (membership: string) => {
    switch (membership) {
      case 'platinum':
        return '铂金会员';
      case 'gold':
        return '金牌会员';
      case 'silver':
        return '银牌会员';
      default:
        return '普通会员';
    }
  };

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'platinum':
        return '#E5E4E2';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return theme.textMuted;
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      console.log('开始退出登录...');
      
      // 清除用户信息
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('avatar');
      await AsyncStorage.removeItem('userInfo');
      
      console.log('用户信息已清除');
      
      // 关闭弹窗
      setShowLogoutModal(false);
      
      // 跳转到登录页面
      router.replace('/login');
      
      console.log('已跳转到登录页');
    } catch (error) {
      console.error('退出登录失败:', error);
      setShowLogoutModal(false);
      Alert.alert('错误', '退出失败，请重试');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    switch (item.id) {
      case 'progress':
        router.push('/');
        break;
      case 'matching':
        router.push('/matching');
        break;
      case 'incubator':
        router.push('/matching');
        break;
      case 'resources':
        Alert.alert('我的资源库', '功能开发中...');
        break;
      case 'subscription':
        Alert.alert('我的订阅', '功能开发中...');
        break;
      case 'notifications':
        router.push('/matching');
        break;
      case 'privacy':
        Alert.alert('隐私设置', '功能开发中...');
        break;
      case 'about':
        Alert.alert('关于我们', '遇合 v1.0.0\n书写属于自己的商业山河');
        break;
      default:
        break;
    }
  };

  const handleSettings = () => {
    Alert.alert('设置', '功能开发中...');
  };

  const featureCards: MenuItem[] = [
    { id: 'progress', icon: 'chart-line', title: '创业进度看板', arrow: true },
    { id: 'matching', icon: 'handshake', title: '我的对接记录', arrow: true },
    { id: 'incubator', icon: 'lightbulb', title: '我的孵化项目', arrow: true },
    { id: 'resources', icon: 'cubes-stacked', title: '我的资源库', arrow: true },
  ];

  const menuItems: MenuItem[] = [
    { id: 'subscription', icon: 'crown', title: '我的订阅', arrow: true },
    { id: 'notifications', icon: 'bell', title: '消息通知', arrow: true },
    { id: 'privacy', icon: 'shield-halved', title: '隐私设置', arrow: true },
    { id: 'about', icon: 'circle-info', title: '关于我们', arrow: true },
  ];

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部用户信息区 */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <FontAwesome6 name="circle-user" size={64} color={theme.border} />
            </View>
            <View style={styles.userDetails}>
              <View style={styles.userNameContainer}>
                <ThemedText variant="h3" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                  {userInfo.name}
                </ThemedText>
                {userInfo.verified && (
                  <FontAwesome6 name="circle-check" size={20} color={theme.success} />
                )}
              </View>
              <TouchableOpacity style={styles.membershipBadge}>
                <FontAwesome6
                  name="crown"
                  size={14}
                  color={getMembershipColor(userInfo.membership)}
                  solid
                />
                <ThemedText
                  variant="caption"
                  color={theme.textSecondary}
                  style={{ fontWeight: '600' }}
                >
                  {getMembershipText(userInfo.membership)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <FontAwesome6 name="gear" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 功能卡片区 */}
        <View style={styles.featureCardsSection}>
          {featureCards.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              onPress={() => handleMenuItemPress(item)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome6 name={item.icon as any} size={24} color={theme.primary} />
                </View>
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  {item.title}
                </ThemedText>
              </View>
              {item.arrow && (
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 菜单项区 */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}
            >
              <View style={styles.menuItemLeft}>
                <FontAwesome6
                  name={item.icon as any}
                  size={20}
                  color={theme.textSecondary}
                  style={{ width: 24 }}
                />
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  {item.title}
                </ThemedText>
              </View>
              {item.arrow && (
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome6 name="right-from-bracket" size={20} color={theme.error} style={{ width: 24 }} />
          <ThemedText variant="bodyMedium" color={theme.error}>
            退出登录
          </ThemedText>
        </TouchableOpacity>
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

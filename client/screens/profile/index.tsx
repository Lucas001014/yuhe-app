import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Pressable, TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

interface UserInfo {
  id: number;
  username: string;
  avatar: string;
  verified: boolean;
  identityVerified: boolean; // 身份认证状态
  identityStatus: 'pending' | 'approved' | 'rejected' | 'none'; // 认证状态
}

interface PostStats {
  myPosts: number;
  likedPosts: number;
  collectedPosts: number;
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // 权限控制
  useAuthGuard('/profile');

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [postStats, setPostStats] = useState<PostStats>({
    myPosts: 0,
    likedPosts: 0,
    collectedPosts: 0,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAccountSwitchModal, setShowAccountSwitchModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  // 模拟用户信息
  const mockUserInfo: UserInfo = {
    id: 1,
    username: '张三',
    avatar: 'https://i.pravatar.cc/150?img=68',
    verified: true,
    identityVerified: false,
    identityStatus: 'pending', // 待审核
  };

  // 模拟发帖统计
  const mockPostStats: PostStats = {
    myPosts: 12,
    likedPosts: 45,
    collectedPosts: 23,
  };

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      // 使用模拟数据（无论是否登录都显示）
      setUserInfo(mockUserInfo);
      setPostStats(mockPostStats);
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 加载失败时也显示模拟数据
      setUserInfo(mockUserInfo);
      setPostStats(mockPostStats);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [loadUserInfo])
  );

  // 处理退出登录
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // 处理头像更换
  const handleChangeAvatar = async () => {
    try {
      // 请求相册权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限才能更换头像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newAvatar = result.assets[0].uri;
        setUserInfo({ ...userInfo!, avatar: newAvatar });
        Alert.alert('成功', '头像更换成功');
      }
    } catch (error) {
      console.error('更换头像失败:', error);
      Alert.alert('错误', '更换头像失败，请重试');
    }
  };

  // 处理改名
  const handleChangeName = () => {
    setNewName(userInfo?.username || '');
    setShowChangeNameModal(true);
  };

  const confirmChangeName = async () => {
    if (!newName.trim()) {
      Alert.alert('提示', '用户名不能为空');
      return;
    }

    try {
      setUserInfo({ ...userInfo!, username: newName.trim() });
      await AsyncStorage.setItem('username', newName.trim());
      setShowChangeNameModal(false);
      Alert.alert('成功', '用户名修改成功');
    } catch (error) {
      console.error('修改用户名失败:', error);
      Alert.alert('错误', '修改失败，请重试');
    }
  };

  // 加载已保存的账号列表
  const loadSavedAccounts = async () => {
    try {
      const accounts = await AsyncStorage.getItem('savedAccounts');
      if (accounts) {
        setSavedAccounts(JSON.parse(accounts));
      }
    } catch (error) {
      console.error('加载账号列表失败:', error);
    }
  };

  // 退出登录并保存当前账号
  const confirmLogout = async () => {
    try {
      // 保存当前账号到列表
      const currentAccount = {
        userId: userInfo?.id,
        username: userInfo?.username,
        avatar: userInfo?.avatar,
        lastLoginTime: new Date().toISOString(),
      };

      const updatedAccounts = savedAccounts.filter(a => a.userId !== currentAccount.userId);
      updatedAccounts.unshift(currentAccount);
      // 只保留最近5个账号
      const finalAccounts = updatedAccounts.slice(0, 5);

      await AsyncStorage.setItem('savedAccounts', JSON.stringify(finalAccounts));
      
      // 清除当前登录信息
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('avatar');
      await AsyncStorage.removeItem('userInfo');

      setShowLogoutModal(false);
      setShowAccountSwitchModal(true);
    } catch (error) {
      console.error('退出登录失败:', error);
      setShowLogoutModal(false);
      Alert.alert('错误', '退出失败，请重试');
    }
  };

  // 切换到已保存的账号
  const handleSwitchAccount = async (account: any) => {
    try {
      await AsyncStorage.setItem('userId', account.userId.toString());
      await AsyncStorage.setItem('username', account.username);
      await AsyncStorage.setItem('avatar', account.avatar);
      
      setShowAccountSwitchModal(false);
      router.replace('/home');
    } catch (error) {
      console.error('切换账号失败:', error);
      Alert.alert('错误', '切换失败，请重试');
    }
  };

  // 身份认证状态显示
  const getIdentityStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '审核中';
      case 'approved':
        return '已认证';
      case 'rejected':
        return '审核未通过';
      default:
        return '未认证';
    }
  };

  const getIdentityStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B'; // 橙色
      case 'approved':
        return '#10B981'; // 绿色
      case 'rejected':
        return '#EF4444'; // 红色
      default:
        return theme.textMuted;
    }
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
        {/* 用户信息区 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleChangeAvatar}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userInfo.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.avatarEditIcon}>
                <FontAwesome6 name="camera" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={handleChangeName}>
              <View style={styles.userNameContainer}>
                <ThemedText variant="h3" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                  {userInfo.username}
                </ThemedText>
                {userInfo.verified && (
                  <FontAwesome6 name="circle-check" size={20} color={theme.success} />
                )}
                <FontAwesome6 name="pen" size={16} color={theme.textMuted} style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
            
            {/* 身份认证状态 */}
            {userInfo.identityStatus !== 'none' && (
              <TouchableOpacity
                style={styles.identityBadge}
                onPress={() => router.push('/identity-verification')}
              >
                <FontAwesome6
                  name="certificate"
                  size={14}
                  color={getIdentityStatusColor(userInfo.identityStatus)}
                />
                <ThemedText
                  variant="caption"
                  color={getIdentityStatusColor(userInfo.identityStatus)}
                  style={{ fontWeight: '600' }}
                >
                  {getIdentityStatusText(userInfo.identityStatus)}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* 设置按钮 */}
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <FontAwesome6 name="gear" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 身份认证卡片（仅当有认证记录时显示） */}
        {userInfo.identityStatus === 'pending' && (
          <View style={styles.verifyCard}>
            <View style={styles.verifyCardContent}>
              <FontAwesome6 name="clock" size={20} color="#F59E0B" />
              <View style={styles.verifyCardText}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                  身份认证审核中
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>
                  我们正在审核您的身份认证申请，请耐心等待
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {userInfo.identityStatus === 'rejected' && (
          <View style={[styles.verifyCard, styles.verifyCardRejected]}>
            <View style={styles.verifyCardContent}>
              <FontAwesome6 name="circle-xmark" size={20} color="#EF4444" />
              <View style={styles.verifyCardText}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                  身份认证未通过
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>
                  您的认证申请未通过，请修改后重新提交
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.push('/identity-verification')}
              >
                <ThemedText variant="caption" color={theme.buttonPrimaryText}>重新提交</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {userInfo.identityStatus === 'none' && (
          <View style={styles.verifyCard}>
            <View style={styles.verifyCardContent}>
              <FontAwesome6 name="certificate" size={20} color={theme.primary} />
              <View style={styles.verifyCardText}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                  完成身份认证
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>
                  认证后可解锁更多功能，提高账号可信度
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => router.push('/identity-verification')}
              >
                <ThemedText variant="caption" color={theme.buttonPrimaryText}>立即认证</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 发帖统计区 */}
        <View style={styles.statsSection}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
            发帖统计
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/my-posts')}
            >
              <FontAwesome6 name="file-lines" size={24} color={theme.primary} />
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {postStats.myPosts}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>
                我的发帖
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/my-likes')}
            >
              <FontAwesome6 name="heart" size={24} color="#FF6B6B" />
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {postStats.likedPosts}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>
                点赞
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/my-collections')}
            >
              <FontAwesome6 name="bookmark" size={24} color="#FFD93D" />
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {postStats.collectedPosts}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>
                收藏
              </ThemedText>
            </TouchableOpacity>
          </View>
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

      {/* 改名弹窗 */}
      <Modal
        visible={showChangeNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangeNameModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowChangeNameModal(false)}
        >
          <View style={styles.modalContent}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.modalTitle}>
              修改用户名
            </ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="请输入新用户名"
                placeholderTextColor={theme.textMuted}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowChangeNameModal(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                  取消
                </ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmChangeName}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  确定
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* 账号切换弹窗 */}
      <Modal
        visible={showAccountSwitchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.accountSwitchContent]}>
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.modalTitle}>
              切换账号
            </ThemedText>
            
            <View style={styles.accountList}>
              <TouchableOpacity
                style={styles.addAccountButton}
                onPress={() => {
                  setShowAccountSwitchModal(false);
                  router.push('/login');
                }}
              >
                <FontAwesome6 name="plus" size={20} color={theme.primary} />
                <ThemedText variant="bodyMedium" color={theme.primary}>
                  添加新账号
                </ThemedText>
              </TouchableOpacity>
              
              {savedAccounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.accountItem}
                  onPress={() => handleSwitchAccount(account)}
                >
                  <Image
                    source={{ uri: account.avatar }}
                    style={styles.accountAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.accountInfo}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      {account.username}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      最后登录: {new Date(account.lastLoginTime).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.fullWidthButton]}
              onPress={() => {
                setShowAccountSwitchModal(false);
                router.replace('/login');
              }}
            >
              <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                返回登录
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

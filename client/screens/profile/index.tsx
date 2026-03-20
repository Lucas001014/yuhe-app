import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Pressable, TextInput, TouchableWithoutFeedback, Keyboard, Dimensions, PanResponder, Animated } from 'react-native';
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
import { createFormDataFile } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { logout, updateUser, user, refreshUser } = useAuth();

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
  const [loading, setLoading] = useState(false);
  const [showAvatarPreviewModal, setShowAvatarPreviewModal] = useState(false);
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null);
  
  // 头像裁剪相关状态
  const avatarScale = useRef(new Animated.Value(1)).current;
  const avatarTranslateX = useRef(new Animated.Value(0)).current;
  const avatarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  
  // 手势状态
  const isDragging = useRef(false);
  const initialTouchDistance = useRef(0);
  const initialTouchCenter = useRef({ x: 0, y: 0 });

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const AVATAR_CROP_SIZE = SCREEN_WIDTH * 0.75; // 裁剪区域大小
  
  // 手势处理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          // 双指触摸 - 准备缩放
          initialTouchDistance.current = Math.sqrt(
            Math.pow(touches[0].pageX - touches[1].pageX, 2) +
            Math.pow(touches[0].pageY - touches[1].pageY, 2)
          );
          initialTouchCenter.current = {
            x: (touches[0].pageX + touches[1].pageX) / 2,
            y: (touches[0].pageY + touches[1].pageY) / 2,
          };
        } else if (touches.length === 1) {
          // 单指触摸 - 准备拖拽
          isDragging.current = true;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // 双指缩放
          const currentDistance = Math.sqrt(
            Math.pow(touches[0].pageX - touches[1].pageX, 2) +
            Math.pow(touches[0].pageY - touches[1].pageY, 2)
          );
          
          if (initialTouchDistance.current > 0) {
            const scale = lastScale.current * (currentDistance / initialTouchDistance.current);
            const clampedScale = Math.max(0.5, Math.min(3, scale));
            avatarScale.setValue(clampedScale);
          }
        } else if (touches.length === 1 && isDragging.current) {
          // 单指拖拽
          const newX = lastTranslateX.current + gestureState.dx;
          const newY = lastTranslateY.current + gestureState.dy;
          avatarTranslateX.setValue(newX);
          avatarTranslateY.setValue(newY);
        }
      },
      onPanResponderRelease: (evt) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 0 && isDragging.current) {
          // 单指拖拽结束
          lastTranslateX.current += evt.nativeEvent.changedTouches[0]?.pageX - initialTouchCenter.current.x || 0;
          lastTranslateY.current += evt.nativeEvent.changedTouches[0]?.pageY - initialTouchCenter.current.y || 0;
          isDragging.current = false;
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
      },
    })
  ).current;

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // 未登录，使用默认数据
        const defaultUserInfo: UserInfo = {
          id: 1,
          username: '游客',
          avatar: 'https://i.pravatar.cc/150?img=68',
          verified: false,
          identityVerified: false,
          identityStatus: 'none',
        };
        setUserInfo(defaultUserInfo);
        setPostStats({ myPosts: 0, likedPosts: 0, collectedPosts: 0 });
        return;
      }

      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：GET /api/v1/auth/me
       * Query 参数：userId: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.user) {
        setUserInfo({
          id: data.user.id,
          username: data.user.username || '用户',
          avatar: data.user.avatar_url || 'https://i.pravatar.cc/150?img=68',
          verified: false,
          identityVerified: false,
          identityStatus: 'none',
        });
        // 保存到 AsyncStorage 供其他页面使用
        await AsyncStorage.setItem('username', data.user.username || '用户');
        await AsyncStorage.setItem('avatar', data.user.avatar_url || 'https://i.pravatar.cc/150?img=68');
      } else {
        // 使用默认数据
        const defaultUserInfo: UserInfo = {
          id: parseInt(userId),
          username: '用户',
          avatar: 'https://i.pravatar.cc/150?img=68',
          verified: false,
          identityVerified: false,
          identityStatus: 'none',
        };
        setUserInfo(defaultUserInfo);
      }

      setPostStats({ myPosts: 0, likedPosts: 0, collectedPosts: 0 });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      const userId = await AsyncStorage.getItem('userId');
      const defaultUserInfo: UserInfo = {
        id: userId ? parseInt(userId) : 1,
        username: '用户',
        avatar: 'https://i.pravatar.cc/150?img=68',
        verified: false,
        identityVerified: false,
        identityStatus: 'none',
      };
      setUserInfo(defaultUserInfo);
      setPostStats({ myPosts: 0, likedPosts: 0, collectedPosts: 0 });
    }
  }, [API_BASE_URL]);

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
        allowsEditing: false, // 关闭系统裁剪，使用自定义裁剪
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        // 重置裁剪状态
        avatarScale.setValue(1);
        avatarTranslateX.setValue(0);
        avatarTranslateY.setValue(0);
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        // 显示预览弹窗
        setAvatarPreviewUri(localUri);
        setShowAvatarPreviewModal(true);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  // 确认上传头像
  const confirmChangeAvatar = async () => {
    if (!avatarPreviewUri) return;

    setShowAvatarPreviewModal(false);
    setLoading(true);

    try {
      // 1. 上传图片到对象存储
      const filename = avatarPreviewUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const mimeType = `image/${ext}`;

      const formData = new FormData();
      const file = await createFormDataFile(avatarPreviewUri, filename, mimeType);
      formData.append('file', file as any);

      /**
       * 服务端文件：server/src/routes/upload.ts
       * 接口：POST /api/v1/upload
       * Body: multipart/form-data with 'file' field
       */
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || '上传失败');
      }

      const avatarUrl = uploadData.url;

      // 2. 更新后端用户信息
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('错误', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/update-profile
       * Body: { userId: number, avatar_url?: string }
       */
      const updateResponse = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          avatar_url: avatarUrl,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateData.success) {
        throw new Error(updateData.error || '更新失败');
      }

      // 3. 更新本地状态和 AsyncStorage
      setUserInfo({ ...userInfo!, avatar: avatarUrl });
      await AsyncStorage.setItem('avatar', avatarUrl);
      // 更新 AuthContext 的用户状态
      updateUser({ avatar: avatarUrl });
      setAvatarPreviewUri(null);

      Alert.alert('成功', '头像更换成功');
    } catch (error) {
      console.error('更换头像失败:', error);
      Alert.alert('错误', '更换头像失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消头像修改
  const cancelChangeAvatar = () => {
    setShowAvatarPreviewModal(false);
    setAvatarPreviewUri(null);
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
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('错误', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/auth.ts
       * 接口：POST /api/v1/auth/update-profile
       * Body: { userId: number, username?: string }
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          username: newName.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '修改失败');
      }

      // 更新本地状态和 AsyncStorage
      setUserInfo({ ...userInfo!, username: newName.trim() });
      await AsyncStorage.setItem('username', newName.trim());
      // 更新 AuthContext 的用户状态
      updateUser({ username: newName.trim() });
      setShowChangeNameModal(false);
      Alert.alert('成功', '用户名修改成功');
    } catch (error) {
      console.error('修改用户名失败:', error);
      Alert.alert('错误', '修改失败，请重试');
    } finally {
      setLoading(false);
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
      
      // 使用 AuthContext 的 logout 方法清除登录信息
      await logout();

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
      // 保存新账号信息到 AsyncStorage
      await AsyncStorage.setItem('userId', account.userId.toString());
      await AsyncStorage.setItem('username', account.username);
      await AsyncStorage.setItem('avatar', account.avatar);
      
      // 刷新 AuthContext 的用户状态
      await refreshUser();
      
      setShowAccountSwitchModal(false);
      router.replace('/');
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
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowChangeNameModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
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
                autoFocus={true}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                activeOpacity={0.7}
                onPress={() => setShowChangeNameModal(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                  取消
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                activeOpacity={0.7}
                onPress={confirmChangeName}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  确定
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 头像预览弹窗 */}
      <Modal
        visible={showAvatarPreviewModal}
        transparent
        animationType="slide"
        onRequestClose={cancelChangeAvatar}
      >
        <View style={styles.avatarCropModalContainer}>
          {/* 顶部工具栏 */}
          <View style={styles.avatarCropHeader}>
            <TouchableOpacity onPress={cancelChangeAvatar} style={styles.avatarCropButton}>
              <ThemedText variant="bodyMedium" color="#FFFFFF">取消</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="h4" color="#FFFFFF">调整头像</ThemedText>
            <TouchableOpacity onPress={confirmChangeAvatar} style={[styles.avatarCropButton, styles.avatarCropConfirmButton]}>
              <ThemedText variant="bodyMedium" color="#FFFFFF">确认</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 裁剪区域 */}
          <View style={styles.avatarCropArea} {...panResponder.panHandlers}>
            {avatarPreviewUri && (
              <Animated.Image
                source={{ uri: avatarPreviewUri }}
                style={[
                  styles.avatarCropImage,
                  {
                    transform: [
                      { scale: avatarScale },
                      { translateX: avatarTranslateX },
                      { translateY: avatarTranslateY },
                    ],
                  },
                ]}
                resizeMode="cover"
              />
            )}
            
            {/* 圆形裁剪框 */}
            <View style={styles.avatarCropCircle} pointerEvents="none">
              {/* 网格线 */}
              <View style={styles.avatarCropGrid} pointerEvents="none">
                <View style={[styles.avatarCropGridLine, styles.avatarCropGridLineH]} />
                <View style={[styles.avatarCropGridLine, styles.avatarCropGridLineH, { top: '50%' }]} />
                <View style={[styles.avatarCropGridLine, styles.avatarCropGridLineV]} />
                <View style={[styles.avatarCropGridLine, styles.avatarCropGridLineV, { left: '50%' }]} />
              </View>
            </View>
            
            {/* 遮罩层 */}
            <View style={styles.avatarCropMask} pointerEvents="none">
              <View style={styles.avatarCropMaskTop} />
              <View style={styles.avatarCropMaskMiddle}>
                <View style={styles.avatarCropMaskLeft} />
                <View style={styles.avatarCropMaskCircle} />
                <View style={styles.avatarCropMaskRight} />
              </View>
              <View style={styles.avatarCropMaskBottom} />
            </View>
          </View>

          {/* 提示文字 */}
          <View style={styles.avatarCropHint}>
            <ThemedText variant="caption" color="rgba(255,255,255,0.8)">
              拖拽图片调整位置，双指缩放调整大小
            </ThemedText>
          </View>
        </View>
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

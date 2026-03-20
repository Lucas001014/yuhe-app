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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UserInfo {
  id: number;
  username: string;
  avatar: string;
  backgroundImage: string;
  bio: string;
  identity: string;
  verified: boolean;
  isMerchant: boolean;
}

interface PostStats {
  myPosts: number;
  likedPosts: number;
  collectedPosts: number;
  privatePosts: number;
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { logout, updateUser, user, refreshUser } = useAuth();

  useAuthGuard('/profile');

  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    username: '加载中...',
    avatar: 'https://i.pravatar.cc/150?img=68',
    backgroundImage: '',
    bio: '这个人很懒，什么都没写~',
    identity: '创业者',
    verified: false,
    isMerchant: false,
  });
  const [postStats, setPostStats] = useState<PostStats>({
    myPosts: 0,
    likedPosts: 0,
    collectedPosts: 0,
    privatePosts: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'username' | 'bio'>('username');
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarPreviewModal, setShowAvatarPreviewModal] = useState(false);
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 头像裁剪相关
  const avatarScale = useRef(new Animated.Value(1)).current;
  const avatarTranslateX = useRef(new Animated.Value(0)).current;
  const avatarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const isDragging = useRef(false);

  const AVATAR_CROP_SIZE = SCREEN_WIDTH * 0.75;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 1) {
          isDragging.current = true;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const currentDistance = Math.sqrt(
            Math.pow(touches[0].pageX - touches[1].pageX, 2) +
            Math.pow(touches[0].pageY - touches[1].pageY, 2)
          );
          if (lastScale.current > 0) {
            const scale = Math.max(0.5, Math.min(3, lastScale.current * 1));
            avatarScale.setValue(scale);
          }
        } else if (touches.length === 1 && isDragging.current) {
          avatarTranslateX.setValue(lastTranslateX.current + gestureState.dx);
          avatarTranslateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
      },
    })
  ).current;

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setUserInfo({
          id: 1,
          username: '游客',
          avatar: 'https://i.pravatar.cc/150?img=68',
          backgroundImage: '',
          bio: '点击编辑个人简介~',
          identity: '创业者',
          verified: false,
          isMerchant: false,
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.user) {
        setUserInfo({
          id: data.user.id,
          username: data.user.username || '用户',
          avatar: data.user.avatar_url || 'https://i.pravatar.cc/150?img=68',
          backgroundImage: data.user.background_image || '',
          bio: data.user.bio || '点击编辑个人简介~',
          identity: data.user.is_merchant ? '商家' : '创业者',
          verified: false,
          isMerchant: data.user.is_merchant || false,
        });
        await AsyncStorage.setItem('username', data.user.username || '用户');
        await AsyncStorage.setItem('avatar', data.user.avatar_url || '');
      }

      // 加载帖子统计
      const statsResponse = await fetch(`${API_BASE_URL}/api/v1/posts/user/${userId}/stats`);
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setPostStats({
          myPosts: statsData.stats?.myPosts || 0,
          likedPosts: statsData.stats?.likedPosts || 0,
          collectedPosts: statsData.stats?.collectedPosts || 0,
          privatePosts: statsData.stats?.privatePosts || 0,
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  }, [API_BASE_URL]);

  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [loadUserInfo])
  );

  // 更换背景图
  const handleChangeBackground = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限才能更换背景');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setLoading(true);

        const filename = localUri.split('/').pop() || 'background.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const mimeType = `image/${ext}`;

        const formData = new FormData();
        const file = await createFormDataFile(localUri, filename, mimeType);
        formData.append('file', file as any);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || '上传失败');
        }

        const backgroundImageUrl = uploadData.url;

        const userId = await AsyncStorage.getItem('userId');
        const updateResponse = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: parseInt(userId!),
            background_image: backgroundImageUrl,
          }),
        });

        const updateData = await updateResponse.json();
        if (updateData.success) {
          setUserInfo({ ...userInfo, backgroundImage: backgroundImageUrl });
          Alert.alert('成功', '背景图更换成功');
        }
      }
    } catch (error) {
      console.error('更换背景图失败:', error);
      Alert.alert('错误', '更换背景图失败');
    } finally {
      setLoading(false);
    }
  };

  // 更换头像
  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限才能更换头像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        avatarScale.setValue(1);
        avatarTranslateX.setValue(0);
        avatarTranslateY.setValue(0);
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        setAvatarPreviewUri(localUri);
        setShowAvatarPreviewModal(true);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败');
    }
  };

  // 确认上传头像
  const confirmChangeAvatar = async () => {
    if (!avatarPreviewUri) return;

    setShowAvatarPreviewModal(false);
    setLoading(true);

    try {
      const filename = avatarPreviewUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const mimeType = `image/${ext}`;

      const formData = new FormData();
      const file = await createFormDataFile(avatarPreviewUri, filename, mimeType);
      formData.append('file', file as any);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || '上传失败');
      }

      const avatarUrl = uploadData.url;

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('错误', '请先登录');
        return;
      }

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

      setUserInfo({ ...userInfo, avatar: avatarUrl });
      await AsyncStorage.setItem('avatar', avatarUrl);
      updateUser({ avatar: avatarUrl });
      setAvatarPreviewUri(null);
      Alert.alert('成功', '头像更换成功');
    } catch (error) {
      console.error('更换头像失败:', error);
      Alert.alert('错误', '更换头像失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑字段
  const handleEdit = (field: 'username' | 'bio') => {
    setEditField(field);
    setEditValue(field === 'username' ? userInfo.username : userInfo.bio);
    setShowEditModal(true);
  };

  // 确认编辑
  const confirmEdit = async () => {
    if (!editValue.trim()) {
      Alert.alert('提示', editField === 'username' ? '用户名不能为空' : '个人简介不能为空');
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('错误', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          [editField === 'username' ? 'username' : 'bio']: editValue.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '修改失败');
      }

      setUserInfo({ ...userInfo, [editField === 'username' ? 'username' : 'bio']: editValue.trim() });
      if (editField === 'username') {
        await AsyncStorage.setItem('username', editValue.trim());
        updateUser({ username: editValue.trim() });
      }
      setShowEditModal(false);
      Alert.alert('成功', '修改成功');
    } catch (error) {
      console.error('修改失败:', error);
      Alert.alert('错误', '修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到帖子列表
  const goToPosts = (type: 'myPosts' | 'likedPosts' | 'collectedPosts' | 'privatePosts') => {
    const routes: Record<string, string> = {
      myPosts: '/my-posts',
      likedPosts: '/my-likes',
      collectedPosts: '/my-collections',
      privatePosts: '/my-private',
    };
    router.push(routes[type]);
  };

  return (
    <View style={styles.container}>
      {/* 背景图区域 */}
      <View style={styles.backgroundContainer}>
        {userInfo.backgroundImage ? (
          <Image
            source={{ uri: userInfo.backgroundImage }}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.backgroundImage, styles.backgroundPlaceholder]}>
            <FontAwesome6 name="image" size={48} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        {/* 渐变遮罩 */}
        <View style={styles.gradientOverlay} pointerEvents="none">
          <View style={[styles.gradientLayer, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          <View style={[styles.gradientLayer, { backgroundColor: `rgba(255,255,255,0.1)` }]} />
          <View style={[styles.gradientLayer, { backgroundColor: theme.backgroundRoot }]} />
        </View>
        
        {/* 更换背景按钮 */}
        <TouchableOpacity style={styles.changeBackgroundButton} onPress={handleChangeBackground}>
          <FontAwesome6 name="camera" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* 设置按钮 */}
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <FontAwesome6 name="gear" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 用户信息区 */}
      <View style={styles.userInfoSection}>
        {/* 头像 */}
        <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarWrapper}>
          <Image source={{ uri: userInfo.avatar }} style={styles.avatar} contentFit="cover" />
          <View style={styles.avatarEditBadge}>
            <FontAwesome6 name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 用户名和身份 */}
        <View style={styles.nameSection}>
          <TouchableOpacity onPress={() => handleEdit('username')} style={styles.nameRow}>
            <ThemedText variant="h2" color={theme.textPrimary} style={{ fontWeight: '700' }}>
              {userInfo.username}
            </ThemedText>
            <FontAwesome6 name="pen" size={14} color={theme.textMuted} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* 身份标签 */}
          <View style={styles.identityRow}>
            <View style={[styles.identityBadge, userInfo.isMerchant && styles.merchantBadge]}>
              <FontAwesome6
                name={userInfo.isMerchant ? 'store' : 'user-tie'}
                size={12}
                color={userInfo.isMerchant ? '#FFD700' : theme.primary}
              />
              <ThemedText
                variant="caption"
                color={userInfo.isMerchant ? '#FFD700' : theme.primary}
                style={{ fontWeight: '600' }}
              >
                {userInfo.identity}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 个人简介 */}
        <TouchableOpacity onPress={() => handleEdit('bio')} style={styles.bioSection}>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.bioText}>
            {userInfo.bio}
          </ThemedText>
          <FontAwesome6 name="pen" size={12} color={theme.textMuted} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* 底部统计板块 */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statItem} onPress={() => goToPosts('myPosts')}>
            <FontAwesome6 name="file-lines" size={24} color={theme.primary} />
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
              {postStats.myPosts}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              帖子
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statItem} onPress={() => goToPosts('collectedPosts')}>
            <FontAwesome6 name="bookmark" size={24} color="#FFD93D" />
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
              {postStats.collectedPosts}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              收藏
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statItem} onPress={() => goToPosts('likedPosts')}>
            <FontAwesome6 name="heart" size={24} color="#FF6B6B" />
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
              {postStats.likedPosts}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              点赞
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statItem} onPress={() => goToPosts('privatePosts')}>
            <FontAwesome6 name="lock" size={24} color="#8B5CF6" />
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
              {postStats.privatePosts}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              私密
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 编辑弹窗 */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <ThemedText variant="h4" color={theme.textPrimary} style={styles.modalTitle}>
              {editField === 'username' ? '修改用户名' : '修改个人简介'}
            </ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.modalInput, editField === 'bio' && styles.modalInputMultiline]}
                placeholder={editField === 'username' ? '请输入用户名' : '请输入个人简介'}
                placeholderTextColor={theme.textMuted}
                value={editValue}
                onChangeText={setEditValue}
                maxLength={editField === 'username' ? 20 : 100}
                autoFocus={true}
                multiline={editField === 'bio'}
                numberOfLines={editField === 'bio' ? 3 : 1}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmEdit}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>确定</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 头像裁剪弹窗 */}
      <Modal
        visible={showAvatarPreviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPreviewModal(false)}
      >
        <View style={styles.avatarCropModalContainer}>
          <View style={styles.avatarCropHeader}>
            <TouchableOpacity onPress={() => setShowAvatarPreviewModal(false)} style={styles.avatarCropButton}>
              <ThemedText variant="bodyMedium" color="#FFFFFF">取消</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="h4" color="#FFFFFF">调整头像</ThemedText>
            <TouchableOpacity onPress={confirmChangeAvatar} style={[styles.avatarCropButton, styles.avatarCropConfirmButton]}>
              <ThemedText variant="bodyMedium" color="#FFFFFF">确认</ThemedText>
            </TouchableOpacity>
          </View>

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
            <View style={[styles.avatarCropCircle, { width: AVATAR_CROP_SIZE, height: AVATAR_CROP_SIZE, borderRadius: AVATAR_CROP_SIZE / 2 }]} pointerEvents="none" />
          </View>

          <View style={styles.avatarCropHint}>
            <ThemedText variant="caption" color="rgba(255,255,255,0.8)">
              拖拽图片调整位置，双指缩放调整大小
            </ThemedText>
          </View>
        </View>
      </Modal>
    </View>
  );
}

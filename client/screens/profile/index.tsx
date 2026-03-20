import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Dimensions, PanResponder, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { createStyles, SKY_BLUE } from './styles';
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

interface UserStats {
  likes: number;
  mutualFollows: number;
  following: number;
  followers: number;
}

// 示例项目数据
const MOCK_PROJECTS = [
  {
    id: 1,
    title: '智能供应链管理系统',
    cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    progress: 75,
    views: 1234,
    likes: 89,
  },
  {
    id: 2,
    title: '跨境电商平台',
    cover: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    progress: 45,
    views: 856,
    likes: 56,
  },
  {
    id: 3,
    title: '农业物联网项目',
    cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    progress: 90,
    views: 2341,
    likes: 167,
  },
];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { updateUser } = useAuth();

  useAuthGuard('/profile');

  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    username: '张三',
    avatar: 'https://i.pravatar.cc/150?img=68',
    backgroundImage: '',
    bio: '成为光',
    identity: '创业者',
    verified: true,
    isMerchant: false,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    likes: 893,
    mutualFollows: 59,
    following: 354,
    followers: 121,
  });

  const [activeTab, setActiveTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'username' | 'bio'>('username');
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

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
          verified: data.user.is_merchant || false,
          isMerchant: data.user.is_merchant || false,
        });
        await AsyncStorage.setItem('username', data.user.username || '用户');
        await AsyncStorage.setItem('avatar', data.user.avatar_url || '');
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
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setLoading(true);

        const filename = localUri.split('/').pop() || 'avatar.jpg';
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
        if (!uploadData.success) throw new Error(uploadData.error || '上传失败');

        const avatarUrl = uploadData.url;
        const userId = await AsyncStorage.getItem('userId');
        
        const updateResponse = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: parseInt(userId!),
            avatar_url: avatarUrl,
          }),
        });

        const updateData = await updateResponse.json();
        if (updateData.success) {
          setUserInfo({ ...userInfo, avatar: avatarUrl });
          await AsyncStorage.setItem('avatar', avatarUrl);
          updateUser({ avatar: avatarUrl });
          Alert.alert('成功', '头像更换成功');
        }
      }
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
      if (!userId) return;

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          [editField === 'username' ? 'username' : 'bio']: editValue.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserInfo({ ...userInfo, [editField === 'username' ? 'username' : 'bio']: editValue.trim() });
        if (editField === 'username') {
          await AsyncStorage.setItem('username', editValue.trim());
          updateUser({ username: editValue.trim() });
        }
        setShowEditModal(false);
        Alert.alert('成功', '修改成功');
      }
    } catch (error) {
      console.error('修改失败:', error);
      Alert.alert('错误', '修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 功能入口点击
  const handleFeaturePress = (feature: string) => {
    Alert.alert('功能提示', `${feature}功能开发中`);
  };

  // 标签栏数据
  const tabs = ['我的项目', '对接记录', '收藏资源', '喜欢内容'];

  // 功能入口数据
  const features = [
    { icon: 'chart-line', name: '创业进度看板', key: 'dashboard' },
    { icon: 'file-lines', name: '我的对接记录', key: 'records' },
    { icon: 'lightbulb', name: '我的孵化项目', key: 'incubation' },
    { icon: 'cubes', name: '我的资源库', key: 'resources' },
    { icon: 'grip', name: '全部功能', key: 'all' },
  ];

  return (
    <Screen backgroundColor="#FFFFFF" statusBarStyle="dark">
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ========== 顶部用户信息区 ========== */}
        <View style={styles.headerSection}>
          {/* 半透明天蓝色渐变背景 */}
          <View style={styles.headerGradient} />

          {/* 顶部操作栏 */}
          <View style={styles.headerTopBar}>
            <TouchableOpacity style={styles.headerButton} onPress={() => handleFeaturePress('搜索')}>
              <FontAwesome6 name="magnifying-glass" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
              <FontAwesome6 name="bars" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* 用户信息 */}
          <View style={styles.userInfoRow}>
            {/* 头像 */}
            <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} contentFit="cover" />
              {/* 右下角悬浮按钮 */}
              <TouchableOpacity style={styles.avatarAddButton} onPress={() => handleFeaturePress('添加好友')}>
                <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 用户名、标签、ID */}
            <View style={styles.userTextInfo}>
              <TouchableOpacity onPress={() => handleEdit('username')} style={styles.usernameRow}>
                <ThemedText variant="h3" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                  {userInfo.username}
                </ThemedText>
                <FontAwesome6 name="pen" size={12} color={theme.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              {/* 金牌会员标签 */}
              <View style={styles.memberBadge}>
                <FontAwesome6 name="crown" size={12} color="#F59E0B" solid />
                <ThemedText variant="caption" color="#F59E0B" style={{ fontWeight: '600', marginLeft: 4 }}>
                  金牌会员
                </ThemedText>
              </View>

              {/* 遇合ID */}
              <View style={styles.idRow}>
                <ThemedText variant="caption" color={theme.textMuted}>
                  遇合号：{String(userInfo.id).padStart(10, '0')}
                </ThemedText>
                <TouchableOpacity style={styles.copyIdButton}>
                  <FontAwesome6 name="copy" size={10} color={SKY_BLUE} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ========== 数据统计区 ========== */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            {/* 获赞 */}
            <TouchableOpacity style={styles.statItem} onPress={() => handleFeaturePress('获赞')}>
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {userStats.likes}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>获赞</ThemedText>
            </TouchableOpacity>

            {/* 互关 */}
            <TouchableOpacity style={styles.statItem} onPress={() => handleFeaturePress('互关')}>
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {userStats.mutualFollows}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>互关</ThemedText>
            </TouchableOpacity>

            {/* 关注 */}
            <TouchableOpacity style={styles.statItem} onPress={() => handleFeaturePress('关注')}>
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {userStats.following}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>关注</ThemedText>
            </TouchableOpacity>

            {/* 粉丝 */}
            <TouchableOpacity style={styles.statItem} onPress={() => handleFeaturePress('粉丝')}>
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.statNumber}>
                {userStats.followers}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textSecondary}>粉丝</ThemedText>
            </TouchableOpacity>

            {/* 编辑主页按钮 */}
            <TouchableOpacity style={styles.editProfileButton} onPress={() => handleFeaturePress('编辑主页')}>
              <ThemedText variant="caption" color={theme.textPrimary} style={{ fontWeight: '500' }}>
                编辑主页
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* 用户简介 */}
          <TouchableOpacity onPress={() => handleEdit('bio')} style={styles.bioRow}>
            <ThemedText variant="body" color={theme.textPrimary}>
              {userInfo.bio}
            </ThemedText>
          </TouchableOpacity>

          {/* 标签栏 */}
          <View style={styles.tagsRow}>
            <View style={styles.tagItem}>
              <ThemedText variant="caption" color={theme.textSecondary}>山东·烟台</ThemedText>
            </View>
            <View style={styles.tagItem}>
              <ThemedText variant="caption" color={theme.textSecondary}>男·25岁</ThemedText>
            </View>
          </View>
        </View>

        {/* ========== 功能快捷入口区 ========== */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresRow}>
            {features.map((feature) => (
              <TouchableOpacity 
                key={feature.key} 
                style={styles.featureItem}
                onPress={() => handleFeaturePress(feature.name)}
                activeOpacity={0.7}
              >
                <View style={styles.featureIconBg}>
                  <FontAwesome6 name={feature.icon} size={20} color={SKY_BLUE} />
                </View>
                <ThemedText variant="caption" color={theme.textSecondary} style={styles.featureName}>
                  {feature.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* 活动横幅 */}
          <TouchableOpacity style={styles.activityBanner} activeOpacity={0.85}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconBg}>
                <FontAwesome6 name="rocket" size={16} color={SKY_BLUE} />
              </View>
              <View style={styles.bannerText}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  遇合创业季
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  参与活动赢取创业资源
                </ThemedText>
              </View>
            </View>
            <View style={styles.bannerAction}>
              <ThemedText variant="caption" color={SKY_BLUE} style={{ fontWeight: '500' }}>
                去参与
              </ThemedText>
              <FontAwesome6 name="chevron-right" size={12} color={SKY_BLUE} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ========== 内容展示区 ========== */}
        <View style={styles.contentSection}>
          {/* 标签栏 */}
          <View style={styles.tabsRow}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === index && styles.tabItemActive]}
                onPress={() => setActiveTab(index)}
              >
                <ThemedText
                  variant="body"
                  color={activeTab === index ? SKY_BLUE : theme.textSecondary}
                  style={{ fontWeight: activeTab === index ? '600' : '400' }}
                >
                  {tab}
                </ThemedText>
                {activeTab === index && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* 内容列表 */}
          <View style={styles.contentList}>
            {activeTab === 0 ? (
              <>
                {/* 项目卡片网格 */}
                <View style={styles.projectGrid}>
                  {MOCK_PROJECTS.map((project) => (
                    <TouchableOpacity key={project.id} style={styles.projectCard} activeOpacity={0.85}>
                      <Image source={{ uri: project.cover }} style={styles.projectCover} contentFit="cover" />
                      <View style={styles.projectInfo}>
                        <ThemedText variant="body" color={theme.textPrimary} numberOfLines={2} style={{ fontWeight: '500' }}>
                          {project.title}
                        </ThemedText>
                        <View style={styles.projectStats}>
                          <View style={styles.projectStatItem}>
                            <FontAwesome6 name="eye" size={11} color={theme.textMuted} />
                            <ThemedText variant="caption" color={theme.textMuted}>{project.views}</ThemedText>
                          </View>
                          <View style={styles.projectStatItem}>
                            <FontAwesome6 name="heart" size={11} color={theme.textMuted} />
                            <ThemedText variant="caption" color={theme.textMuted}>{project.likes}</ThemedText>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 草稿箱入口 */}
                <TouchableOpacity style={styles.draftBox} activeOpacity={0.7}>
                  <View style={styles.draftIconBg}>
                    <FontAwesome6 name="folder" size={16} color={theme.textMuted} />
                  </View>
                  <ThemedText variant="body" color={theme.textSecondary}>
                    草稿箱
                  </ThemedText>
                  <View style={styles.draftBadge}>
                    <ThemedText variant="caption" color="#FFFFFF">2</ThemedText>
                  </View>
                  <FontAwesome6 name="chevron-right" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyContent}>
                <FontAwesome6 name="inbox" size={40} color={theme.textMuted} />
                <ThemedText variant="body" color={theme.textMuted} style={{ marginTop: 12 }}>
                  暂无内容
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* 底部安全区 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ========== 编辑弹窗 ========== */}
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
                <ThemedText variant="bodyMedium" color="#FFFFFF">确定</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

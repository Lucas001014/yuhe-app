import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  Dimensions, 
  PanResponder, 
  Animated,
  Platform,
  Image as RNImage
} from 'react-native';
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
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 56;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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
  following: number;
  followers: number;
  posts: number;
}

// 示例帖子数据
const MOCK_POSTS = [
  {
    id: 1,
    content: '创业路上，每一个决策都是一次赌博，但我们要做的不是赌徒，而是精算师。',
    likes: 89,
    comments: 12,
    time: '2小时前',
  },
  {
    id: 2,
    content: '团队管理最重要的是建立信任，信任是效率的基石。',
    likes: 156,
    comments: 23,
    time: '5小时前',
  },
  {
    id: 3,
    content: '产品迭代不求快，但求稳。每一次更新都要给用户带来真正的价值。',
    likes: 234,
    comments: 45,
    time: '昨天',
  },
];

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { updateUser } = useAuth();

  useAuthGuard('/profile');

  // 滚动动画值
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 是否已关注
  const [isFollowed, setIsFollowed] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 1,
    username: '张三',
    avatar: 'https://i.pravatar.cc/150?img=68',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    bio: '成为光',
    identity: '创业者',
    verified: true,
    isMerchant: false,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    following: 354,
    followers: 121,
    posts: 28,
  });

  const [activeTab, setActiveTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'username' | 'bio'>('username');
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarPreviewModal, setShowAvatarPreviewModal] = useState(false);
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 动画插值
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // 头像缩放
  const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });

  const avatarTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, SCREEN_WIDTH / 2 - 60],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_MAX_HEIGHT + 70],
    extrapolate: 'clamp',
  });

  // 数据区域透明度和位移
  const statsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const statsTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // 按钮区域透明度和位移
  const buttonsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 收缩后的右侧小图标区域
  const miniBarOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

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
      }
    } catch (error) {
      console.error('修改失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 标签栏
  const tabs = ['帖子', '动态', '喜欢', '收藏'];

  return (
    <Screen backgroundColor="#FFFFFF" statusBarStyle="light">
      <View style={styles.container}>
        {/* 固定顶部导航栏 */}
        <View style={styles.fixedHeader}>
          <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
          
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Animated.Text style={[
              styles.headerTitle,
              { opacity: headerOpacity }
            ]}>
              {userInfo.username}
            </Animated.Text>
            
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
              <FontAwesome6 name="bars" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* 收缩后的右侧迷你栏 */}
          <Animated.View style={[styles.miniBar, { opacity: miniBarOpacity }]}>
            <View style={styles.miniStatsRow}>
              <TouchableOpacity style={styles.miniStatItem}>
                <FontAwesome6 name="user-group" size={14} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.following}</Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniStatItem}>
                <FontAwesome6 name="users" size={14} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.followers}</Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniStatItem}>
                <FontAwesome6 name="file-lines" size={14} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.posts}</Animated.Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.miniButtonsRow}>
              <TouchableOpacity 
                style={[styles.miniButton, isFollowed && styles.miniButtonActive]}
                onPress={() => setIsFollowed(!isFollowed)}
              >
                <FontAwesome6 
                  name={isFollowed ? 'check' : 'plus'} 
                  size={14} 
                  color={isFollowed ? '#666' : '#FFFFFF'} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniButton}>
                <FontAwesome6 name="comment" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* 可滚动内容 */}
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {/* 头部背景图 */}
          <View style={styles.headerImageContainer}>
            {userInfo.backgroundImage ? (
              <Image
                source={{ uri: userInfo.backgroundImage }}
                style={styles.headerImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.headerImage, styles.defaultHeaderBg]} />
            )}
            <View style={styles.headerImageOverlay} />
          </View>

          {/* 头像 - 带动画 */}
          <Animated.View style={[
            styles.avatarWrapper,
            {
              transform: [
                { scale: avatarScale },
                { translateX: avatarTranslateX },
                { translateY: avatarTranslateY },
              ],
            }
          ]}>
            <TouchableOpacity onPress={handleChangeAvatar}>
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} contentFit="cover" />
            </TouchableOpacity>
          </Animated.View>

          {/* 用户名 */}
          <Animated.View style={[
            styles.usernameSection,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }]
            }
          ]}>
            <TouchableOpacity onPress={() => handleEdit('username')} style={styles.usernameRow}>
              <ThemedText variant="h2" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                {userInfo.username}
              </ThemedText>
              <FontAwesome6 name="pen" size={12} color={theme.textMuted} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleEdit('bio')} style={styles.bioRow}>
              <ThemedText variant="body" color={theme.textSecondary}>
                {userInfo.bio}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {/* 数据统计区域 */}
          <Animated.View style={[
            styles.statsSection,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }]
            }
          ]}>
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userStats.following}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>关注</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userStats.followers}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>粉丝</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userStats.posts}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>帖子</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 操作按钮区域 */}
          <Animated.View style={[
            styles.actionButtonsSection,
            { opacity: buttonsOpacity }
          ]}>
            <TouchableOpacity 
              style={[styles.followButton, isFollowed && styles.followedButton]}
              onPress={() => setIsFollowed(!isFollowed)}
              activeOpacity={0.7}
            >
              <FontAwesome6 
                name={isFollowed ? 'check' : 'plus'} 
                size={14} 
                color={isFollowed ? theme.textSecondary : '#FFFFFF'} 
              />
              <ThemedText 
                variant="body" 
                color={isFollowed ? theme.textSecondary : '#FFFFFF'}
                style={{ marginLeft: 6, fontWeight: '500' }}
              >
                {isFollowed ? '已关注' : '关注'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.messageButton} activeOpacity={0.7}>
              <FontAwesome6 name="comment" size={14} color={theme.textPrimary} />
              <ThemedText variant="body" color={theme.textPrimary} style={{ marginLeft: 6, fontWeight: '500' }}>
                私信
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {/* 标签栏 */}
          <View style={styles.tabsSection}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
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
          <View style={styles.contentSection}>
            {activeTab === 0 && MOCK_POSTS.map((post) => (
              <TouchableOpacity key={post.id} style={styles.postCard} activeOpacity={0.85}>
                <ThemedText variant="body" color={theme.textPrimary} style={styles.postContent}>
                  {post.content}
                </ThemedText>
                <View style={styles.postFooter}>
                  <View style={styles.postStat}>
                    <FontAwesome6 name="heart" size={14} color={theme.textMuted} />
                    <ThemedText variant="caption" color={theme.textMuted}>{post.likes}</ThemedText>
                  </View>
                  <View style={styles.postStat}>
                    <FontAwesome6 name="comment" size={14} color={theme.textMuted} />
                    <ThemedText variant="caption" color={theme.textMuted}>{post.comments}</ThemedText>
                  </View>
                  <ThemedText variant="caption" color={theme.textMuted} style={{ marginLeft: 'auto' }}>
                    {post.time}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
            
            {activeTab !== 0 && (
              <View style={styles.emptyContent}>
                <FontAwesome6 name="inbox" size={40} color={theme.textMuted} />
                <ThemedText variant="body" color={theme.textMuted} style={{ marginTop: 12 }}>
                  暂无内容
                </ThemedText>
              </View>
            )}
          </View>

          {/* 底部安全区 */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
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

import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles, SKY_BLUE } from './styles';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 56 + (Platform.OS === 'ios' ? 44 : 20);
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// 示例帖子数据
const MOCK_POSTS = [
  {
    id: 1,
    content: '创业路上，每一个决策都是一次赌博，但我们要做的不是赌徒，而是精算师。风险可控，收益可期。',
    likes: 89,
    comments: 12,
    time: '2小时前',
  },
  {
    id: 2,
    content: '团队管理最重要的是建立信任，信任是效率的基石。没有信任，再好的流程也是空谈。',
    likes: 156,
    comments: 23,
    time: '5小时前',
  },
  {
    id: 3,
    content: '产品迭代不求快，但求稳。每一次更新都要给用户带来真正的价值，而不是为了迭代而迭代。',
    likes: 234,
    comments: 45,
    time: '昨天',
  },
  {
    id: 4,
    content: '融资不是目的，只是手段。不要为了融资而融资，要清楚自己真正需要什么。',
    likes: 312,
    comments: 67,
    time: '2天前',
  },
];

interface UserInfo {
  id: number;
  username: string;
  avatar: string;
  backgroundImage: string;
  bio: string;
  verified: boolean;
}

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ userId?: string; username?: string; avatar?: string }>();

  // 滚动动画值 - 使用 useState 而非 useRef 避免 ESLint 警告
  const [scrollY] = useState(() => new Animated.Value(0));
  
  // 是否已关注
  const [isFollowed, setIsFollowed] = useState(false);

  // 模拟用户数据（实际应从API获取）
  const [userInfo] = useState<UserInfo>({
    id: parseInt(params.userId || '1'),
    username: params.username || '斯文',
    avatar: params.avatar || 'https://i.pravatar.cc/150?img=32',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    bio: '这是一个测试账号',
    verified: true,
  });

  const [userStats] = useState({
    following: 0,
    followers: 1,
    posts: 3,
  });

  const [activeTab, setActiveTab] = useState(0);

  // ========== 动画插值 ==========
  
  // 头部背景高度
  const headerBgHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [200, 0],
    extrapolate: 'clamp',
  });

  // 顶部导航栏背景透明度
  const navBgOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // 头像缩放和位移
  const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.35],
    extrapolate: 'clamp',
  });

  const avatarTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, SCREEN_WIDTH / 2 - 100],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_MAX_HEIGHT + 100],
    extrapolate: 'clamp',
  });

  // 用户名位移
  const usernameTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, SCREEN_WIDTH / 2 - 60],
    extrapolate: 'clamp',
  });

  const usernameTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_MAX_HEIGHT + 130],
    extrapolate: 'clamp',
  });

  const usernameScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  // 数据统计区域透明度和位移
  const statsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const statsTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  // 按钮区域透明度
  const buttonsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 简介区域透明度
  const bioOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 收缩后的迷你栏透明度
  const miniBarOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 标签栏
  const tabs = ['帖子', '动态', '喜欢', '收藏'];

  // 发私信
  const handleSendMessage = () => {
    Alert.alert('提示', '私信功能开发中');
  };

  return (
    <Screen backgroundColor="#FFFFFF" statusBarStyle="light">
      <View style={styles.container}>
        {/* ========== 固定顶部导航栏 ========== */}
        <View style={styles.fixedNav}>
          <Animated.View style={[styles.navBackground, { opacity: navBgOpacity }]} />
          
          <View style={styles.navContent}>
            <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            
            {/* 收缩后显示的用户名 */}
            <Animated.Text style={[
              styles.navTitle,
              { opacity: miniBarOpacity }
            ]}>
              {userInfo.username}
            </Animated.Text>
            
            <TouchableOpacity style={styles.navButton}>
              <FontAwesome6 name="ellipsis" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ========== 收缩后的右侧迷你栏 ========== */}
          <Animated.View style={[styles.miniBar, { opacity: miniBarOpacity }]}>
            {/* 迷你数据统计 */}
            <View style={styles.miniStatsRow}>
              <View style={styles.miniStatItem}>
                <FontAwesome6 name="user-group" size={12} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.following}</Animated.Text>
              </View>
              <View style={styles.miniStatItem}>
                <FontAwesome6 name="users" size={12} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.followers}</Animated.Text>
              </View>
              <View style={styles.miniStatItem}>
                <FontAwesome6 name="file-lines" size={12} color="#666" />
                <Animated.Text style={styles.miniStatText}>{userStats.posts}</Animated.Text>
              </View>
            </View>
            
            {/* 迷你操作按钮 */}
            <View style={styles.miniButtonsRow}>
              <TouchableOpacity 
                style={[styles.miniButton, isFollowed && styles.miniButtonFollowed]}
                onPress={() => setIsFollowed(!isFollowed)}
              >
                <FontAwesome6 
                  name={isFollowed ? 'check' : 'plus'} 
                  size={12} 
                  color={isFollowed ? '#666' : '#FFFFFF'} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniButton} onPress={handleSendMessage}>
                <FontAwesome6 name="comment" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* ========== 可滚动内容 ========== */}
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
          {/* ========== 头部背景图 ========== */}
          <Animated.View style={[styles.headerBg, { height: headerBgHeight }]}>
            <Image
              source={{ uri: userInfo.backgroundImage }}
              style={styles.headerBgImage}
              contentFit="cover"
            />
            <View style={styles.headerBgOverlay} />
          </Animated.View>

          {/* ========== 头像 ========== */}
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
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} contentFit="cover" />
          </Animated.View>

          {/* ========== 用户名 ========== */}
          <Animated.View style={[
            styles.usernameWrapper,
            {
              opacity: Animated.add(statsOpacity, miniBarOpacity),
              transform: [
                { scale: usernameScale },
                { translateX: usernameTranslateX },
                { translateY: usernameTranslateY },
              ],
            }
          ]}>
            <View style={styles.usernameRow}>
              <ThemedText variant="h2" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                {userInfo.username}
              </ThemedText>
              {userInfo.verified && (
                <View style={styles.verifiedBadge}>
                  <FontAwesome6 name="check" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>
          </Animated.View>

          {/* ========== 简介 ========== */}
          <Animated.View style={[styles.bioWrapper, { opacity: bioOpacity }]}>
            <ThemedText variant="body" color={theme.textSecondary}>
              {userInfo.bio}
            </ThemedText>
          </Animated.View>

          {/* ========== 数据统计区域 ========== */}
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

          {/* ========== 操作按钮区域 ========== */}
          <Animated.View style={[styles.actionButtonsSection, { opacity: buttonsOpacity }]}>
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
            
            <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage} activeOpacity={0.7}>
              <FontAwesome6 name="comment" size={14} color={theme.textPrimary} />
              <ThemedText variant="body" color={theme.textPrimary} style={{ marginLeft: 6, fontWeight: '500' }}>
                私信
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {/* ========== 标签栏 ========== */}
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

          {/* ========== 内容列表 ========== */}
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
    </Screen>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);
const NAV_HEIGHT = 44;
const HEADER_HEIGHT = 220;
const AVATAR_SIZE = 80;
const SCROLL_THRESHOLD = HEADER_HEIGHT - 60;

// 天蓝色
const SKY_BLUE = '#38BDF8';

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

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ userId?: string; username?: string; avatar?: string }>();

  // 滚动动画值
  const [scrollY] = useState(() => new Animated.Value(0));
  
  // 是否已关注
  const [isFollowed, setIsFollowed] = useState(false);

  // 模拟用户数据
  const [userInfo] = useState({
    id: parseInt(params.userId || '1'),
    username: params.username || '斯文',
    avatar: params.avatar || 'https://i.pravatar.cc/150?img=32',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    bio: '这是一个测试账号',
    verified: true,
    following: 0,
    followers: 1,
    posts: 3,
  });

  const [activeTab, setActiveTab] = useState(0);

  // ========== 动画插值 ==========
  
  // 导航栏背景透明度
  const navBgOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // 导航栏标题透明度
  const navTitleOpacity = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD * 0.3, SCROLL_THRESHOLD * 0.6],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 头部背景图高度和透明度
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 头像动画
  const avatarScale = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [0, -SCROLL_THRESHOLD + 30],
    extrapolate: 'clamp',
  });

  // 用户信息区透明度
  const infoOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 标签栏
  const tabs = ['帖子', '动态', '喜欢', '收藏'];

  const handleSendMessage = () => {
    Alert.alert('提示', '私信功能开发中');
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ========== 固定顶部导航栏 ========== */}
      <View style={styles.fixedNav}>
        <Animated.View style={[styles.navBackground, { opacity: navBgOpacity }]} />
        
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.navTitle, { opacity: navTitleOpacity }]}>
            {userInfo.username}
          </Animated.Text>
          
          <TouchableOpacity style={styles.navButton}>
            <FontAwesome6 name="ellipsis-vertical" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
        <Animated.View style={[styles.headerBg, { height: headerHeight, opacity: headerOpacity }]}>
          <Image
            source={{ uri: userInfo.backgroundImage }}
            style={styles.headerBgImage}
            contentFit="cover"
          />
        </Animated.View>

        {/* ========== 头像（独立层，不受滚动影响） ========== */}
        <Animated.View style={[
          styles.avatarContainer,
          {
            transform: [
              { scale: avatarScale },
              { translateY: avatarTranslateY },
            ],
          }
        ]}>
          <Image source={{ uri: userInfo.avatar }} style={styles.avatar} contentFit="cover" />
          {userInfo.verified && (
            <View style={styles.verifiedBadge}>
              <FontAwesome6 name="check" size={8} color="#FFFFFF" solid />
            </View>
          )}
        </Animated.View>

        {/* ========== 白色卡片 ========== */}
        <View style={styles.card}>
          {/* 用户信息区 */}
          <Animated.View style={[styles.infoSection, { opacity: infoOpacity }]}>
            {/* 简介 */}
            <ThemedText variant="caption" color={theme.textMuted} style={styles.bio}>
              {userInfo.bio}
            </ThemedText>

            {/* 用户名 */}
            <View style={styles.usernameRow}>
              <ThemedText variant="h2" color={theme.textPrimary} style={{ fontWeight: '700' }}>
                {userInfo.username}
              </ThemedText>
            </View>

            {/* 数据统计 */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userInfo.following}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>关注</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userInfo.followers}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>粉丝</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                  {userInfo.posts}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textSecondary}>帖子</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 操作按钮 */}
            <View style={styles.actionButtons}>
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
                  style={{ marginLeft: 6, fontWeight: '600' }}
                >
                  {isFollowed ? '已关注' : '关注'}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage} activeOpacity={0.7}>
                <FontAwesome6 name="comment" size={14} color={theme.textSecondary} />
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginLeft: 6, fontWeight: '600' }}>
                  私信
                </ThemedText>
              </TouchableOpacity>
            </View>
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
        </View>

        {/* 底部安全区 */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 导航栏
  fixedNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_BAR_HEIGHT + NAV_HEIGHT,
    zIndex: 100,
  },
  navBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1917',
  },

  // 滚动
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // 头部背景
  headerBg: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0F2FE',
  },

  // 头像容器 - 绝对定位，覆盖在背景图和卡片上
  avatarContainer: {
    position: 'absolute',
    top: HEADER_HEIGHT - AVATAR_SIZE / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3F4F6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: SKY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // 白色卡片
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: AVATAR_SIZE / 2 + 16,
  },

  // 用户信息区
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bio: {
    marginBottom: 4,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SKY_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    minWidth: 100,
  },
  followedButton: {
    backgroundColor: '#F3F4F6',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // 标签栏
  tabsSection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: SKY_BLUE,
    borderRadius: 1,
  },

  // 内容
  contentSection: {
    paddingHorizontal: 16,
  },
  postCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postContent: {
    lineHeight: 24,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});

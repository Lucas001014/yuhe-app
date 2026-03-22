import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Alert, Modal, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Image } from 'expo-image';
import { createStyles, createShareMenuStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Post {
  id: number;
  type: string;
  title: string | null;
  content: string;
  images: string[];
  aspectRatio: number;
  author_id: number;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  isLiked: boolean;
  isCollected: boolean;
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const shareMenuStyles = useMemo(() => createShareMenuStyles(theme), [theme]);
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'normal' | 'qa_paid' | 'qa_bounty' | 'product' | 'local'>('normal');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 生成随机宽高比 (0.5~2.0)
  const generateAspectRatio = (): number => {
    return 0.5 + Math.random() * 1.5;
  };

  // 贪心分配算法
  const distributeItems = (items: Post[], columnWidth: number) => {
    const FOOTER_HEIGHT = 120;
    const TEXT_ONLY_HEIGHT = 80; // 纯文字帖子的额外高度
    const columnArrays: Post[][] = Array.from({ length: 2 }, () => []);
    const columnHeights: number[] = [0, 0];

    items.forEach((item) => {
      const hasImage = item.images && item.images.length > 0;
      const imgHeight = hasImage ? columnWidth / item.aspectRatio : 0;
      const totalItemHeight = imgHeight + FOOTER_HEIGHT + (hasImage ? 0 : TEXT_ONLY_HEIGHT);

      const shortestIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      columnArrays[shortestIndex].push(item);
      columnHeights[shortestIndex] += totalItemHeight;
    });

    return columnArrays;
  };

  // 加载帖子列表
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      /**
       * 服务端文件：server/src/routes/posts.ts
       * 接口：GET /api/v1/posts
       * Query 参数：type?: string, userId?: number
       */
      const url = userId
        ? `${API_BASE_URL}/api/v1/posts?userId=${userId}`
        : `${API_BASE_URL}/api/v1/posts`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const processedPosts = data.posts.map((p: any) => {
          return {
            id: p.id,
            type: p.type || 'normal',
            title: p.title,
            content: p.content,
            images: p.images || [],
            aspectRatio: p.aspectRatio || generateAspectRatio(),
            author_id: p.author_id,
            authorName: p.username || p.authorName || '用户',
            authorAvatar: p.avatar || p.authorAvatar || 'https://i.pravatar.cc/150',
            tags: p.tags || [],
            like_count: p.like_count || 0,
            comment_count: p.comment_count || 0,
            share_count: p.share_count || 0,
            created_at: p.created_at,
            isLiked: p.isLiked || false,
            isCollected: p.isCollected || false,
          };
        });
        setPosts(processedPosts);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const tabs = [
    { id: 'normal', label: '推荐' },
    { id: 'qa_paid', label: '知识库' },
    { id: 'qa_bounty', label: '悬赏' },
    { id: 'product', label: '产品' },
    { id: 'local', label: '同城' },
  ];

  // 过滤帖子
  const filteredPosts = useMemo(() => {
    if (activeTab === 'normal') {
      return posts;
    }
    return posts.filter(post => post.type === activeTab);
  }, [posts, activeTab]);

  // 布局常量
  const COLUMNS = 2;
  const GAP = 12;
  const PADDING = 16;
  const COLUMN_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  // 计算列数据
  const columnData = useMemo(() =>
    distributeItems(filteredPosts, COLUMN_WIDTH),
    [filteredPosts, COLUMN_WIDTH]
  );

  // 跳转帖子详情
  const handlePostPress = (post: Post) => {
    router.push('/post-detail', { postId: post.id.toString() });
  };

  // 点赞
  const handleLike = async (post: Post) => {
    if (!currentUserId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      /**
       * 服务端文件：server/src/routes/posts.ts
       * 接口：POST /api/v1/posts/:id/like
       * Body 参数：userId: number, action: 'like' | 'unlike'
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(currentUserId),
          action: post.isLiked ? 'unlike' : 'like'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, isLiked: data.isLiked, like_count: data.likeCount }
            : p
        ));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 转发（显示分享选项弹窗）
  const handleShare = async (post: Post) => {
    if (!currentUserId) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setSharingPost(post);
    setShowShareMenu(true);
  };

  // 分享到微信
  const handleShareToWechat = async () => {
    if (!sharingPost) return;
    setShowShareMenu(false);

    try {
      // 构建分享内容
      const shareContent = `【${sharingPost.title || '分享一个帖子'}】\n${sharingPost.content?.substring(0, 100)}${sharingPost.content && sharingPost.content.length > 100 ? '...' : ''}\n\n来自「遇合」App`;
      
      // 复制内容到剪贴板
      await Clipboard.setStringAsync(shareContent);
      
      Alert.alert(
        '分享到微信',
        '内容已复制到剪贴板\n请打开微信粘贴分享给好友',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '已分享成功', 
            onPress: async () => {
              // 用户确认分享成功后，记录统计
              await recordShare('wechat');
            }
          }
        ]
      );
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('错误', '分享失败');
    }
  };

  // 分享到企业微信
  const handleShareToWework = async () => {
    if (!sharingPost) return;
    setShowShareMenu(false);

    try {
      // 构建分享内容
      const shareContent = `【${sharingPost.title || '分享一个帖子'}】\n${sharingPost.content?.substring(0, 100)}${sharingPost.content && sharingPost.content.length > 100 ? '...' : ''}\n\n来自「遇合」App`;
      
      // 复制内容到剪贴板
      await Clipboard.setStringAsync(shareContent);
      
      Alert.alert(
        '分享到企业微信',
        '内容已复制到剪贴板\n请打开企业微信粘贴分享给好友',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '已分享成功', 
            onPress: async () => {
              // 用户确认分享成功后，记录统计
              await recordShare('wework');
            }
          }
        ]
      );
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('错误', '分享失败');
    }
  };

  // 分享给遇友
  const handleShareToYuhu = () => {
    if (!sharingPost) return;
    setShowShareMenu(false);
    // 跳转到选择好友页面，分享统计在好友选择页面发送成功后记录
    router.push('/share-friends', { postId: sharingPost.id.toString() });
  };

  // 记录分享统计
  const recordShare = async (shareTo: string) => {
    if (!sharingPost || !currentUserId) return;

    try {
      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/share
       * Body 参数：postId: number, userId: number, shareTo?: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: sharingPost.id,
          userId: parseInt(currentUserId),
          shareTo: shareTo
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 更新帖子分享数
        setPosts(posts.map(p =>
          p.id === sharingPost.id
            ? { ...p, share_count: p.share_count + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('记录分享失败:', error);
    }
  };

  // 渲染帖子卡片
  const renderPostCard = (post: Post) => {
    const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;
    const imgHeight = imageUrl ? COLUMN_WIDTH / post.aspectRatio : 0;

    // 点击头像跳转到用户主页
    const handleAvatarPress = () => {
      // 如果是自己，跳转到"我的"页面；否则跳转到用户主页
      if (currentUserId && post.author_id === parseInt(currentUserId)) {
        router.navigate('/profile');
      } else {
        router.push('/user-profile', { userId: post.author_id.toString() });
      }
    };

    return (
      <TouchableOpacity
        key={post.id}
        style={[styles.card, imageUrl ? {} : { position: 'relative' }]}
        onPress={() => handlePostPress(post)}
        activeOpacity={0.9}
      >
        {/* 图片 - 仅当有图片时显示 */}
        {imageUrl && (
          <View style={[styles.imageWrapper, { height: imgHeight }]}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        {/* 内容区域 */}
        <View style={styles.cardContent}>
          <ThemedText variant="body" color={theme.textPrimary} numberOfLines={2} style={styles.cardTitle}>
            {post.title || '无标题'}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textSecondary} numberOfLines={imageUrl ? 2 : 4} style={styles.cardDescription}>
            {post.content}
          </ThemedText>

          {/* 用户头像 - 右下角（可点击） */}
          <TouchableOpacity
            style={styles.authorAvatarContainer}
            onPress={handleAvatarPress}
          >
            <Image
              source={{ uri: post.authorAvatar }}
              style={styles.authorAvatar}
              contentFit="cover"
            />
          </TouchableOpacity>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 2).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <ThemedText variant="caption" color={theme.textSecondary}>
                    #{tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* 底部互动 */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(post)}
            >
              <FontAwesome6
                name="heart"
                size={12}
                color={post.isLiked ? theme.error : theme.textSecondary}
                solid={post.isLiked}
              />
              <ThemedText variant="caption" color={post.isLiked ? theme.error : theme.textMuted}>
                {post.like_count}
              </ThemedText>
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <FontAwesome6 name="comment" size={12} color={theme.textSecondary} />
              <ThemedText variant="caption" color={theme.textMuted}>
                {post.comment_count}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(post)}
            >
              <FontAwesome6 name="share-nodes" size={12} color={theme.textSecondary} />
              <ThemedText variant="caption" color={theme.textMuted}>
                {post.share_count}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* Tab 导航 */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                activeTab === tab.id && styles.tabItemActive
              ]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <ThemedText
                variant="small"
                color={activeTab === tab.id ? theme.primary : theme.textSecondary}
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 瀑布流帖子列表 */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: PADDING }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadPosts}
          />
        }
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="file-lines" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              {loading ? '加载中...' : '暂无帖子'}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.columnsContainer, { gap: GAP }]}>
            {columnData.map((colItems, colIndex) => (
              <View key={colIndex} style={[styles.column, { gap: GAP }]}>
                {colItems.map(post => renderPostCard(post))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 分享选项弹窗 */}
      <Modal
        visible={showShareMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareMenu(false)}
      >
        <Pressable style={shareMenuStyles.menuOverlay} onPress={() => setShowShareMenu(false)}>
          <View style={shareMenuStyles.menuContainer}>
            {/* 分享给遇友 */}
            <TouchableOpacity
              style={shareMenuStyles.menuItem}
              onPress={handleShareToYuhu}
            >
              <View style={[shareMenuStyles.menuIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                <FontAwesome6 name="user-group" size={18} color="#38BDF8" />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>分享给遇友</ThemedText>
            </TouchableOpacity>

            {/* 微信 */}
            <TouchableOpacity
              style={shareMenuStyles.menuItem}
              onPress={handleShareToWechat}
            >
              <View style={[shareMenuStyles.menuIconWrap, { backgroundColor: 'rgba(7, 193, 96, 0.1)' }]}>
                <FontAwesome6 name="weixin" size={18} color="#07C160" brand />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>微信</ThemedText>
            </TouchableOpacity>

            {/* 企业微信 */}
            <TouchableOpacity
              style={shareMenuStyles.menuItem}
              onPress={handleShareToWework}
            >
              <View style={[shareMenuStyles.menuIconWrap, { backgroundColor: 'rgba(43, 126, 255, 0.1)' }]}>
                <FontAwesome6 name="weixin" size={18} color="#2B7EFF" brand />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>企业微信</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Post {
  id: number;
  author_id: number;
  type: string;
  title: string | null;
  content: string;
  images: string[];
  video_url: string | null;
  qa_price: number | null;
  bounty_price: number | null;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  created_at: string;
  username: string;
  avatar_url: string | null;
  is_purchased: boolean;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子列表
  const fetchPosts = useCallback(async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      if (currentUserId) {
        setUserId(parseInt(currentUserId));
      }

      const url = currentUserId
        ? `${API_BASE_URL}/api/v1/posts?userId=${currentUserId}`
        : `${API_BASE_URL}/api/v1/posts`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // 获取帖子类型标签
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'qa_paid':
        return '付费问答';
      case 'qa_bounty':
        return '悬赏求助';
      case 'product':
        return '产品推广';
      default:
        return '普通帖子';
    }
  };

  // 点赞
  const handleLike = async (postId: number, isLiked: boolean) => {
    if (!userId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: isLiked ? 'unlike' : 'like'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !isLiked,
              like_count: isLiked ? post.like_count - 1 : post.like_count + 1
            };
          }
          return post;
        }));
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 渲染帖子卡片
  const renderPostCard = (post: Post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      onPress={() => router.push('/post-detail', { postId: post.id })}
    >
      {/* 用户信息 */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <ThemedText variant="body" color={theme.buttonPrimaryText}>
              {post.username?.[0] || 'U'}
            </ThemedText>
          </View>
          <View>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>
              {post.username}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {new Date(post.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
        <View style={[
          styles.typeBadge,
          { backgroundColor: post.type === 'qa_paid' || post.type === 'qa_bounty'
            ? `${theme.primary}20`
            : theme.backgroundTertiary }
        ]}>
          <ThemedText variant="caption" color={post.type === 'qa_paid' || post.type === 'qa_bounty'
            ? theme.primary
            : theme.textSecondary}>
            {getPostTypeLabel(post.type)}
          </ThemedText>
        </View>
      </View>

      {/* 帖子内容 */}
      {post.title && (
        <ThemedText variant="h4" color={theme.textPrimary} style={styles.postTitle}>
          {post.title}
        </ThemedText>
      )}

      <ThemedText variant="body" color={theme.textSecondary} style={styles.postContent} numberOfLines={4}>
        {post.type === 'qa_paid' && !post.is_purchased && post.author_id !== userId
          ? '付费内容，购买后查看完整内容'
          : post.content}
      </ThemedText>

      {/* 价格标签 */}
      {post.qa_price && !post.is_purchased && post.author_id !== userId && (
        <View style={styles.priceBadge}>
          <ThemedText variant="small" color={theme.primary}>
            💰 ¥{post.qa_price.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {post.bounty_price && post.status !== 'resolved' && (
        <View style={styles.priceBadge}>
          <ThemedText variant="small" color={theme.accent}>
            🏆 悬赏 ¥{post.bounty_price.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {/* 图片 */}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {post.images.map((imageUrl, index) => (
            <View key={index} style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <FontAwesome6 name="image" size={32} color={theme.textMuted} />
                <ThemedText variant="caption" color={theme.textMuted} style={styles.imageText}>
                  图片 {index + 1}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <ThemedText variant="caption" color={theme.textSecondary}>
                #{tag}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* 底部操作栏 */}
      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id, post.is_liked)}
        >
          <FontAwesome6
            name={post.is_liked ? 'heart' : 'heart'}
            size={16}
            color={post.is_liked ? theme.primary : theme.textMuted}
            solid={post.is_liked}
          />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.like_count || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome6 name="comment" size={16} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.comment_count || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome6 name="eye" size={16} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.view_count || 0}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部标签栏 */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <ThemedText variant="bodyMedium" color={theme.primary}>推荐</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <ThemedText variant="body" color={theme.textSecondary}>关注</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <ThemedText variant="body" color={theme.textSecondary}>热榜</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 帖子列表 */}
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无帖子，快来发布第一条内容吧
            </ThemedText>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {posts.map(renderPostCard)}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

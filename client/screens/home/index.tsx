import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  type: 'free' | 'paid' | 'bounty';
  category: string;
  tags: string[];
  images?: string[];
  price?: number;
  status: 'published';
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  forwardCount: number;
  collectCount: number;
  isLiked: boolean;
  isCollected: boolean;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { width } = Dimensions.get('window');
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);
  const router = useSafeRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

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
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: data.isLiked,
              likeCount: data.likeCount,
            };
          }
          return post;
        }));
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 收藏
  const handleCollect = async (postId: number, isCollected: boolean) => {
    if (!userId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isCollected: data.isCollected,
              collectCount: data.collectCount,
            };
          }
          return post;
        }));
        Alert.alert('成功', data.message);
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 转发（复制链接）
  const handleForward = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/forward`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        await Clipboard.setStringAsync(data.shareUrl);
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              forwardCount: data.forwardCount,
            };
          }
          return post;
        }));
        Alert.alert('成功', '链接已复制到剪贴板');
      }
    } catch (error) {
      Alert.alert('错误', '转发失败');
    }
  };

  // 打开评论
  const openComments = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setCurrentPostId(postId);
        setCommentModalVisible(true);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  // 发表评论
  const submitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('提示', '请输入评论内容');
      return;
    }

    if (!userId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${currentPostId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username: '用户' + userId,
          avatar: 'https://i.pravatar.cc/150?img=' + (userId % 10 + 1),
          content: commentText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setCommentText('');
        setPosts(posts.map(post => {
          if (post.id === currentPostId) {
            return {
              ...post,
              commentCount: data.commentCount,
            };
          }
          return post;
        }));
      }
    } catch (error) {
      Alert.alert('错误', '评论失败');
    }
  };

  // 获取帖子类型标签
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'paid':
        return '付费';
      case 'bounty':
        return '悬赏';
      default:
        return '免费';
    }
  };

  // 渲染帖子卡片
  const renderPostCard = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* 用户信息 */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
          <View>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>
              {post.authorName}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {new Date(post.createdAt).toLocaleDateString()} · {post.category}
            </ThemedText>
          </View>
        </View>
        <View style={[
          styles.typeBadge,
          { backgroundColor: post.type === 'paid' || post.type === 'bounty'
            ? `${theme.primary}20`
            : `${theme.success}20` }
        ]}>
          <ThemedText variant="caption" color={post.type === 'paid' || post.type === 'bounty'
            ? theme.primary
            : theme.success}>
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
        {post.content}
      </ThemedText>

      {/* 价格标签 */}
      {post.price && (
        <View style={styles.priceBadge}>
          <ThemedText variant="small" color={theme.primary}>
            💰 ¥{post.price}
          </ThemedText>
        </View>
      )}

      {/* 图片 */}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {post.images.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.postImage}
              contentFit="cover"
            />
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
          onPress={() => handleLike(post.id, post.isLiked)}
        >
          <FontAwesome6
            name={post.isLiked ? 'heart' : 'heart'}
            size={16}
            color={post.isLiked ? theme.primary : theme.textMuted}
            solid={post.isLiked}
          />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.likeCount || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openComments(post.id)}
        >
          <FontAwesome6 name="comment" size={16} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.commentCount || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCollect(post.id, post.isCollected)}
        >
          <FontAwesome6
            name="bookmark"
            size={16}
            color={post.isCollected ? theme.warning : theme.textMuted}
            solid={post.isCollected}
          />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.collectCount || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleForward(post.id)}
        >
          <FontAwesome6 name="share-nodes" size={16} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.forwardCount || 0}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome6 name="eye" size={16} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
            {post.viewCount || 0}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部标签栏 */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
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

      {/* 评论弹窗 */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>评论 ({comments.length})</ThemedText>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <ThemedText variant="smallMedium" color={theme.textPrimary}>
                      {comment.username}
                    </ThemedText>
                    <ThemedText variant="body" color={theme.textSecondary} style={styles.commentText}>
                      {comment.content}
                    </ThemedText>
                    <View style={styles.commentActions}>
                      <ThemedText variant="caption" color={theme.textMuted}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </ThemedText>
                      <TouchableOpacity style={styles.commentLike}>
                        <FontAwesome6 name="heart" size={12} color={theme.textMuted} />
                        <ThemedText variant="caption" color={theme.textMuted}>
                          {comment.likeCount}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                placeholder="说点什么..."
                placeholderTextColor={theme.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: theme.primary }]}
                onPress={submitComment}
              >
                <FontAwesome6 name="paper-plane" size={16} color={theme.buttonPrimaryText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

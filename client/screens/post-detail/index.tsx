import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Comment {
  id: number;
  author_id: number;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  isMerchant: boolean;
  type: string;
  title: string | null;
  content: string;
  images: string[];
  videoUrl: string | null;
  price: number | null;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  isCollected: boolean;
  isFollowing: boolean;
  isPurchased: boolean;
  comments: any[];
  virtualResources?: any[];
}

export default function PostDetailScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { postId } = useSafeSearchParams<{ postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子详情
  const loadPostDetail = useCallback(async () => {
    if (!postId) return;

    try {
      const userId = await AsyncStorage.getItem('userId');

      const url = userId
        ? `${API_BASE_URL}/api/v1/posts/${postId}?userId=${userId}`
        : `${API_BASE_URL}/api/v1/posts/${postId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
      }
    } catch (error) {
      console.error('加载帖子详情失败:', error);
    }
  }, [postId, API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPostDetail();
    }, [loadPostDetail])
  );

  // 点赞
  const handleLike = async () => {
    if (!post) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          action: post.isLiked ? 'unlike' : 'like'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPost({
          ...post,
          isLiked: !post.isLiked,
          likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
        });
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 关注用户
  const handleFollow = async () => {
    if (!post) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.authorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: parseInt(userId),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPost({
          ...post,
          isFollowing: !post.isFollowing,
        });
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 购买付费内容
  const handlePurchase = async () => {
    if (!post) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      Alert.alert(
        '确认购买',
        `确定支付 ¥${post.price?.toFixed(2)} 购买此内容吗？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/api/v1/transactions/qa-purchase`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: parseInt(userId),
                    postId: post.id,
                  }),
                });

                const data = await response.json();
                if (data.success) {
                  Alert.alert('成功', '购买成功');
                  loadPostDetail();
                } else {
                  Alert.alert('失败', data.error || '购买失败');
                }
              } catch (error) {
                Alert.alert('错误', '网络请求失败');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!post || !comment.trim()) {
      Alert.alert('提示', '请输入评论内容');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          content: comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setComment('');
        loadPostDetail();
      } else {
        Alert.alert('失败', data.error || '评论失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

  if (!post) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* 顶部导航 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>
              帖子详情
            </ThemedText>
            <TouchableOpacity>
              <FontAwesome6 name="ellipsis" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 作者信息 */}
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: post.authorAvatar }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  {post.authorName}
                  {post.isMerchant && (
                    <ThemedText variant="caption" color={theme.primary}>
                      {' '}商家
                    </ThemedText>
                  )}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {new Date(post.createdAt).toLocaleString()}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  post.isFollowing && styles.followButtonFollowing
                ]}
                onPress={handleFollow}
              >
                <ThemedText
                  variant="small"
                  color={post.isFollowing ? theme.textPrimary : theme.buttonPrimaryText}
                >
                  {post.isFollowing ? '已关注' : '+ 关注'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* 帖子标题和内容 */}
            {post.title && (
              <ThemedText variant="h3" color={theme.textPrimary} style={styles.title}>
                {post.title}
              </ThemedText>
            )}

            <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
              {post.price && post.price > 0 && !post.isPurchased
                ? '付费内容，购买后查看完整内容'
                : post.content}
            </ThemedText>

            {/* 价格标签 */}
            {post.price && post.price > 0 && !post.isPurchased && (
              <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  💰 购买查看 - ¥{post.price.toFixed(2)}
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* 图片 */}
            {post.images && post.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {post.images.map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={styles.postImage}
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

            {/* 统计信息 */}
            <View style={styles.statsRow}>
              {post.viewCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome6 name="eye" size={14} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {post.viewCount}
                  </ThemedText>
                </View>
              )}
              {post.likeCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome6 name="heart" size={14} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {post.likeCount}
                  </ThemedText>
                </View>
              )}
              {post.commentCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome6 name="comment" size={14} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {post.commentCount}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* 操作按钮 */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLike}
              >
                <FontAwesome6
                  name={post.isLiked ? 'heart' : 'heart'}
                  size={20}
                  color={post.isLiked ? theme.primary : theme.textMuted}
                  solid={post.isLiked}
                />
                {post.likeCount > 0 && (
                  <ThemedText
                    variant="small"
                    color={post.isLiked ? theme.primary : theme.textMuted}
                  >
                    {post.likeCount}
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome6 name="share-nodes" size={20} color={theme.textMuted} />
                <ThemedText variant="small" color={theme.textMuted}>转发</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome6 name="bookmark" size={20} color={post.isCollected ? theme.primary : theme.textMuted} solid={post.isCollected} />
                <ThemedText variant="small" color={post.isCollected ? theme.primary : theme.textMuted}>收藏</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 评论区 */}
            <View style={styles.commentsSection}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                {post.commentCount > 0 ? `评论 (${post.commentCount})` : '评论'}
              </ThemedText>

              {!post.comments || post.comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <ThemedText variant="body" color={theme.textMuted}>
                    暂无评论，快来抢沙发吧
                  </ThemedText>
                </View>
              ) : (
                post.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{ uri: comment.avatar }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                        {comment.username}
                      </ThemedText>
                      <ThemedText variant="body" color={theme.textSecondary}>
                        {comment.content}
                      </ThemedText>
                      <View style={styles.commentMeta}>
                        <ThemedText variant="caption" color={theme.textMuted}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </ThemedText>
                        {comment.likeCount > 0 && (
                          <>
                            <FontAwesome6 name="heart" size={12} color={theme.textMuted} />
                            <ThemedText variant="caption" color={theme.textMuted}>
                              {comment.likeCount}
                            </ThemedText>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* 评论输入框 */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[styles.commentInput, { color: theme.textPrimary }]}
              placeholder="写评论..."
              placeholderTextColor={theme.textMuted}
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!comment.trim()}
            >
              <FontAwesome6 name="paper-plane" size={20} color={theme.buttonPrimaryText} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

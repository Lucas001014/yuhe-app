import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles, getCardWidth } from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  isMerchant: boolean;
  type: 'normal' | 'paid_qa' | 'bounty' | 'product';
  contentType: 'text' | 'image' | 'video' | 'mixed';
  category: string;
  tags: string[];
  images?: string[];
  videoUrl?: string;
  virtualResources?: VirtualResource[];
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
  isPurchased?: boolean;
  aspectRatio?: number;
}

interface VirtualResource {
  id: number;
  name: string;
  description: string;
  fileSize: string;
  downloadUrl: string;
  price: number;
  fileType: string;
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

export function NormalTab() {
  const { theme } = useTheme();
  const { width } = Dimensions.get('window');
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);
  const router = useSafeRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMerchant, setIsMerchant] = useState<boolean>(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子列表（仅普通帖子）
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem('userId');
        const merchantStatus = await AsyncStorage.getItem('isMerchant');
        if (currentUserId) {
          setUserId(parseInt(currentUserId));
        }
        if (merchantStatus) {
          setIsMerchant(merchantStatus === 'true');
        }

        let url = `${API_BASE_URL}/api/v1/posts?type=normal`;
        const params = new URLSearchParams();

        if (currentUserId) {
          params.append('userId', currentUserId);
        }

        if (params.toString()) {
          url += '&' + params.toString();
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('获取帖子列表失败:', error);
      }
    };

    fetchPosts();
  }, [API_BASE_URL]);

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
              commentCount: post.commentCount + 1,
            };
          }
          return post;
        }));
      }
    } catch (error) {
      Alert.alert('错误', '评论失败');
    }
  };

  // 点击帖子卡片
  const handlePostPress = (post: Post) => {
    router.push('/post-detail', { postId: post.id });
  };

  // 分配帖子到左右两列（瀑布流）
  const masonryColumns = useMemo(() => {
    if (posts.length === 0) return { left: [], right: [] };

    const gap = 12;
    const padding = 16;
    const cardWidth = getCardWidth(width);

    const leftColumn: Post[] = [];
    const rightColumn: Post[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    posts.forEach(post => {
      const aspectRatio = post.aspectRatio || 1;
      const imageHeight = cardWidth / aspectRatio;
      const cardHeight = imageHeight + 72;

      if (leftHeight <= rightHeight) {
        leftColumn.push(post);
        leftHeight += cardHeight + gap;
      } else {
        rightColumn.push(post);
        rightHeight += cardHeight + gap;
      }
    });

    return { left: leftColumn, right: rightColumn };
  }, [posts, width]);

  // 渲染帖子卡片
  const renderPostCard = (post: Post) => {
    return (
      <TouchableOpacity
        key={post.id}
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handlePostPress(post)}
      >
        {post.images && post.images.length > 0 && (
          <Image
            source={{ uri: post.images[0] }}
            style={[styles.cardImage, { aspectRatio: post.aspectRatio || 1 }]}
            contentFit="cover"
          />
        )}

        <ThemedView style={styles.cardContent} level="default">
          <ThemedText variant="bodyMedium" numberOfLines={2} style={styles.cardTitle}>
            {post.title}
          </ThemedText>

          <View style={styles.cardFooter}>
            <View style={styles.author}>
              <Image
                source={{ uri: post.authorAvatar }}
                style={styles.authorAvatar}
                contentFit="cover"
              />
              <ThemedText variant="caption" color={theme.textSecondary} numberOfLines={1}>
                {post.authorName}
              </ThemedText>
            </View>

            <View style={styles.stats}>
              {post.likeCount > 0 && (
                <>
                  <FontAwesome6 name="heart" size={12} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted} style={styles.statText}>
                    {post.likeCount}
                  </ThemedText>
                </>
              )}
              {post.commentCount > 0 && (
                <>
                  <FontAwesome6 name="comment" size={12} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted} style={styles.statText}>
                    {post.commentCount}
                  </ThemedText>
                </>
              )}
            </View>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.masonryContainer}>
        <View style={styles.masonryColumn}>
          {masonryColumns.left.map(post => renderPostCard(post))}
        </View>
        <View style={styles.masonryColumn}>
          {masonryColumns.right.map(post => renderPostCard(post))}
        </View>
      </View>

      {/* 评论Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentModal}>
          <ThemedView style={styles.commentContainer} level="default">
            <View style={styles.commentHeader}>
              <ThemedText variant="h3">评论</ThemedText>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>关闭</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentList}>
              {comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{ uri: comment.avatar }}
                    style={styles.commentAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.commentContent}>
                    <ThemedText variant="caption" color={theme.textPrimary} style={styles.commentUser}>
                      {comment.username}
                    </ThemedText>
                    <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                      {comment.content}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="发表评论..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.commentSubmit, { backgroundColor: theme.primary }]}
                onPress={submitComment}
              >
                <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>发送</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

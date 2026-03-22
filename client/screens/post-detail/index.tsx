import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Modal, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Comment {
  id: number;
  postId: number;
  authorId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  username: string;
  avatarUrl: string;
}

interface Post {
  id: number;
  author_id: number;
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
  shareCount: number;
  collectCount: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  isCollected: boolean;
  isFollowing: boolean;
}

export default function PostDetailScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { postId } = useSafeSearchParams<{ postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子详情和评论
  const loadData = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');

      // 并行获取帖子详情和评论
      const [postResponse, commentsResponse] = await Promise.all([
        fetch(userId
          ? `${API_BASE_URL}/api/v1/posts/${postId}?userId=${userId}`
          : `${API_BASE_URL}/api/v1/posts/${postId}`
        ),
        fetch(`${API_BASE_URL}/api/v1/social/comments/${postId}`)
      ]);

      const postData = await postResponse.json();
      const commentsData = await commentsResponse.json();

      if (postData.success) {
        const p = postData.post;
        // 获取作者信息
        const authorResponse = await fetch(`${API_BASE_URL}/api/v1/social/user/${p.author_id}?currentUserId=${userId || 0}`);
        const authorData = await authorResponse.json();

        setPost({
          ...p,
          authorId: p.author_id,
          authorName: authorData.success ? authorData.user.username : '匿名用户',
          authorAvatar: authorData.success ? authorData.user.avatarUrl : 'https://i.pravatar.cc/150',
          isFollowing: authorData.success ? authorData.user.isFollowing : false,
          likeCount: p.like_count || 0,
          commentCount: p.comment_count || 0,
          shareCount: p.share_count || 0,
          collectCount: p.collect_count || 0,
          viewCount: p.view_count || 0,
        });
      }

      if (commentsData.success) {
        setComments(commentsData.comments);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
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

      /**
       * 服务端文件：server/src/routes/posts.ts
       * 接口：POST /api/v1/posts/:id/like
       * Body 参数：userId: number, username?: string
       */
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
          isLiked: data.isLiked,
          likeCount: data.likeCount
        });
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 收藏
  const handleCollect = async () => {
    if (!post) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId) }),
      });

      const data = await response.json();
      if (data.success) {
        setPost({
          ...post,
          isCollected: data.isCollected,
          collectCount: data.collectCount
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

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/follow
       * Body 参数：currentUserId: number, targetUserId: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: parseInt(userId),
          targetUserId: post.author_id || post.authorId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPost({
          ...post,
          isFollowing: data.isFollowing,
        });
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 转发
  const handleShare = async () => {
    if (!post) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/share
       * Body 参数：postId: number, userId: number, shareTo?: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: parseInt(userId),
          shareTo: 'timeline'
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '转发成功');
        setPost({
          ...post,
          shareCount: post.shareCount + 1
        });
      }
    } catch (error) {
      Alert.alert('错误', '转发失败');
    }
  };

  // 保存内容到本地
  const handleSaveContent = async () => {
    if (!post) return;
    try {
      // 这里可以调用原生存储API保存帖子内容
      Alert.alert('成功', '内容已保存到本地');
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  // 转发到好友私信
  const handleShareToFriend = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/share
       * Body 参数：postId: number, userId: number, shareTo?: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: parseInt(userId),
          shareTo: 'friend'
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '已转发到好友私信');
        setPost({
          ...post,
          shareCount: post.shareCount + 1
        });
      }
    } catch (error) {
      Alert.alert('错误', '转发失败');
    }
  };

  // 转发到朋友圈
  const handleShareToMoments = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/social/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: parseInt(userId),
          shareTo: 'moments'
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '已转发到朋友圈');
        setPost({
          ...post,
          shareCount: post.shareCount + 1
        });
      }
    } catch (error) {
      Alert.alert('错误', '转发失败');
    }
  };

  // 转发到微信（使用系统分享）
  const handleShareToWechat = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      // 构建分享内容
      const shareContent = `【${post.title || '分享一个帖子'}】\n${post.content?.substring(0, 100)}${post.content && post.content.length > 100 ? '...' : ''}\n\n来自「遇合」App`;
      
      // 复制内容到剪贴板
      await Clipboard.setStringAsync(shareContent);
      
      // 显示分享确认对话框
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

  // 转发到企业微信
  const handleShareToWework = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      // 构建分享内容
      const shareContent = `【${post.title || '分享一个帖子'}】\n${post.content?.substring(0, 100)}${post.content && post.content.length > 100 ? '...' : ''}\n\n来自「遇合」App`;
      
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

  // 分享给遇友（跳转到好友选择页面，不立即记录统计）
  const handleShareToYuhu = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      // 跳转到选择好友页面，分享统计在好友选择页面发送成功后记录
      router.push('/share-friends', { postId: post.id.toString() });
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('错误', '分享失败');
    }
  };

  // 记录分享统计（分享成功后调用）
  const recordShare = async (shareTo: string) => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/share
       * Body 参数：postId: number, userId: number, shareTo?: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: parseInt(userId),
          shareTo: shareTo
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 更新本地分享计数
        setPost({
          ...post,
          shareCount: post.shareCount + 1
        });
        Alert.alert('成功', '分享成功');
      }
    } catch (error) {
      console.error('记录分享失败:', error);
    }
  };

  // 投诉帖子
  const handleReport = () => {
    if (!post) return;
    Alert.alert(
      '投诉',
      '请选择投诉原因',
      [
        { text: '取消', style: 'cancel' },
        { text: '虚假信息', onPress: () => submitReport('fake') },
        { text: '内容不当', onPress: () => submitReport('inappropriate') },
        { text: '侵权', onPress: () => submitReport('copyright') },
        { text: '其他', onPress: () => submitReport('other') },
      ]
    );
  };

  // 提交投诉
  const submitReport = async (reason: string) => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/posts.ts
       * 接口：POST /api/v1/posts/:id/report
       * Body 参数：userId: number, reason: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          reason
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '投诉已提交，我们会尽快处理');
      }
    } catch (error) {
      Alert.alert('错误', '投诉失败');
    }
  };

  // 屏蔽用户
  const handleBlock = () => {
    if (!post) return;
    Alert.alert(
      '屏蔽用户',
      `确定要屏蔽 ${post.authorName} 吗？屏蔽后将不再看到该用户的帖子。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确定屏蔽', style: 'destructive', onPress: submitBlock },
      ]
    );
  };

  // 提交屏蔽
  const submitBlock = async () => {
    if (!post) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/block
       * Body 参数：currentUserId: number, targetUserId: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: parseInt(userId),
          targetUserId: post.author_id || post.authorId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '已屏蔽该用户');
        router.back();
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!post || !comment.trim()) {
      Alert.alert('提示', '请输入评论内容');
      return;
    }

    try {
      setSubmitting(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/comments
       * Body 参数：postId: number, userId: number, content: string, parentId?: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: parseInt(userId),
          content: comment.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setComment('');
        setComments([data.comment, ...comments]);
        setPost({
          ...post,
          commentCount: post.commentCount + 1
        });
      } else {
        Alert.alert('失败', data.error || '评论失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 跳转用户主页
  const goToUserProfile = () => {
    if (!post) return;
    router.push('/user-profile', { userId: post.author_id || post.authorId });
  };

  // 跳转私信
  const goToChat = () => {
    if (!post) return;
    router.push('/chat', { 
      userId: post.author_id || post.authorId,
      username: post.authorName,
      avatar: post.authorAvatar
    });
  };

  // 渲染评论项
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.avatarUrl }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <ThemedText variant="smallMedium" color={theme.textPrimary}>
          {item.username}
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary}>
          {item.content}
        </ThemedText>
        <View style={styles.commentMeta}>
          <ThemedText variant="caption" color={theme.textMuted}>
            {formatTime(item.createdAt)}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color={theme.textMuted}>帖子不存在</ThemedText>
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
            <TouchableOpacity onPress={() => setShowMoreMenu(true)}>
              <FontAwesome6 name="ellipsis" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 作者信息 */}
            <TouchableOpacity style={styles.authorInfo} onPress={goToUserProfile}>
              <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
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
                  {formatTime(post.createdAt)} · {post.viewCount} 次浏览
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
            </TouchableOpacity>

            {/* 标题 */}
            {post.title && (
              <View style={styles.title}>
                <ThemedText variant="h3" color={theme.textPrimary}>
                  {post.title}
                </ThemedText>
              </View>
            )}

            {/* 内容 */}
            <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
              {post.content}
            </ThemedText>

            {/* 图片 */}
            {post.images && post.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {post.images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
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
                    <ThemedText variant="caption" color={theme.textMuted}>#{tag}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* 操作按钮 */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <FontAwesome6
                  name={post.isLiked ? 'heart' : 'heart'}
                  size={20}
                  color={post.isLiked ? theme.error : theme.textMuted}
                  solid={post.isLiked}
                />
                <ThemedText variant="small" color={post.isLiked ? theme.error : theme.textMuted}>
                  {post.isLiked ? '已赞' : '点赞'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleCollect}>
                <FontAwesome6
                  name={post.isCollected ? 'bookmark' : 'bookmark'}
                  size={20}
                  color={post.isCollected ? theme.primary : theme.textMuted}
                  solid={post.isCollected}
                />
                <ThemedText variant="small" color={post.isCollected ? theme.primary : theme.textMuted}>
                  {post.isCollected ? '已收藏' : '收藏'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={goToChat}>
                <FontAwesome6 name="message" size={20} color={theme.textMuted} />
                <ThemedText variant="small" color={theme.textMuted}>私信</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 评论区域 */}
            <View style={styles.commentsSection}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                评论 ({post.commentCount})
              </ThemedText>

              {comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <ThemedText variant="body" color={theme.textMuted}>暂无评论，快来抢沙发吧~</ThemedText>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          </ScrollView>

          {/* 底部评论输入框 */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="说点什么..."
              placeholderTextColor={theme.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, submitting && { opacity: 0.5 }]}
              onPress={handleSubmitComment}
              disabled={submitting}
            >
              <FontAwesome6 name="paper-plane" size={16} color={theme.buttonPrimaryText} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 右上角更多菜单 */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowMoreMenu(false)}>
          <View style={styles.menuContainer}>
            {/* 分享给遇友 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleShareToYuhu();
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                <FontAwesome6 name="user-group" size={18} color="#38BDF8" />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>分享给遇友</ThemedText>
            </TouchableOpacity>

            {/* 微信 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleShareToWechat();
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(7, 193, 96, 0.1)' }]}>
                <FontAwesome6 name="weixin" size={18} color="#07C160" brand />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>微信</ThemedText>
            </TouchableOpacity>

            {/* 企业微信 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleShareToWework();
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(43, 126, 255, 0.1)' }]}>
                <FontAwesome6 name="weixin" size={18} color="#2B7EFF" brand />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>企业微信</ThemedText>
            </TouchableOpacity>

            {/* 分隔线 */}
            <View style={styles.menuDivider} />

            {/* 投诉 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleReport();
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <FontAwesome6 name="triangle-exclamation" size={18} color="#F97316" />
              </View>
              <ThemedText variant="body" color={theme.textPrimary}>投诉</ThemedText>
            </TouchableOpacity>

            {/* 屏蔽 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleBlock();
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <FontAwesome6 name="ban" size={18} color="#EF4444" />
              </View>
              <ThemedText variant="body" color="#EF4444">屏蔽</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

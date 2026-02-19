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
import { createStyles, getCardWidth } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  isMerchant: boolean; // 是否为商家
  type: 'free' | 'paid' | 'bounty';
  contentType: 'text' | 'image' | 'video' | 'mixed'; // 内容类型
  category: string;
  tags: string[];
  images?: string[];
  videoUrl?: string; // 视频URL
  virtualResources?: VirtualResource[]; // 虚拟资料
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
  isPurchased?: boolean; // 是否已购买
  aspectRatio?: number; // 宽高比（用于瀑布流布局）
}

interface VirtualResource {
  id: number;
  name: string;
  description: string;
  fileSize: string;
  downloadUrl: string;
  price: number;
  fileType: string; // pdf, doc, zip等
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
  const [isMerchant, setIsMerchant] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('全部'); // 当前标签（类别）
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // 帖子类别导航
  const categories = [
    '全部', '产品心得', '融资经验', '运营推广', '团队管理',
    '技术分享', '市场营销', '商业模式', '创业故事', '行业洞察', '工具推荐'
  ];

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
      const aspectRatio = post.aspectRatio || 1; // 默认 1:1
      const imageHeight = cardWidth / aspectRatio;
      const cardHeight = imageHeight + 72; // 72 = 内容区域高度

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

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子列表
  const fetchPosts = useCallback(async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      const merchantStatus = await AsyncStorage.getItem('isMerchant');
      if (currentUserId) {
        setUserId(parseInt(currentUserId));
      }
      if (merchantStatus) {
        setIsMerchant(merchantStatus === 'true');
      }

      // 根据类别构建请求参数
      let url = `${API_BASE_URL}/api/v1/posts`;
      const params = new URLSearchParams();

      if (currentUserId) {
        params.append('userId', currentUserId);
      }

      // 根据类别筛选（不是"全部"时才筛选）
      if (activeTab !== '全部') {
        params.append('category', activeTab);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
    }
  }, [API_BASE_URL, activeTab]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts, activeTab])
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

  // 购买虚拟资料
  const handleBuyResource = async (postId: number, resourceId: number, price: number) => {
    if (!userId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    Alert.alert(
      '确认购买',
      `该资源价格为 ¥${price}，确认购买吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/resources/${resourceId}/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '购买成功，可以开始下载了');
                // 更新帖子状态
                setPosts(posts.map(post => {
                  if (post.id === postId) {
                    return {
                      ...post,
                      isPurchased: true,
                    };
                  }
                  return post;
                }));
              } else {
                Alert.alert('失败', data.error || '购买失败');
              }
            } catch (error) {
              Alert.alert('错误', '购买失败');
            }
          },
        },
      ]
    );
  };

  // 下载虚拟资料
  const handleDownloadResource = async (postId: number, resourceId: number) => {
    if (!userId) {
      Alert.alert('提示', '请先登录');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/resources/${resourceId}/download?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // 在实际应用中，这里会触发文件下载
        Alert.alert('下载中', `正在下载: ${data.resourceName}`);
      } else {
        Alert.alert('失败', data.error || '下载失败');
      }
    } catch (error) {
      Alert.alert('错误', '下载失败');
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

  // 渲染瀑布流帖子卡片
  const renderMasonryCard = (post: Post, cardWidth: number) => {
    const aspectRatio = post.aspectRatio || 1; // 默认 1:1
    const imageHeight = cardWidth / aspectRatio;

    return (
      <TouchableOpacity
        key={post.id}
        style={styles.masonryCard}
        onPress={() => router.push('/post', { id: post.id })}
      >
        {/* 图片区域 */}
        <View style={[styles.masonryImageContainer, { height: imageHeight }]}>
          {post.images && post.images.length > 0 ? (
            <Image
              source={{ uri: post.images[0] }}
              style={styles.masonryImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.masonryImage, styles.masonryImagePlaceholder]}>
              <FontAwesome6 name="image" size={32} color={theme.textMuted} />
            </View>
          )}

          {/* 视频标识 */}
          {post.contentType === 'video' && (
            <View style={styles.videoIcon}>
              <FontAwesome6 name="play" size={16} color="#fff" />
            </View>
          )}

          {/* 类型标签 */}
          <View style={[
            styles.masonryTypeBadge,
            { backgroundColor: post.type === 'paid' || post.type === 'bounty'
              ? `${theme.primary}CC`
              : `${theme.success}CC` }
          ]}>
            <ThemedText variant="caption" color="#fff">
              {getPostTypeLabel(post.type)}
            </ThemedText>
          </View>

          {/* 商家标识 */}
          {post.isMerchant && (
            <View style={styles.masonryMerchantBadge}>
              <FontAwesome6 name="store" size={10} color={theme.warning} />
            </View>
          )}

          {/* 虚拟资料标识 */}
          {post.virtualResources && post.virtualResources.length > 0 && (
            <View style={styles.masonryResourceBadge}>
              <FontAwesome6 name="paperclip" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* 内容区域 */}
        <View style={styles.masonryContent}>
          {/* 标题 */}
          <ThemedText
            variant="bodyMedium"
            color={theme.textPrimary}
            style={styles.masonryTitle}
            numberOfLines={2}
          >
            {post.title || '无标题'}
          </ThemedText>

          {/* 作者信息 */}
          <View style={styles.masonryFooter}>
            <View style={styles.masonryAuthor}>
              <Image source={{ uri: post.authorAvatar }} style={styles.masonryAvatar} />
              <ThemedText variant="caption" color={theme.textMuted} numberOfLines={1}>
                {post.authorName}
              </ThemedText>
            </View>
            <View style={styles.masonryLikes}>
              <FontAwesome6 name="heart" size={10} color={theme.textMuted} />
              <ThemedText variant="caption" color={theme.textMuted} style={{ marginLeft: 2 }}>
                {post.likeCount}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      {/* 顶部类别导航 */}
      <View style={styles.categoryNav}>
        <View style={styles.categoryScrollViewWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  activeTab === category && styles.activeCategoryItem
                ]}
                onPress={() => setActiveTab(category)}
              >
                <ThemedText
                  variant="bodyMedium"
                  color={activeTab === category ? theme.buttonPrimaryText : theme.textSecondary}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* 管理入口和控制面板 */}
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/admin-web')}
          >
            <FontAwesome6 name="gear" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/control-panel')}
          >
            <FontAwesome6 name="sliders" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 瀑布流帖子列表 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无{activeTab !== '全部' ? activeTab : ''}帖子，快来发布第一条内容吧
            </ThemedText>
          </View>
        ) : (
          <View style={styles.masonryContainer}>
            {/* 左列 */}
            <View style={styles.masonryColumn}>
              {masonryColumns.left.map(post => renderMasonryCard(post, getCardWidth(width)))}
            </View>
            {/* 右列 */}
            <View style={styles.masonryColumn}>
              {masonryColumns.right.map(post => renderMasonryCard(post, getCardWidth(width)))}
            </View>
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

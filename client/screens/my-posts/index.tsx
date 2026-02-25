import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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
  user_id: number;
  username: string;
  avatar_url: string | null;
  title: string;
  content: string;
  type: 'recommendation' | 'qa' | 'bounty' | 'promotion';
  images: string[];
  likes_count: number;
  comments_count: number;
  is_paid: boolean;
  price: number | null;
  created_at: string;
}

export default function MyPostsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'recommendation' | 'qa' | 'bounty' | 'promotion'>('all');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子列表
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      // 构建查询参数
      let url = `${API_BASE_URL}/api/v1/posts/user?userId=${userId}`;
      if (selectedType !== 'all') {
        url += `&type=${selectedType}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, selectedType]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recommendation':
        return '推荐';
      case 'qa':
        return '知识库';
      case 'bounty':
        return '悬赏';
      case 'promotion':
        return '热点讨论';
      default:
        return '其他';
    }
  };

  // 点击帖子
  const handlePostPress = (post: Post) => {
    router.push('/post-detail', { postId: post.id });
  };

  // 过滤后的帖子
  const filteredPosts = selectedType === 'all'
    ? posts
    : posts.filter(post => post.type === selectedType);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 类型筛选Tab */}
      <View style={styles.tabsContainer}>
        {(['all', 'recommendation', 'qa', 'bounty', 'promotion'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tab,
              selectedType === type && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedType(type)}
          >
            <ThemedText
              variant="small"
              color={selectedType === type ? theme.buttonPrimaryText : theme.textSecondary}
            >
              {type === 'all' ? '全部' : getTypeLabel(type)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPosts} />
        }
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="box-open" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              {loading ? '加载中...' : '暂无帖子'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.postsList}>
            {filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => handlePostPress(post)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.postTypeBadge}>
                    <ThemedText variant="caption" color={theme.primary}>
                      {getTypeLabel(post.type)}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </ThemedText>
                </View>

                <ThemedText variant="h4" color={theme.textPrimary} style={styles.postTitle}>
                  {post.title}
                </ThemedText>

                <ThemedText variant="body" color={theme.textSecondary} numberOfLines={2} style={styles.postContent}>
                  {post.content}
                </ThemedText>

                {post.images && post.images.length > 0 && (
                  <View style={styles.postImages}>
                    {post.images.slice(0, 3).map((imageUrl, index) => (
                      <Image
                        key={index}
                        source={{ uri: imageUrl }}
                        style={[
                          styles.postImage,
                          post.images.length === 1 && styles.singleImage
                        ]}
                        contentFit="cover"
                      />
                    ))}
                    {post.images.length > 3 && (
                      <View style={[styles.moreImagesBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                          +{post.images.length - 3}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.postFooter}>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <FontAwesome6 name="heart" size={14} color={theme.textMuted} />
                      <ThemedText variant="caption" color={theme.textMuted}>
                        {post.likes_count}
                      </ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <FontAwesome6 name="comment" size={14} color={theme.textMuted} />
                      <ThemedText variant="caption" color={theme.textMuted}>
                        {post.comments_count}
                      </ThemedText>
                    </View>
                  </View>
                  {post.is_paid && post.price && (
                    <ThemedText variant="small" color={theme.primary}>
                      ¥{post.price.toFixed(2)}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

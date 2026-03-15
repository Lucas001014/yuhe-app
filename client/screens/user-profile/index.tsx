import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface UserInfo {
  id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
  isFollowing: boolean;
}

interface Post {
  id: number;
  title: string | null;
  content: string;
  images: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
}

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { userId } = useSafeSearchParams<{ userId: string }>();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载数据
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      const cId = await AsyncStorage.getItem('userId');
      setCurrentUserId(cId);

      // 并行获取用户信息和帖子
      const [userResponse, postsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/social/user/${userId}?currentUserId=${cId || 0}`),
        fetch(`${API_BASE_URL}/api/v1/social/user/${userId}/posts`)
      ]);

      const userData = await userResponse.json();
      const postsData = await postsResponse.json();

      if (userData.success) {
        setUserInfo(userData.user);
      }

      if (postsData.success) {
        setPosts(postsData.posts);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 关注/取消关注
  const handleFollow = async () => {
    if (!userInfo || !currentUserId) return;

    try {
      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/follow
       * Body 参数：currentUserId: number, targetUserId: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: parseInt(currentUserId),
          targetUserId: userInfo.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserInfo({
          ...userInfo,
          isFollowing: data.isFollowing,
          followerCount: data.followerCount,
        });
      }
    } catch (error) {
      console.error('关注操作失败:', error);
    }
  };

  // 跳转关注列表
  const goToFollowing = () => {
    router.push('/follow-list', { userId: userId, type: 'following' });
  };

  // 跳转粉丝列表
  const goToFollowers = () => {
    router.push('/follow-list', { userId: userId, type: 'followers' });
  };

  // 跳转私信
  const goToChat = () => {
    if (!userInfo) return;
    router.push('/chat', {
      userId: userInfo.id,
      username: userInfo.username,
      avatar: userInfo.avatarUrl
    });
  };

  // 跳转帖子详情
  const goToPostDetail = (postId: number) => {
    router.push('/post-detail', { postId: postId.toString() });
  };

  // 渲染帖子项
  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postItem} onPress={() => goToPostDetail(item.id)}>
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.postImage}
          contentFit="cover"
        />
      )}
      <View style={styles.postContent}>
        {item.title && (
          <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.postTitle}>
            {item.title}
          </ThemedText>
        )}
        <ThemedText variant="body" color={theme.textSecondary} numberOfLines={2}>
          {item.content}
        </ThemedText>
        <View style={styles.postStats}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <FontAwesome6 name="heart" size={12} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>{item.like_count || 0}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <FontAwesome6 name="comment" size={12} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>{item.comment_count || 0}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 是否是自己的主页
  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!userInfo) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" color={theme.textMuted}>用户不存在</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <View style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>个人主页</ThemedText>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <FontAwesome6 name="share-nodes" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            <>
              {/* 用户信息区域 */}
              <View style={styles.profileSection}>
                <Image source={{ uri: userInfo.avatarUrl }} style={styles.avatar} />
                <ThemedText variant="h3" color={theme.textPrimary} style={styles.username}>
                  {userInfo.username}
                </ThemedText>
                {userInfo.bio && (
                  <ThemedText variant="body" color={theme.textSecondary} style={styles.bio}>
                    {userInfo.bio}
                  </ThemedText>
                )}

                {/* 统计数据 */}
                <View style={styles.statsRow}>
                  <TouchableOpacity style={styles.statItem} onPress={goToFollowing}>
                    <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                      {userInfo.followingCount}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted} style={styles.statLabel}>
                      关注
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statItem} onPress={goToFollowers}>
                    <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                      {userInfo.followerCount}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted} style={styles.statLabel}>
                      粉丝
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.statItem}>
                    <ThemedText variant="h4" color={theme.textPrimary} style={styles.statNumber}>
                      {userInfo.postCount}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted} style={styles.statLabel}>
                      帖子
                    </ThemedText>
                  </View>
                </View>

                {/* 操作按钮 */}
                {!isOwnProfile && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.followButton, userInfo.isFollowing && styles.followingButton]}
                      onPress={handleFollow}
                    >
                      <ThemedText
                        variant="bodyMedium"
                        color={userInfo.isFollowing ? theme.textPrimary : theme.buttonPrimaryText}
                      >
                        {userInfo.isFollowing ? '已关注' : '关注'}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton} onPress={goToChat}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                        私信
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 帖子列表标题 */}
              <View style={[styles.tabsContainer]}>
                <View style={[styles.tab, styles.tabActive]}>
                  <ThemedText variant="bodyMedium" color={theme.primary}>帖子</ThemedText>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText variant="body" color={theme.textMuted}>暂无帖子</ThemedText>
            </View>
          }
          contentContainerStyle={styles.postsContainer}
        />
      </View>
    </Screen>
  );
}

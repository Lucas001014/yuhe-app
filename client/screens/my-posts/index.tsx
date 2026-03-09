import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { Image } from 'expo-image';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
}

  // 模拟数据（在组件外定义）
  const now = Date.now();
  const mockPosts: Post[] = [
    {
      id: 1,
      title: '如何从0到1搭建一个SaaS产品',
      content: '分享我过去一年创业的心得，包括市场调研、产品定位、技术选型等...',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop',
      author: {
        id: 1,
        username: '张三',
        avatar: 'https://i.pravatar.cc/150?img=68',
      },
      likes: 128,
      comments: 32,
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: '创业初期如何有效管理现金流',
      content: '现金流是创业公司的生命线，以下是我在管理现金流方面的经验...',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      author: {
        id: 1,
        username: '张三',
        avatar: 'https://i.pravatar.cc/150?img=68',
      },
      likes: 89,
      comments: 21,
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockLikedPosts: Post[] = [
    {
      id: 3,
      title: '创业团队如何进行有效招聘',
      content: '招聘是创业公司最重要的事情之一，分享我的招聘方法论...',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=500&fit=crop',
      author: {
        id: 2,
        username: '李四',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      likes: 256,
      comments: 45,
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockCollectedPosts: Post[] = [
    {
      id: 4,
      title: '如何写好商业计划书',
      content: '商业计划书是融资的重要工具，这里分享一些撰写技巧...',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=550&fit=crop',
      author: {
        id: 3,
        username: '王五',
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
      likes: 512,
      comments: 67,
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

export default function MyPostsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ tab?: 'posts' | 'likes' | 'collections' }>();

  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'collections'>(params.tab || 'posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [collectedPosts, setCollectedPosts] = useState<Post[]>([]);

  // 加载数据
  const loadData = useCallback(() => {
    if (activeTab === 'posts') {
      setPosts(mockPosts);
    } else if (activeTab === 'likes') {
      setLikedPosts(mockLikedPosts);
    } else if (activeTab === 'collections') {
      setCollectedPosts(mockCollectedPosts);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'posts':
        return posts;
      case 'likes':
        return likedPosts;
      case 'collections':
        return collectedPosts;
      default:
        return [];
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => router.push('/post-detail', { id: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.postImage}
        contentFit="cover"
      />
      <View style={styles.postContent}>
        <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText variant="caption" color={theme.textMuted} style={styles.postExcerpt} numberOfLines={2}>
          {item.content}
        </ThemedText>
        <View style={styles.postMeta}>
          <View style={styles.postAuthor}>
            <Image
              source={{ uri: item.author.avatar }}
              style={styles.authorAvatar}
              contentFit="cover"
            />
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.author.username}
            </ThemedText>
          </View>
          <ThemedText variant="caption" color={theme.textMuted}>
            {formatDistanceToNow(new Date(item.createdAt), { 
              addSuffix: true,
              locale: zhCN 
            })}
          </ThemedText>
        </View>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <FontAwesome6 name="heart" size={14} color="#FF6B6B" />
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.likes}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <FontAwesome6 name="comment" size={14} color="#3B82F6" />
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.comments}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* Tab 导航 */}
      <View style={styles.tabBar}>
        {[
          { key: 'posts', label: '发帖', icon: 'file-lines' },
          { key: 'likes', label: '点赞', icon: 'heart' },
          { key: 'collections', label: '收藏', icon: 'bookmark' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <FontAwesome6
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? theme.primary : theme.textMuted}
            />
            <ThemedText
              variant="caption"
              color={activeTab === tab.key ? theme.primary : theme.textMuted}
              style={styles.tabLabel}
            >
              {tab.label}
            </ThemedText>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 内容列表 */}
      <FlatList
        data={getCurrentPosts()}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              {activeTab === 'posts' ? '还没有发过帖子' : activeTab === 'likes' ? '还没有点赞过' : '还没有收藏过'}
            </ThemedText>
          </View>
        }
      />
    </Screen>
  );
}

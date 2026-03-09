import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Post {
  id: number;
  type: 'normal' | 'qa_paid' | 'qa_bounty' | 'product';
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  price?: number;
  productName?: string;
  productPrice?: number;
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'normal' | 'qa_paid' | 'qa_bounty' | 'product'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 模拟帖子数据
  const mockPosts: Post[] = [
    {
      id: 1,
      type: 'normal',
      title: '创业初期的团队搭建经验分享',
      content: '在创业初期，如何快速搭建一个高效的团队？我从0到1搭建了5人技术团队，总结了一些经验...',
      author: {
        id: 1,
        name: '张三',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      tags: ['创业', '团队管理', '经验分享'],
      likes: 128,
      comments: 32,
      shares: 15,
      createdAt: '2小时前',
    },
    {
      id: 2,
      type: 'qa_paid',
      title: '如何选择适合创业项目的云服务？',
      content: '正在做SaaS产品，需要选择云服务提供商，请教各位大神的经验...',
      author: {
        id: 2,
        name: '李四',
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
      tags: ['技术', '云计算', '问答'],
      likes: 45,
      comments: 12,
      shares: 5,
      createdAt: '5小时前',
      price: 9.9,
    },
    {
      id: 3,
      type: 'qa_bounty',
      title: '悬赏：寻找电商数据分析专家',
      content: '需要一位有经验的电商数据分析专家，帮助分析用户行为数据，优化转化率...',
      author: {
        id: 3,
        name: '王五',
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
      tags: ['悬赏', '数据分析', '电商'],
      likes: 67,
      comments: 28,
      shares: 8,
      createdAt: '1天前',
      price: 500,
    },
    {
      id: 4,
      type: 'product',
      title: '智能客服系统',
      content: '基于AI技术的智能客服系统，支持多语言、多渠道接入，帮助企业提升客服效率...',
      author: {
        id: 4,
        name: '赵六',
        avatar: 'https://i.pravatar.cc/150?img=4',
      },
      tags: ['AI', '产品', '客服'],
      likes: 89,
      comments: 45,
      shares: 22,
      createdAt: '2天前',
      productName: '智能客服系统',
      productPrice: 9999,
    },
  ];

  // 加载帖子列表
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: 实际应该从API获取数据
      setPosts(mockPosts);
    } catch (error) {
      console.error('加载帖子失败:', error);
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'normal', label: '推荐' },
    { id: 'qa_paid', label: '知识库' },
    { id: 'qa_bounty', label: '悬赏' },
    { id: 'product', label: '产品' },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return '推荐';
      case 'qa_paid':
        return '知识库';
      case 'qa_bounty':
        return '悬赏';
      case 'product':
        return '产品';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'normal':
        return '#4F46E5';
      case 'qa_paid':
        return '#F59E0B';
      case 'qa_bounty':
        return '#10B981';
      case 'product':
        return '#8B5CF6';
      default:
        return theme.textMuted;
    }
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  const handlePostPress = (post: Post) => {
    router.push('/post-detail', { postId: post.id });
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 顶部搜索栏 */}
      <View style={styles.searchBar}>
        <FontAwesome6 name="magnifying-glass" size={18} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索帖子、用户、话题..."
          placeholderTextColor={theme.textMuted}
        />
      </View>

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
                color={activeTab === tab.id ? theme.buttonPrimaryText : theme.textSecondary}
                style={styles.tabText}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 帖子列表 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => handlePostPress(post)}
            >
              {/* 作者信息 */}
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <FontAwesome6 name="circle-user" size={32} color={theme.border} />
                  <View style={styles.authorDetails}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      {post.author.name}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      {post.createdAt}
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.typeTag, { backgroundColor: getTypeColor(post.type) }]}>
                  <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                    {getTypeLabel(post.type)}
                  </ThemedText>
                </View>
              </View>

              {/* 帖子内容 */}
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.postTitle}>
                {post.title}
              </ThemedText>
              <ThemedText variant="body" color={theme.textSecondary} numberOfLines={3} style={styles.postContent}>
                {post.content}
              </ThemedText>

              {/* 标签 */}
              <View style={styles.tagsContainer}>
                {post.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <ThemedText variant="caption" color={theme.textSecondary}>
                      #{tag}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* 价格信息 */}
              {post.type === 'qa_paid' && post.price && (
                <View style={styles.priceInfo}>
                  <FontAwesome6 name="sack-dollar" size={16} color={theme.warning} />
                  <ThemedText variant="bodyMedium" color={theme.warning} style={{ fontWeight: '600' }}>
                    ¥{post.price}
                  </ThemedText>
                </View>
              )}

              {post.type === 'qa_bounty' && post.price && (
                <View style={styles.priceInfo}>
                  <FontAwesome6 name="trophy" size={16} color={theme.success} />
                  <ThemedText variant="bodyMedium" color={theme.success} style={{ fontWeight: '600' }}>
                    悬赏 ¥{post.price}
                  </ThemedText>
                </View>
              )}

              {post.type === 'product' && post.productPrice && (
                <View style={styles.priceInfo}>
                  <FontAwesome6 name="tag" size={16} color={theme.accent} />
                  <ThemedText variant="bodyMedium" color={theme.accent} style={{ fontWeight: '600' }}>
                    ¥{post.productPrice}
                  </ThemedText>
                </View>
              )}

              {/* 底部互动 */}
              <View style={styles.postFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
                  <FontAwesome6 name="heart" size={16} color={theme.textSecondary} />
                  <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
                    {post.likes}
                  </ThemedText>
                </TouchableOpacity>
                <View style={styles.actionButton}>
                  <FontAwesome6 name="comment" size={16} color={theme.textSecondary} />
                  <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
                    {post.comments}
                  </ThemedText>
                </View>
                <View style={styles.actionButton}>
                  <FontAwesome6 name="share-nodes" size={16} color={theme.textSecondary} />
                  <ThemedText variant="caption" color={theme.textMuted} style={styles.actionText}>
                    {post.shares}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

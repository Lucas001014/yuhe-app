import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Image } from 'expo-image';
import { createStyles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Post {
  id: number;
  type: 'normal' | 'qa_paid' | 'qa_bounty' | 'product';
  title: string;
  content: string;
  imageUrl?: string;
  aspectRatio: number;
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

  // 生成随机宽高比
  const generateAspectRatio = (): number => {
    const seed = Math.random();
    if (seed < 0.2) {
      return 1.6 + Math.random() * 0.2; // 扁图
    } else if (seed < 0.7) {
      return 0.75 + Math.random() * 0.4; // 常规图
    } else {
      return 0.5 + Math.random() * 0.1; // 长图
    }
  };

  // 模拟帖子数据
  const mockPosts: Post[] = [
    {
      id: 1,
      type: 'normal',
      title: '创业初期的团队搭建经验分享',
      content: '在创业初期，如何快速搭建一个高效的团队？我从0到1搭建了5人技术团队，总结了一些经验...',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      aspectRatio: generateAspectRatio(),
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
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop',
      aspectRatio: generateAspectRatio(),
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
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      aspectRatio: generateAspectRatio(),
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
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
      aspectRatio: generateAspectRatio(),
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
    {
      id: 5,
      type: 'normal',
      title: '从0到1的创业融资经验',
      content: '分享我从小团队到获得A轮融资的完整过程，包括BP制作、路演技巧...',
      imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop',
      aspectRatio: generateAspectRatio(),
      author: {
        id: 5,
        name: '钱七',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      tags: ['融资', '创业', '经验'],
      likes: 156,
      comments: 43,
      shares: 28,
      createdAt: '3天前',
    },
    {
      id: 6,
      type: 'product',
      title: '企业级CRM系统',
      content: '专为中小企业设计的客户关系管理系统，功能强大，操作简单...',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=280&fit=crop',
      aspectRatio: generateAspectRatio(),
      author: {
        id: 6,
        name: '孙八',
        avatar: 'https://i.pravatar.cc/150?img=6',
      },
      tags: ['CRM', '企业服务', 'SaaS'],
      likes: 72,
      comments: 28,
      shares: 15,
      createdAt: '4天前',
      productName: '企业级CRM系统',
      productPrice: 4999,
    },
  ];

  // 贪心分配算法
  const distributeItems = (items: Post[], columnWidth: number) => {
    const FOOTER_HEIGHT = 120; // 标题+头像+互动区域高度
    const columnArrays: Post[][] = Array.from({ length: 2 }, () => []);
    const columnHeights: number[] = [0, 0];

    items.forEach((item) => {
      const imgHeight = columnWidth / item.aspectRatio;
      const totalItemHeight = imgHeight + FOOTER_HEIGHT;

      const shortestIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1;
      columnArrays[shortestIndex].push(item);
      columnHeights[shortestIndex] += totalItemHeight;
    });

    return columnArrays;
  };

  // 加载帖子列表
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
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

  // 布局常量
  const COLUMNS = 2;
  const GAP = 12;
  const PADDING = 16;
  const COLUMN_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  // 计算列数据
  const columnData = useMemo(() =>
    distributeItems(filteredPosts, COLUMN_WIDTH),
    [filteredPosts, COLUMN_WIDTH]
  );

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

  const renderPostCard = (post: Post) => {
    const imgHeight = COLUMN_WIDTH / post.aspectRatio;

    return (
      <TouchableOpacity
        key={post.id}
        style={styles.card}
        onPress={() => handlePostPress(post)}
      >
        {/* 图片 */}
        <View style={[styles.imageWrapper, { height: imgHeight }]}>
          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { height: imgHeight }]}>
              <FontAwesome6 name="image" size={32} color={theme.textMuted} />
            </View>
          )}
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(post.type) }]}>
            <ThemedText variant="caption" color={theme.buttonPrimaryText}>
              {getTypeLabel(post.type)}
            </ThemedText>
          </View>
        </View>

        {/* 内容区域 */}
        <View style={styles.cardContent}>
          <ThemedText variant="body" color={theme.textPrimary} numberOfLines={2} style={styles.cardTitle}>
            {post.title}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textSecondary} numberOfLines={2} style={styles.cardDescription}>
            {post.content}
          </ThemedText>

          {/* 标签 */}
          {post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 2).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <ThemedText variant="caption" color={theme.textSecondary}>
                    #{tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* 价格信息 */}
          {post.type === 'qa_paid' && post.price && (
            <View style={styles.priceInfo}>
              <FontAwesome6 name="sack-dollar" size={12} color={theme.warning} />
              <ThemedText variant="caption" color={theme.warning} style={{ fontWeight: '600' }}>
                ¥{post.price}
              </ThemedText>
            </View>
          )}

          {post.type === 'qa_bounty' && post.price && (
            <View style={styles.priceInfo}>
              <FontAwesome6 name="trophy" size={12} color={theme.success} />
              <ThemedText variant="caption" color={theme.success} style={{ fontWeight: '600' }}>
                悬赏 ¥{post.price}
              </ThemedText>
            </View>
          )}

          {post.type === 'product' && post.productPrice && (
            <View style={styles.priceInfo}>
              <FontAwesome6 name="tag" size={12} color={theme.accent} />
              <ThemedText variant="caption" color={theme.accent} style={{ fontWeight: '600' }}>
                ¥{post.productPrice}
              </ThemedText>
            </View>
          )}

          {/* 底部互动 */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(post.id)}
            >
              <FontAwesome6 name="heart" size={12} color={theme.textSecondary} />
              <ThemedText variant="caption" color={theme.textMuted}>
                {post.likes}
              </ThemedText>
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <FontAwesome6 name="comment" size={12} color={theme.textSecondary} />
              <ThemedText variant="caption" color={theme.textMuted}>
                {post.comments}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
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
                color={activeTab === tab.id ? theme.primary : theme.textSecondary}
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 瀑布流帖子列表 */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: PADDING }]}
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
          <View style={[styles.columnsContainer, { gap: GAP }]}>
            {columnData.map((colItems, colIndex) => (
              <View key={colIndex} style={[styles.column, { gap: GAP }]}>
                {colItems.map(post => renderPostCard(post))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

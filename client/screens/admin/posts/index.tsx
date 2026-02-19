import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

interface Post {
  id: number;
  title: string;
  content: string;
  authorName: string;
  category: string;
  type: 'free' | 'paid' | 'bounty';
  status: 'published';
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export default function AdminPostsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载帖子列表
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/posts?page=1&pageSize=100`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('获取帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  // 删除帖子
  const handleDelete = async (postId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个帖子吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '帖子已删除');
                fetchPosts();
              } else {
                Alert.alert('失败', data.error || '删除失败');
              }
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  // 打开编辑弹窗
  const openEditModal = (post: Post) => {
    setCurrentPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSave = async () => {
    if (!currentPost || !editTitle.trim()) {
      Alert.alert('提示', '标题不能为空');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${currentPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          category: editCategory,
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '帖子已更新');
        setEditModalVisible(false);
        fetchPosts();
      } else {
        Alert.alert('失败', data.error || '更新失败');
      }
    } catch (error) {
      Alert.alert('错误', '更新失败');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'published' ? `${theme.success}CC` : `${theme.warning}CC`;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'paid':
        return `${theme.primary}CC`;
      case 'bounty':
        return `${theme.accent}CC`;
      default:
        return `${theme.success}CC`;
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h4" color={theme.textPrimary}>帖子管理</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 统计信息 */}
        <View style={styles.statsInfo}>
          <ThemedText variant="body" color={theme.textSecondary}>
            共 {posts.length} 篇帖子
          </ThemedText>
        </View>

        {/* 帖子列表 */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.centerContainer}>
            <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无帖子
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {posts.map((post) => (
              <View key={post.id} style={[styles.postCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.postHeader}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.postTitle}>
                    {post.title}
                  </ThemedText>
                  <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: getStatusBadgeColor(post.status) }]}>
                      <ThemedText variant="caption" color="#fff">
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </ThemedText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getTypeBadgeColor(post.type) }]}>
                      <ThemedText variant="caption" color="#fff">
                        {post.type === 'paid' ? '付费' : post.type === 'bounty' ? '悬赏' : '免费'}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <ThemedText variant="body" color={theme.textSecondary} style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </ThemedText>

                <View style={styles.postMeta}>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    作者: {post.authorName}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {post.category}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>

                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <FontAwesome6 name="heart" size={14} color={theme.textMuted} />
                    <ThemedText variant="caption" color={theme.textMuted}>{post.likeCount}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <FontAwesome6 name="comment" size={14} color={theme.textMuted} />
                    <ThemedText variant="caption" color={theme.textMuted}>{post.commentCount}</ThemedText>
                  </View>
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.primary}15` }]}
                    onPress={() => openEditModal(post)}
                  >
                    <FontAwesome6 name="pen" size={14} color={theme.primary} />
                    <ThemedText variant="small" color={theme.primary}>编辑</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.error}15` }]}
                    onPress={() => handleDelete(post.id)}
                  >
                    <FontAwesome6 name="trash" size={14} color={theme.error} />
                    <ThemedText variant="small" color={theme.error}>删除</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>编辑帖子</ThemedText>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                标题
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="请输入标题"
                placeholderTextColor={theme.textMuted}
              />

              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                内容
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                value={editContent}
                onChangeText={setEditContent}
                placeholder="请输入内容"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={6}
              />

              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                类别
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                value={editCategory}
                onChangeText={setEditCategory}
                placeholder="请输入类别"
                placeholderTextColor={theme.textMuted}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.backgroundTertiary }]}
                onPress={() => setEditModalVisible(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>保存</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

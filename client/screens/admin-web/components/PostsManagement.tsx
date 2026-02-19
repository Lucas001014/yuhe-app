import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, Modal, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from '../styles';

interface Post {
  id: number;
  title: string;
  content: string;
  authorName: string;
  type: 'free' | 'paid' | 'bounty' | 'product';
  status: string;
  category: string;
  likeCount: number;
  commentCount: number;
}

interface PostsManagementProps {
  onRefresh?: () => void;
}

export default function PostsManagement({ onRefresh }: PostsManagementProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/posts?page=1&pageSize=100`);
      const data = await res.json();
      
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
    });
    setModalVisible(true);
  };

  const handleDelete = async (postId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个帖子吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/posts/${postId}`, {
                method: 'DELETE',
              });
              
              const data = await res.json();
              if (data.success) {
                Alert.alert('成功', '删除成功');
                fetchPosts();
                onRefresh?.();
              } else {
                Alert.alert('失败', data.error || '删除失败');
              }
            } catch (error) {
              Alert.alert('失败', '删除失败');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!editingPost) return;

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('成功', '保存成功');
        setModalVisible(false);
        fetchPosts();
        onRefresh?.();
      } else {
        Alert.alert('失败', data.error || '保存失败');
      }
    } catch (error) {
      Alert.alert('失败', '保存失败');
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'free':
        return styles.badgeSuccess;
      case 'paid':
      case 'bounty':
        return styles.badgeWarning;
      default:
        return styles.badge;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>加载中...</ThemedText>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>暂无帖子</ThemedText>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <ThemedText variant="h2">帖子管理</ThemedText>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 800 }}>
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>ID</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>标题</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>作者</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>类型</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>点赞</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>评论</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1.5 }]}>操作</ThemedText>
          </View>

          {posts.map((post) => (
            <View key={post.id} style={styles.tableRow}>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{post.id}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{post.title}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{post.authorName}</ThemedText>
              <View style={[styles.badge, getBadgeStyle(post.type), { flex: 1 }]}>
                <ThemedText style={{ color: 'inherit' }}>{post.type}</ThemedText>
              </View>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{post.likeCount}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{post.commentCount}</ThemedText>
              <View style={[styles.actionButtons, { flex: 1.5 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonPrimary]}
                  onPress={() => handleEdit(post)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>编辑</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonDanger]}
                  onPress={() => handleDelete(post.id)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>删除</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText variant="h3" style={styles.modalTitle}>编辑帖子</ThemedText>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                    <FontAwesome6 name="xmark" size={24} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>标题</ThemedText>
                    <TextInput
                      style={styles.formInput}
                      value={formData.title}
                      onChangeText={(text) => setFormData({ ...formData, title: text })}
                      placeholder="请输入标题"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>内容</ThemedText>
                    <TextInput
                      style={[styles.formInput, { height: 120, textAlignVertical: 'top' }]}
                      value={formData.content}
                      onChangeText={(text) => setFormData({ ...formData, content: text })}
                      placeholder="请输入内容"
                      multiline
                      numberOfLines={5}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>类别</ThemedText>
                    <TextInput
                      style={styles.formInput}
                      value={formData.category}
                      onChangeText={(text) => setFormData({ ...formData, category: text })}
                      placeholder="请输入类别"
                    />
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.border }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <ThemedText style={styles.buttonText}>取消</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleSave}
                  >
                    <ThemedText style={styles.buttonText}>保存</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

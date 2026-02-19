import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export default function AdminCategoriesScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载类别列表
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('获取类别列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  // 打开新增弹窗
  const openAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const openEditModal = (category: Category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  // 保存类别
  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('提示', '类别名称不能为空');
      return;
    }

    try {
      const url = editMode
        ? `${API_BASE_URL}/api/v1/categories/${currentCategory!.id}`
        : `${API_BASE_URL}/api/v1/categories`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', editMode ? '类别已更新' : '类别已创建');
        setModalVisible(false);
        fetchCategories();
      } else {
        Alert.alert('失败', data.error || '操作失败');
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 删除类别
  const handleDelete = (category: Category) => {
    Alert.alert(
      '确认删除',
      `确定要删除类别 "${category.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/categories/${category.id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '类别已删除');
                fetchCategories();
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

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h4" color={theme.textPrimary}>类别管理</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 新增按钮 */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={openAddModal}
        >
          <FontAwesome6 name="plus" size={20} color="#fff" />
          <ThemedText variant="bodyMedium" color="#fff">新增类别</ThemedText>
        </TouchableOpacity>

        {/* 统计信息 */}
        <View style={styles.statsInfo}>
          <ThemedText variant="body" color={theme.textSecondary}>
            共 {categories.length} 个类别
          </ThemedText>
        </View>

        {/* 类别列表 */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.centerContainer}>
            <FontAwesome6 name="folder-open" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无类别
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {categories.map((category) => (
              <View key={category.id} style={[styles.categoryCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${theme.primary}15` }]}>
                    <FontAwesome6 name="folder" size={20} color={theme.primary} />
                  </View>
                  <View style={styles.categoryMeta}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      {category.name}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      Slug: {category.slug}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText variant="caption" color={theme.textMuted} style={styles.createTime}>
                  创建于 {new Date(category.createdAt).toLocaleDateString()}
                </ThemedText>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.primary}15` }]}
                    onPress={() => openEditModal(category)}
                  >
                    <FontAwesome6 name="pen" size={14} color={theme.primary} />
                    <ThemedText variant="small" color={theme.primary}>编辑</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.error}15` }]}
                    onPress={() => handleDelete(category)}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>
                {editMode ? '编辑类别' : '新增类别'}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                类别名称
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="请输入类别名称"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.backgroundTertiary }]}
                onPress={() => setModalVisible(false)}
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

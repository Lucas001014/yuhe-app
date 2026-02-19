import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, Modal, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from '../styles';

interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export default function CategoriesManagement() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/categories`);
      const data = await res.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('加载类别失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleDelete = async (categoryId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个类别吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/categories/${categoryId}`, {
                method: 'DELETE',
              });
              
              const data = await res.json();
              if (data.success) {
                Alert.alert('成功', '删除成功');
                fetchCategories();
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
    if (!categoryName.trim()) {
      Alert.alert('提示', '类别名称不能为空');
      return;
    }

    try {
      const url = editingCategory
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/categories/${editingCategory.id}`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('成功', editingCategory ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchCategories();
      } else {
        Alert.alert('失败', data.error || '操作失败');
      }
    } catch (error) {
      Alert.alert('失败', '操作失败');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>加载中...</ThemedText>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <ThemedText variant="h2">类别管理</ThemedText>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleAdd}>
          <ThemedText style={styles.buttonText}>新增类别</ThemedText>
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 700 }}>
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>ID</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>名称</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>Slug</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>创建时间</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1.5 }]}>操作</ThemedText>
          </View>

          {categories.map((category) => (
            <View key={category.id} style={styles.tableRow}>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{category.id}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 2 }]}>{category.name}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 2 }]}>{category.slug}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 2 }]}>
                {new Date(category.createdAt).toLocaleDateString()}
              </ThemedText>
              <View style={[styles.actionButtons, { flex: 1.5 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonPrimary]}
                  onPress={() => handleEdit(category)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>
                    编辑
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonDanger]}
                  onPress={() => handleDelete(category.id)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>
                    删除
                  </ThemedText>
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
                  <ThemedText variant="h3" style={styles.modalTitle}>
                    {editingCategory ? '编辑类别' : '新增类别'}
                  </ThemedText>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                    <FontAwesome6 name="xmark" size={24} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>类别名称</ThemedText>
                    <TextInput
                      style={styles.formInput}
                      value={categoryName}
                      onChangeText={setCategoryName}
                      placeholder="请输入类别名称"
                      autoFocus
                    />
                  </View>
                </View>

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

import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [postType, setPostType] = useState<'normal' | 'qa_paid' | 'qa_bounty' | 'product'>('normal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 选择图片
  const handlePickImages = async () => {
    try {
      // 请求相册权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能选择图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        if (images.length + result.assets.length > 9) {
          Alert.alert('提示', '最多只能上传9张图片');
          return;
        }
        setImages([...images, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片失败');
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 发布帖子
  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入内容');
      return;
    }

    if (postType === 'qa_paid' && !price) {
      Alert.alert('提示', '请设置问答价格');
      return;
    }

    if (postType === 'qa_bounty' && !price) {
      Alert.alert('提示', '请设置悬赏金额');
      return;
    }

    if (postType === 'product' && (!productName || !productPrice)) {
      Alert.alert('提示', '请填写产品名称和价格');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const payload: any = {
        userId: parseInt(userId),
        type: postType,
        content,
        title: postType !== 'normal' ? title : undefined,
        images: images.length > 0 ? images : undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
      };

      if (postType === 'qa_paid') {
        payload.qa_price = parseFloat(price);
      } else if (postType === 'qa_bounty') {
        payload.bounty_price = parseFloat(price);
      } else if (postType === 'product') {
        payload.productName = productName;
        payload.productPrice = parseFloat(productPrice);
        payload.productDescription = productDescription;
        payload.contactInfo = contactInfo;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('成功', '发布成功', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('失败', data.error || '发布失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return '普通帖子';
      case 'qa_paid':
        return '付费问答';
      case 'qa_bounty':
        return '悬赏求助';
      case 'product':
        return '产品推广';
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 帖子类型选择 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              选择类型
            </ThemedText>
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {(['normal', 'qa_paid', 'qa_bounty', 'product'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      postType === type && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => setPostType(type)}
                  >
                    <ThemedText
                      variant="small"
                      color={postType === type ? theme.buttonPrimaryText : theme.textPrimary}
                    >
                      {getPostTypeLabel(type)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 标题 */}
          {postType !== 'normal' && (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                标题
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder={postType === 'product' ? '产品名称' : '问题/主题'}
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
              />
            </View>
          )}

          {/* 内容 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              内容
            </ThemedText>
            <TextInput
              style={[styles.textarea, { color: theme.textPrimary }]}
              placeholder={
                postType === 'qa_paid'
                  ? '请描述您的问题，付费后可获得详细解答'
                  : postType === 'qa_bounty'
                  ? '请描述您需要解决的问题，设置悬赏金额吸引解答'
                  : postType === 'product'
                  ? '产品介绍、使用场景等'
                  : '分享您的创业经验或见解...'
              }
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* 价格设置 */}
          {(postType === 'qa_paid' || postType === 'qa_bounty') && (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                {postType === 'qa_paid' ? '问答价格（元）' : '悬赏金额（元）'}
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="最低 1 元"
                placeholderTextColor={theme.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          )}

          {/* 产品信息 */}
          {postType === 'product' && (
            <TouchableOpacity
              style={styles.section}
              onPress={() => setShowProductModal(true)}
            >
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                产品信息 {productName && productPrice ? '✓' : '（点击填写）'}
              </ThemedText>
              <View style={styles.productInfoBox}>
                <ThemedText variant="body" color={theme.textMuted}>
                  {productName ? `${productName} - ¥${productPrice}` : '请填写产品详细信息'}
                </ThemedText>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          )}

          {/* 标签 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              标签（用逗号分隔）
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="如：电商,科技,创业"
              placeholderTextColor={theme.textMuted}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* 图片 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                图片（最多9张）
              </ThemedText>
              <TouchableOpacity style={styles.addButton} onPress={handlePickImages}>
                <FontAwesome6 name="plus" size={16} color={theme.primary} />
                <ThemedText variant="small" color={theme.primary}>添加</ThemedText>
              </TouchableOpacity>
            </View>
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <View style={styles.imagePreview}>
                      <FontAwesome6 name="image" size={24} color={theme.textMuted} />
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <FontAwesome6 name="xmark" size={14} color={theme.buttonPrimaryText} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 发布按钮 */}
          <TouchableOpacity
            style={[styles.publishButton, loading && styles.disabledButton]}
            onPress={handlePublish}
            disabled={loading}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              {loading ? '发布中...' : '发布'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 产品信息弹窗 */}
      <Modal
        visible={showProductModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText variant="h4" color={theme.textPrimary}>产品信息</ThemedText>
                <TouchableOpacity onPress={() => setShowProductModal(false)}>
                  <FontAwesome6 name="xmark" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                  产品名称 *
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="请输入产品名称"
                  placeholderTextColor={theme.textMuted}
                  value={productName}
                  onChangeText={setProductName}
                />

                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                  产品价格（元）*
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="请输入产品价格"
                  placeholderTextColor={theme.textMuted}
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="decimal-pad"
                />

                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                  产品描述
                </ThemedText>
                <TextInput
                  style={[styles.textarea, { color: theme.textPrimary, minHeight: 80 }]}
                  placeholder="请输入产品描述"
                  placeholderTextColor={theme.textMuted}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  multiline
                  textAlignVertical="top"
                />

                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                  联系方式
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="微信号、电话等"
                  placeholderTextColor={theme.textMuted}
                  value={contactInfo}
                  onChangeText={setContactInfo}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowProductModal(false)}
                >
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>取消</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => setShowProductModal(false)}
                >
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>确定</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  );
}

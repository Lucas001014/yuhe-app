import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { createFormDataFile } from '@/utils';

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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 显示错误弹窗
  const showError = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: '确定', style: 'default' }]);
  };

  // 显示成功弹窗
  const showSuccess = (title: string, message: string, onPress?: () => void) => {
    Alert.alert(title, message, [
      { text: '确定', style: 'default', onPress }
    ]);
  };

  // 选择图片
  const handlePickImages = async () => {
    try {
      // 请求相册权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('权限不足', '需要相册权限才能选择图片，请在设置中开启');
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
          showError('图片过多', '最多只能上传9张图片');
          return;
        }
        setImages([...images, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error: any) {
      console.error('选择图片失败:', error);
      showError('选择图片失败', error?.message || '未知错误，请重试');
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 上传图片到对象存储
  const uploadImages = async (imageUris: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < imageUris.length; i++) {
      try {
        const imageUri = imageUris[i];
        const formData = new FormData();
        const file = await createFormDataFile(imageUri, `image_${Date.now()}_${i}.jpg`, 'image/jpeg');
        formData.append('file', file as any);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`上传失败: HTTP ${uploadResponse.status}`);
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.url) {
          uploadedUrls.push(uploadData.url);
        } else {
          throw new Error(uploadData.error || '上传失败');
        }
      } catch (error: any) {
        console.error(`上传第 ${i + 1} 张图片失败:`, error);
        throw new Error(`第 ${i + 1} 张图片上传失败: ${error?.message || '未知错误'}`);
      }
    }

    return uploadedUrls;
  };

  // 发布帖子
  const handlePublish = async () => {
    // 前端验证
    if (!title.trim()) {
      showError('提示', '请输入标题');
      return;
    }

    if (title.trim().length < 2) {
      showError('提示', '标题至少需要2个字符');
      return;
    }

    if (!content.trim()) {
      showError('提示', '请输入内容');
      return;
    }

    if (content.length < 10) {
      showError('提示', '内容至少需要10个字符');
      return;
    }

    if (postType === 'qa_paid') {
      if (!price || parseFloat(price) < 1) {
        showError('提示', '知识库帖子需要设置价格，最低1元');
        return;
      }
    }

    if (postType === 'qa_bounty') {
      if (!price || parseFloat(price) < 1) {
        showError('提示', '悬赏帖子需要设置悬赏金额，最低1元');
        return;
      }
    }

    if (postType === 'product' && (!productName || !productPrice)) {
      showError('提示', '请填写产品名称和价格');
      return;
    }

    // 检查登录状态
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');
    const avatar = await AsyncStorage.getItem('avatar');

    if (!userId) {
      showError('未登录', '请先登录后再发布帖子');
      router.replace('/login');
      return;
    }

    setLoading(true);

    try {
      // 上传图片
      let uploadedImages: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        try {
          uploadedImages = await uploadImages(images);
        } catch (uploadError: any) {
          showError('图片上传失败', uploadError?.message || '请检查网络后重试');
          setLoading(false);
          setUploadingImages(false);
          return;
        }
        setUploadingImages(false);
      }

      // 构建请求体
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const payload: any = {
        userId: parseInt(userId),
        username,
        avatar,
        type: postType,
        content: content.trim(),
        title: title.trim(),
        images: uploadedImages,
        tags: tagArray.length > 0 ? tagArray : [],
        category: 'general',
        price: 0,
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

      // 发送请求
      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`服务器错误: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // 清空所有表单内容
        setTitle('');
        setContent('');
        setImages([]);
        setTags('');
        setPrice('');
        setPostType('normal');
        setProductName('');
        setProductPrice('');
        setProductDescription('');
        setContactInfo('');
        
        if (data.post?.audit_status === 'approved') {
          showSuccess('发布成功', '您的帖子已成功发布！', () => {
            // 跳转到首页
            router.replace('/');
          });
        } else {
          showSuccess('已提交', data.message || '帖子已提交，等待审核', () => {
            // 跳转到首页
            router.replace('/');
          });
        }
      } else {
        showError('发布失败', data.error || data.message || '未知错误，请重试');
      }
    } catch (error: any) {
      console.error('发布帖子失败:', error);
      let errorMessage = '发布失败，请重试';
      
      if (error.message?.includes('Network request failed')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else if (error.message?.includes('timeout')) {
        errorMessage = '请求超时，请重试';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError('错误', errorMessage);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return '推荐';
      case 'qa_paid':
        return '知识库';
      case 'qa_bounty':
        return '悬赏';
      case 'product':
        return '热点讨论';
    }
  };

  const getPostTypeColor = (type: string) => {
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

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部标题栏 */}
        <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 0 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="xmark" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h4" color={theme.textPrimary}>发布动态</ThemedText>
          <View style={{ width: 24 }} />
        </View>

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
                      postType === type && { backgroundColor: getPostTypeColor(type) }
                    ]}
                    onPress={() => setPostType(type)}
                  >
                    <ThemedText
                      variant="body"
                      color={postType === type ? theme.buttonPrimaryText : theme.textSecondary}
                    >
                      {getPostTypeLabel(type)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 标题输入 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              标题
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="输入标题（必填）"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 4 }}>
              {title.length}/100
            </ThemedText>
          </View>

          {/* 内容输入 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              内容
            </ThemedText>
            <TextInput
              style={styles.textarea}
              placeholder="分享你的想法...（至少10个字符）"
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              maxLength={10000}
              textAlignVertical="top"
            />
            <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 4 }}>
              {content.length}/10000（最少10字符）
            </ThemedText>
          </View>

          {/* 图片上传 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                图片
              </ThemedText>
              <TouchableOpacity style={styles.addButton} onPress={handlePickImages}>
                <FontAwesome6 name="plus" size={14} color={theme.primary} />
                <ThemedText variant="body" color={theme.primary}>添加图片</ThemedText>
              </TouchableOpacity>
            </View>
            
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <FontAwesome6 name="xmark" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <ThemedText variant="caption" color={theme.textMuted}>
              最多上传9张图片，当前已选 {images.length} 张
            </ThemedText>
          </View>

          {/* 标签 */}
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              标签
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="用逗号分隔，如：创业,经验,分享"
              placeholderTextColor={theme.textMuted}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* 价格设置（根据类型显示） */}
          {(postType === 'qa_paid' || postType === 'qa_bounty') && (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                {postType === 'qa_paid' ? '问答价格' : '悬赏金额'}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={postType === 'qa_paid' ? '设置查看价格，最低1元' : '设置悬赏金额，最低1元'}
                placeholderTextColor={theme.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 4 }}>
                {postType === 'qa_paid' ? '用户需付费查看您的回答' : '悬赏金额将奖励给回答者'}
              </ThemedText>
            </View>
          )}

          {/* 产品信息（产品类型显示） */}
          {postType === 'product' && (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                产品信息
              </ThemedText>
              <TouchableOpacity
                style={styles.productInfoBox}
                onPress={() => setShowProductModal(true)}
              >
                <View>
                  <ThemedText variant="body" color={theme.textPrimary}>
                    {productName || '点击填写产品信息'}
                  </ThemedText>
                  {productPrice && (
                    <ThemedText variant="caption" color={theme.textMuted}>
                      ¥{productPrice}
                    </ThemedText>
                  )}
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* 发布按钮 */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.publishButton, loading && styles.disabledButton]}
              onPress={handlePublish}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={theme.buttonPrimaryText} />
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                    {uploadingImages ? '上传图片中...' : '发布中...'}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                  发布
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 产品信息弹窗 */}
        <Modal
          visible={showProductModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowProductModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText variant="h4" color={theme.textPrimary}>产品信息</ThemedText>
                <TouchableOpacity onPress={() => setShowProductModal(false)}>
                  <FontAwesome6 name="xmark" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <ThemedText variant="body" color={theme.textPrimary} style={styles.formLabel}>
                  产品名称
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="输入产品名称"
                  placeholderTextColor={theme.textMuted}
                  value={productName}
                  onChangeText={setProductName}
                />
                <ThemedText variant="body" color={theme.textPrimary} style={[styles.formLabel, { marginTop: 16 }]}>
                  产品价格
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="输入价格"
                  placeholderTextColor={theme.textMuted}
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="decimal-pad"
                />
                <ThemedText variant="body" color={theme.textPrimary} style={[styles.formLabel, { marginTop: 16 }]}>
                  产品描述
                </ThemedText>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="描述你的产品"
                  placeholderTextColor={theme.textMuted}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  multiline
                />
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowProductModal(false)}
                >
                  <ThemedText variant="body" color={theme.textPrimary}>取消</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => setShowProductModal(false)}
                >
                  <ThemedText variant="body" color={theme.buttonPrimaryText}>确定</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
  );
}

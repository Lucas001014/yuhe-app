import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { createFormDataFile } from '@/utils';

// 附件类型
type AttachmentType = 'photo' | 'video' | 'document';

// 附件数据结构
interface Attachment {
  id: string;
  uri: string;
  type: AttachmentType;
  name: string;
  size?: number;
  mimeType?: string;
}

// 验证错误状态类型
interface ValidationErrors {
  title: boolean;
  content: boolean;
  price: boolean;
  productName: boolean;
  productPrice: boolean;
  attachments: boolean;
}

export default function CreateScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [postType, setPostType] = useState<'normal' | 'qa_paid' | 'qa_bounty' | 'product'>('normal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: false,
    content: false,
    price: false,
    productName: false,
    productPrice: false,
    attachments: false,
  });

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 清除验证错误
  const clearValidationError = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // 显示成功弹窗
  const showSuccess = (title: string, message: string, onPress?: () => void) => {
    Alert.alert(title, message, [
      { text: '确定', style: 'default', onPress }
    ]);
  };

  // 生成唯一ID
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 获取附件图标
  const getAttachmentIcon = (type: AttachmentType): string => {
    switch (type) {
      case 'photo': return 'image';
      case 'video': return 'video';
      case 'document': return 'file-lines';
    }
  };

  // 添加照片
  const handleAddPhoto = async () => {
    setShowAttachmentSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能选择照片，请在设置中开启');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map(asset => ({
          id: generateId(),
          uri: asset.uri,
          type: 'photo' as AttachmentType,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        }));
        setAttachments([...attachments, ...newAttachments]);
        clearValidationError('attachments');
      }
    } catch (error: any) {
      console.error('选择照片失败:', error);
      Alert.alert('选择照片失败', error?.message || '未知错误，请重试');
    }
  };

  // 添加视频
  const handleAddVideo = async () => {
    setShowAttachmentSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能选择视频，请在设置中开启');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map(asset => ({
          id: generateId(),
          uri: asset.uri,
          type: 'video' as AttachmentType,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        }));
        setAttachments([...attachments, ...newAttachments]);
        clearValidationError('attachments');
      }
    } catch (error: any) {
      console.error('选择视频失败:', error);
      Alert.alert('选择视频失败', error?.message || '未知错误，请重试');
    }
  };

  // 添加文档
  const handleAddDocument = async () => {
    setShowAttachmentSheet(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map(asset => ({
          id: generateId(),
          uri: asset.uri,
          type: 'document' as AttachmentType,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        }));
        setAttachments([...attachments, ...newAttachments]);
        clearValidationError('attachments');
      }
    } catch (error: any) {
      console.error('选择文档失败:', error);
      Alert.alert('选择文档失败', error?.message || '未知错误，请重试');
    }
  };

  // 删除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // 上传附件到对象存储
  const uploadAttachments = async (attachmentList: Attachment[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < attachmentList.length; i++) {
      try {
        const attachment = attachmentList[i];
        const formData = new FormData();
        
        // 根据类型确定 MIME 类型
        let mimeType = attachment.mimeType || 'application/octet-stream';
        if (attachment.type === 'photo') mimeType = attachment.mimeType || 'image/jpeg';
        if (attachment.type === 'video') mimeType = attachment.mimeType || 'video/mp4';
        
        const file = await createFormDataFile(attachment.uri, attachment.name, mimeType);
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
        console.error(`上传第 ${i + 1} 个附件失败:`, error);
        throw new Error(`第 ${i + 1} 个附件上传失败: ${error?.message || '未知错误'}`);
      }
    }

    return uploadedUrls;
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      title: false,
      content: false,
      price: false,
      productName: false,
      productPrice: false,
      attachments: false,
    };

    let isValid = true;

    // 验证标题
    if (!title.trim() || title.trim().length < 2) {
      errors.title = true;
      isValid = false;
    }

    // 验证内容
    if (!content.trim() || content.length < 10) {
      errors.content = true;
      isValid = false;
    }

    // 验证价格（知识库/悬赏）
    if (postType === 'qa_paid' || postType === 'qa_bounty') {
      if (!price || parseFloat(price) < 1) {
        errors.price = true;
        isValid = false;
      }
    }

    // 验证产品信息
    if (postType === 'product') {
      if (!productName.trim()) {
        errors.productName = true;
        isValid = false;
      }
      if (!productPrice || parseFloat(productPrice) <= 0) {
        errors.productPrice = true;
        isValid = false;
      }
    }

    // 验证附件（知识库、悬赏、产品必须添加）
    if (postType !== 'normal' && attachments.length === 0) {
      errors.attachments = true;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // 发布帖子
  const handlePublish = async () => {
    // 验证表单
    if (!validateForm()) {
      return;
    }

    // 检查登录状态
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');
    const avatar = await AsyncStorage.getItem('avatar');

    if (!userId) {
      Alert.alert('未登录', '请先登录后再发布帖子');
      router.replace('/login');
      return;
    }

    setLoading(true);

    try {
      // 上传附件
      let uploadedAttachmentUrls: string[] = [];
      if (attachments.length > 0) {
        setUploadingFiles(true);
        try {
          uploadedAttachmentUrls = await uploadAttachments(attachments);
        } catch (uploadError: any) {
          Alert.alert('附件上传失败', uploadError?.message || '请检查网络后重试');
          setLoading(false);
          setUploadingFiles(false);
          return;
        }
        setUploadingFiles(false);
      }

      // 构建请求体
      const payload: any = {
        userId: parseInt(userId),
        username,
        avatar,
        type: postType,
        content: content.trim(),
        title: title.trim(),
        images: uploadedAttachmentUrls.filter((_, i) => attachments[i]?.type === 'photo'),
        videos: uploadedAttachmentUrls.filter((_, i) => attachments[i]?.type === 'video'),
        documents: uploadedAttachmentUrls.filter((_, i) => attachments[i]?.type === 'document'),
        attachments: attachments.map((a, i) => ({
          url: uploadedAttachmentUrls[i],
          type: a.type,
          name: a.name,
          size: a.size,
        })),
        tags: [],
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
        setAttachments([]);
        setPrice('');
        setPostType('normal');
        setProductName('');
        setProductPrice('');
        setProductDescription('');
        setContactInfo('');
        setValidationErrors({
          title: false,
          content: false,
          price: false,
          productName: false,
          productPrice: false,
          attachments: false,
        });
        
        if (data.post?.audit_status === 'approved') {
          showSuccess('发布成功', '您的帖子已成功发布！', () => {
            router.replace('/');
          });
        } else {
          showSuccess('已提交', data.message || '帖子已提交，等待审核', () => {
            router.replace('/');
          });
        }
      } else {
        Alert.alert('发布失败', data.error || data.message || '未知错误，请重试');
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
      
      Alert.alert('错误', errorMessage);
    } finally {
      setLoading(false);
      setUploadingFiles(false);
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
        return '产品';
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

  // 错误边框样式
  const errorBorderStyle = {
    borderWidth: 2,
    borderColor: '#EF4444',
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
              style={[styles.input, validationErrors.title && errorBorderStyle]}
              placeholder="输入标题（至少2个字符）"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                clearValidationError('title');
              }}
              maxLength={100}
            />
            {validationErrors.title && (
              <ThemedText variant="caption" color="#EF4444" style={{ marginTop: 4 }}>
                标题至少需要2个字符
              </ThemedText>
            )}
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
              style={[styles.textarea, validationErrors.content && errorBorderStyle]}
              placeholder="分享你的想法...（至少10个字符）"
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                clearValidationError('content');
              }}
              multiline
              numberOfLines={8}
              maxLength={10000}
              textAlignVertical="top"
            />
            {validationErrors.content && (
              <ThemedText variant="caption" color="#EF4444" style={{ marginTop: 4 }}>
                内容至少需要10个字符
              </ThemedText>
            )}
            <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 4 }}>
              {content.length}/10000（最少10字符）
            </ThemedText>
          </View>

          {/* 附件上传 */}
          <View style={[styles.section, validationErrors.attachments && errorBorderStyle, validationErrors.attachments && { borderRadius: 12, padding: 16 }]}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                附件{postType !== 'normal' && <ThemedText color="#EF4444"> *</ThemedText>}
              </ThemedText>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAttachmentSheet(true)}>
                <FontAwesome6 name="plus" size={14} color={theme.primary} />
                <ThemedText variant="body" color={theme.primary}>添加附件</ThemedText>
              </TouchableOpacity>
            </View>
            
            {validationErrors.attachments && (
              <ThemedText variant="caption" color="#EF4444" style={{ marginBottom: 8 }}>
                {getPostTypeLabel(postType)}帖子必须添加至少一个附件
              </ThemedText>
            )}
            
            {attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <View style={styles.attachmentIcon}>
                      <FontAwesome6 
                        name={getAttachmentIcon(attachment.type)} 
                        size={20} 
                        color={theme.primary} 
                      />
                    </View>
                    <View style={styles.attachmentInfo}>
                      <ThemedText variant="body" color={theme.textPrimary} numberOfLines={1}>
                        {attachment.name}
                      </ThemedText>
                      {attachment.size && (
                        <ThemedText variant="caption" color={theme.textMuted}>
                          {formatFileSize(attachment.size)}
                        </ThemedText>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveAttachment(attachment.id)}
                    >
                      <FontAwesome6 name="xmark" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* 照片预览 */}
            {attachments.filter(a => a.type === 'photo').length > 0 && (
              <View style={styles.imagesContainer}>
                {attachments.filter(a => a.type === 'photo').map((attachment) => (
                  <View key={attachment.id} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: attachment.uri }} style={styles.imagePreview} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveAttachment(attachment.id)}
                    >
                      <FontAwesome6 name="xmark" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <ThemedText variant="caption" color={theme.textMuted}>
              {postType === 'normal' 
                ? `已选 ${attachments.length} 个附件` 
                : `已选 ${attachments.length} 个附件（必须添加）`
              }
            </ThemedText>
          </View>

          {/* 价格设置（根据类型显示） */}
          {(postType === 'qa_paid' || postType === 'qa_bounty') && (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                {postType === 'qa_paid' ? '问答价格' : '悬赏金额'}
              </ThemedText>
              <TextInput
                style={[styles.input, validationErrors.price && errorBorderStyle]}
                placeholder={postType === 'qa_paid' ? '设置查看价格，最低1元' : '设置悬赏金额，最低1元'}
                placeholderTextColor={theme.textMuted}
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  clearValidationError('price');
                }}
                keyboardType="decimal-pad"
              />
              {validationErrors.price && (
                <ThemedText variant="caption" color="#EF4444" style={{ marginTop: 4 }}>
                  {postType === 'qa_paid' ? '知识库需要设置价格，最低1元' : '悬赏需要设置金额，最低1元'}
                </ThemedText>
              )}
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
                style={[styles.productInfoBox, (validationErrors.productName || validationErrors.productPrice) && errorBorderStyle]}
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
              {(validationErrors.productName || validationErrors.productPrice) && (
                <ThemedText variant="caption" color="#EF4444" style={{ marginTop: 4 }}>
                  请填写完整的产品名称和价格
                </ThemedText>
              )}
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
                    {uploadingFiles ? '上传附件中...' : '发布中...'}
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

        {/* 附件选择弹窗 */}
        <Modal
          visible={showAttachmentSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachmentSheet(false)}
        >
          <TouchableOpacity 
            style={attachmentStyles.overlay}
            activeOpacity={1}
            onPress={() => setShowAttachmentSheet(false)}
          >
            <TouchableOpacity 
              style={[attachmentStyles.sheetContainer, { backgroundColor: theme.backgroundDefault }]}
              activeOpacity={1}
            >
              <View style={attachmentStyles.sheetHeader}>
                <ThemedText variant="h4" color={theme.textPrimary}>添加附件</ThemedText>
                <TouchableOpacity onPress={() => setShowAttachmentSheet(false)}>
                  <FontAwesome6 name="xmark" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={attachmentStyles.sheetOption} onPress={handleAddPhoto}>
                <View style={[attachmentStyles.optionIcon, { backgroundColor: '#4F46E520' }]}>
                  <FontAwesome6 name="image" size={24} color="#4F46E5" />
                </View>
                <View style={attachmentStyles.optionContent}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>添加照片</ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>从相册选择照片</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
              
              <TouchableOpacity style={attachmentStyles.sheetOption} onPress={handleAddVideo}>
                <View style={[attachmentStyles.optionIcon, { backgroundColor: '#10B98120' }]}>
                  <FontAwesome6 name="video" size={24} color="#10B981" />
                </View>
                <View style={attachmentStyles.optionContent}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>添加视频</ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>从相册选择视频</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
              
              {/* 知识库和悬赏显示添加文档选项 */}
              {(postType === 'qa_paid' || postType === 'qa_bounty') && (
                <TouchableOpacity style={attachmentStyles.sheetOption} onPress={handleAddDocument}>
                  <View style={[attachmentStyles.optionIcon, { backgroundColor: '#F59E0B20' }]}>
                    <FontAwesome6 name="file-lines" size={24} color="#F59E0B" />
                  </View>
                  <View style={attachmentStyles.optionContent}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>添加文档</ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>PDF、Word、Excel等</ThemedText>
                  </View>
                  <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[attachmentStyles.cancelButton, { borderTopColor: theme.border }]}
                onPress={() => setShowAttachmentSheet(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

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
              
              <ScrollView style={styles.modalBody}>
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginBottom: 8 }}>
                  产品名称
                </ThemedText>
                <TextInput
                  style={[styles.input, validationErrors.productName && errorBorderStyle]}
                  placeholder="输入产品名称"
                  placeholderTextColor={theme.textMuted}
                  value={productName}
                  onChangeText={(text) => {
                    setProductName(text);
                    clearValidationError('productName');
                  }}
                />
                
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginBottom: 8, marginTop: 16 }}>
                  产品价格
                </ThemedText>
                <TextInput
                  style={[styles.input, validationErrors.productPrice && errorBorderStyle]}
                  placeholder="输入产品价格"
                  placeholderTextColor={theme.textMuted}
                  value={productPrice}
                  onChangeText={(text) => {
                    setProductPrice(text);
                    clearValidationError('productPrice');
                  }}
                  keyboardType="decimal-pad"
                />
                
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginBottom: 8, marginTop: 16 }}>
                  产品描述（选填）
                </ThemedText>
                <TextInput
                  style={[styles.textarea, { height: 100 }]}
                  placeholder="输入产品描述"
                  placeholderTextColor={theme.textMuted}
                  value={productDescription}
                  onChangeText={setProductDescription}
                  multiline
                  textAlignVertical="top"
                />
                
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginBottom: 8, marginTop: 16 }}>
                  联系方式（选填）
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="输入联系方式"
                  placeholderTextColor={theme.textMuted}
                  value={contactInfo}
                  onChangeText={setContactInfo}
                />
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowProductModal(false)}
                >
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>确定</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// 附件弹窗样式
const attachmentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 8,
  },
});

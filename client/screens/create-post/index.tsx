import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { createFormDataFile } from '@/utils';
import { Image } from 'expo-image';

export default function CreatePostScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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
  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showError('权限不足', '需要相册权限才能选择图片，请在设置中开启');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 9 - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        if (images.length + newImages.length > 9) {
          showError('图片过多', '最多只能上传9张图片');
          return;
        }
        setImages([...images, ...newImages]);
      }
    } catch (error: any) {
      console.error('选择图片失败:', error);
      showError('选择图片失败', error?.message || '未知错误，请重试');
    }
  }, [images.length]);

  // 删除图片
  const handleRemoveImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images]);

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
  const handlePublish = useCallback(async () => {
    // 验证标题
    if (!title.trim()) {
      showError('提示', '请输入标题');
      return;
    }

    if (title.trim().length < 2) {
      showError('提示', '标题至少需要2个字符');
      return;
    }

    // 验证内容
    if (!content.trim()) {
      showError('提示', '请输入内容');
      return;
    }

    if (content.length < 10) {
      showError('提示', '内容至少需要10个字符');
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

      // 创建帖子
      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          username,
          avatar,
          title: title.trim(),
          content: content.trim(),
          images: uploadedImages,
          type: 'normal',
          category: 'general',
          tags: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`服务器错误: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (data.post?.audit_status === 'approved') {
          showSuccess('发布成功', '您的帖子已成功发布！', () => {
            setTitle('');
            setContent('');
            setImages([]);
            router.back();
          });
        } else {
          showSuccess('已提交', data.message || '帖子已提交，等待审核', () => {
            router.back();
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
  }, [title, content, images, API_BASE_URL, router]);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="xmark" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h3" color={theme.textPrimary}>发布动态</ThemedText>
          <TouchableOpacity
            style={[styles.publishButton, loading && styles.publishButtonDisabled]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ThemedText
                variant="bodyMedium"
                color={theme.primary}
                style={{ fontWeight: '600' }}
              >
                发布
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 标题输入 */}
          <TextInput
            style={[styles.input, styles.titleInput]}
            placeholder="输入标题..."
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <ThemedText variant="caption" color={theme.textMuted} style={{ marginHorizontal: 16, marginBottom: 8 }}>
            {title.length}/100
          </ThemedText>

          {/* 内容输入 */}
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="分享你的想法...（至少10个字符）"
            placeholderTextColor={theme.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            maxLength={10000}
            textAlignVertical="top"
          />
          <ThemedText variant="caption" color={theme.textMuted} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            {content.length}/10000（最少10字符）
          </ThemedText>

          {/* 图片预览 */}
          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
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

          {/* 添加图片按钮 */}
          {images.length < 9 && (
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
              <FontAwesome6 name="image" size={24} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={{ marginLeft: 8 }}>
                添加图片 ({images.length}/9)
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* 发布按钮 */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

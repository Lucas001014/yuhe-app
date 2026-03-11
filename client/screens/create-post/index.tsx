import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { createStyles } from './styles';
import { createFormDataFile } from '@/utils';
import { Image } from 'expo-image';

export default function CreatePostScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // 权限控制
  useAuthGuard('/create-post');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 选择图片
  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('提示', '需要相册权限才能选择图片');
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
          Alert.alert('提示', '最多只能上传9张图片');
          return;
        }
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败');
    }
  }, [images.length]);

  // 删除图片
  const handleRemoveImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images]);

  // 发布帖子
  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }

    if (content.length < 10) {
      Alert.alert('提示', '内容至少需要10个字符');
      return;
    }

    try {
      setLoading(true);

      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      const avatar = await AsyncStorage.getItem('avatar');

      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      // 上传图片到对象存储
      const uploadedImages: string[] = [];
      for (const imageUri of images) {
        const formData = new FormData();
        const file = await createFormDataFile(imageUri, `image_${Date.now()}.jpg`, 'image/jpeg');
        formData.append('file', file as any);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.url) {
          uploadedImages.push(uploadData.url);
        }
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

      const data = await response.json();

      if (data.success) {
        if (data.post.status === 'approved') {
          Alert.alert('成功', '发布成功！', [
            { text: '确定', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('审核未通过', data.message || '您的帖子未通过审核', [
            { text: '确定', onPress: () => router.back() }
          ]);
        }
      } else {
        Alert.alert('发布失败', data.error || '未知错误');
      }
    } catch (error) {
      console.error('发布帖子失败:', error);
      Alert.alert('错误', '发布失败，请重试');
    } finally {
      setLoading(false);
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
            <ThemedText
              variant="bodyMedium"
              color={loading ? theme.textMuted : theme.primary}
              style={{ fontWeight: '600' }}
            >
              {loading ? '发布中...' : '发布'}
            </ThemedText>
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

          {/* 内容输入 */}
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="分享你的想法..."
            placeholderTextColor={theme.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            maxLength={10000}
            textAlignVertical="top"
          />

          {/* 图片预览 */}
          {images.length > 0 && (
            <View style={styles.imageContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <FontAwesome6 name="xmark" size={16} color={theme.buttonPrimaryText} />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 9 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handlePickImage}
                >
                  <FontAwesome6 name="plus" size={24} color={theme.textMuted} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    添加图片
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 添加图片按钮（当没有图片时） */}
          {images.length === 0 && (
            <TouchableOpacity
              style={styles.addImageLargeButton}
              onPress={handlePickImage}
            >
              <FontAwesome6 name="image" size={32} color={theme.primary} />
              <ThemedText variant="body" color={theme.primary} style={styles.addImageText}>
                添加图片
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                最多9张
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* 提示信息 */}
          <View style={styles.tipContainer}>
            <FontAwesome6 name="circle-info" size={14} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted} style={styles.tipText}>
              发布的内容将经过自动审核，审核通过后才能被其他用户看到
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

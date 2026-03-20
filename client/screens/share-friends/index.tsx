import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Friend {
  id: number;
  username: string;
  avatarUrl: string;
  bio?: string;
}

export default function ShareFriendsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const { postId } = useSafeSearchParams<{ postId: string }>();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 获取关注列表作为好友列表
  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        router.back();
        return;
      }

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：GET /api/v1/social/following/:userId
       */
      const response = await fetch(
        `${API_BASE_URL}/api/v1/social/following/${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setFriends(
          data.list.map((item: any) => ({
            id: item.id,
            username: item.username,
            avatarUrl: item.avatar_url || 'https://i.pravatar.cc/150',
            bio: item.bio,
          }))
        );
      }
    } catch (error) {
      console.error('获取好友列表失败:', error);
      Alert.alert('错误', '获取好友列表失败');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, router]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 发送分享
  const handleSend = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('提示', '请选择要分享的好友');
      return;
    }

    try {
      setSending(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      // 获取帖子信息
      const postResponse = await fetch(
        `${API_BASE_URL}/api/v1/posts/${postId}`
      );
      const postData = await postResponse.json();

      if (!postData.success) {
        Alert.alert('错误', '帖子不存在');
        return;
      }

      // 批量发送私信
      let successCount = 0;
      for (const friendId of selectedIds) {
        try {
          /**
           * 服务端文件：server/src/routes/social.ts
           * 接口：POST /api/v1/social/chats
           * Body 参数：senderId: number, receiverId: number, content: string
           */
          const response = await fetch(`${API_BASE_URL}/api/v1/social/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderId: parseInt(userId),
              receiverId: friendId,
              content: `分享了一个帖子给你：${postData.post?.title || '点击查看'}`,
            }),
          });
          const data = await response.json();
          if (data.success) {
            successCount++;
          }
        } catch (e) {
          console.error('发送失败:', e);
        }
      }

      Alert.alert('成功', `已分享给 ${successCount} 位好友`);
      router.back();
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('错误', '分享失败');
    } finally {
      setSending(false);
    }
  };

  // 渲染好友项
  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => toggleSelect(item.id)}
      >
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            {item.username}
          </ThemedText>
          {item.bio && (
            <ThemedText variant="caption" color={theme.textMuted} numberOfLines={1}>
              {item.bio}
            </ThemedText>
          )}
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && (
            <FontAwesome6 name="check" size={14} color={theme.buttonPrimaryText} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            分享给遇友
          </ThemedText>
          <TouchableOpacity
            style={[styles.sendButton, selectedIds.length === 0 && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={selectedIds.length === 0 || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.buttonPrimaryText} />
            ) : (
              <ThemedText
                variant="smallMedium"
                color={selectedIds.length > 0 ? theme.buttonPrimaryText : theme.textMuted}
              >
                发送({selectedIds.length})
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* 好友列表 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="users" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>
              暂无好友，快去关注一些用户吧
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Screen>
  );
}

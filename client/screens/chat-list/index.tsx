import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface ChatItem {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatListScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载聊天列表
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/chats?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('加载聊天列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  // 点击聊天项
  const handleChatPress = (chat: ChatItem) => {
    router.push('/chat-detail', { chatId: chat.id, username: chat.username });
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <ThemedText variant="h3" color={theme.textPrimary}>私信</ThemedText>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadChats}
          />
        }
      >
        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="comments" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              {loading ? '加载中...' : '暂无私信'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.chatsList}>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => handleChatPress(chat)}
              >
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                  {chat.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.username}>
                      {chat.username}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      {chat.time}
                    </ThemedText>
                  </View>

                  <ThemedText
                    variant="body"
                    color={theme.textSecondary}
                    numberOfLines={1}
                    style={styles.lastMessage}
                  >
                    {chat.lastMessage}
                  </ThemedText>
                </View>

                <View style={styles.chatRight}>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

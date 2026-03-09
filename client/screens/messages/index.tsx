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

interface MessageItem {
  id: number;
  type: 'like' | 'collect' | 'forward' | 'follow' | 'comment' | 'chat';
  title: string;
  content: string;
  avatar: string;
  username: string;
  postId?: number;
  postTitle?: string;
  time: string;
  unread: boolean;
  count?: number;
}

export default function MessagesScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'notifications' | 'chats'>('notifications');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载消息列表
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/messages?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  // 点击消息项
  const handleMessagePress = (message: MessageItem) => {
    // TODO: 标记为已读

    if (message.type === 'chat') {
      // 跳转到聊天列表
      router.push('/chat-list');
    } else if (message.type === 'follow') {
      // 跳转到关注列表
      router.push('/follow-list');
    } else if (message.postId) {
      // 跳转到帖子详情
      router.push('/post-detail', { postId: message.postId });
    }
  };

  // 切换 Tab
  const handleTabChange = (tab: 'notifications' | 'chats') => {
    setCurrentTab(tab);
    if (tab === 'chats') {
      router.push('/chat-list');
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'collect':
        return 'bookmark';
      case 'forward':
        return 'share-nodes';
      case 'follow':
        return 'user-plus';
      case 'comment':
        return 'comment';
      case 'chat':
        return 'message';
      default:
        return 'bell';
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#FF6B6B';
      case 'collect':
        return '#FFD93D';
      case 'forward':
        return '#6BCB77';
      case 'follow':
        return '#4D96FF';
      case 'comment':
        return '#9B59B6';
      case 'chat':
        return '#1ABC9C';
      default:
        return theme.textMuted;
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <View style={styles.header}>
        <ThemedText variant="h3" color={theme.textPrimary}>消息</ThemedText>
      </View>

      {/* Tab 切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            currentTab === 'notifications' && styles.tabItemActive,
          ]}
          onPress={() => setCurrentTab('notifications')}
        >
          <ThemedText
            variant="bodyMedium"
            color={currentTab === 'notifications' ? theme.primary : theme.textSecondary}
          >
            通知
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            currentTab === 'chats' && styles.tabItemActive,
          ]}
          onPress={() => handleTabChange('chats')}
        >
          <ThemedText
            variant="bodyMedium"
            color={currentTab === 'chats' ? theme.primary : theme.textSecondary}
          >
            聊天
          </ThemedText>
        </TouchableOpacity>
      </View>

      {currentTab === 'notifications' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadMessages}
            />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="comment-dots" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                {loading ? '加载中...' : '暂无消息'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.messagesList}>
              {messages.map((message) => (
                <TouchableOpacity
                  key={message.id}
                  style={[styles.messageItem, message.unread && styles.unreadItem]}
                  onPress={() => handleMessagePress(message)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: getTypeColor(message.type) }]}>
                    <FontAwesome6
                      name={getTypeIcon(message.type)}
                      size={20}
                      color={theme.buttonPrimaryText}
                    />
                  </View>

                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.messageTitle}>
                        {message.title}
                      </ThemedText>
                      <ThemedText variant="caption" color={theme.textMuted}>
                        {message.time}
                      </ThemedText>
                    </View>

                    <ThemedText variant="body" color={theme.textSecondary} numberOfLines={2} style={styles.messageText}>
                      {message.content}
                    </ThemedText>

                    {message.postTitle && (
                      <ThemedText variant="caption" color={theme.textMuted} style={styles.postTitle}>
                        {message.postTitle}
                      </ThemedText>
                    )}
                  </View>

                  <View style={styles.messageRight}>
                    {message.unread && <View style={styles.unreadDot} />}
                    {message.count !== undefined && message.count > 0 && (
                      <View style={styles.countBadge}>
                        <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                          {message.count > 99 ? '99+' : message.count}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </Screen>
  );
}

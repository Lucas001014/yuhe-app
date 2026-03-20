import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  postId: number | null;
  fromUserId: number;
  fromUsername: string;
  fromUserAvatar: string;
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  otherUserId: number;
  otherUsername: string;
  otherAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // 权限控制
  useAuthGuard('/messages');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'notifications' | 'chats'>('notifications');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setCurrentUserId(null);
        return;
      }
      setCurrentUserId(userId);

      // 并行加载通知和私信
      const [notificationsRes, chatsRes] = await Promise.all([
        /**
         * 服务端文件：server/src/routes/social.ts
         * 接口：GET /api/v1/social/notifications
         * Query 参数：userId: number
         */
        fetch(`${API_BASE_URL}/api/v1/social/notifications?userId=${userId}`),
        /**
         * 服务端文件：server/src/routes/social.ts
         * 接口：GET /api/v1/social/chats
         * Query 参数：userId: number
         */
        fetch(`${API_BASE_URL}/api/v1/social/chats?userId=${userId}`)
      ]);

      const notificationsData = await notificationsRes.json();
      const chatsData = await chatsRes.json();

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications);
        setUnreadCount(notificationsData.unreadCount);
      }

      if (chatsData.success) {
        setChats(chatsData.chats);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 标记通知已读
  const markAsRead = async (notificationId?: number) => {
    if (!currentUserId) return;

    try {
      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/notifications/read
       * Body 参数：userId: number, notificationId?: number
       */
      await fetch(`${API_BASE_URL}/api/v1/social/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(currentUserId),
          notificationId
        }),
      });

      // 更新本地状态
      if (notificationId) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      } else {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 获取类型图标和颜色
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return { icon: 'heart', color: theme.error };
      case 'collect':
        return { icon: 'bookmark', color: theme.primary };
      case 'share':
        return { icon: 'share-nodes', color: theme.accent };
      case 'follow':
        return { icon: 'user-plus', color: theme.success };
      case 'comment':
        return { icon: 'comment', color: '#3B82F6' };
      case 'message':
        return { icon: 'message', color: '#0EA5E9' };
      default:
        return { icon: 'bell', color: theme.textMuted };
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  // 点击通知
  const handleNotificationPress = (notification: Notification) => {
    // 标记已读
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // 根据类型跳转
    if (notification.type === 'follow') {
      router.push('/user-profile', { userId: notification.fromUserId.toString() });
    } else if (notification.postId) {
      router.push('/post-detail', { postId: notification.postId.toString() });
    }
  };

  // 点击聊天
  const handleChatPress = (chat: Chat) => {
    router.push('/chat', {
      userId: chat.otherUserId.toString(),
      username: chat.otherUsername,
      avatar: chat.otherAvatar
    });
  };

  // 渲染通知项
  const renderNotification = ({ item }: { item: Notification }) => {
    const { icon, color } = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.messageItem, !item.isRead && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <FontAwesome6 name={icon} size={18} color={color} />
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.messageTitle}>
              {item.fromUsername}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {formatTime(item.createdAt)}
            </ThemedText>
          </View>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.messageText}>
            {item.content}
          </ThemedText>
        </View>
        <View style={styles.messageRight}>
          {!item.isRead && <View style={styles.unreadDot} />}
          <Image source={{ uri: item.fromUserAvatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染聊天项
  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.messageItem, item.unreadCount > 0 && styles.unreadItem]}
      onPress={() => handleChatPress(item)}
    >
      <Image source={{ uri: item.otherAvatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.messageTitle}>
            {item.otherUsername}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {formatTime(item.lastMessageTime)}
          </ThemedText>
        </View>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.messageText} numberOfLines={1}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <View style={styles.messageRight}>
        {item.unreadCount > 0 && (
          <View style={styles.countBadge}>
            <ThemedText variant="caption" color={theme.buttonPrimaryText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 全部标记已读
  const handleMarkAllRead = () => {
    markAsRead();
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <ThemedText variant="h4" color={theme.textPrimary}>消息</ThemedText>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <ThemedText variant="small" color={theme.primary}>全部已读</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'notifications' && styles.tabItemActive]}
          onPress={() => setCurrentTab('notifications')}
        >
          <ThemedText variant="bodyMedium" color={currentTab === 'notifications' ? theme.primary : theme.textMuted}>
            通知
          </ThemedText>
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: 8, right: 20 }}>
              <View style={styles.countBadge}>
                <ThemedText variant="caption" color={theme.buttonPrimaryText} style={{ fontSize: 10 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </ThemedText>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'chats' && styles.tabItemActive]}
          onPress={() => setCurrentTab('chats')}
        >
          <ThemedText variant="bodyMedium" color={currentTab === 'chats' ? theme.primary : theme.textMuted}>
            私信
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* 列表 */}
      {currentTab === 'notifications' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="bell-slash" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                暂无通知
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.otherUserId.toString()}
          contentContainerStyle={styles.messagesList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="message" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                暂无私信
              </ThemedText>
            </View>
          }
        />
      )}
    </Screen>
  );
}

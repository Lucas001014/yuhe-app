import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
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

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: number;
  user: ChatUser;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export default function MessagesScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [notifications, setNotifications] = useState<MessageItem[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'notifications' | 'chats'>('notifications');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 模拟通知数据
  const mockNotifications: MessageItem[] = [
    {
      id: 1,
      type: 'like',
      title: '张三 赞了你的帖子',
      content: '创业初期的团队搭建经验分享',
      avatar: 'https://i.pravatar.cc/150?img=1',
      username: '张三',
      postId: 1,
      postTitle: '创业初期的团队搭建经验分享',
      time: '10分钟前',
      unread: true,
    },
    {
      id: 2,
      type: 'comment',
      title: '李四 评论了你的帖子',
      content: '这篇文章写得真好，非常有用！',
      avatar: 'https://i.pravatar.cc/150?img=2',
      username: '李四',
      postId: 2,
      postTitle: '从0到1的创业融资经验',
      time: '1小时前',
      unread: true,
    },
    {
      id: 3,
      type: 'follow',
      title: '王五 关注了你',
      content: '期待你的更多分享',
      avatar: 'https://i.pravatar.cc/150?img=3',
      username: '王五',
      time: '2小时前',
      unread: false,
    },
  ];

  // 模拟聊天数据
  const mockChats: ChatMessage[] = [
    {
      id: 1,
      user: {
        id: 1,
        name: '张三',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      lastMessage: '你好，我对你的创业项目很感兴趣，想了解一下...',
      time: '10:30',
      unread: true,
    },
    {
      id: 2,
      user: {
        id: 2,
        name: '李四',
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
      lastMessage: '好的，我们明天下午三点见面聊一下',
      time: '昨天',
      unread: false,
    },
    {
      id: 3,
      user: {
        id: 3,
        name: '王五',
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
      lastMessage: '项目资料已经发到你邮箱了，请查收',
      time: '2024-03-08',
      unread: true,
    },
    {
      id: 4,
      user: {
        id: 4,
        name: '赵六',
        avatar: 'https://i.pravatar.cc/150?img=4',
      },
      lastMessage: '恭喜你获得A轮融资！',
      time: '2024-03-07',
      unread: false,
    },
  ];

  // 加载消息列表
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setNotifications(mockNotifications);
      setChats(mockChats);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  // 获取过滤后的通知
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(msg =>
      msg.title.toLowerCase().includes(query) ||
      msg.content.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  // 获取过滤后的聊天
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat =>
      chat.user.name.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

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

  // 点击通知项
  const handleNotificationPress = (message: MessageItem) => {
    if (message.type === 'follow') {
      router.push('/follow-list');
    } else if (message.postId) {
      router.push('/post-detail', { postId: message.postId });
    }
  };

  // 点击聊天项
  const handleChatPress = (chat: ChatMessage) => {
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unread: false } : c
      )
    );

    router.push('/chat', {
      userId: chat.user.id,
      userName: chat.user.name,
      userAvatar: chat.user.avatar,
    });
  };

  // 渲染通知项
  const renderNotificationItem = ({ item }: { item: MessageItem }) => {
    return (
      <TouchableOpacity
        style={[styles.messageItem, item.unread && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) }]}>
          <FontAwesome6
            name={getTypeIcon(item.type) as any}
            size={20}
            color={theme.buttonPrimaryText}
          />
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.messageTitle}>
              {item.title}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.time}
            </ThemedText>
          </View>

          <ThemedText variant="body" color={theme.textSecondary} numberOfLines={2} style={styles.messageText}>
            {item.content}
          </ThemedText>

          {item.postTitle && (
            <ThemedText variant="caption" color={theme.textMuted} style={styles.postTitle}>
              {item.postTitle}
            </ThemedText>
          )}
        </View>

        <View style={styles.messageRight}>
          {item.unread && <View style={styles.unreadDot} />}
          {item.count !== undefined && item.count > 0 && (
            <View style={styles.countBadge}>
              <ThemedText variant="caption" color={theme.buttonPrimaryText}>
                {item.count > 99 ? '99+' : item.count}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染聊天项
  const renderChatItem = ({ item }: { item: ChatMessage }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <ThemedText
              variant="bodyMedium"
              color={theme.textPrimary}
              style={styles.userName}
              numberOfLines={1}
            >
              {item.user.name}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.time}
            </ThemedText>
          </View>

          <ThemedText
            variant="body"
            color={item.unread ? theme.textPrimary : theme.textSecondary}
            style={[styles.lastMessage, item.unread && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
        </View>

        <FontAwesome6
          name="chevron-right"
          size={16}
          color={theme.textMuted}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 页面标题 */}
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
          onPress={() => setCurrentTab('chats')}
        >
          <ThemedText
            variant="bodyMedium"
            color={currentTab === 'chats' ? theme.primary : theme.textSecondary}
          >
            聊天
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={currentTab === 'notifications' ? '搜索通知...' : '搜索聊天...'}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome6 name="xmark" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* 通知列表 */}
      {currentTab === 'notifications' && (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadMessages}
              tintColor={theme.textMuted}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="comment-dots" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                {loading ? '加载中...' : '暂无通知'}
              </ThemedText>
            </View>
          }
        />
      )}

      {/* 聊天列表 */}
      {currentTab === 'chats' && (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadMessages}
              tintColor={theme.textMuted}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="comments" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                {loading ? '加载中...' : '暂无聊天'}
              </ThemedText>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      position: 'relative',
    },
    tabItemActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 12,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.textPrimary,
    },
    listContent: {
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
      gap: 16,
    },
    emptyText: {
      marginTop: 8,
    },
    // 通知列表样式
    messageItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    unreadItem: {
      backgroundColor: `${theme.primary}10`,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    messageContent: {
      flex: 1,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    messageTitle: {
      fontWeight: '600',
    },
    messageText: {
      lineHeight: 20,
      marginBottom: 4,
    },
    postTitle: {
      marginTop: 4,
    },
    messageRight: {
      alignItems: 'flex-end',
      gap: 6,
      minHeight: 44,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    countBadge: {
      minWidth: 20,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 聊天列表样式
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 15,
      backgroundColor: theme.backgroundDefault,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.backgroundTertiary,
    },
    chatContent: {
      flex: 1,
      justifyContent: 'center',
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      marginRight: 8,
    },
    lastMessage: {
      fontSize: 14,
      lineHeight: 20,
    },
    unreadMessage: {
      fontWeight: '600',
    },
    arrowIcon: {
      marginLeft: 8,
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginLeft: 78,
    },
  });

import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Image } from 'expo-image';

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

export default function ChatListScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 模拟聊天会话数据
  const mockMessages: ChatMessage[] = [
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
    {
      id: 5,
      user: {
        id: 5,
        name: '钱七',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      lastMessage: '我们需要再详细讨论一下技术方案',
      time: '2024-03-06',
      unread: false,
    },
  ];

  // 加载聊天列表
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      // 这里可以调用真实的 API
      // const response = await fetch(`${API_BASE_URL}/api/v1/chats`);
      // const data = await response.json();
      // if (data.success) {
      //   setMessages(data.chats || []);
      // }
      
      // 使用模拟数据
      setMessages(mockMessages);
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

  // 点击会话项
  const handleChatPress = (chat: ChatMessage) => {
    // 标记为已读
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === chat.id ? { ...msg, unread: false } : msg
      )
    );

    // 跳转到聊天页面
    router.push('/chat', {
      userId: chat.user.id,
      userName: chat.user.name,
      userAvatar: chat.user.avatar,
    });
  };

  // 渲染单条会话项
  const renderChatItem = ({ item }: { item: ChatMessage }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        {/* 头像 */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          {/* 未读红点 */}
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        {/* 内容区域 */}
        <View style={styles.chatContent}>
          {/* 昵称 + 时间 */}
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

          {/* 最后一条消息 */}
          <ThemedText
            variant="body"
            color={item.unread ? theme.textPrimary : theme.textSecondary}
            style={[styles.lastMessage, item.unread && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
        </View>

        {/* 箭头图标 */}
        <FontAwesome6
          name="chevron-right"
          size={16}
          color={theme.textMuted}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  // 渲染分隔线
  const renderSeparator = () => {
    return <View style={styles.separator} />;
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 页面标题 */}
      <View style={styles.header}>
        <ThemedText variant="h3" color={theme.textPrimary}>
          聊天
        </ThemedText>
      </View>

      {/* 聊天列表 */}
      <FlatList
        data={messages}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadChats}
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
    </Screen>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    listContent: {
      flexGrow: 1,
    },
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
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#F56C6C',
      borderWidth: 2,
      borderColor: theme.backgroundDefault,
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
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
      marginLeft: 78, // 从头像右侧开始显示
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
  });

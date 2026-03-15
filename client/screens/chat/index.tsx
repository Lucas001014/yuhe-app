import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  username: string;
  avatarUrl: string;
  isMine: boolean;
}

interface ChatParams {
  userId: string;
  username: string;
  avatar: string;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<ChatParams>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 获取对方用户信息
  const otherUserId = params.userId;
  const otherUsername = params.username || '用户';
  const otherAvatar = params.avatar || 'https://i.pravatar.cc/150';

  // 加载聊天记录
  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;

    try {
      const cId = await AsyncStorage.getItem('userId');
      setCurrentUserId(cId);

      if (!cId) return;

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：GET /api/v1/social/chats/:otherUserId
       * Query 参数：userId: number
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/chats/${otherUserId}?userId=${cId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        // 滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || !currentUserId || !otherUserId || sending) return;

    try {
      setSending(true);

      /**
       * 服务端文件：server/src/routes/social.ts
       * 接口：POST /api/v1/social/chats
       * Body 参数：senderId: number, receiverId: number, content: string
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/social/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: parseInt(currentUserId),
          receiverId: parseInt(otherUserId),
          content: inputText.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setInputText('');
        // 滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setSending(false);
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 渲染消息项
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showTime = index === 0 || 
      new Date(item.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5分钟

    return (
      <View style={styles.messageRow}>
        {showTime && (
          <View style={styles.messageTime}>
            <ThemedText variant="caption" color={theme.textMuted}>
              {formatTime(item.createdAt)}
            </ThemedText>
          </View>
        )}
        <View style={item.isMine ? styles.messageBubbleMine : styles.messageBubbleOther}>
          <ThemedText
            variant="body"
            color={item.isMine ? theme.buttonPrimaryText : theme.textPrimary}
          >
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Image source={{ uri: otherAvatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>
              {otherUsername}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push('/user-profile', { userId: otherUserId })}>
            <FontAwesome6 name="user" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 消息列表 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* 输入框 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="输入消息..."
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <FontAwesome6 name="paper-plane" size={16} color={theme.buttonPrimaryText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

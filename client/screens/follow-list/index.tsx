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

interface User {
  id: number;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

export default function FollowListScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const type = activeTab === 'followers' ? 'followers' : 'following';
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${type}?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 页面聚焦或Tab切换时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [activeTab])
  );

  // 切换关注状态
  const handleFollowToggle = async (user: User) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId: parseInt(userId) }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
        ));
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <ThemedText variant="h3" color={theme.textPrimary}>
          {activeTab === 'followers' ? '我的粉丝' : '我的关注'}
        </ThemedText>
        <View style={{ width: 20 }} />
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <ThemedText
            variant="bodyMedium"
            color={activeTab === 'followers' ? theme.buttonPrimaryText : theme.textSecondary}
          >
            粉丝
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <ThemedText
            variant="bodyMedium"
            color={activeTab === 'following' ? theme.buttonPrimaryText : theme.textSecondary}
          >
            关注
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadUsers}
          />
        }
      >
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="users" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              {loading ? '加载中...' : '暂无用户'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.usersList}>
            {users.map((user) => (
              <View key={user.id} style={styles.userItem}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />

                <View style={styles.userInfo}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.username}>
                    {user.username}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted} numberOfLines={1}>
                    {user.bio || '这个人很懒，什么都没写'}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={[
                    styles.followButton,
                    user.isFollowing && styles.followingButton,
                  ]}
                  onPress={() => handleFollowToggle(user)}
                >
                  <ThemedText
                    variant="small"
                    color={user.isFollowing ? theme.textSecondary : theme.buttonPrimaryText}
                  >
                    {user.isFollowing ? '已关注' : '关注'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

interface User {
  id: number;
  username: string;
  avatar?: string;
  role: 'user' | 'merchant';
  createdAt: string;
}

export default function AdminUsersScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/users?page=1&pageSize=100`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  // 切换用户角色
  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'user' ? 'merchant' : 'user';
    Alert.alert(
      '确认操作',
      `确定要将用户 "${user.username}" 的角色切换为 ${newRole === 'merchant' ? '商家' : '普通用户'}吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '用户角色已更新');
                fetchUsers();
              } else {
                Alert.alert('失败', data.error || '更新失败');
              }
            } catch (error) {
              Alert.alert('错误', '更新失败');
            }
          },
        },
      ]
    );
  };

  // 封禁用户
  const handleBanUser = (user: User) => {
    Alert.alert(
      '确认封禁',
      `确定要封禁用户 "${user.username}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '封禁',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.id}/ban`, {
                method: 'PUT',
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '用户已封禁');
                fetchUsers();
              } else {
                Alert.alert('失败', data.error || '操作失败');
              }
            } catch (error) {
              Alert.alert('错误', '操作失败');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h4" color={theme.textPrimary}>用户管理</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* 统计信息 */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: `${theme.primary}15` }]}>
            <ThemedText variant="h3" color={theme.primary}>{users.length}</ThemedText>
            <ThemedText variant="body" color={theme.textSecondary}>总用户数</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${theme.accent}15` }]}>
            <ThemedText variant="h3" color={theme.accent}>
              {users.filter(u => u.role === 'merchant').length}
            </ThemedText>
            <ThemedText variant="body" color={theme.textSecondary}>商家</ThemedText>
          </View>
        </View>

        {/* 用户列表 */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ThemedText variant="body" color={theme.textMuted}>加载中...</ThemedText>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerContainer}>
            <FontAwesome6 name="users" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无用户
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {users.map((user) => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: theme.backgroundDefault }]}>
                {/* 用户信息 */}
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <ThemedText variant="h4" color="#fff">
                      {user.username.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.userMeta}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      {user.username}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      ID: {user.id}
                    </ThemedText>
                  </View>
                </View>

                {/* 角色徽章 */}
                <View style={styles.badge}>
                  <FontAwesome6
                    name={user.role === 'merchant' ? 'store' : 'user'}
                    size={12}
                    color={user.role === 'merchant' ? '#fff' : '#fff'}
                  />
                  <ThemedText variant="caption" color="#fff">
                    {user.role === 'merchant' ? '商家' : '普通用户'}
                  </ThemedText>
                </View>

                {/* 注册时间 */}
                <ThemedText variant="caption" color={theme.textMuted} style={styles.registerTime}>
                  注册于 {new Date(user.createdAt).toLocaleDateString()}
                </ThemedText>

                {/* 操作按钮 */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.primary}15` }]}
                    onPress={() => handleToggleRole(user)}
                  >
                    <FontAwesome6 name="repeat" size={14} color={theme.primary} />
                    <ThemedText variant="small" color={theme.primary}>
                      切换为{user.role === 'merchant' ? '用户' : '商家'}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${theme.error}15` }]}
                    onPress={() => handleBanUser(user)}
                  >
                    <FontAwesome6 name="ban" size={14} color={theme.error} />
                    <ThemedText variant="small" color={theme.error}>封禁</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

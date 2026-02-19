import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from '../styles';

interface User {
  id: number;
  username: string;
  role: 'user' | 'merchant';
  createdAt: string;
}

export default function UsersManagement() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users?page=1&pageSize=100`);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'user' ? 'merchant' : 'user';
    
    Alert.alert(
      '确认操作',
      `确定要将该用户切换为${newRole === 'merchant' ? '商家' : '用户'}吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
              });
              
              const data = await res.json();
              if (data.success) {
                Alert.alert('成功', '角色切换成功');
                fetchUsers();
              } else {
                Alert.alert('失败', data.error || '操作失败');
              }
            } catch (error) {
              Alert.alert('失败', '操作失败');
            }
          },
        },
      ]
    );
  };

  const handleBan = async (userId: number) => {
    Alert.alert(
      '确认封禁',
      '确定要封禁这个用户吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '封禁',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users/${userId}/ban`, {
                method: 'PUT',
              });
              
              const data = await res.json();
              if (data.success) {
                Alert.alert('成功', '封禁成功');
                fetchUsers();
              } else {
                Alert.alert('失败', data.error || '操作失败');
              }
            } catch (error) {
              Alert.alert('失败', '操作失败');
            }
          },
        },
      ]
    );
  };

  const getBadgeStyle = (role: string) => {
    return role === 'merchant' ? styles.badgeWarning : styles.badgeSuccess;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>加载中...</ThemedText>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>暂无用户</ThemedText>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <ThemedText variant="h2">用户管理</ThemedText>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 600 }}>
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>ID</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>用户名</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 1 }]}>角色</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>注册时间</ThemedText>
            <ThemedText style={[styles.tableCellHeader, { flex: 2 }]}>操作</ThemedText>
          </View>

          {users.map((user) => (
            <View key={user.id} style={styles.tableRow}>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>{user.id}</ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 2 }]}>{user.username}</ThemedText>
              <View style={[styles.badge, getBadgeStyle(user.role), { flex: 1 }]}>
                <ThemedText style={{ color: 'inherit' }}>
                  {user.role === 'merchant' ? '商家' : '用户'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.tableCell, { flex: 2 }]}>
                {new Date(user.createdAt).toLocaleDateString()}
              </ThemedText>
              <View style={[styles.actionButtons, { flex: 2 }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonPrimary]}
                  onPress={() => handleToggleRole(user.id, user.role)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>
                    切换角色
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buttonDanger]}
                  onPress={() => handleBan(user.id)}
                >
                  <ThemedText style={{ color: theme.buttonPrimaryText, fontSize: 12 }}>
                    封禁
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      </View>
    </View>
  );
}

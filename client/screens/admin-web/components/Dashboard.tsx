import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from '../styles';

interface DashboardProps {
  stats: {
    posts: number;
    users: number;
    categories: number;
  };
  loading: boolean;
  onRefresh: () => void;
}

export default function AdminDashboard({ stats, loading, onRefresh }: DashboardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const statItems = [
    {
      key: 'posts',
      label: '帖子总数',
      value: stats.posts,
      icon: 'file-lines' as const,
      color: theme.primary,
    },
    {
      key: 'users',
      label: '用户总数',
      value: stats.users,
      icon: 'users' as const,
      color: theme.success,
    },
    {
      key: 'categories',
      label: '类别数量',
      value: stats.categories,
      icon: 'tags' as const,
      color: theme.accent,
    },
  ];

  return (
    <View>
      <View style={styles.header}>
        <ThemedText variant="h2">仪表盘</ThemedText>
      </View>

      <View style={styles.statsGrid}>
        {statItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.statCard}
            activeOpacity={0.7}
          >
            <View style={{ alignItems: 'center' }}>
              <FontAwesome6
                name={item.icon}
                size={32}
                color={item.color}
                style={{ marginBottom: 8 }}
              />
              <ThemedText variant="h1" style={[styles.statNumber, { color: item.color }]}>
                {loading ? '...' : item.value}
              </ThemedText>
              <ThemedText variant="body" style={styles.statLabel}>
                {item.label}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onRefresh}
      >
        <ThemedText style={styles.buttonText}>刷新数据</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

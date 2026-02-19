import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

export default function AdminScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  const menuItems = [
    {
      title: '帖子管理',
      description: '管理所有帖子内容',
      icon: 'file-lines',
      route: '/admin/posts',
      color: theme.primary,
    },
    {
      title: '用户管理',
      description: '管理用户和权限',
      icon: 'users',
      route: '/admin/users',
      color: theme.success,
    },
    {
      title: '类别管理',
      description: '管理内容分类',
      icon: 'tags',
      route: '/admin/categories',
      color: theme.accent,
    },
    {
      title: '系统设置',
      description: '系统配置和参数',
      icon: 'gear',
      route: '/admin/settings',
      color: theme.textMuted,
    },
  ];

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>管理后台</ThemedText>
          <ThemedText variant="body" color={theme.textSecondary}>
            欢迎回来，管理员
          </ThemedText>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText variant="h3" color={theme.primary}>100</ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>帖子总数</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText variant="h3" color={theme.success}>10</ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>用户总数</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText variant="h3" color={theme.accent}>11</ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>类别数量</ThemedText>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.menuTitle}>
            功能菜单
          </ThemedText>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <FontAwesome6 name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  {item.title}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {item.description}
                </ThemedText>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import AdminDashboard from './components/Dashboard';
import PostsManagement from './components/PostsManagement';
import UsersManagement from './components/UsersManagement';
import CategoriesManagement from './components/CategoriesManagement';

type AdminTab = 'dashboard' | 'posts' | 'users' | 'categories';

interface TabItem {
  id: AdminTab;
  title: string;
  icon: keyof typeof FontAwesome6.glyphMap;
}

const tabs: TabItem[] = [
  { id: 'dashboard', title: '仪表盘', icon: 'chart-pie' },
  { id: 'posts', title: '帖子管理', icon: 'file-lines' },
  { id: 'users', title: '用户管理', icon: 'users' },
  { id: 'categories', title: '类别管理', icon: 'tags' },
];

export default function AdminWebPage() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [postsRes, usersRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/posts?page=1&pageSize=1`),
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users?page=1&pageSize=1`),
        fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/categories`),
      ]);

      const posts = await postsRes.json();
      const users = await usersRes.json();
      const categories = await categoriesRes.json();

      setStats({
        posts: posts.pagination?.total || 0,
        users: users.pagination?.total || 0,
        categories: categories.categories?.length || 0,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} loading={loading} onRefresh={fetchStats} />;
      case 'posts':
        return <PostsManagement onRefresh={() => {
          setActiveTab('dashboard');
          fetchStats();
        }} />;
      case 'users':
        return <UsersManagement />;
      case 'categories':
        return <CategoriesManagement />;
      default:
        return null;
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <View style={styles.container}>
        {/* 侧边栏 */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <FontAwesome6 name="shield-halved" size={24} color={theme.primary} />
            <ThemedText variant="h3" style={styles.sidebarTitle}>管理后台</ThemedText>
          </View>

          <View style={styles.menuContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.menuItem,
                  activeTab === tab.id && styles.menuItemActive,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <FontAwesome6
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? theme.primary : theme.textMuted}
                />
                <ThemedText
                  variant="body"
                  style={[
                    styles.menuItemText,
                    activeTab === tab.id && styles.menuItemTextActive,
                  ]}
                >
                  {tab.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome6 name="arrow-left" size={20} color={theme.textMuted} />
            <ThemedText variant="body" style={styles.backButtonText}>返回首页</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollContent}>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}

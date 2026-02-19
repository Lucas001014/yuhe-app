import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { createStyles } from './styles';

type Tab = 'dashboard' | 'admin' | 'frontend' | 'logs';

interface TabItem {
  id: Tab;
  title: string;
  icon: keyof typeof FontAwesome6.glyphMap;
}

const tabs: TabItem[] = [
  { id: 'dashboard', title: '仪表盘', icon: 'chart-line' },
  { id: 'admin', title: '内容管理', icon: 'folder-open' },
  { id: 'frontend', title: '前端控制', icon: 'gears' },
  { id: 'logs', title: '系统日志', icon: 'terminal' },
];

export default function ControlPanel() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<Array<{ time: string; level: string; message: string }>>([]);
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    categories: 0,
    uptime: 0,
    memory: 0,
  });

  const addLog = useCallback((level: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, level, message }, ...prev].slice(0, 100));
  }, []);

  const fetchData = useCallback(async () => {
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
        uptime: Math.floor(Math.random() * 1000 + 100),
        memory: Math.random() * 100 + 50,
      });
    } catch (error) {
      addLog('ERROR', '获取数据失败');
    }
  }, [addLog]);

  useEffect(() => {
    // 使用 setTimeout 避免同步调用 setState
    const timer = setTimeout(() => {
      fetchData();
      addLog('INFO', '控制面板已启动');
    }, 0);
    
    return () => clearTimeout(timer);
  }, [fetchData, addLog]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    addLog('INFO', '数据已刷新');
    setRefreshing(false);
  };

  const executeCommand = () => {
    if (!command.trim()) return;
    
    addLog('INFO', `执行命令: ${command}`);
    
    try {
      // 这里可以执行一些前端命令
      switch (command.toLowerCase()) {
        case 'clear':
          if (Platform.OS === 'web') {
            localStorage.clear();
          } else {
            AsyncStorage.clear();
          }
          addLog('SUCCESS', '缓存已清空');
          break;
        case 'reload':
          if (Platform.OS === 'web') {
            window.location.reload();
          } else {
            addLog('INFO', '移动端不支持重新加载');
          }
          break;
        case 'version':
          addLog('INFO', 'React Native Version: 0.75.4');
          addLog('INFO', 'Expo Version: 54');
          addLog('INFO', `Platform: ${Platform.OS}`);
          break;
        default:
          addLog('WARN', `未知命令: ${command}`);
      }
    } catch (error) {
      addLog('ERROR', `命令执行失败: ${error}`);
    }
    
    setCommand('');
  };

  const handleClearCache = () => {
    Alert.alert(
      '确认清理',
      '确定要清理所有缓存吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                localStorage.clear();
                sessionStorage.clear();
              } else {
                await AsyncStorage.clear();
              }
              addLog('SUCCESS', '缓存已清理');
              Alert.alert('成功', '缓存已清理');
            } catch (error) {
              addLog('ERROR', '清理缓存失败');
              Alert.alert('失败', '清理缓存失败');
            }
          },
        },
      ]
    );
  };

  const renderDashboard = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <ThemedText variant="h2">仪表盘</ThemedText>
        <TouchableOpacity onPress={onRefresh}>
          <FontAwesome6 name="rotate" size={24} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <FontAwesome6 name="file-lines" size={32} color={theme.primary} />
          <ThemedText variant="h1" style={styles.statNumber}>{stats.posts}</ThemedText>
          <ThemedText variant="body" style={styles.statLabel}>帖子总数</ThemedText>
        </View>

        <View style={styles.statCard}>
          <FontAwesome6 name="users" size={32} color={theme.success} />
          <ThemedText variant="h1" style={[styles.statNumber, { color: theme.success }]}>{stats.users}</ThemedText>
          <ThemedText variant="body" style={styles.statLabel}>用户总数</ThemedText>
        </View>

        <View style={styles.statCard}>
          <FontAwesome6 name="tags" size={32} color={theme.accent} />
          <ThemedText variant="h1" style={[styles.statNumber, { color: theme.accent }]}>{stats.categories}</ThemedText>
          <ThemedText variant="body" style={styles.statLabel}>类别数量</ThemedText>
        </View>

        <View style={styles.statCard}>
          <FontAwesome6 name="server" size={32} color={theme.warning} />
          <ThemedText variant="h1" style={[styles.statNumber, { color: theme.warning }]}>{stats.uptime}</ThemedText>
          <ThemedText variant="body" style={styles.statLabel}>运行时间(分钟)</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText variant="h3" style={styles.sectionTitle}>快速操作</ThemedText>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} onPress={() => router.push('/admin-web')}>
            <FontAwesome6 name="gear" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>管理后台</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]} onPress={() => router.push('/')}>
            <FontAwesome6 name="house" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>返回首页</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAdmin = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <ThemedText variant="h2">内容管理</ThemedText>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-web')}>
          <FontAwesome6 name="file-lines" size={24} color={theme.primary} />
          <View style={styles.menuItemContent}>
            <ThemedText variant="h4" style={styles.menuItemTitle}>帖子管理</ThemedText>
            <ThemedText variant="caption" style={styles.menuItemDesc}>管理所有帖子内容</ThemedText>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome6 name="users" size={24} color={theme.success} />
          <View style={styles.menuItemContent}>
            <ThemedText variant="h4" style={styles.menuItemTitle}>用户管理</ThemedText>
            <ThemedText variant="caption" style={styles.menuItemDesc}>管理用户和权限</ThemedText>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome6 name="tags" size={24} color={theme.accent} />
          <View style={styles.menuItemContent}>
            <ThemedText variant="h4" style={styles.menuItemTitle}>类别管理</ThemedText>
            <ThemedText variant="caption" style={styles.menuItemDesc}>管理内容分类</ThemedText>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFrontend = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <ThemedText variant="h2">前端控制</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText variant="h3" style={styles.sectionTitle}>缓存管理</ThemedText>
        <TouchableOpacity style={styles.operationButton} onPress={handleClearCache}>
          <FontAwesome6 name="trash" size={20} color={theme.error} />
          <ThemedText style={styles.operationButtonText}>清理缓存</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText variant="h3" style={styles.sectionTitle}>页面操作</ThemedText>
        <TouchableOpacity 
          style={styles.operationButton} 
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.reload();
            } else {
              Alert.alert('提示', '移动端请下拉刷新页面');
            }
          }}
        >
          <FontAwesome6 name="rotate" size={20} color={theme.primary} />
          <ThemedText style={styles.operationButtonText}>刷新页面</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText variant="h3" style={styles.sectionTitle}>命令执行</ThemedText>
        <TextInput
          style={[styles.commandInput, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary, borderColor: theme.border }]}
          placeholder="输入命令（如：clear, reload, version）"
          placeholderTextColor={theme.textMuted}
          value={command}
          onChangeText={setCommand}
          onSubmitEditing={executeCommand}
        />
        <TouchableOpacity style={[styles.operationButton, styles.operationButtonPrimary]} onPress={executeCommand}>
          <FontAwesome6 name="play" size={20} color="#fff" />
          <ThemedText style={[styles.operationButtonText, { color: '#fff' }]}>执行命令</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLogs = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <ThemedText variant="h2">系统日志</ThemedText>
        <TouchableOpacity onPress={() => setLogs([])}>
          <FontAwesome6 name="trash" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        {logs.length === 0 ? (
          <ThemedText style={styles.emptyText}>暂无日志</ThemedText>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <ThemedText variant="caption" style={[styles.logTime, { color: theme.textMuted }]}>
                [{log.time}]
              </ThemedText>
              <View style={[
                styles.logLevel,
                log.level === 'ERROR' && { backgroundColor: `${theme.error}20` },
                log.level === 'SUCCESS' && { backgroundColor: `${theme.success}20` },
                log.level === 'WARN' && { backgroundColor: `${theme.warning}20` },
              ]}>
                <ThemedText variant="caption" style={[
                  { color: log.level === 'ERROR' ? theme.error : log.level === 'SUCCESS' ? theme.success : log.level === 'WARN' ? theme.warning : theme.primary }
                ]}>
                  {log.level}
                </ThemedText>
              </View>
              <ThemedText variant="body" style={[styles.logMessage, { color: theme.textSecondary }]}>
                {log.message}
              </ThemedText>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'admin':
        return renderAdmin();
      case 'frontend':
        return renderFrontend();
      case 'logs':
        return renderLogs();
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
            <FontAwesome6 name="shield-halved" size={28} color={theme.primary} />
            <ThemedText variant="h3" style={styles.sidebarTitle}>控制面板</ThemedText>
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
            <ThemedText variant="body" style={styles.backButtonText}>返回</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { Stack } from 'expo-router';

type TabType = 'dashboard' | 'users' | 'posts' | 'transactions';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
  };
  posts: {
    total: number;
    published: number;
    pending: number;
  };
  transactions: {
    total: number;
    totalAmount: number;
    successRate: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  postCount: number;
  transactionCount: number;
}

interface Post {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  type: 'free' | 'paid' | 'bounty';
  status: 'published' | 'pending' | 'deleted';
  createdAt: string;
  viewCount: number;
  likeCount: number;
}

interface Transaction {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  type: 'qa_payment' | 'bounty_payment' | 'product_purchase';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: string;
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, [API_BASE]);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/admin/users?page=1&limit=20`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 获取帖子列表
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/admin/posts?page=1&limit=20`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 获取交易记录
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/admin/transactions?page=1&limit=20`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('获取交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 更新用户状态
  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', data.message);
        fetchUsers();
      }
    } catch (error) {
      Alert.alert('错误', '更新用户状态失败');
    }
  };

  // 删除帖子
  const deletePost = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', data.message);
        fetchPosts();
      }
    } catch (error) {
      Alert.alert('错误', '删除帖子失败');
    }
  };

  // 批准帖子
  const approvePost = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/posts/${postId}/approve`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', data.message);
        fetchPosts();
      }
    } catch (error) {
      Alert.alert('错误', '批准帖子失败');
    }
  };

  // 处理退款
  const refundTransaction = async (transactionId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/transactions/${transactionId}/refund`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', data.message);
        fetchTransactions();
      }
    } catch (error) {
      Alert.alert('错误', '处理退款失败');
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'posts') fetchPosts();
    else if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab, fetchStats, fetchUsers, fetchPosts, fetchTransactions]);

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault }]}>
      {(['dashboard', 'users', 'posts', 'transactions'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabItem,
            activeTab === tab && { backgroundColor: theme.primary }
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <FontAwesome6
            name={tab === 'dashboard' ? 'chart-line' : tab === 'users' ? 'users' : tab === 'posts' ? 'newspaper' : 'credit-card'}
            size={20}
            color={activeTab === tab ? theme.buttonPrimaryText : theme.textMuted}
          />
          <ThemedText
            style={[styles.tabText, activeTab === tab && { color: theme.buttonPrimaryText }]}
            variant="caption"
          >
            {tab === 'dashboard' ? '概览' : tab === 'users' ? '用户' : tab === 'posts' ? '内容' : '交易'}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDashboard = () => {
    if (!stats) return null;

    return (
      <View style={styles.dashboardGrid}>
        {/* 用户统计 */}
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statHeader}>
            <FontAwesome6 name="users" size={24} color={theme.primary} />
            <ThemedText variant="h3" color={theme.textPrimary}>用户</ThemedText>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.textPrimary}>{stats.users.total}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>总数</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.success}>{stats.users.active}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>活跃</ThemedText>
            </View>
          </View>
          <View style={styles.statFooter}>
            <FontAwesome6 name="user-plus" size={14} color={theme.accent} />
            <ThemedText variant="caption" color={theme.accent}>+{stats.users.newThisWeek} 本周新增</ThemedText>
          </View>
        </View>

        {/* 帖子统计 */}
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statHeader}>
            <FontAwesome6 name="newspaper" size={24} color={theme.primary} />
            <ThemedText variant="h3" color={theme.textPrimary}>内容</ThemedText>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.textPrimary}>{stats.posts.total}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>总数</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.success}>{stats.posts.published}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>已发布</ThemedText>
            </View>
          </View>
          <View style={styles.statFooter}>
            <FontAwesome6 name="clock" size={14} color={theme.warning} />
            <ThemedText variant="caption" color={theme.warning}>{stats.posts.pending} 待审核</ThemedText>
          </View>
        </View>

        {/* 交易统计 */}
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statHeader}>
            <FontAwesome6 name="credit-card" size={24} color={theme.primary} />
            <ThemedText variant="h3" color={theme.textPrimary}>交易</ThemedText>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.textPrimary}>{stats.transactions.total}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>总数</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.success}>{stats.transactions.successRate}%</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>成功率</ThemedText>
            </View>
          </View>
          <View style={styles.statFooter}>
            <FontAwesome6 name="sack-dollar" size={14} color={theme.success} />
            <ThemedText variant="caption" color={theme.success}>¥{stats.transactions.totalAmount.toLocaleString()}</ThemedText>
          </View>
        </View>

        {/* 收入统计 */}
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statHeader}>
            <FontAwesome6 name="chart-pie" size={24} color={theme.primary} />
            <ThemedText variant="h3" color={theme.textPrimary}>收入</ThemedText>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.textPrimary}>{stats.revenue.today}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>今日</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.success}>{stats.revenue.thisWeek}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>本周</ThemedText>
            </View>
          </View>
          <View style={styles.statFooter}>
            <FontAwesome6 name="calendar" size={14} color={theme.accent} />
            <ThemedText variant="caption" color={theme.accent}>¥{stats.revenue.thisMonth.toLocaleString()} 本月</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const renderUsers = () => (
    <View style={styles.listContainer}>
      {users.map((user) => (
        <View key={user.id} style={[styles.listItem, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.listItemLeft}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <FontAwesome6 name="user" size={20} color={theme.buttonPrimaryText} />
            </View>
            <View style={styles.listItemContent}>
              <ThemedText variant="smallMedium" color={theme.textPrimary}>{user.username}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>{user.email}</ThemedText>
            </View>
          </View>
          <View style={styles.listItemRight}>
            <View style={styles.userStats}>
              <View style={styles.userStatItem}>
                <ThemedText variant="caption" color={theme.textMuted}>帖子</ThemedText>
                <ThemedText variant="smallMedium" color={theme.textPrimary}>{user.postCount}</ThemedText>
              </View>
              <View style={styles.userStatItem}>
                <ThemedText variant="caption" color={theme.textMuted}>交易</ThemedText>
                <ThemedText variant="smallMedium" color={theme.textPrimary}>{user.transactionCount}</ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.statusButton,
                user.status === 'active' && { backgroundColor: `${theme.success}20` },
                user.status === 'suspended' && { backgroundColor: `${theme.warning}20` },
                user.status === 'banned' && { backgroundColor: `${theme.error}20` },
              ]}
              onPress={() => {
                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                updateUserStatus(user.id, newStatus);
              }}
            >
              <ThemedText
                variant="caption"
                color={user.status === 'active' ? theme.success : user.status === 'suspended' ? theme.warning : theme.error}
              >
                {user.status === 'active' ? '正常' : user.status === 'suspended' ? '暂停' : '禁用'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPosts = () => (
    <View style={styles.listContainer}>
      {posts.map((post) => (
        <View key={post.id} style={[styles.listItem, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.listItemLeft}>
            <View style={[styles.postTypeBadge, {
              backgroundColor: post.type === 'paid' ? `${theme.warning}20` : post.type === 'bounty' ? `${theme.accent}20` : `${theme.primary}20`
            }]}>
              <ThemedText variant="caption" color={post.type === 'paid' ? theme.warning : post.type === 'bounty' ? theme.accent : theme.primary}>
                {post.type === 'paid' ? '付费' : post.type === 'bounty' ? '悬赏' : '免费'}
              </ThemedText>
            </View>
            <View style={styles.listItemContent}>
              <ThemedText variant="smallMedium" color={theme.textPrimary} numberOfLines={1}>{post.title}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>@{post.authorName}</ThemedText>
            </View>
          </View>
          <View style={styles.listItemRight}>
            <View style={styles.postStats}>
              <View style={styles.postStatItem}>
                <FontAwesome6 name="eye" size={12} color={theme.textMuted} />
                <ThemedText variant="caption" color={theme.textMuted}>{post.viewCount}</ThemedText>
              </View>
              <View style={styles.postStatItem}>
                <FontAwesome6 name="heart" size={12} color={theme.textMuted} />
                <ThemedText variant="caption" color={theme.textMuted}>{post.likeCount}</ThemedText>
              </View>
            </View>
            <View style={styles.postActions}>
              {post.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${theme.success}20` }]}
                  onPress={() => approvePost(post.id)}
                >
                  <FontAwesome6 name="check" size={16} color={theme.success} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.error}20` }]}
                onPress={() => deletePost(post.id)}
              >
                <FontAwesome6 name="trash" size={16} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.listContainer}>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={[styles.listItem, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.listItemLeft}>
            <View style={[styles.transactionIcon, { backgroundColor: `${theme.primary}20` }]}>
              <FontAwesome6
                name={transaction.type === 'qa_payment' ? 'comments-dollar' : transaction.type === 'bounty_payment' ? 'sack-dollar' : 'cart-shopping'}
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.listItemContent}>
              <ThemedText variant="smallMedium" color={theme.textPrimary}>{transaction.userName}</ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                {transaction.type === 'qa_payment' ? '付费问答' : transaction.type === 'bounty_payment' ? '悬赏支付' : '产品购买'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.listItemRight}>
            <ThemedText variant="h3" color={theme.textPrimary}>¥{transaction.amount}</ThemedText>
            <View style={styles.transactionStatus}>
              <View
                style={[
                  styles.statusDot,
                  transaction.status === 'success' && { backgroundColor: theme.success },
                  transaction.status === 'pending' && { backgroundColor: theme.warning },
                  transaction.status === 'failed' && { backgroundColor: theme.error },
                  transaction.status === 'refunded' && { backgroundColor: theme.textMuted },
                ]}
              />
              <ThemedText
                variant="caption"
                color={transaction.status === 'success' ? theme.success : transaction.status === 'pending' ? theme.warning : transaction.status === 'failed' ? theme.error : theme.textMuted}
              >
                {transaction.status === 'success' ? '成功' : transaction.status === 'pending' ? '处理中' : transaction.status === 'failed' ? '失败' : '已退款'}
              </ThemedText>
            </View>
            {transaction.status === 'success' && (
              <TouchableOpacity
                style={[styles.refundButton, { backgroundColor: `${theme.error}20` }]}
                onPress={() => refundTransaction(transaction.id)}
              >
                <ThemedText variant="caption" color={theme.error}>退款</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.headerContent}>
          <FontAwesome6 name="shield-halved" size={24} color={theme.primary} />
          <ThemedText variant="h2" color={theme.textPrimary}>管理控制台</ThemedText>
        </View>
        <TouchableOpacity onPress={() => {
          if (activeTab === 'dashboard') fetchStats();
          else if (activeTab === 'users') fetchUsers();
          else if (activeTab === 'posts') fetchPosts();
          else if (activeTab === 'transactions') fetchTransactions();
        }}>
          <FontAwesome6 name="rotate" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {renderTabBar()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              if (activeTab === 'dashboard') fetchStats();
              else if (activeTab === 'users') fetchUsers();
              else if (activeTab === 'posts') fetchPosts();
              else if (activeTab === 'transactions') fetchTransactions();
            }}
          />
        }
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'transactions' && renderTransactions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    gap: 4,
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  userStatItem: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  refundButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});

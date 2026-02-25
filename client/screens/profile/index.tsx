import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  phone: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  balance: number;
  tags: string[];
  created_at: string;
  stats?: {
    followersCount: number;
    followingCount: number;
    likesCount: number;
  };
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string;
  title: string | null;
  post_type: string;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEditUsername(data.user.username || '');
        setEditBio(data.user.bio || '');
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  }, [API_BASE_URL]);

  // 加载交易记录
  const loadTransactions = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/transactions?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('加载交易记录失败:', error);
    }
  }, [API_BASE_URL]);

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
      loadTransactions();
    }, [loadUserInfo, loadTransactions])
  );

  // 退出登录
  const handleLogout = async () => {
    Alert.alert('提示', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['userId', 'userInfo']);
          router.replace('/login');
        }
      }
    ]);
  };

  // 更新用户资料
  const handleUpdateProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          username: editUsername,
          bio: editBio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setShowEditModal(false);
        Alert.alert('成功', '更新成功');
      } else {
        Alert.alert('失败', data.error || '更新失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

  // 获取交易类型标签
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'qa_payment':
        return '付费问答';
      case 'bounty_payment':
        return '悬赏支付';
      case 'product_purchase':
        return '产品购买';
      default:
        return '其他';
    }
  };

  if (!user) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/login')}
          >
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              去登录
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 用户信息卡片 */}
        <View style={styles.headerCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <ThemedText variant="h2" color={theme.buttonPrimaryText}>
                {user.username?.[0] || 'U'}
              </ThemedText>
            </View>
            <View style={styles.userDetails}>
              <ThemedText variant="h3" color={theme.textPrimary}>
                {user.username}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                {user.bio || '这个人很懒，什么都没写'}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                加入于 {new Date(user.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
            <FontAwesome6 name="pen" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 统计数据 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText variant="h4" color={theme.primary}>
              {user.stats?.followersCount || 0}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              粉丝
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText variant="h4" color={theme.primary}>
              {user.stats?.followingCount || 0}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              关注
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText variant="h4" color={theme.primary}>
              {user.stats?.likesCount || 0}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary}>
              获赞
            </ThemedText>
          </View>
        </View>

        {/* 余额卡片 */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <ThemedText variant="caption" color={theme.textMuted}>账户余额</ThemedText>
            <ThemedText variant="h1" color={theme.primary}>
              ¥{user.balance.toFixed(2)}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.rechargeButton} onPress={() => router.push('/wallet')}>
            <ThemedText variant="small" color={theme.buttonPrimaryText}>
              充值
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 标签 */}
        {user.tags && user.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              创业标签
            </ThemedText>
            <View style={styles.tagsContainer}>
              {user.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText variant="small" color={theme.primary}>
                    {tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 交易记录 */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
              交易记录
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <ThemedText variant="small" color={theme.primary}>查看全部</ThemedText>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="receipt" size={32} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted}>暂无交易记录</ThemedText>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <ThemedText variant="body" color={theme.textPrimary}>
                      {transaction.title || getTransactionTypeLabel(transaction.type)}
                    </ThemedText>
                    <ThemedText variant="caption" color={theme.textMuted}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText
                    variant="bodyMedium"
                    color={transaction.type === 'qa_payment' || transaction.type === 'bounty_payment'
                      ? theme.error
                      : theme.success}
                  >
                    {transaction.type === 'qa_payment' || transaction.type === 'bounty_payment'
                      ? `-¥${transaction.amount.toFixed(2)}`
                      : `+¥${transaction.amount.toFixed(2)}`}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 功能列表 */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/wallet')}>
            <FontAwesome6 name="wallet" size={20} color={theme.primary} />
            <ThemedText variant="body" color={theme.textPrimary}>我的钱包</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <FontAwesome6 name="file-invoice-dollar" size={20} color={theme.textSecondary} />
            <ThemedText variant="body" color={theme.textPrimary}>我的订单</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-posts')}>
            <FontAwesome6 name="file-lines" size={20} color={theme.textSecondary} />
            <ThemedText variant="body" color={theme.textPrimary}>我的发布</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-favorites')}>
            <FontAwesome6 name="bookmark" size={20} color={theme.textSecondary} />
            <ThemedText variant="body" color={theme.textPrimary}>我的收藏</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin')}>
            <FontAwesome6 name="shield-halved" size={20} color={theme.primary} />
            <ThemedText variant="body" color={theme.primary}>管理控制台</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <FontAwesome6 name="gear" size={20} color={theme.textSecondary} />
            <ThemedText variant="body" color={theme.textPrimary}>设置</ThemedText>
            <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <FontAwesome6 name="right-from-bracket" size={20} color={theme.error} />
            <ThemedText variant="body" color={theme.error}>退出登录</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 编辑资料弹窗 */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>编辑资料</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <FontAwesome6 name="xmark" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                用户名
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="请输入用户名"
                placeholderTextColor={theme.textMuted}
                value={editUsername}
                onChangeText={setEditUsername}
                maxLength={50}
              />

              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.formLabel}>
                个人简介
              </ThemedText>
              <TextInput
                style={[styles.textarea, { color: theme.textPrimary }]}
                placeholder="介绍一下自己"
                placeholderTextColor={theme.textMuted}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateProfile}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>保存</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

import { TextInput } from 'react-native';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { Spacing } from '@/constants/theme';

interface Transaction {
  type: 'income' | 'withdraw';
  amount: number;
  description: string;
  createTime: string;
}

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = 1; // TODO: 从用户上下文获取

  const loadTransactions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /**
       * 服务端文件：server/src/routes/wallet.ts
       * 接口：GET /api/v1/wallet/transactions
       * Query 参数：userId: number, page: number, size: number
       */
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wallet/transactions?userId=${userId}&page=1&size=50`
      );
      const result = await response.json();

      if (result.code === 0) {
        setTransactions(result.data.list || []);
      }
    } catch (error) {
      console.error('加载交易记录失败：', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions(false);
    }, [loadTransactions])
  );

  const onRefresh = () => {
    loadTransactions(true);
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && transactions.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.center}>
            <FontAwesome6 name="inbox" size={64} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无交易记录
            </ThemedText>
          </View>
        ) : (
          transactions.map((tx, index) => (
            <ThemedView level="default" key={index} style={styles.transactionCard}>
              <View style={styles.transactionIconContainer}>
                <FontAwesome6
                  name={tx.type === 'income' ? 'arrow-down' : 'arrow-up'}
                  size={24}
                  color={tx.type === 'income' ? theme.success : theme.primary}
                />
              </View>
              <View style={styles.transactionContent}>
                <ThemedText variant="body" color={theme.textPrimary}>
                  {tx.description}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {new Date(tx.createTime).toLocaleString('zh-CN')}
                </ThemedText>
              </View>
              <ThemedText
                variant="h3"
                color={tx.type === 'income' ? theme.success : theme.textPrimary}
              >
                {tx.type === 'income' ? '+' : '-'}¥{Math.abs(tx.amount).toFixed(2)}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

interface WalletData {
  balance: number;
  freeze_balance: number;
  total_income: number;
  total_withdraw: number;
}

interface WithdrawRecord {
  id: number;
  withdraw_no: string;
  amount: number;
  status: number;
  create_time: string;
  bank_name?: string;
}

export default function WalletPage() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [withdrawList, setWithdrawList] = useState<WithdrawRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWalletData = useCallback(async () => {
    try {
      // TODO: 从用户上下文获取真实的 userId
      const userId = 1;

      // 获取钱包信息
      /**
       * 服务端文件：server/src/routes/withdraw.ts
       * 接口：GET /api/v1/withdraw/wallet/info
       * Query 参数：userId: number
       */
      const walletRes = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/withdraw/wallet/info?userId=${userId}`
      );
      const walletResult = await walletRes.json();
      if (walletResult.code === 0) {
        setWalletData(walletResult.data);
      }

      // 获取提现记录
      /**
       * 服务端文件：server/src/routes/withdraw.ts
       * 接口：GET /api/v1/withdraw/list
       * Query 参数：userId: number
       */
      const withdrawRes = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/withdraw/list?userId=${userId}`
      );
      const withdrawResult = await withdrawRes.json();
      if (withdrawResult.code === 0) {
        setWithdrawList(withdrawResult.data.list);
      }
    } catch (error) {
      Alert.alert('加载失败', '请稍后重试');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, [loadWalletData]);

  const handleWithdraw = () => {
    router.push('/withdraw');
  };

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [loadWalletData])
  );

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '待审核';
      case 1:
        return '已打款';
      case 2:
        return '已拒绝';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return theme.textSecondary;
      case 1:
        return theme.success;
      case 2:
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>
            我的钱包
          </ThemedText>
        </View>

        {/* 余额卡片 */}
        <ThemedView level="default" style={styles.balanceCard}>
          <ThemedText variant="body" color={theme.textSecondary}>
            可用余额
          </ThemedText>
          <ThemedText variant="h1" color={theme.textPrimary} style={styles.balanceAmount}>
            ¥{walletData?.balance.toFixed(2) || '0.00'}
          </ThemedText>
          <View style={styles.balanceDetails}>
            <ThemedText variant="caption" color={theme.textMuted}>
              冻结金额：¥{walletData?.freeze_balance.toFixed(2) || '0.00'}
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              累计收入：¥{walletData?.total_income.toFixed(2) || '0.00'}
            </ThemedText>
          </View>
        </ThemedView>

        {/* 提现按钮 */}
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            { backgroundColor: theme.primary },
            (walletData?.balance || 0) <= 0 && styles.disabledButton,
          ]}
          onPress={handleWithdraw}
          disabled={(walletData?.balance || 0) <= 0}
        >
          <ThemedText variant="body" color={theme.buttonPrimaryText}>
            提现到银行卡
          </ThemedText>
        </TouchableOpacity>

        {/* 提现记录 */}
        <View style={styles.recordsSection}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.recordsTitle}>
            提现记录
          </ThemedText>
          {withdrawList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText variant="body" color={theme.textMuted}>
                暂无提现记录
              </ThemedText>
            </View>
          ) : (
            withdrawList.map((item) => (
              <ThemedView key={item.id} level="default" style={styles.recordItem}>
                <View style={styles.recordLeft}>
                  <ThemedText variant="body" color={theme.textPrimary}>
                    ¥{item.amount.toFixed(2)}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    单号：{item.withdraw_no}
                  </ThemedText>
                  {item.bank_name && (
                    <ThemedText variant="caption" color={theme.textMuted}>
                      {item.bank_name}
                    </ThemedText>
                  )}
                </View>
                <ThemedText
                  variant="caption"
                  color={getStatusColor(item.status)}
                >
                  {getStatusText(item.status)}
                </ThemedText>
              </ThemedView>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

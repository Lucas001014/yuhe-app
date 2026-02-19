import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

export default function WalletScreen() {
  const { theme } = useTheme();
  const router = useSafeRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [balance, setBalance] = useState(0);
  const [freezeBalance, setFreezeBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = 1; // TODO: 从用户上下文获取

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      /**
       * 服务端文件：server/src/routes/wallet.ts
       * 接口：GET /api/v1/wallet/info
       * Query 参数：userId: number
       */
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wallet/info?userId=${userId}`
      );
      const result = await response.json();

      if (result.code === 0) {
        setBalance(Number(result.data.balance) || 0);
        setFreezeBalance(Number(result.data.freeze_balance) || 0);
        setTotalIncome(Number(result.data.total_income) || 0);
        setTotalWithdraw(Number(result.data.total_withdraw) || 0);
      }
    } catch (error) {
      console.error('加载钱包数据失败：', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    router.push('/wallet/withdraw');
  };

  const handleTransactions = () => {
    router.push('/wallet/transactions');
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.container}>
        {/* 余额卡片 */}
        <ThemedView level="default" style={styles.balanceCard}>
          <ThemedText variant="small" color={theme.textSecondary} style={styles.balanceLabel}>
            可用余额
          </ThemedText>
          <ThemedText variant="h1" color={theme.textPrimary} style={styles.balanceAmount}>
            ¥{balance.toFixed(2)}
          </ThemedText>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText variant="caption" color={theme.textMuted}>
                冻结金额
              </ThemedText>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>
                ¥{freezeBalance.toFixed(2)}
              </ThemedText>
            </View>
            <View style={[styles.balanceItem, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
              <ThemedText variant="caption" color={theme.textMuted}>
                累计收入
              </ThemedText>
              <ThemedText variant="smallMedium" color={theme.success}>
                ¥{totalIncome.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* 操作按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={handleWithdraw}
          disabled={balance <= 0}
        >
          <FontAwesome6 name="money-bill-transfer" size={20} color={theme.buttonPrimaryText} />
          <ThemedText variant="body" color={theme.buttonPrimaryText} style={styles.actionButtonText}>
            提现到银行卡
          </ThemedText>
        </TouchableOpacity>

        {/* 功能入口 */}
        <ThemedView level="default" style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleTransactions}>
            <View style={styles.menuIconContainer}>
              <FontAwesome6 name="clock-rotate-left" size={24} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <ThemedText variant="body" color={theme.textPrimary}>
                交易记录
              </ThemedText>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* 统计信息 */}
        <ThemedView level="default" style={styles.statsSection}>
          <View style={styles.statItem}>
            <FontAwesome6 name="arrow-up-from-bracket" size={20} color={theme.textMuted} />
            <View style={styles.statContent}>
              <ThemedText variant="caption" color={theme.textMuted}>
                累计提现
              </ThemedText>
              <ThemedText variant="smallMedium" color={theme.textPrimary}>
                ¥{totalWithdraw.toFixed(2)}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
            <FontAwesome6 name="wallet" size={20} color={theme.textMuted} />
            <View style={styles.statContent}>
              <ThemedText variant="caption" color={theme.textMuted}>
                累计收入
              </ThemedText>
              <ThemedText variant="smallMedium" color={theme.success}>
                ¥{totalIncome.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { Spacing } from '@/constants/theme';
import { API_BASE_URL } from '@/config/api';

export default function WithdrawScreen() {
  const { theme } = useTheme();
  const router = useSafeRouter();
  const { balance: initialBalance } = useSafeSearchParams<{ balance?: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [balance, setBalance] = useState(Number(initialBalance) || 0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNo, setBankNo] = useState('');
  const [bankUser, setBankUser] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = 1; // TODO: 从用户上下文获取

  const handleSubmit = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      Alert.alert('提示', '请输入有效的提现金额');
      return;
    }

    if (withdrawAmount > balance) {
      Alert.alert('提示', '提现金额不能超过可用余额');
      return;
    }

    if (!bankName || !bankNo || !bankUser) {
      Alert.alert('提示', '请填写完整的银行卡信息');
      return;
    }

    setLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/withdraw.ts
       * 接口：POST /api/v1/withdraw/apply
       * Body 参数：userId: number, amount: number, bankName: string, bankNo: string, bankUser: string
       */
      const response = await fetch(
        `${API_BASE_URL}/api/v1/withdraw/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            amount: withdrawAmount,
            bankName,
            bankNo,
            bankUser,
          }),
        }
      );
      const result = await response.json();

      if (result.code === 0) {
        Alert.alert('成功', '提现申请已提交，等待审核打款', [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('失败', result.msg || '提现申请失败');
      }
    } catch (error) {
      console.error('提现申请失败：', error);
      Alert.alert('错误', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    if (value <= balance) {
      setAmount(value.toString());
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.container}>
        {/* 余额提示 */}
        <ThemedView level="default" style={styles.balanceTip}>
          <ThemedText variant="caption" color={theme.textSecondary}>
            可提现余额
          </ThemedText>
          <ThemedText variant="h2" color={theme.textPrimary}>
            ¥{balance.toFixed(2)}
          </ThemedText>
        </ThemedView>

        {/* 快捷金额 */}
        <View style={styles.quickAmountSection}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.sectionTitle}>
            快捷金额
          </ThemedText>
          <View style={styles.quickAmountGrid}>
            {[
              { value: 100, label: '¥100' },
              { value: 500, label: '¥500' },
              { value: 1000, label: '¥1000' },
              { value: balance, label: '全部' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.quickAmountButton,
                  { backgroundColor: amount === item.value.toString() ? theme.primary : theme.backgroundDefault },
                ]}
                onPress={() => handleQuickAmount(item.value)}
              >
                <ThemedText
                  variant="small"
                  color={amount === item.value.toString() ? theme.buttonPrimaryText : theme.textPrimary}
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 提现金额 */}
        <ThemedView level="default" style={styles.inputSection}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.sectionTitle}>
            提现金额
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="请输入提现金额"
            placeholderTextColor={theme.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <ThemedText variant="caption" color={theme.textMuted} style={styles.inputHint}>
            最低提现金额：¥100.00
          </ThemedText>
        </ThemedView>

        {/* 银行卡信息 */}
        <ThemedView level="default" style={styles.inputSection}>
          <ThemedText variant="smallMedium" color={theme.textSecondary} style={styles.sectionTitle}>
            银行卡信息
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="开户银行"
            placeholderTextColor={theme.textMuted}
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            style={[styles.input, { color: theme.textPrimary, marginTop: Spacing.md }]}
            placeholder="银行卡号"
            placeholderTextColor={theme.textMuted}
            value={bankNo}
            onChangeText={setBankNo}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, { color: theme.textPrimary, marginTop: Spacing.md }]}
            placeholder="开户人姓名"
            placeholderTextColor={theme.textMuted}
            value={bankUser}
            onChangeText={setBankUser}
          />
        </ThemedView>

        {/* 提交按钮 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: !amount || parseFloat(amount) <= 0 ? theme.textMuted : theme.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading || !amount || parseFloat(amount) <= 0}
        >
          <ThemedText variant="body" color={theme.buttonPrimaryText}>
            {loading ? '提交中...' : '提交提现申请'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

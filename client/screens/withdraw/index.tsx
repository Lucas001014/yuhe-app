import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Keyboard, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useSafeSearchParams } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

export default function WithdrawPage() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ balance?: string }>();

  const balance = Number(params.balance) || 0;

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNo, setBankNo] = useState('');
  const [bankUser, setBankUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      Alert.alert('提示', '请输入有效的提现金额');
      return;
    }

    if (withdrawAmount > balance) {
      Alert.alert('提示', `提现金额不能超过 ¥${balance.toFixed(2)}`);
      return;
    }

    if (!bankName || !bankNo || !bankUser) {
      Alert.alert('提示', '请填写完整的银行卡信息');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // TODO: 从用户上下文获取真实的 userId
      const userId = 1;

      /**
       * 服务端文件：server/src/routes/withdraw.ts
       * 接口：POST /api/v1/withdraw/apply
       * Body 参数：userId: number, amount: number, bankName: string, bankNo: string, bankUser: string
       */
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/withdraw/apply`,
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
        Alert.alert('提交成功', '提现申请已提交，等待审核打款', [
          {
            text: '确定',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('提交失败', result.msg || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>
            提现到银行卡
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.subtitle}>
            最多可提现 ¥{balance.toFixed(2)}
          </ThemedText>
        </View>

        <ThemedView level="default" style={styles.form}>
          <View style={styles.formItem}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              提现金额
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>¥</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="请输入提现金额"
                placeholderTextColor={theme.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.formItem}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              开户银行
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.backgroundTertiary }]}
              placeholder="请输入开户银行"
              placeholderTextColor={theme.textMuted}
              value={bankName}
              onChangeText={setBankName}
            />
          </View>

          <View style={styles.formItem}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              银行卡号
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.backgroundTertiary }]}
              placeholder="请输入银行卡号"
              placeholderTextColor={theme.textMuted}
              value={bankNo}
              onChangeText={setBankNo}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.formItem}>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.label}>
              开户人姓名
            </ThemedText>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.backgroundTertiary }]}
              placeholder="请输入开户人姓名"
              placeholderTextColor={theme.textMuted}
              value={bankUser}
              onChangeText={setBankUser}
            />
          </View>
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.primary },
            isLoading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>提交中...</Text>
          ) : (
            <ThemedText variant="body" color={theme.buttonPrimaryText}>
              提交提现申请
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

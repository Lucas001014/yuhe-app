import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// 价格-商品ID映射（和苹果后台一致）
const productIdMap: Record<string, string> = {
  "1.00": "com.yourapp.post.1",
  "5.00": "com.yourapp.post.5",
  "10.00": "com.yourapp.post.10",
};

interface PurchaseButtonProps {
  postId: string | number;
  userId: string | number;
  price: string | number;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ postId, userId, price }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      // 模拟 IAP 支付流程
      // 实际项目中需要集成 react-native-iap
      const receiptData = 'simulated_receipt_data';
      const productId = productIdMap[String(price)] || productIdMap["1.00"];

      // 调用后端验证
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/iap/order/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          postId,
          receiptData,
          productId,
        }),
      });

      const result = await response.json();

      if (result.code === 0) {
        Alert.alert('购买成功', '已解锁下载权限');
      } else {
        Alert.alert('购买失败', result.msg || '未知错误');
      }
    } catch (error) {
      Alert.alert('网络错误', '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePurchase}
      disabled={isLoading}
      style={{
        backgroundColor: theme.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
          付费{price}元下载
        </Text>
      )}
    </TouchableOpacity>
  );
};

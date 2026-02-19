import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

interface Order {
  id: number;
  order_no: string;
  price: number;
  status: number;
  create_time: string;
  post?: {
    title: string;
    image_url?: string;
  };
}

export default function OrdersScreen() {
  const { theme } = useTheme();
  const router = useSafeRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const userId = 1; // TODO: 从用户上下文获取

  const loadOrders = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      /**
       * 服务端文件：server/src/routes/order.ts
       * 接口：GET /api/v1/order/my
       * Query 参数：userId: number, page: number, size: number
       */
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/order/my?userId=${userId}&page=${pageNum}&size=20`
      );
      const result = await response.json();

      if (result.code === 0) {
        const newOrders = result.data.list || [];
        if (pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }
        setHasMore(newOrders.length >= 20);
      }
    } catch (error) {
      console.error('加载订单失败：', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadOrders(1, false);
    }, [loadOrders])
  );

  const onRefresh = () => {
    setPage(1);
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && !refreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOrders(nextPage, false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return { text: '已支付', color: theme.textSecondary };
      case 2:
        return { text: '已完成', color: theme.success };
      case 3:
        return { text: '已退款', color: theme.error };
      default:
        return { text: '未知', color: theme.textMuted };
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="light">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          if (
            !loading &&
            hasMore &&
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 100
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && orders.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <FontAwesome6 name="inbox" size={64} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
              暂无订单记录
            </ThemedText>
          </View>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusText(order.status);
            return (
              <ThemedView level="default" key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {new Date(order.create_time).toLocaleString('zh-CN')}
                  </ThemedText>
                  <ThemedText variant="small" color={statusInfo.color}>
                    {statusInfo.text}
                  </ThemedText>
                </View>
                <View style={styles.orderContent}>
                  <ThemedText variant="body" color={theme.textPrimary} style={styles.orderTitle}>
                    {order.post?.title || '未知商品'}
                  </ThemedText>
                  <ThemedText variant="h3" color={theme.primary}>
                    ¥{order.price.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.orderFooter}>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    订单号：{order.order_no}
                  </ThemedText>
                  {order.status === 1 && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => {
                        Alert.alert('确认收货', '确认收货后款项将打给创作者，确定继续吗？', [
                          { text: '取消', style: 'cancel' },
                          {
                            text: '确定',
                            onPress: async () => {
                              /**
                               * 服务端文件：server/src/routes/order.ts
                               * 接口：POST /api/v1/order/confirm
                               * Body 参数：orderId: number
                               */
                              const response = await fetch(
                                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/order/confirm`,
                                {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orderId: order.id }),
                                }
                              );
                              const result = await response.json();
                              if (result.code === 0) {
                                Alert.alert('成功', '确认收货成功');
                                loadOrders(1, true);
                              } else {
                                Alert.alert('失败', result.msg || '确认收货失败');
                              }
                            },
                          },
                        ]);
                      }}
                    >
                      <ThemedText variant="caption" color={theme.primary}>
                        确认收货
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </ThemedView>
            );
          })
        )}

        {hasMore && orders.length > 0 && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

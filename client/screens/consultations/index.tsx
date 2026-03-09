import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Pressable, TextInput } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Consultation {
  id: number;
  consultant: {
    id: number;
    username: string;
    avatar: string;
    verified: boolean;
  };
  type: 'hourly' | 'per_question';
  price: number;
  status: 'pending' | 'paid' | 'in_progress' | 'completed' | 'refunded';
  createdAt: string;
  description?: string;
  platformFee?: number; // 平台服务费 3%
  totalAmount?: number; // 总金额（含平台费）
}

  // 模拟数据（在组件外定义）
  const now = Date.now();
  const mockConsultations: Consultation[] = [
    {
      id: 1,
      consultant: {
        id: 1,
        username: '张三',
        avatar: 'https://i.pravatar.cc/150?img=68',
        verified: true,
      },
      type: 'hourly',
      price: 200,
      status: 'completed',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      description: '咨询 SaaS 产品开发策略',
      platformFee: 6,
      totalAmount: 206,
    },
    {
      id: 2,
      consultant: {
        id: 2,
        username: '李四',
        avatar: 'https://i.pravatar.cc/150?img=12',
        verified: true,
      },
      type: 'per_question',
      price: 50,
      status: 'paid',
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      description: '咨询融资相关问题',
      platformFee: 1.5,
      totalAmount: 51.5,
    },
    {
      id: 3,
      consultant: {
        id: 3,
        username: '王五',
        avatar: 'https://i.pravatar.cc/150?img=33',
        verified: false,
      },
      type: 'hourly',
      price: 300,
      status: 'pending',
      createdAt: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
      description: '咨询市场营销策略',
      platformFee: 9,
      totalAmount: 309,
    },
  ];

export default function ConsultationScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  
  // 创建咨询表单
  const [consultantType, setConsultantType] = useState<'hourly' | 'per_question'>('hourly');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setConsultations(mockConsultations);
  }, []);

  // 处理创建咨询
  const handleCreate = () => {
    if (!price.trim()) {
      Alert.alert('提示', '请输入价格');
      return;
    }

    const priceNum = parseFloat(price);
    if (priceNum < 10 || priceNum > 1000) {
      Alert.alert('提示', '价格必须在 10-1000 元之间');
      return;
    }

    if (consultantType === 'per_question' && !description.trim()) {
      Alert.alert('提示', '按问题计费需要描述问题');
      return;
    }

    setLoading(true);

    // 模拟创建咨询
    setTimeout(() => {
      const platformFee = priceNum * 0.03;
      const newConsultation: Consultation = {
        id: Date.now(),
        consultant: {
          id: 1,
          username: '张三',
          avatar: 'https://i.pravatar.cc/150?img=68',
          verified: true,
        },
        type: consultantType,
        price: priceNum,
        status: 'pending',
        createdAt: new Date().toISOString(),
        description: consultantType === 'per_question' ? description : undefined,
        platformFee,
        totalAmount: priceNum + platformFee,
      };

      setConsultations([newConsultation, ...consultations]);
      setLoading(false);
      setShowCreateModal(false);
      setPrice('');
      setDescription('');
      Alert.alert('成功', '咨询已创建，请完成支付');
    }, 1000);
  };

  // 处理支付
  const handlePay = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowPayModal(true);
  };

  // 确认支付
  const confirmPay = () => {
    if (!selectedConsultation) return;

    Alert.alert(
      '确认支付',
      `确认支付 ${selectedConsultation.totalAmount?.toFixed(2)} 元？\n（含平台服务费 ${selectedConsultation.platformFee?.toFixed(2)} 元）`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认支付',
          onPress: () => {
            setConsultations(prev =>
              prev.map(c =>
                c.id === selectedConsultation.id
                  ? { ...c, status: 'paid' as const }
                  : c
              )
            );
            setShowPayModal(false);
            setSelectedConsultation(null);
            Alert.alert('支付成功', '咨询已支付，请等待顾问回复');
          },
        },
      ]
    );
  };

  // 处理退款
  const handleRefund = (consultation: Consultation) => {
    if (consultation.status !== 'paid') {
      Alert.alert('提示', '只有已支付的咨询才能退款');
      return;
    }

    Alert.alert(
      '申请退款',
      '确认要申请退款吗？退款将在 3-5 个工作日内原路返回。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认退款',
          onPress: () => {
            setConsultations(prev =>
              prev.map(c =>
                c.id === consultation.id
                  ? { ...c, status: 'refunded' as const }
                  : c
              )
            );
            Alert.alert('退款成功', '退款已处理，金额将在 3-5 个工作日内返回');
          },
        },
      ]
    );
  };

  // 完成咨询
  const handleComplete = (consultation: Consultation) => {
    if (consultation.status !== 'paid') {
      Alert.alert('提示', '只有已支付的咨询才能完成');
      return;
    }

    Alert.alert(
      '完成咨询',
      '确认完成咨询？完成后将向顾问支付咨询费用。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认完成',
          onPress: () => {
            setConsultations(prev =>
              prev.map(c =>
                c.id === consultation.id
                  ? { ...c, status: 'completed' as const }
                  : c
              )
            );
            Alert.alert('完成', '咨询已完成，感谢您的使用');
          },
        },
      ]
    );
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待支付';
      case 'paid':
        return '已支付';
      case 'in_progress':
        return '咨询中';
      case 'completed':
        return '已完成';
      case 'refunded':
        return '已退款';
      default:
        return status;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'paid':
        return '#3B82F6';
      case 'in_progress':
        return '#8B5CF6';
      case 'completed':
        return '#10B981';
      case 'refunded':
        return '#EF4444';
      default:
        return theme.textMuted;
    }
  };

  const renderConsultationItem = (item: Consultation) => (
    <View style={styles.consultationItem}>
      <View style={styles.consultationHeader}>
        <View style={styles.consultantInfo}>
          <FontAwesome6 name="circle-user" size={48} color={theme.border} />
          <View style={styles.consultantDetails}>
            <View style={styles.consultantNameContainer}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                {item.consultant.username}
              </ThemedText>
              {item.consultant.verified && (
                <FontAwesome6 name="circle-check" size={16} color={theme.success} />
              )}
            </View>
            <ThemedText variant="caption" color={theme.textMuted}>
              {formatDistanceToNow(new Date(item.createdAt), { 
                addSuffix: true,
                locale: zhCN 
              })}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <ThemedText variant="caption" color={getStatusColor(item.status)} style={{ fontWeight: '600' }}>
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.consultationInfo}>
        <View style={styles.priceContainer}>
          <FontAwesome6 name="tag" size={16} color={theme.primary} />
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            ¥{item.price.toFixed(2)}
            {item.type === 'hourly' ? '/小时' : '/问题'}
          </ThemedText>
        </View>

        {item.platformFee && (
          <View style={styles.feeContainer}>
            <ThemedText variant="caption" color={theme.textMuted}>
              平台服务费: ¥{item.platformFee.toFixed(2)} (3%)
            </ThemedText>
            <ThemedText variant="caption" color={theme.textPrimary} style={{ fontWeight: '600' }}>
              总计: ¥{item.totalAmount?.toFixed(2)}
            </ThemedText>
          </View>
        )}
      </View>

      {item.description && (
        <ThemedText variant="body" color={theme.textSecondary} style={styles.description}>
          {item.description}
        </ThemedText>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() => handlePay(item)}
          >
            <FontAwesome6 name="credit-card" size={16} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              立即支付
            </ThemedText>
          </TouchableOpacity>
        )}

        {item.status === 'paid' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleComplete(item)}
            >
              <FontAwesome6 name="check" size={16} color={theme.buttonPrimaryText} />
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                完成咨询
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.refundButton]}
              onPress={() => handleRefund(item)}
            >
              <FontAwesome6 name="rotate-left" size={16} color={theme.textSecondary} />
              <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                申请退款
              </ThemedText>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => Alert.alert('提示', '评价功能')}
          >
            <FontAwesome6 name="star" size={16} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              评价咨询
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary} style={styles.headerTitle}>
            今日咨询
          </ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <FontAwesome6 name="plus" size={18} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
              创建咨询
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 列表 */}
        <ScrollView contentContainerStyle={styles.listContent}>
          {consultations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="comments" size={64} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={styles.emptyText}>
                暂无咨询记录
              </ThemedText>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  创建第一个咨询
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            consultations.map((item) => renderConsultationItem(item))
          )}
        </ScrollView>
      </View>

      {/* 创建咨询 Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h3" color={theme.textPrimary}>
                创建咨询
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <FontAwesome6 name="xmark" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* 计费方式 */}
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                计费方式
              </ThemedText>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    consultantType === 'hourly' && styles.typeButtonActive,
                  ]}
                  onPress={() => setConsultantType('hourly')}
                >
                  <FontAwesome6
                    name="clock"
                    size={20}
                    color={consultantType === 'hourly' ? theme.buttonPrimaryText : theme.textSecondary}
                  />
                  <ThemedText
                    variant="bodyMedium"
                    color={consultantType === 'hourly' ? theme.buttonPrimaryText : theme.textSecondary}
                  >
                    按小时
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    consultantType === 'per_question' && styles.typeButtonActive,
                  ]}
                  onPress={() => setConsultantType('per_question')}
                >
                  <FontAwesome6
                    name="circle-question"
                    size={20}
                    color={consultantType === 'per_question' ? theme.buttonPrimaryText : theme.textSecondary}
                  />
                  <ThemedText
                    variant="bodyMedium"
                    color={consultantType === 'per_question' ? theme.buttonPrimaryText : theme.textSecondary}
                  >
                    按问题
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* 价格 */}
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                价格（¥）
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="10-1000"
                placeholderTextColor={theme.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <ThemedText variant="caption" color={theme.textMuted}>
                价格范围：10-1000 元
              </ThemedText>

              {/* 问题描述（仅按问题计费时显示） */}
              {consultantType === 'per_question' && (
                <>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.label}>
                    问题描述
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="请简要描述您要咨询的问题..."
                    placeholderTextColor={theme.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </>
              )}

              {/* 费用说明 */}
              <View style={styles.feeInfo}>
                <FontAwesome6 name="circle-info" size={16} color={theme.primary} />
                <ThemedText variant="caption" color={theme.textSecondary}>
                  平台收取 3% 服务费
                </ThemedText>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                  取消
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreate}
                disabled={loading}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  {loading ? '创建中...' : '确认创建'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 支付确认 Modal */}
      <Modal
        visible={showPayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPayModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPayModal(false)}
        >
          <View style={styles.payModalContent}>
            <View style={styles.payIcon}>
              <FontAwesome6 name="credit-card" size={48} color={theme.primary} />
            </View>

            <ThemedText variant="h3" color={theme.textPrimary} style={styles.payTitle}>
              确认支付
            </ThemedText>

            {selectedConsultation && (
              <>
                <View style={styles.payDetails}>
                  <View style={styles.payDetailItem}>
                    <ThemedText variant="body" color={theme.textSecondary}>
                      咨询费用
                    </ThemedText>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      ¥{selectedConsultation.price.toFixed(2)}
                    </ThemedText>
                  </View>
                  <View style={styles.payDetailItem}>
                    <ThemedText variant="body" color={theme.textSecondary}>
                      平台服务费
                    </ThemedText>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      ¥{selectedConsultation.platformFee?.toFixed(2)}
                    </ThemedText>
                  </View>
                  <View style={[styles.payDetailItem, styles.payTotal]}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                      总计
                    </ThemedText>
                    <ThemedText variant="h3" color={theme.primary} style={{ fontWeight: '700' }}>
                      ¥{selectedConsultation.totalAmount?.toFixed(2)}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.payConfirmButton}
                  onPress={confirmPay}
                >
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                    确认支付
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.payCancelButton}
              onPress={() => setShowPayModal(false)}
            >
              <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                取消
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

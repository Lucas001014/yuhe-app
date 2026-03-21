import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { Image } from 'expo-image';
import { createFormDataFile } from '@/utils';

// 认证状态类型
interface CertificationStatus {
  id?: number;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  realName?: string;
  type?: 'individual' | 'enterprise';
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 商家状态类型
interface MerchantStatus {
  isMerchant: boolean;
  hasPaidSettlement: boolean;
  settlementFee: number;
}

export default function CertificationScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  
  // 认证状态
  const [certification, setCertification] = useState<CertificationStatus>({
    status: 'none',
  });
  const [merchant, setMerchant] = useState<MerchantStatus>({
    isMerchant: false,
    hasPaidSettlement: false,
    settlementFee: 1000,
  });

  // 表单数据
  const [realName, setRealName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [certType, setCertType] = useState<'individual' | 'enterprise'>('individual');

  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  // 获取认证状态
  const fetchCertificationStatus = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        router.replace('/login');
        return;
      }

      /**
       * 服务端文件：server/src/routes/certification.ts
       * 接口：GET /api/v1/certification/status
       * Query 参数：userId: number
       */
      const response = await fetch(
        `${API_BASE_URL}/api/v1/certification/status?userId=${userId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('获取认证状态失败');
      }

      const data = await response.json();
      if (data.success) {
        setCertification(data.certification);
        setMerchant(data.merchant);
      }
    } catch (error: any) {
      console.error('获取认证状态失败:', error);
      Alert.alert('错误', error.message || '获取认证状态失败');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, router]);

  useEffect(() => {
    fetchCertificationStatus();
  }, [fetchCertificationStatus]);

  // 选择图片
  const pickImage = async (type: 'front' | 'back' | 'license') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要相册权限才能选择照片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (type === 'front') setIdCardFront(uri);
        else if (type === 'back') setIdCardBack(uri);
        else setBusinessLicense(uri);
      }
    } catch (error: any) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', error.message || '选择图片失败');
    }
  };

  // 上传图片
  const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const file = await createFormDataFile(uri, `cert_${Date.now()}.jpg`, 'image/jpeg');
    formData.append('file', file as any);

    const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    const data = await response.json();
    if (data.success && data.url) {
      return data.url;
    }
    throw new Error(data.error || '上传失败');
  };

  // 提交认证申请
  const handleSubmit = async () => {
    // 验证表单
    if (!realName.trim()) {
      Alert.alert('提示', '请输入真实姓名');
      return;
    }
    if (!idCard.trim() || idCard.length !== 18) {
      Alert.alert('提示', '请输入正确的身份证号码（18位）');
      return;
    }
    if (!idCardFront) {
      Alert.alert('提示', '请上传身份证正面照片');
      return;
    }
    if (!idCardBack) {
      Alert.alert('提示', '请上传身份证背面照片');
      return;
    }
    if (certType === 'enterprise' && !businessLicense) {
      Alert.alert('提示', '企业认证需要上传营业执照');
      return;
    }

    Alert.alert(
      '确认提交',
      '确认提交认证申请？提交后将进入审核阶段。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认提交',
          onPress: async () => {
            setSubmitting(true);
            try {
              const userId = await AsyncStorage.getItem('userId');
              if (!userId) {
                router.replace('/login');
                return;
              }

              // 上传图片
              const frontUrl = await uploadImage(idCardFront);
              const backUrl = await uploadImage(idCardBack);
              let licenseUrl = '';
              if (businessLicense) {
                licenseUrl = await uploadImage(businessLicense);
              }

              /**
               * 服务端文件：server/src/routes/certification.ts
               * 接口：POST /api/v1/certification/apply
               * Body 参数：userId: number, realName: string, idCard: string, idCardFront: string, idCardBack: string, businessLicense?: string, type: 'individual' | 'enterprise'
               */
              const response = await fetch(`${API_BASE_URL}/api/v1/certification/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: parseInt(userId),
                  realName: realName.trim(),
                  idCard: idCard.trim(),
                  idCardFront: frontUrl,
                  idCardBack: backUrl,
                  businessLicense: licenseUrl || undefined,
                  type: certType,
                }),
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('提交成功', data.message || '认证申请已提交，请等待审核', [
                  { text: '确定', onPress: () => fetchCertificationStatus() }
                ]);
              } else {
                Alert.alert('提交失败', data.error || '未知错误');
              }
            } catch (error: any) {
              console.error('提交认证失败:', error);
              Alert.alert('错误', error.message || '提交失败');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  // 支付入驻费
  const handlePaySettlement = () => {
    Alert.alert(
      '缴纳入驻费',
      `入驻费金额：¥${merchant.settlementFee}\n\n支付后即可发布知识库和产品内容，是否确认支付？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认支付',
          onPress: async () => {
            setPaying(true);
            try {
              const userId = await AsyncStorage.getItem('userId');
              if (!userId) {
                router.replace('/login');
                return;
              }

              /**
               * 服务端文件：server/src/routes/certification.ts
               * 接口：POST /api/v1/certification/pay-settlement
               * Body 参数：userId: number, paymentMethod: string
               */
              const response = await fetch(`${API_BASE_URL}/api/v1/certification/pay-settlement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: parseInt(userId),
                  paymentMethod: 'balance',
                }),
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('支付成功', data.message || '入驻费支付成功', [
                  { text: '确定', onPress: () => fetchCertificationStatus() }
                ]);
              } else {
                Alert.alert('支付失败', data.error || '未知错误');
              }
            } catch (error: any) {
              console.error('支付入驻费失败:', error);
              Alert.alert('错误', error.message || '支付失败');
            } finally {
              setPaying(false);
            }
          }
        }
      ]
    );
  };

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: '#10B981',
          icon: 'circle-check',
          text: '已认证',
        };
      case 'pending':
        return {
          color: '#F59E0B',
          icon: 'clock',
          text: '审核中',
        };
      case 'rejected':
        return {
          color: '#EF4444',
          icon: 'circle-xmark',
          text: '已拒绝',
        };
      default:
        return {
          color: theme.textMuted,
          icon: 'circle',
          text: '未认证',
        };
    }
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText variant="body" color={theme.textSecondary} style={{ marginTop: 16 }}>
            加载中...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const statusConfig = getStatusConfig(certification.status);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="chevron-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <ThemedText variant="h3" color={theme.textPrimary}>认证中心</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 认证状态卡片 */}
          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: statusConfig.color + '20' }]}>
              <FontAwesome6 name={statusConfig.icon} size={32} color={statusConfig.color} />
            </View>
            <ThemedText variant="h4" color={theme.textPrimary} style={{ marginTop: 16 }}>
              {statusConfig.text}
            </ThemedText>
            {certification.status === 'rejected' && certification.rejectReason && (
              <ThemedText variant="body" color={theme.error} style={{ marginTop: 8, textAlign: 'center' }}>
                拒绝原因：{certification.rejectReason}
              </ThemedText>
            )}
          </View>

          {/* 入驻费状态 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>入驻状态</ThemedText>
            </View>
            <View style={styles.merchantCard}>
              <View style={styles.merchantItem}>
                <View style={[styles.merchantIcon, { backgroundColor: (certification.status === 'approved' ? '#10B981' : '#EF4444') + '20' }]}>
                  <FontAwesome6 
                    name={certification.status === 'approved' ? 'check' : 'xmark'} 
                    size={20} 
                    color={certification.status === 'approved' ? '#10B981' : '#EF4444'} 
                  />
                </View>
                <View style={styles.merchantText}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>身份认证</ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {certification.status === 'approved' ? '已通过' : 
                     certification.status === 'pending' ? '审核中' : '未认证'}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.merchantItem}>
                <View style={[styles.merchantIcon, { backgroundColor: (merchant.hasPaidSettlement ? '#10B981' : '#EF4444') + '20' }]}>
                  <FontAwesome6 
                    name={merchant.hasPaidSettlement ? 'check' : 'xmark'} 
                    size={20} 
                    color={merchant.hasPaidSettlement ? '#10B981' : '#EF4444'} 
                  />
                </View>
                <View style={styles.merchantText}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>入驻费</ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    ¥{merchant.settlementFee} {merchant.hasPaidSettlement ? '已支付' : '未支付'}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* 权限说明 */}
            <View style={styles.permissionInfo}>
              <FontAwesome6 name="circle-info" size={16} color={theme.textMuted} />
              <ThemedText variant="caption" color={theme.textMuted} style={{ marginLeft: 8, flex: 1 }}>
                发布「知识库」「产品」内容需身份认证+入驻费；发布「悬赏」内容需身份认证
              </ThemedText>
            </View>
          </View>

          {/* 已认证或审核中时不显示表单 */}
          {certification.status !== 'approved' && certification.status !== 'pending' && (
            <>
              {/* 认证类型选择 */}
              <View style={styles.section}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                  认证类型
                </ThemedText>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeOption, certType === 'individual' && styles.typeOptionActive]}
                    onPress={() => setCertType('individual')}
                  >
                    <FontAwesome6 
                      name="user" 
                      size={24} 
                      color={certType === 'individual' ? theme.primary : theme.textMuted} 
                    />
                    <ThemedText 
                      variant="body" 
                      color={certType === 'individual' ? theme.primary : theme.textSecondary}
                      style={{ marginTop: 8 }}
                    >
                      个人认证
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeOption, certType === 'enterprise' && styles.typeOptionActive]}
                    onPress={() => setCertType('enterprise')}
                  >
                    <FontAwesome6 
                      name="building" 
                      size={24} 
                      color={certType === 'enterprise' ? theme.primary : theme.textMuted} 
                    />
                    <ThemedText 
                      variant="body" 
                      color={certType === 'enterprise' ? theme.primary : theme.textSecondary}
                      style={{ marginTop: 8 }}
                    >
                      企业认证
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 基本信息 */}
              <View style={styles.section}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                  基本信息
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="真实姓名"
                  placeholderTextColor={theme.textMuted}
                  value={realName}
                  onChangeText={setRealName}
                />
                <TextInput
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="身份证号码（18位）"
                  placeholderTextColor={theme.textMuted}
                  value={idCard}
                  onChangeText={setIdCard}
                  keyboardType="number-pad"
                  maxLength={18}
                />
              </View>

              {/* 身份证照片 */}
              <View style={styles.section}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                  身份证照片
                </ThemedText>
                <View style={styles.imageRow}>
                  <TouchableOpacity 
                    style={styles.imagePicker}
                    onPress={() => pickImage('front')}
                  >
                    {idCardFront ? (
                      <Image source={{ uri: idCardFront }} style={styles.idImage} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <FontAwesome6 name="id-card" size={32} color={theme.textMuted} />
                        <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 8 }}>
                          身份证正面
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imagePicker}
                    onPress={() => pickImage('back')}
                  >
                    {idCardBack ? (
                      <Image source={{ uri: idCardBack }} style={styles.idImage} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <FontAwesome6 name="id-card" size={32} color={theme.textMuted} />
                        <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 8 }}>
                          身份证背面
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* 营业执照（企业认证） */}
              {certType === 'enterprise' && (
                <View style={styles.section}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionTitle}>
                    营业执照
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.imagePicker, { width: '100%', height: 150 }]}
                    onPress={() => pickImage('license')}
                  >
                    {businessLicense ? (
                      <Image source={{ uri: businessLicense }} style={styles.idImage} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <FontAwesome6 name="file-image" size={32} color={theme.textMuted} />
                        <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 8 }}>
                          上传营业执照
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* 提交按钮 */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={theme.buttonPrimaryText} />
                  ) : (
                    <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                      提交认证申请
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* 已认证但未支付入驻费 */}
          {certification.status === 'approved' && !merchant.hasPaidSettlement && (
            <View style={styles.section}>
              <View style={styles.payCard}>
                <FontAwesome6 name="wallet" size={32} color={theme.primary} />
                <ThemedText variant="h4" color={theme.textPrimary} style={{ marginTop: 12 }}>
                  缴纳入驻费
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginTop: 8, textAlign: 'center' }}>
                  支付入驻费后即可发布知识库和产品内容
                </ThemedText>
                <ThemedText variant="h2" color={theme.primary} style={{ marginTop: 16 }}>
                  ¥{merchant.settlementFee}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.payButton, paying && styles.disabledButton]}
                  onPress={handlePaySettlement}
                  disabled={paying}
                >
                  {paying ? (
                    <ActivityIndicator size="small" color={theme.buttonPrimaryText} />
                  ) : (
                    <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                      立即支付
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 已完成所有认证 */}
          {certification.status === 'approved' && merchant.hasPaidSettlement && (
            <View style={styles.section}>
              <View style={styles.successCard}>
                <FontAwesome6 name="circle-check" size={48} color="#10B981" />
                <ThemedText variant="h4" color={theme.textPrimary} style={{ marginTop: 16 }}>
                  认证完成
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={{ marginTop: 8, textAlign: 'center' }}>
                  您已完成所有认证，可以发布所有类型的内容
                </ThemedText>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/create')}
                >
                  <FontAwesome6 name="plus" size={16} color={theme.buttonPrimaryText} />
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ marginLeft: 8, fontWeight: '600' }}>
                    立即发布内容
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

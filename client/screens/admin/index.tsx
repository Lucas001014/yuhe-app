import { API_BASE_URL } from '@/config/api';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, RefreshControl, ActivityIndicator, FlatList, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

// 认证申请数据类型
interface CertificationItem {
  id: number;
  userId: number;
  username: string;
  phone: string;
  avatar: string;
  realName: string;
  idCard: string;
  type: 'individual' | 'enterprise';
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  idCardFront: string;
  idCardBack: string;
  businessLicense?: string;
  createdAt: string;
  updatedAt: string;
}

// 统计数据类型
interface Stats {
  pendingCerts: number;
  totalUsers: number;
  verifiedUsers: number;
  merchants: number;
  settlementIncome: number;
  totalPosts: number;
  todayPosts: number;
}

// Tab类型
type TabType = 'overview' | 'certifications' | 'users' | 'posts';

export default function AdminScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // 数据
  const [stats, setStats] = useState<Stats>({
    pendingCerts: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    merchants: 0,
    settlementIncome: 0,
    totalPosts: 0,
    todayPosts: 0,
  });
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [certPage, setCertPage] = useState(1);
  const [certTotal, setCertTotal] = useState(0);
  const [certStatus, setCertStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // 弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');


  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      /**
       * 服务端文件：server/src/routes/certification.ts
       * 接口：GET /api/v1/certification/admin/stats
       */
      const response = await fetch(`${API_BASE_URL}/api/v1/certification/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, [API_BASE_URL]);

  // 获取认证列表
  const fetchCertifications = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(!append);
      
      /**
       * 服务端文件：server/src/routes/certification.ts
       * 接口：GET /api/v1/certification/admin/list
       * Query 参数：status: string, page: number, pageSize: number
       */
      const response = await fetch(
        `${API_BASE_URL}/api/v1/certification/admin/list?status=${certStatus}&page=${page}&pageSize=20`
      );
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setCertifications(prev => [...prev, ...data.list]);
        } else {
          setCertifications(data.list);
        }
        setCertTotal(data.pagination.total);
        setCertPage(page);
      }
    } catch (error) {
      console.error('获取认证列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL, certStatus]);

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      await fetchStats();
      await fetchCertifications(1);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchCertifications]);

  // 刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchCertifications(1);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (certifications.length < certTotal && !loading) {
      fetchCertifications(certPage + 1, true);
    }
  };

  // 查看详情
  const handleViewDetail = (item: CertificationItem) => {
    setSelectedCert(item);
    setShowDetailModal(true);
  };

  // 审批通过
  const handleApprove = async (certId: number) => {
    Alert.alert(
      '确认通过',
      '确定通过该用户的身份认证申请？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            try {
              /**
               * 服务端文件：server/src/routes/certification.ts
               * 接口：POST /api/v1/certification/admin/approve
               * Body 参数：certificationId: number, action: 'approve' | 'reject', rejectReason?: string
               */
              const response = await fetch(`${API_BASE_URL}/api/v1/certification/admin/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  certificationId: certId,
                  action: 'approve',
                }),
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('成功', '认证已通过');
                setShowDetailModal(false);
                fetchCertifications(1);
                fetchStats();
              } else {
                Alert.alert('失败', data.error || '操作失败');
              }
            } catch (error) {
              console.error('审批失败:', error);
              Alert.alert('错误', '操作失败');
            }
          }
        }
      ]
    );
  };

  // 拒绝申请
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('提示', '请填写拒绝原因');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certification/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationId: selectedCert?.id,
          action: 'reject',
          rejectReason: rejectReason.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '认证已拒绝');
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason('');
        fetchCertifications(1);
        fetchStats();
      } else {
        Alert.alert('失败', data.error || '操作失败');
      }
    } catch (error) {
      console.error('拒绝失败:', error);
      Alert.alert('错误', '操作失败');
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: '#10B981', bg: '#10B98120', text: '已通过' };
      case 'rejected':
        return { color: '#EF4444', bg: '#EF444420', text: '已拒绝' };
      default:
        return { color: '#F59E0B', bg: '#F59E0B20', text: '待审核' };
    }
  };

  // 统计卡片
  const StatCard = ({ icon, iconColor, title, value, onPress }: { 
    icon: string; 
    iconColor: string; 
    title: string; 
    value: string | number;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, onPress && { borderWidth: 1, borderColor: theme.borderLight }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
        <FontAwesome6 name={icon} size={20} color={iconColor} />
      </View>
      <ThemedText variant="caption" color={theme.textMuted} style={{ marginTop: 8 }}>
        {title}
      </ThemedText>
      <ThemedText variant="h3" color={theme.textPrimary} style={{ marginTop: 4 }}>
        {value}
      </ThemedText>
    </TouchableOpacity>
  );

  // 渲染认证列表项
  const renderCertItem = ({ item }: { item: CertificationItem }) => {
    const statusStyle = getStatusStyle(item.status);
    
    return (
      <TouchableOpacity style={styles.certItem} onPress={() => handleViewDetail(item)}>
        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.certAvatar} />
        <View style={styles.certInfo}>
          <View style={styles.certHeader}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
              {item.realName}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <ThemedText variant="caption" color={statusStyle.color}>
                {statusStyle.text}
              </ThemedText>
            </View>
          </View>
          <ThemedText variant="caption" color={theme.textMuted}>
            {item.username} · {item.type === 'enterprise' ? '企业认证' : '个人认证'}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
        <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <ThemedText variant="h3" color={theme.textPrimary}>管理后台</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab导航 */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概览' },
          { key: 'certifications', label: '认证管理' },
          { key: 'users', label: '用户管理' },
          { key: 'posts', label: '内容管理' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as TabType)}
          >
            <ThemedText
              variant="body"
              color={activeTab === tab.key ? theme.primary : theme.textMuted}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {/* 统计卡片 */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="user-check"
              iconColor="#F59E0B"
              title="待审核认证"
              value={stats.pendingCerts}
              onPress={() => {
                setCertStatus('pending');
                setActiveTab('certifications');
              }}
            />
            <StatCard
              icon="users"
              iconColor="#38BDF8"
              title="总用户数"
              value={stats.totalUsers}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="shield-halved"
              iconColor="#10B981"
              title="已认证用户"
              value={stats.verifiedUsers}
            />
            <StatCard
              icon="store"
              iconColor="#8B5CF6"
              title="商家用户"
              value={stats.merchants}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="wallet"
              iconColor="#F59E0B"
              title="入驻费收入"
              value={`¥${stats.settlementIncome}`}
            />
            <StatCard
              icon="file-lines"
              iconColor="#38BDF8"
              title="总帖子数"
              value={stats.totalPosts}
            />
          </View>

          <View style={styles.section}>
            <StatCard
              icon="plus-circle"
              iconColor="#10B981"
              title="今日新增帖子"
              value={stats.todayPosts}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'certifications' && (
        <FlatList
          data={certifications}
          renderItem={renderCertItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View style={styles.filterBar}>
              {['pending', 'approved', 'rejected', 'all'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterButton, certStatus === status && styles.filterButtonActive]}
                  onPress={() => {
                    setCertStatus(status as any);
                    fetchCertifications(1);
                  }}
                >
                  <ThemedText
                    variant="body"
                    color={certStatus === status ? theme.buttonPrimaryText : theme.textSecondary}
                  >
                    {status === 'pending' ? '待审核' : 
                     status === 'approved' ? '已通过' : 
                     status === 'rejected' ? '已拒绝' : '全部'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="inbox" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted} style={{ marginTop: 16 }}>
                暂无数据
              </ThemedText>
            </View>
          }
        />
      )}

      {activeTab === 'users' && (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="users" size={48} color={theme.textMuted} />
          <ThemedText variant="body" color={theme.textMuted} style={{ marginTop: 16 }}>
            用户管理功能开发中...
          </ThemedText>
        </View>
      )}

      {activeTab === 'posts' && (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="file-lines" size={48} color={theme.textMuted} />
          <ThemedText variant="body" color={theme.textMuted} style={{ marginTop: 16 }}>
            内容管理功能开发中...
          </ThemedText>
        </View>
      )}

      {/* 详情弹窗 */}
      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            {selectedCert && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText variant="h4" color={theme.textPrimary}>认证详情</ThemedText>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <FontAwesome6 name="xmark" size={20} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <ThemedText variant="body" color={theme.textMuted}>用户名</ThemedText>
                      <ThemedText variant="body" color={theme.textPrimary}>{selectedCert.username}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText variant="body" color={theme.textMuted}>真实姓名</ThemedText>
                      <ThemedText variant="body" color={theme.textPrimary}>{selectedCert.realName}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText variant="body" color={theme.textMuted}>身份证号</ThemedText>
                      <ThemedText variant="body" color={theme.textPrimary}>{selectedCert.idCard}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText variant="body" color={theme.textMuted}>认证类型</ThemedText>
                      <ThemedText variant="body" color={theme.textPrimary}>
                        {selectedCert.type === 'enterprise' ? '企业认证' : '个人认证'}
                      </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText variant="body" color={theme.textMuted}>申请时间</ThemedText>
                      <ThemedText variant="body" color={theme.textPrimary}>
                        {new Date(selectedCert.createdAt).toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ marginBottom: 12 }}>
                    身份证照片
                  </ThemedText>
                  <View style={styles.imageRow}>
                    <Image source={{ uri: selectedCert.idCardFront }} style={styles.idImage} />
                    <Image source={{ uri: selectedCert.idCardBack }} style={styles.idImage} />
                  </View>

                  {selectedCert.businessLicense && (
                    <>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ marginBottom: 12, marginTop: 16 }}>
                        营业执照
                      </ThemedText>
                      <Image source={{ uri: selectedCert.businessLicense }} style={styles.licenseImage} />
                    </>
                  )}

                  {selectedCert.status === 'rejected' && selectedCert.rejectReason && (
                    <View style={[styles.rejectReasonBox, { backgroundColor: '#EF444420' }]}>
                      <FontAwesome6 name="triangle-exclamation" size={16} color="#EF4444" />
                      <ThemedText variant="body" color="#EF4444" style={{ marginLeft: 8 }}>
                        拒绝原因：{selectedCert.rejectReason}
                      </ThemedText>
                    </View>
                  )}
                </ScrollView>

                {selectedCert.status === 'pending' && (
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                      onPress={() => setShowRejectModal(true)}
                    >
                      <ThemedText variant="bodyMedium" color="#FFFFFF">拒绝</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#10B981', flex: 1.5 }]}
                      onPress={() => handleApprove(selectedCert.id)}
                    >
                      <ThemedText variant="bodyMedium" color="#FFFFFF">通过</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 拒绝原因弹窗 */}
      <Modal visible={showRejectModal} transparent animationType="fade" onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.rejectModal, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText variant="h4" color={theme.textPrimary} style={{ marginBottom: 16 }}>
              拒绝原因
            </ThemedText>
            <TextInput
              style={[styles.rejectInput, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
              placeholder="请输入拒绝原因"
              placeholderTextColor={theme.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.rejectModalFooter}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.backgroundTertiary }]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                <ThemedText variant="bodyMedium" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#EF4444', flex: 1.5 }]}
                onPress={handleReject}
              >
                <ThemedText variant="bodyMedium" color="#FFFFFF">确认拒绝</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

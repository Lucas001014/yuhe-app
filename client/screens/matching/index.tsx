import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

interface MatchingItem {
  id: number;
  avatar: string;
  name: string;
  verified: boolean;
  needType: string;
  description: string;
  matchScore: number;
  cooperationMode: string;
}

export default function MatchingScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();

  // 筛选状态
  const [needType, setNeedType] = useState('全部');
  const [cooperationMode, setCooperationMode] = useState('全部');
  const [industry, setIndustry] = useState('全部');
  const [region, setRegion] = useState('全部');

  // 模拟匹配结果数据
  const [matchingResults, setMatchingResults] = useState<MatchingItem[]>([
    {
      id: 1,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      name: '张三',
      verified: true,
      needType: '技术合伙人',
      description: '寻找技术合伙人，共同开发SaaS产品，有完整的产品方案和种子用户。',
      matchScore: 95,
      cooperationMode: '股权合作',
    },
    {
      id: 2,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      name: '李四',
      verified: true,
      needType: '产品经理',
      description: '需要产品经理负责产品规划和用户体验，有医疗健康行业经验优先。',
      matchScore: 88,
      cooperationMode: '项目制',
    },
    {
      id: 3,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      name: '王五',
      verified: false,
      needType: '市场推广',
      description: '寻找市场推广合作伙伴，有教育行业资源和营销渠道者优先。',
      matchScore: 82,
      cooperationMode: '分成合作',
    },
  ]);

  const handleAIMatch = () => {
    Alert.alert(
      'AI 智能匹配',
      'AI正在根据你的需求寻找最佳匹配对象，预计还需 30 秒...',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('匹配成功', '已为你找到 3 个高匹配度的对接对象');
          },
        },
      ]
    );
  };

  const handleConnect = (item: MatchingItem) => {
    Alert.alert(
      '发起对接',
      `确定要向 ${item.name} 发起对接请求吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('成功', '已发送对接请求，对方确认后将开始对话');
          },
        },
      ]
    );
  };

  const handlePublish = () => {
    router.push('/incubator');
  };

  const renderStars = (score: number) => {
    const filledStars = Math.floor(score / 20);
    const hasHalfStar = score % 20 >= 10;

    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < filledStars) {
        stars.push(
          <FontAwesome6 key={i} name="star" size={14} color={theme.warning} solid />
        );
      } else if (i === filledStars && hasHalfStar) {
        stars.push(
          <FontAwesome6 key={i} name="star-half-stroke" size={14} color={theme.warning} solid />
        );
      } else {
        stars.push(
          <FontAwesome6 key={i} name="star" size={14} color={theme.border} />
        );
      }
    }
    return stars;
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部筛选区 */}
        <View style={styles.filterSection}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.filterTitle}>
            精准对接中心
          </ThemedText>

          {/* 筛选项 */}
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.filterButtonText}>
                  需求类型
                </ThemedText>
                <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.filterButtonText}>
                  合作模式
                </ThemedText>
                <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.filterButtonText}>
                  行业
                </ThemedText>
                <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton}>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.filterButtonText}>
                  地域
                </ThemedText>
                <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.aiMatchButton} onPress={handleAIMatch}>
                <FontAwesome6 name="brain" size={16} color={theme.buttonPrimaryText} />
                <ThemedText
                  variant="caption"
                  color={theme.buttonPrimaryText}
                  style={styles.aiMatchButtonText}
                >
                  一键AI匹配
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 匹配结果列表 */}
        <View style={styles.resultsSection}>
          <ThemedText variant="bodyMedium" color={theme.textSecondary} style={styles.resultsTitle}>
            推荐匹配结果（3）
          </ThemedText>

          {matchingResults.map((item) => (
            <View key={item.id} style={styles.resultCard}>
              {/* 用户信息 */}
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <FontAwesome6 name="circle-user" size={48} color={theme.border} />
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.userNameContainer}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                      {item.name}
                    </ThemedText>
                    {item.verified && (
                      <FontAwesome6 name="circle-check" size={16} color={theme.success} />
                    )}
                  </View>
                  <View style={styles.matchScore}>
                    {renderStars(item.matchScore)}
                    <ThemedText variant="caption" color={theme.textMuted} style={styles.scoreText}>
                      匹配度 {item.matchScore}%
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* 需求描述 */}
              <View style={styles.needInfo}>
                <ThemedText variant="body" color={theme.textPrimary} style={styles.needType}>
                  {item.needType}
                </ThemedText>
                <ThemedText variant="body" color={theme.textSecondary} style={styles.needDescription}>
                  {item.description}
                </ThemedText>
                <TouchableOpacity style={styles.cooperationTag}>
                  <ThemedText variant="caption" color={theme.primary}>
                    {item.cooperationMode}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* 对接按钮 */}
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnect(item)}
              >
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                  立即对接
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 底部发布按钮 */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
          <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
            发布对接需求
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

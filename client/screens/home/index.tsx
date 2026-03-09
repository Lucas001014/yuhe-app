import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIHint, setShowAIHint] = useState(true);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // 模拟数据
  const matchingCards = [
    {
      id: 1,
      matchRate: 92,
      avatar: 'https://i.pravatar.cc/150?img=1',
      name: '张三',
      tags: ['AI领域 CTO', '10年经验'],
    },
    {
      id: 2,
      matchRate: 88,
      avatar: 'https://i.pravatar.cc/150?img=2',
      name: '李四',
      tags: ['天使投资人', '专注AI赛道'],
    },
    {
      id: 3,
      matchRate: 85,
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: '王五',
      tags: ['产品总监', '创业导师'],
    },
  ];

  const progressData = {
    stage: '想法验证期',
    progress: 35,
    recommendedResources: [
      { id: 1, title: '竞品分析工具', type: 'tool' },
      { id: 2, title: '创业想法验证课', type: 'course' },
      { id: 3, title: '用户调研模板', type: 'template' },
    ],
  };

  const recentActivities = [
    {
      id: 1,
      avatar: 'https://i.pravatar.cc/150?img=10',
      name: '赵六',
      tag: '创业者',
      content: '成功对接技术合伙人，现在产品开发顺利',
      time: '2小时前',
    },
    {
      id: 2,
      avatar: 'https://i.pravatar.cc/150?img=11',
      name: '钱七',
      tag: '投资人',
      content: '发布了3个投资机会，寻找优质AI项目',
      time: '5小时前',
    },
    {
      id: 3,
      avatar: 'https://i.pravatar.cc/150?img=12',
      name: '孙八',
      tag: '创业者',
      content: '完成第一轮融资，感谢平台推荐',
      time: '1天前',
    },
  ];

  const quickActions = [
    { id: 1, title: '孵化舱', icon: 'flask', route: '/incubator' },
    { id: 2, title: '对接中心', icon: 'handshake', route: '/matching' },
    { id: 3, title: '工具箱', icon: 'toolbox', route: '/toolbox' },
    { id: 4, title: '更多', icon: 'ellipsis', route: '/more' },
  ];

  const renderMatchingCard = ({ item }: any) => (
    <View style={styles.matchingCard}>
      <View style={styles.matchingCardHeader}>
        <ThemedText variant="caption" color={theme.success} style={styles.matchRateText}>
          匹配度 {item.matchRate}%
        </ThemedText>
      </View>
      <View style={styles.matchingCardContent}>
        <Image source={{ uri: item.avatar }} style={styles.matchingCardAvatar} />
        <View style={styles.matchingCardInfo}>
          <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.matchingCardName}>
            {item.name}
          </ThemedText>
          {item.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tagBadge}>
              <ThemedText variant="caption" color={theme.primary}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.matchingCardActions}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => {}}>
          <ThemedText variant="caption" color={theme.buttonPrimaryText}>
            一键发起对接
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
          <ThemedText variant="caption" color={theme.primary}>
            签署 NDA
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResourceCard = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.resourceCard}>
      <FontAwesome6
        name={
          item.type === 'tool'
            ? 'tool'
            : item.type === 'course'
            ? 'graduation-cap'
            : 'file-lines'
        }
        size={20}
        color={theme.primary}
      />
      <ThemedText variant="caption" color={theme.textPrimary} style={styles.resourceTitle}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 顶部搜索栏 */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="输入你想对接的资源"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setShowAIHint(true)}
            />
            {showAIHint && searchQuery === '' && (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.aiHint}>
                如"技术合伙人""种子轮资金"
              </ThemedText>
            )}
          </View>
          <TouchableOpacity
            style={styles.messageIcon}
            onPress={() => router.push('/matching')}
          >
            <FontAwesome6 name="bell" size={20} color={theme.textPrimary} />
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
        </View>

        {/* 精准匹配卡片区 */}
        <View style={styles.section}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            精准匹配
          </ThemedText>
          <View style={styles.carouselContainer}>
            <Carousel
              loop={false}
              width={SCREEN_WIDTH - 64}
              height={200}
              data={matchingCards}
              scrollAnimationDuration={1000}
              renderItem={renderMatchingCard}
              mode="horizontal-stack"
              modeConfig={{
                snapDirection: 'left',
                stackInterval: 18,
              }}
            />
          </View>
        </View>

        {/* 创业进度看板 */}
        <View style={styles.section}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            创业进度
          </ThemedText>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.progressStage}>
                {progressData.stage}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                {progressData.progress}%
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressData.progress}%` }]} />
            </View>
            <View style={styles.resourceList}>
              {progressData.recommendedResources.map(renderResourceCard)}
            </View>
          </View>
        </View>

        {/* 实时动态区 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
              实时动态
            </ThemedText>
            <TouchableOpacity>
              <FontAwesome6 name="filter" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <Image source={{ uri: activity.avatar }} style={styles.activityAvatar} />
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                      {activity.name}
                    </ThemedText>
                    <View style={styles.activityTag}>
                      <ThemedText variant="caption" color={theme.primary}>
                        {activity.tag}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="body" color={theme.textSecondary} style={styles.activityText}>
                    {activity.content}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {activity.time}
                  </ThemedText>
                </View>
                <TouchableOpacity style={styles.privacyButton}>
                  <FontAwesome6 name="lock" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 快捷功能入口 */}
        <View style={styles.section}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            快捷功能
          </ThemedText>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => router.push(action.route)}
              >
                <FontAwesome6 name={action.icon as any} size={24} color={theme.primary} />
                <ThemedText variant="caption" color={theme.textPrimary} style={styles.quickActionTitle}>
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

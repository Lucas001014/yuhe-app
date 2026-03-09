import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';

const initialLayout = { width: Dimensions.get('window').width };

interface MatchingItem {
  id: number;
  matchRate: number;
  name: string;
  avatar: string;
  tags: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchingScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // Tab 导航状态
  const [tabIndex, setTabIndex] = useState(0);

  // 想法孵化状态
  const [idea, setIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 模拟精准匹配数据
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

  // 进度数据
  const progressData = {
    stage: '想法验证期',
    progress: 35,
    recommendedResources: [
      { id: 1, title: '竞品分析工具', type: 'tool' },
      { id: 2, title: '创业想法验证课', type: 'course' },
      { id: 3, title: '用户调研模板', type: 'template' },
    ],
  };

  // 实时动态数据
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

  // 匹配结果数据
  const matchingResults = [
    {
      id: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
      name: '张三',
      verified: true,
      needType: '技术合伙人',
      description: '寻找技术合伙人，共同开发SaaS产品，有完整的产品方案和种子用户。',
      matchScore: 95,
      cooperationMode: '股权合作',
    },
    {
      id: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
      name: '李四',
      verified: true,
      needType: '产品经理',
      description: '需要产品经理负责产品规划和用户体验，有医疗健康行业经验优先。',
      matchScore: 88,
      cooperationMode: '项目制',
    },
  ];

  // 处理想法分析
  const handleAnalyze = () => {
    if (!idea.trim()) {
      Alert.alert('提示', '请先输入你的创业想法');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      setAnalysisResult({
        feasibility: 'high',
        feasibilityText: '高可行',
        report: '【市场分析】\n市场规模大，目标用户清晰，需求真实存在。预计潜在用户规模达 500 万+，市场空间充足。\n\n【竞争分析】\n现有竞品较少，差异化优势明显。',
        trackAnalysis: '【赛道概况】\n该赛道正处于快速发展期，年增长率超过 40%。\n\n【主要参与者】\n头部企业：A公司、B公司',
        businessModel: '【用户群体】\n核心用户：25-40 岁职场人士\n\n【财务预测】\n第一年：预计营收 50-100 万',
      });
      setShowResult(true);
      setIsAnalyzing(false);
    }, 3000);
  };

  // 匹配卡片渲染
  const renderMatchingCard = ({ item }: any) => (
    <View style={styles.matchingCard}>
      <View style={styles.matchingCardHeader}>
        <ThemedText variant="caption" color={theme.success} style={styles.matchRateText}>
          匹配度 {item.matchRate}%
        </ThemedText>
      </View>
      <View style={styles.matchingCardContent}>
        <View style={styles.matchingCardUser}>
          <FontAwesome6 name="circle-user" size={40} color={theme.border} />
          <View style={styles.matchingCardUserInfo}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
              {item.name}
            </ThemedText>
            <View style={styles.matchingCardTags}>
              {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                <View key={idx} style={styles.matchingCardTag}>
                  <ThemedText variant="caption" color={theme.textSecondary}>
                    {tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.matchingCardButton}
          onPress={() => Alert.alert('提示', '发起对接功能')}
        >
          <ThemedText variant="caption" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
            发起对接
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Tab 场景
  const HomeScene = () => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <FontAwesome6 name="magnifying-glass" size={18} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索创业者、投资人、项目..."
          placeholderTextColor={theme.textMuted}
        />
      </View>

      {/* 精准匹配 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            精准匹配
          </ThemedText>
          <TouchableOpacity>
            <ThemedText variant="caption" color={theme.primary}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>
        <Carousel
          data={matchingCards}
          renderItem={renderMatchingCard}
          width={SCREEN_WIDTH * 0.85}
          style={styles.carousel}
          loop={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
        />
      </View>

      {/* 创业进度看板 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            创业进度看板
          </ThemedText>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.stageBadge}>
              <FontAwesome6 name="rocket" size={14} color={theme.primary} />
              <ThemedText variant="caption" color={theme.primary} style={{ marginLeft: 4 }}>
                {progressData.stage}
              </ThemedText>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressData.progress}%` }]} />
          </View>
          <ThemedText variant="caption" color={theme.textMuted} style={styles.progressText}>
            完成度 {progressData.progress}%
          </ThemedText>
          <View style={styles.resourcesContainer}>
            <ThemedText variant="body" color={theme.textPrimary} style={styles.resourcesTitle}>
              推荐资源
            </ThemedText>
            {progressData.recommendedResources.map((resource) => (
              <View key={resource.id} style={styles.resourceItem}>
                <FontAwesome6
                  name={resource.type === 'tool' ? 'screwdriver-wrench' : resource.type === 'course' ? 'graduation-cap' : 'file'}
                  size={16}
                  color={theme.primary}
                />
                <ThemedText variant="body" color={theme.textSecondary}>
                  {resource.title}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 实时动态 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            实时动态
          </ThemedText>
          <TouchableOpacity style={styles.privacyToggle}>
            <FontAwesome6 name="eye-slash" size={16} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>隐私</ThemedText>
          </TouchableOpacity>
        </View>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <FontAwesome6 name="circle-user" size={40} color={theme.border} />
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                  {activity.name}
                </ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {activity.tag}
                </ThemedText>
              </View>
              <ThemedText variant="body" color={theme.textSecondary} style={styles.activityText}>
                {activity.content}
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                {activity.time}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const IncubatorScene = () => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
      {/* 想法输入 */}
      <View style={styles.inputSection}>
        <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.sectionLabel}>
          描述你的创业想法
        </ThemedText>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="支持语音输入..."
            placeholderTextColor={theme.textMuted}
            value={idea}
            onChangeText={setIdea}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.micButton}>
            <FontAwesome6 name="microphone" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          <ThemedText
            variant="bodyMedium"
            color={isAnalyzing ? theme.textMuted : theme.buttonPrimaryText}
            style={{ fontWeight: '600' }}
          >
            {isAnalyzing ? 'AI 正在解析...' : '开始解析'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText variant="caption" color={theme.textMuted} style={styles.hintText}>
          AI 本地解析，无需联网
        </ThemedText>
      </View>

      {/* 解析结果 */}
      {isAnalyzing && (
        <View style={styles.loadingSection}>
          <FontAwesome6 name="spinner" size={32} color={theme.primary} />
          <ThemedText variant="body" color={theme.textSecondary} style={styles.loadingText}>
            AI 正在解析你的想法，预计还需 58 秒
          </ThemedText>
        </View>
      )}

      {showResult && analysisResult && (
        <View style={styles.resultSection}>
          <View style={[
            styles.feasibilityBadge,
            analysisResult.feasibility === 'high' && styles.feasibilityBadgeHigh,
          ]}>
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
              {analysisResult.feasibilityText}
            </ThemedText>
          </View>

          <ThemedText variant="body" color={theme.textPrimary} style={styles.reportText}>
            {analysisResult.report}
          </ThemedText>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('提示', '优化想法功能')}
            >
              <FontAwesome6 name="wand-magic-sparkles" size={16} color={theme.primary} />
              <ThemedText variant="bodyMedium" color={theme.primary}>优化想法</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Alert.alert('提示', '导出PDF功能')}
            >
              <FontAwesome6 name="file-pdf" size={16} color={theme.buttonPrimaryText} />
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>导出 PDF</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const MatchingScene = () => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
      {/* 筛选区 */}
      <View style={styles.filterSection}>
        <ThemedText variant="h3" color={theme.textPrimary} style={styles.filterTitle}>
          精准对接中心
        </ThemedText>

        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
              <ThemedText variant="body" color={theme.textSecondary}>需求类型</ThemedText>
              <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <ThemedText variant="body" color={theme.textSecondary}>合作模式</ThemedText>
              <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
              <ThemedText variant="body" color={theme.textSecondary}>行业</ThemedText>
              <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <ThemedText variant="body" color={theme.textSecondary}>地域</ThemedText>
              <FontAwesome6 name="chevron-down" size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiMatchButton}
              onPress={() => Alert.alert('提示', '一键AI匹配功能')}
            >
              <FontAwesome6 name="brain" size={16} color={theme.buttonPrimaryText} />
              <ThemedText variant="caption" color={theme.buttonPrimaryText}>一键AI匹配</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 匹配结果 */}
      <ThemedText variant="bodyMedium" color={theme.textSecondary} style={styles.resultsTitle}>
        推荐匹配结果（2）
      </ThemedText>

      {matchingResults.map((item) => (
        <View key={item.id} style={styles.resultCard}>
          <View style={styles.userInfo}>
            <FontAwesome6 name="circle-user" size={48} color={theme.border} />
            <View style={styles.userDetails}>
              <View style={styles.userNameContainer}>
                <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                  {item.name}
                </ThemedText>
                {item.verified && (
                  <FontAwesome6 name="circle-check" size={16} color={theme.success} />
                )}
              </View>
              <ThemedText variant="caption" color={theme.textMuted}>
                匹配度 {item.matchScore}%
              </ThemedText>
            </View>
          </View>

          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            {item.needType}
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.needDescription}>
            {item.description}
          </ThemedText>

          <TouchableOpacity style={styles.connectButton}>
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
              立即对接
            </ThemedText>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderScene = SceneMap({
    home: HomeScene,
    incubator: IncubatorScene,
    matching: MatchingScene,
  });

  const tabRoutes = [
    { key: 'home', title: '今日' },
    { key: 'incubator', title: '孵化舱' },
    { key: 'matching', title: '对接中心' },
  ];

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primary, height: 2 }}
      style={styles.tabBar}
      activeColor={theme.primary}
      inactiveColor={theme.textSecondary}
      tabStyle={{ width: 'auto' }}
      scrollEnabled={true}
      labelStyle={{
        fontSize: 14,
        fontWeight: '600',
      }}
    />
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setTabIndex}
        initialLayout={initialLayout}
        lazy
      />
    </Screen>
  );
}

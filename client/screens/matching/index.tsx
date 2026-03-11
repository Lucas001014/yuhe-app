import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Modal } from 'react-native';
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

  // 顾问咨询格式状态
  const [consultFormats, setConsultFormats] = useState<Record<number, 'hourly' | 'per_question'>>({});

  // 切换咨询格式
  const handleToggleConsultFormat = (userId: number) => {
    setConsultFormats(prev => ({
      ...prev,
      [userId]: prev[userId] === 'hourly' ? 'per_question' : 'hourly'
    }));
  };

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

  // 用户名片数据（含介绍、咨询格式、费用）
  const userCards = [
    {
      id: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
      name: '张三',
      verified: true,
      title: 'AI领域 CTO',
      intro: '10年AI技术经验，曾主导多个大型AI项目，擅长自然语言处理和计算机视觉。',
      consultFormat: 'hourly', // hourly | per_question
      hourlyRate: 300,
      perQuestionRate: 50,
      tags: ['AI技术', 'NLP', '计算机视觉'],
      consultCount: 128,
      rating: 4.9,
    },
    {
      id: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
      name: '李四',
      verified: true,
      title: '天使投资人',
      intro: '专注AI赛道早期投资，已投资30+项目，累计投资金额超2亿元。',
      consultFormat: 'per_question',
      hourlyRate: 500,
      perQuestionRate: 100,
      tags: ['天使投资', 'AI赛道', '融资'],
      consultCount: 256,
      rating: 5.0,
    },
    {
      id: 3,
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: '王五',
      verified: false,
      title: '产品总监',
      intro: '8年产品管理经验，擅长B2B SaaS产品规划和用户体验设计。',
      consultFormat: 'hourly',
      hourlyRate: 200,
      perQuestionRate: 30,
      tags: ['产品管理', 'B2B', 'SaaS'],
      consultCount: 89,
      rating: 4.7,
    },
  ];

  // 初始化咨询格式状态
  React.useEffect(() => {
    const initialFormats: Record<number, 'hourly' | 'per_question'> = {};
    userCards.forEach(card => {
      initialFormats[card.id] = card.consultFormat as 'hourly' | 'per_question';
    });
    setConsultFormats(initialFormats);
  }, []);

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
        report: `
【市场分析】
市场规模大，目标用户清晰，需求真实存在。预计潜在用户规模达 500 万+，市场空间充足。

【竞争分析】
现有竞品较少，差异化优势明显。主要竞争对手覆盖约 30% 的市场份额，仍有较大发展空间。

【盈利模式】
可探索多种盈利模式：
1. 订阅制（月付 9.9 元，年付 99 元）
2. 增值服务（专业版 199 元/年）
3. 企业定制（起价 5000 元）

【风险提示】
1. 用户获取成本可能较高，需优化推广策略
2. 技术实现难度中等，建议预留 3-6 个月开发周期
3. 建议前期聚焦核心功能，快速验证市场
        `,
        trackAnalysis: `
【赛道概况】
该赛道正处于快速发展期，年增长率超过 40%。政策支持力度大，市场需求旺盛。预计未来 3 年将迎来爆发式增长。

【主要参与者】
头部企业：A公司（35%市场份额）、B公司（25%）、C公司（15%）
其他玩家占 25%，市场机会充足

【发展趋势】
1. AI技术融合成为主流，智能化需求增长
2. 个性化定制需求增长 60%
3. 跨界合作增多，生态化趋势明显

【进入壁垒】
技术门槛：中等（需基础 AI 能力）
资金需求：100-500 万起（初期）
人才需求：需技术 + 产品双核团队
时间周期：6-12 个月产品打磨期
        `,
        businessModel: `
【用户群体】
核心用户：25-40 岁职场人士（占比 75%）
收入水平：月薪 8000+ 元
地域分布：一二线城市为主（70%），三线城市为辅（30%）

【获客渠道】
1. 社交媒体营销（微信、抖音、小红书）- 预计占比 40%
2. 内容营销（知乎、B站）- 预计占比 25%
3. KOL合作（行业大号、知识博主）- 预计占比 20%
4. 线下活动（创业沙龙、行业峰会）- 预计占比 15%

【变现路径】
初期（第 1-6 个月）：免费 + 增值服务（验证需求，积累用户）
中期（第 7-18 个月）：订阅制 + 企业服务（稳定收入来源）
后期（第 18 个月后）：生态化平台（构建完整商业闭环）

【财务预测】
第一年：预计营收 50-100 万，净亏损 -30~50 万
第二年：预计营收 200-500 万，净亏损 -20~50 万
第三年：预计营收 1000-2000 万，净利润 100~300 万
        `,
        resourceAnalysis: `
【核心资源需求】
1. 技术资源：需要 2-3 名开发工程师（前端+后端+AI）
2. 产品资源：需要 1 名产品经理负责需求规划
3. 运营资源：需要 1-2 名运营人员负责用户增长
4. 资金资源：种子轮 50-100 万，天使轮 200-500 万

【潜在合作伙伴】
技术平台：云服务商（阿里云、腾讯云）
内容平台：知识付费平台（知乎、得到）
流量平台：社交媒体（抖音、小红书）
投资机构：天使投资人、VC机构

【时间规划】
第 1-3 个月：需求调研 + 原型设计
第 4-6 个月：MVP 开发 + 小范围测试
第 7-12 个月：产品迭代 + 市场推广
第 13-24 个月：规模化运营 + 融资
        `,
      });
      setShowResult(true);
      setIsAnalyzing(false);
    }, 3000);
  };

  // 用户名片渲染
  const renderUserCard = (item: any) => (
    <View style={styles.userCard}>
      <View style={styles.userCardHeader}>
        <View style={styles.userCardAvatarContainer}>
          <FontAwesome6 name="circle-user" size={48} color={theme.border} />
        </View>
        <View style={styles.userCardHeaderInfo}>
          <View style={styles.userCardNameContainer}>
            <ThemedText variant="h4" color={theme.textPrimary} style={{ fontWeight: '700' }}>
              {item.name}
            </ThemedText>
            {item.verified && (
              <FontAwesome6 name="circle-check" size={18} color={theme.success} />
            )}
          </View>
          <ThemedText variant="body" color={theme.primary} style={styles.userCardTitle}>
            {item.title}
          </ThemedText>
        </View>
      </View>

      <ThemedText variant="body" color={theme.textSecondary} style={styles.userCardIntro} numberOfLines={2}>
        {item.intro}
      </ThemedText>

      <View style={styles.userCardTags}>
        {item.tags.map((tag: string, idx: number) => (
          <View key={idx} style={styles.userCardTag}>
            <ThemedText variant="caption" color={theme.textSecondary}>
              {tag}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.userCardConsultSection}>
        <ThemedText variant="caption" color={theme.textMuted} style={styles.consultLabel}>
          咨询格式
        </ThemedText>
        <View style={styles.consultFormats}>
          <TouchableOpacity
            style={[styles.consultFormat, consultFormats[item.id] === 'hourly' && styles.consultFormatActive]}
            onPress={() => handleToggleConsultFormat(item.id)}
          >
            <FontAwesome6 name="clock" size={14} color={consultFormats[item.id] === 'hourly' ? theme.buttonPrimaryText : theme.textMuted} />
            <ThemedText variant="caption" color={consultFormats[item.id] === 'hourly' ? theme.buttonPrimaryText : theme.textMuted}>
              按小时
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.consultFormat, consultFormats[item.id] === 'per_question' && styles.consultFormatActive]}
            onPress={() => handleToggleConsultFormat(item.id)}
          >
            <FontAwesome6 name="circle-question" size={14} color={consultFormats[item.id] === 'per_question' ? theme.buttonPrimaryText : theme.textMuted} />
            <ThemedText variant="caption" color={consultFormats[item.id] === 'per_question' ? theme.buttonPrimaryText : theme.textMuted}>
              按问题
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userCardFeeSection}>
        <View style={styles.feeItem}>
          <ThemedText variant="caption" color={consultFormats[item.id] === 'hourly' ? theme.primary : theme.textMuted}>
            按小时
          </ThemedText>
          <ThemedText variant="bodyMedium" color={consultFormats[item.id] === 'hourly' ? theme.primary : theme.textPrimary} style={{ fontWeight: consultFormats[item.id] === 'hourly' ? '700' : '600' }}>
            ¥{item.hourlyRate}
          </ThemedText>
        </View>
        <View style={styles.feeDivider} />
        <View style={styles.feeItem}>
          <ThemedText variant="caption" color={consultFormats[item.id] === 'per_question' ? theme.primary : theme.textMuted}>
            按问题
          </ThemedText>
          <ThemedText variant="bodyMedium" color={consultFormats[item.id] === 'per_question' ? theme.primary : theme.textPrimary} style={{ fontWeight: consultFormats[item.id] === 'per_question' ? '700' : '600' }}>
            ¥{item.perQuestionRate}
          </ThemedText>
        </View>
      </View>

      <View style={styles.userCardFooter}>
        <View style={styles.consultStats}>
          <View style={styles.statItem}>
            <FontAwesome6 name="comments" size={14} color={theme.textMuted} />
            <ThemedText variant="caption" color={theme.textMuted}>
              {item.consultCount}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <FontAwesome6 name="star" size={14} color="#FFD93D" />
            <ThemedText variant="caption" color={theme.textPrimary}>
              {item.rating}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.userCardButton}
          onPress={() => router.push('/consultations')}
        >
          <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
            立即咨询 ¥{consultFormats[item.id] === 'per_question' ? item.perQuestionRate : item.hourlyRate}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {/* 推荐顾问 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
            推荐顾问
          </ThemedText>
          <TouchableOpacity>
            <ThemedText variant="caption" color={theme.primary}>查看全部</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.userCardsContainer}>
          {userCards.map((item) => renderUserCard(item))}
        </View>
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

  const MatchingScene = () => {
    // 模拟用户身份认证状态（从后端API获取）
    const [identityStatus, setIdentityStatus] = React.useState<'none' | 'pending' | 'approved' | 'rejected'>('pending');

    // 处理发布对接需求
    const handlePublishMatching = () => {
      if (identityStatus !== 'approved') {
        if (identityStatus === 'none') {
          Alert.alert(
            '需要身份认证',
            '发布对接需求需要先完成身份认证',
            [
              { text: '取消', style: 'cancel' },
              { text: '去认证', onPress: () => router.push('/identity-verification') }
            ]
          );
        } else if (identityStatus === 'pending') {
          Alert.alert(
            '认证审核中',
            '您的身份认证正在审核中，审核通过后即可发布对接需求',
            [{ text: '知道了' }]
          );
        } else if (identityStatus === 'rejected') {
          Alert.alert(
            '认证未通过',
            '您的身份认证未通过，请重新提交审核',
            [
              { text: '取消', style: 'cancel' },
              { text: '重新提交', onPress: () => router.push('/identity-verification') }
            ]
          );
        }
        return;
      }

      // 已认证，跳转到发布对接需求页面
      router.push('/create-matching');
    };

    return (
      <ScrollView contentContainerStyle={styles.sceneContent}>
        {/* 发布对接需求按钮 */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublishMatching}>
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
          <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
            发布对接需求
          </ThemedText>
        </TouchableOpacity>

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
  };

  // 客户见证数据
  const testimonialsData = [
    {
      id: 1,
      consultant: {
        id: 1,
        username: '张三',
        avatar: 'https://i.pravatar.cc/150?img=1',
        verified: true,
        title: 'AI领域 CTO',
      },
      consultation: {
        id: 101,
        type: 'hourly',
        price: 300,
        completedAt: '2024-01-15',
      },
      review: {
        rating: 5,
        content: '张三老师非常专业，对我的AI项目给出了很好的建议，解决了技术架构上的难题，非常感谢！',
        createdAt: '2024-01-15',
      },
    },
    {
      id: 2,
      consultant: {
        id: 2,
        username: '李四',
        avatar: 'https://i.pravatar.cc/150?img=2',
        verified: true,
        title: '天使投资人',
      },
      consultation: {
        id: 102,
        type: 'per_question',
        price: 100,
        completedAt: '2024-01-10',
      },
      review: {
        rating: 5,
        content: '李四投资人很热情，详细解答了关于融资的各种问题，还给了我很多宝贵的建议。',
        createdAt: '2024-01-10',
      },
    },
    {
      id: 3,
      consultant: {
        id: 3,
        username: '王五',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: false,
        title: '产品总监',
      },
      consultation: {
        id: 103,
        type: 'hourly',
        price: 200,
        completedAt: '2024-01-05',
      },
      review: {
        rating: 4,
        content: '王五的产品经验很丰富，帮我梳理了产品规划，给出了一些不错的建议。',
        createdAt: '2024-01-05',
      },
    },
  ];

  const TestimonialsScene = () => {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');

    const renderStars = (currentRating: number) => {
      return Array.from({ length: 5 }, (_, index) => (
        <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
          <FontAwesome6
            name="star"
            size={20}
            color={index < currentRating ? '#FFD93D' : theme.border}
            solid={index < currentRating}
          />
        </TouchableOpacity>
      ));
    };

    const handleWriteReview = (testimonial: any) => {
      setSelectedTestimonial(testimonial);
      setRating(testimonial.review.rating);
      setReviewContent(testimonial.review.content);
      setShowReviewModal(true);
    };

    const submitReview = () => {
      Alert.alert(
        '评价成功',
        '感谢您的评价！',
        [{ text: '确定', onPress: () => setShowReviewModal(false) }]
      );
    };

    return (
      <ScrollView contentContainerStyle={styles.sceneContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.sectionTitle}>
              客户见证
            </ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>
              共 {testimonialsData.length} 条评价
            </ThemedText>
          </View>

          {testimonialsData.map((testimonial) => (
            <View key={testimonial.id} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <View style={styles.consultantInfo}>
                  <FontAwesome6 name="circle-user" size={48} color={theme.border} />
                  <View style={styles.consultantDetails}>
                    <View style={styles.consultantNameContainer}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                        {testimonial.consultant.username}
                      </ThemedText>
                      {testimonial.consultant.verified && (
                        <FontAwesome6 name="circle-check" size={16} color={theme.success} />
                      )}
                    </View>
                    <ThemedText variant="caption" color={theme.primary}>
                      {testimonial.consultant.title}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.stars}>{renderStars(testimonial.review.rating)}</View>
              </View>

              <ThemedText variant="body" color={theme.textSecondary} style={styles.testimonialContent}>
                {testimonial.review.content}
              </ThemedText>

              <View style={styles.testimonialFooter}>
                <View style={styles.consultationInfo}>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {testimonial.consultation.type === 'hourly' ? '按小时' : '按问题'}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    ¥{testimonial.consultation.price}
                  </ThemedText>
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {testimonial.consultation.completedAt}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.editReviewButton}
                  onPress={() => handleWriteReview(testimonial)}
                >
                  <FontAwesome6 name="pen" size={14} color={theme.primary} />
                  <ThemedText variant="caption" color={theme.primary}>
                    编辑评价
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 编辑评价 Modal */}
        <Modal
          visible={showReviewModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText variant="h3" color={theme.textPrimary}>
                  编辑评价
                </ThemedText>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <FontAwesome6 name="xmark" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {selectedTestimonial && (
                <View style={styles.modalBody}>
                  <View style={styles.consultantInfo}>
                    <FontAwesome6 name="circle-user" size={48} color={theme.border} />
                    <View style={styles.consultantDetails}>
                      <View style={styles.consultantNameContainer}>
                        <ThemedText variant="bodyMedium" color={theme.textPrimary} style={{ fontWeight: '600' }}>
                          {selectedTestimonial.consultant.username}
                        </ThemedText>
                      </View>
                      <ThemedText variant="caption" color={theme.primary}>
                        {selectedTestimonial.consultant.title}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.ratingSection}>
                    <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.ratingLabel}>
                      评分
                    </ThemedText>
                    <View style={styles.stars}>{renderStars(rating)}</View>
                  </View>

                  <ThemedText variant="bodyMedium" color={theme.textPrimary} style={styles.ratingLabel}>
                    评价内容
                  </ThemedText>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="请输入您的评价..."
                    placeholderTextColor={theme.textMuted}
                    value={reviewContent}
                    onChangeText={setReviewContent}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowReviewModal(false)}
                >
                  <ThemedText variant="bodyMedium" color={theme.textSecondary}>
                    取消
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={submitReview}
                >
                  <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>
                    提交
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const renderScene = SceneMap({
    home: HomeScene,
    incubator: IncubatorScene,
    matching: MatchingScene,
    testimonials: TestimonialsScene,
  });

  const tabRoutes = [
    { key: 'home', title: '顾问' },
    { key: 'incubator', title: '孵化舱' },
    { key: 'matching', title: '对接' },
    { key: 'testimonials', title: '实时动态' },
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

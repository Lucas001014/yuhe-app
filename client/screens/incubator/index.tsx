import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Dimensions } from 'react-native';

const initialLayout = { width: Dimensions.get('window').width };

export default function IncubatorScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  // 状态
  const [idea, setIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // 模拟分析结果
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!idea.trim()) {
      Alert.alert('提示', '请先输入你的创业想法');
      return;
    }

    setIsAnalyzing(true);

    // 模拟AI分析过程
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
        `,
        trackAnalysis: `
【赛道概况】
该赛道正处于快速发展期，年增长率超过 40%。政策支持力度大，市场需求旺盛。

【主要参与者】
头部企业：A公司、B公司、C公司
市场份额：A公司 35%，B公司 25%，C公司 15%
其他玩家 25%，机会充足

【发展趋势】
1. AI技术融合成为主流
2. 个性化定制需求增长
3. 跨界合作增多

【进入壁垒】
技术门槛：中等
资金需求：100-500 万起
人才需求：需技术 + 产品双核团队
        `,
        businessModel: `
【用户群体】
核心用户：25-40 岁职场人士
收入水平：月薪 8000+ 元
地域分布：一二线城市为主（70%），三线城市为辅（30%）

【获客渠道】
1. 社交媒体营销（微信、抖音、小红书）
2. 内容营销（知乎、B站）
3. KOL合作（行业大号、知识博主）
4. 线下活动（创业沙龙、行业峰会）

【变现路径】
初期：免费+增值服务（第1-6个月）
中期：订阅制 + 企业服务（第7-18个月）
后期：生态化平台（第18个月后）

【财务预测】
第一年：预计营收 50-100 万
第二年：预计营收 200-500 万
第三年：预计营收 1000-2000 万
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

  const handleOptimize = () => {
    Alert.alert(
      '优化想法',
      '请输入你的调整需求，如"增加盈利模式"',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('成功', 'AI已根据你的需求优化报告内容');
          },
        },
      ]
    );
  };

  const FeasibilityReport = () => (
    <View style={styles.tabContent}>
      <View style={styles.feasibilityBadge}>
        <ThemedText variant="body" color={theme.buttonPrimaryText} style={styles.feasibilityText}>
          {analysisResult.feasibilityText}
        </ThemedText>
      </View>
      <ThemedText variant="body" color={theme.textPrimary} style={styles.reportText}>
        {analysisResult.report}
      </ThemedText>
    </View>
  );

  const TrackAnalysis = () => (
    <View style={styles.tabContent}>
      <ThemedText variant="body" color={theme.textPrimary} style={styles.reportText}>
        {analysisResult.trackAnalysis}
      </ThemedText>
    </View>
  );

  const BusinessModel = () => (
    <View style={styles.tabContent}>
      <ThemedText variant="body" color={theme.textPrimary} style={styles.reportText}>
        {analysisResult.businessModel}
      </ThemedText>
    </View>
  );

  const ResourceAnalysis = () => (
    <View style={styles.tabContent}>
      <ThemedText variant="body" color={theme.textPrimary} style={styles.reportText}>
        {analysisResult.resourceAnalysis}
      </ThemedText>
    </View>
  );

  const renderScene = SceneMap({
    report: FeasibilityReport,
    track: TrackAnalysis,
    business: BusinessModel,
    resource: ResourceAnalysis,
  });

  const tabRoutes = [
    { key: 'report', title: '可行性报告' },
    { key: 'track', title: '赛道分析' },
    { key: 'business', title: '商业模式' },
    { key: 'resource', title: '资源规划' },
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary} style={styles.headerTitle}>
            AI 想法孵化舱
          </ThemedText>
        </View>

        {/* 想法输入区 */}
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

        {/* 结果展示区 */}
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
            {/* 可行性标签 */}
            <View style={[
              styles.feasibilityBadge,
              analysisResult.feasibility === 'high' && styles.feasibilityBadgeHigh,
              analysisResult.feasibility === 'medium' && styles.feasibilityBadgeMedium,
              analysisResult.feasibility === 'low' && styles.feasibilityBadgeLow,
            ]}>
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                {analysisResult.feasibilityText}
              </ThemedText>
            </View>

            {/* Tab 导航 */}
            <TabView
              navigationState={{ index: tabIndex, routes: tabRoutes }}
              renderScene={renderScene}
              renderTabBar={renderTabBar}
              onIndexChange={setTabIndex}
              initialLayout={initialLayout}
              lazy
            />

            {/* 底部按钮 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleOptimize}>
                <FontAwesome6 name="wand-magic-sparkles" size={16} color={theme.primary} />
                <ThemedText variant="bodyMedium" color={theme.primary}>优化想法</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <FontAwesome6 name="file-pdf" size={16} color={theme.buttonPrimaryText} />
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>导出 PDF</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 一键对接资源（仅高可行时显示） */}
            {analysisResult.feasibility === 'high' && (
              <TouchableOpacity style={styles.matchingButton} onPress={() => router.push('/matching')}>
                <FontAwesome6 name="handshake" size={20} color={theme.buttonPrimaryText} />
                <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText} style={{ fontWeight: '600' }}>
                  一键对接资源
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  sceneContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // 搜索栏
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.textPrimary,
  },
  // 通用区块
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  // 轮播卡片
  carousel: {
    marginBottom: 16,
  },
  matchingCard: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  matchingCardHeader: {
    alignItems: 'flex-end',
  },
  matchRateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchingCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  matchingCardUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchingCardUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  matchingCardTags: {
    flexDirection: 'row',
    marginTop: 4,
  },
  matchingCardTag: {
    backgroundColor: theme.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  matchingCardButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  // 进度看板
  progressCard: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    marginBottom: 12,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.primary}15`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressText: {
    marginBottom: 16,
  },
  resourcesContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  resourcesTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  // 实时动态
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: theme.backgroundDefault,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activityText: {
    marginBottom: 4,
  },
  // 孵化舱
  inputSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    paddingTop: 16,
    fontSize: 16,
    color: theme.textPrimary,
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.border,
  },
  micButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
  },
  loadingSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  resultSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
  },
  feasibilityBadge: {
    backgroundColor: theme.warning,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  feasibilityBadgeHigh: {
    backgroundColor: theme.success,
  },
  reportText: {
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  // 发布对接需求按钮
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  // 对接中心筛选
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  filterContainer: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.backgroundDefault,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  aiMatchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userDetails: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  needDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  // Tab 导航
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
});

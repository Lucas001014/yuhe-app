import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      paddingBottom: 20,
    },
    // 顶部搜索栏
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundRoot,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      height: 44,
      marginRight: Spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: 14,
      color: theme.textPrimary,
    },
    aiHint: {
      position: 'absolute',
      right: Spacing.md,
      fontSize: 12,
    },
    messageIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.backgroundDefault,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    unreadBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.error,
    },
    // 通用区块
    section: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    // 精准匹配卡片
    carouselContainer: {
      marginTop: Spacing.md,
    },
    matchingCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      height: 180,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    matchingCardHeader: {
      alignItems: 'flex-start',
    },
    matchRateText: {
      fontSize: 12,
      fontWeight: '600',
    },
    matchingCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    matchingCardAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: Spacing.md,
    },
    matchingCardInfo: {
      flex: 1,
    },
    matchingCardName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    tagBadge: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: Spacing.xs,
      marginTop: 2,
    },
    matchingCardActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.primary,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    // 创业进度
    progressCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    progressStage: {
      fontSize: 16,
      fontWeight: '600',
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 4,
      marginBottom: Spacing.lg,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    resourceList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    resourceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
    },
    resourceTitle: {
      fontSize: 13,
    },
    // 实时动态
    activityList: {
      gap: Spacing.md,
    },
    activityCard: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    activityAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: Spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
      gap: Spacing.sm,
    },
    activityTag: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: Spacing.xs,
      paddingVertical: 1,
      borderRadius: 3,
    },
    activityText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: Spacing.xs,
    },
    privacyButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.sm,
    },
    // 快捷功能
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    quickActionButton: {
      width: (SCREEN_WIDTH - 64) / 4,
      alignItems: 'center',
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    quickActionTitle: {
      fontSize: 12,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },
  });
};

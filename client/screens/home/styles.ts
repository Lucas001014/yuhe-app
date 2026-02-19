import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme, width: number = Dimensions.get('window').width) => {
  // 计算瀑布流卡片宽度（2列布局）
  const masonryGap = 12;
  const masonryPadding = 16;
  const _cardWidth = (width - masonryPadding * 2 - masonryGap) / 2;

  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      backgroundColor: theme.backgroundRoot,
      paddingVertical: Spacing.md,
    },
    // 类别导航样式
    categoryNav: {
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      paddingBottom: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryScrollViewWrapper: {
      flex: 1,
    },
    categoryScroll: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    categoryItem: {
      marginRight: Spacing.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.backgroundTertiary,
      flexShrink: 0,
    },
    activeCategoryItem: {
      backgroundColor: theme.primary,
    },
    adminButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
    },
    controlButtons: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginRight: Spacing.lg,
    },
    controlButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 瀑布流容器（2列布局）
    masonryContainer: {
      flexDirection: 'row',
      paddingHorizontal: masonryPadding,
      gap: masonryGap,
      paddingBottom: Spacing['4xl'],
    },
    masonryColumn: {
      flex: 1,
      gap: masonryGap,
    },
    // 瀑布流卡片
    masonryCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    masonryImageContainer: {
      width: _cardWidth,
      backgroundColor: theme.backgroundTertiary,
      position: 'relative',
    },
    masonryImage: {
      width: _cardWidth,
    },
    masonryImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -12,
      marginTop: -12,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    masonryTypeBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: BorderRadius.xs,
    },
    masonryMerchantBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.backgroundDefault,
      justifyContent: 'center',
      alignItems: 'center',
    },
    masonryResourceBadge: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    masonryContent: {
      padding: Spacing.sm,
    },
    masonryTitle: {
      marginBottom: Spacing.xs,
      height: 36,
      lineHeight: 18,
    },
    masonryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    masonryAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    masonryAvatar: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    masonryLikes: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // 空状态
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing['4xl'],
      gap: Spacing.lg,
    },
    emptyText: {
      textAlign: 'center',
    },
    // 评论弹窗样式
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    commentsList: {
      flex: 1,
      marginBottom: Spacing.lg,
    },
    commentItem: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    commentContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    commentText: {
      lineHeight: 20,
    },
    commentActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    commentLike: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.md,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    submitButtonText: {
      color: theme.buttonPrimaryText,
    },
    cancelButton: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: theme.textSecondary,
    },
    commentInputContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
  });
};

// 导出卡片宽度供组件使用
export const getCardWidth = (width: number = Dimensions.get('window').width) => {
  const masonryPadding = 16;
  const masonryGap = 12;
  return (width - masonryPadding * 2 - masonryGap) / 2;
};

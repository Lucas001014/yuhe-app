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
    // Tab组件所需样式
    card: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      marginBottom: 12,
    },
    cardImage: {
      width: '100%',
    },
    cardContent: {
      padding: Spacing.md,
    },
    cardTitle: {
      marginBottom: Spacing.sm,
    },
    typeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.xs,
      backgroundColor: theme.backgroundTertiary,
      alignSelf: 'flex-start',
      marginBottom: Spacing.sm,
    },
    typeTagText: {
      fontWeight: '600',
    },
    bountyTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.xs,
      backgroundColor: `${theme.primary}15`,
      alignSelf: 'flex-start',
      marginBottom: Spacing.sm,
    },
    bountyTagText: {
      fontWeight: '600',
    },
    price: {
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    author: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    authorAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statText: {
      marginLeft: 2,
    },
    commentModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    commentContainer: {
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    commentList: {
      flex: 1,
      marginBottom: Spacing.lg,
    },
    commentUser: {
      fontWeight: '600',
      marginBottom: 2,
    },
    commentSubmit: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      marginLeft: Spacing.md,
    },
  });
};

// 导出卡片宽度供组件使用
export const getCardWidth = (width: number = Dimensions.get('window').width) => {
  const masonryPadding = 16;
  const masonryGap = 12;
  return (width - masonryPadding * 2 - masonryGap) / 2;
};

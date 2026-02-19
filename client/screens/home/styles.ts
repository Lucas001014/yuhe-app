import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme, width: number = Dimensions.get('window').width) => {
  // 计算九宫格卡片宽度
  const gridGap = 12;
  const gridPadding = 16;
  const gridItemWidth = (width - gridPadding * 2 - gridGap * 2) / 3;

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
    // 九宫格容器
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: gridPadding,
      gap: gridGap,
      paddingBottom: Spacing['4xl'],
    },
    // 九宫格卡片
    gridCard: {
      width: gridItemWidth,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      marginBottom: 0,
    },
    gridImageContainer: {
      width: gridItemWidth,
      height: gridItemWidth * 1.2,
      backgroundColor: theme.backgroundTertiary,
      position: 'relative',
    },
    gridImage: {
      width: gridItemWidth,
      height: gridItemWidth * 1.2,
    },
    gridImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridTypeBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: BorderRadius.xs,
    },
    gridMerchantBadge: {
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
    gridResourceBadge: {
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
    gridCardContent: {
      padding: Spacing.sm,
    },
    gridTitle: {
      marginBottom: Spacing.xs,
      height: 36,
      lineHeight: 18,
    },
    gridFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    gridAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    gridAvatar: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    postsContainer: {
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    postCard: {
      backgroundColor: theme.backgroundDefault,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    typeBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    postTitle: {
      marginBottom: Spacing.sm,
    },
    postContent: {
      lineHeight: 22,
      marginBottom: Spacing.md,
    },
    priceBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.md,
    },
    imageScroll: {
      marginBottom: Spacing.md,
    },
    postImage: {
      width: width * 0.6,
      height: (width * 0.6) * 0.75,
      borderRadius: BorderRadius.md,
      marginRight: Spacing.sm,
    },
    videoContainer: {
      width: width * 0.6,
      height: (width * 0.6) * 0.5625,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    merchantBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: `${theme.warning}15`,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.md,
    },
    resourceSection: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    resourceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    resourceButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    tag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.sm,
    },
    postFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionText: {
      marginLeft: 4,
    },
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
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commentLike: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commentInputContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'flex-end',
    },
    commentInput: {
      flex: 1,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      minHeight: 80,
      maxHeight: 120,
      textAlignVertical: 'top',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme, width: number = Dimensions.get('window').width) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      backgroundColor: theme.backgroundRoot,
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tabItem: {
      marginRight: Spacing.xl,
      paddingBottom: Spacing.sm,
    },
    activeTabItem: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
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

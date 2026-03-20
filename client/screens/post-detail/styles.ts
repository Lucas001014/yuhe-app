import { StyleSheet, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    scrollContent: {
      paddingVertical: Spacing.lg,
      paddingBottom: 80,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      gap: Spacing.md,
    },
    authorAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    authorDetails: {
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    followButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
    },
    followButtonFollowing: {
      backgroundColor: theme.backgroundTertiary,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    title: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    content: {
      paddingHorizontal: Spacing.lg,
      lineHeight: 24,
      marginBottom: Spacing.md,
    },
    purchaseButton: {
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.md,
      paddingVertical: Spacing.lg,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
    imageScroll: {
      marginBottom: Spacing.md,
    },
    postImage: {
      width: 280,
      minHeight: 150,
      maxHeight: 400,
      borderRadius: BorderRadius.md,
      marginRight: Spacing.sm,
    },
    imageContainer: {
      marginRight: Spacing.sm,
    },
    imagePlaceholder: {
      width: 200,
      height: 200,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    tag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.sm,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      gap: Spacing.xl,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    actionsRow: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      gap: Spacing.xl,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    actionButtonActive: {
      color: theme.primary,
    },
    commentsSection: {
      paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
    },
    emptyComments: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: Spacing.lg,
      gap: Spacing.md,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    commentMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: Spacing.xs,
    },
    commentContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    commentInputContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      gap: Spacing.md,
      paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    },
    commentInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    // 右上角更多菜单
    menuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    menuContainer: {
      position: 'absolute',
      top: 60,
      right: 16,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.sm,
      minWidth: 120,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    menuDivider: {
      height: 1,
      backgroundColor: theme.borderLight,
      marginVertical: Spacing.xs,
    },
  });
};

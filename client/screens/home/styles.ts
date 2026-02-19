import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
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
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
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
    imageContainer: {
      marginRight: Spacing.sm,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    imageText: {
      marginTop: Spacing.xs,
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
      gap: Spacing.xl,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    actionText: {
      marginLeft: Spacing.xs,
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
  });
};

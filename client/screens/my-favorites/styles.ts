import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing['5xl'],
      gap: Spacing.lg,
    },
    emptyText: {
      marginTop: Spacing.md,
    },
    postsList: {
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    postCard: {
      padding: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    postTypeBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.sm,
    },
    postTitle: {
      marginBottom: Spacing.sm,
    },
    postContent: {
      marginBottom: Spacing.md,
    },
    postImages: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
      flexWrap: 'wrap',
    },
    postImage: {
      width: 80,
      height: 80,
      minHeight: 60,
      maxHeight: 120,
      borderRadius: BorderRadius.md,
    },
    singleImage: {
      width: '100%',
      minHeight: 150,
      maxHeight: 400,
    },
    moreImagesBadge: {
      position: 'absolute',
      top: Spacing.xs,
      right: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    postFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    postStats: {
      flexDirection: 'row',
      gap: Spacing.lg,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
  });
};

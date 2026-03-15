import { StyleSheet } from 'react-native';
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
    headerRight: {
      flexDirection: 'row',
      gap: Spacing.lg,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: Spacing.md,
    },
    username: {
      marginBottom: Spacing.xs,
    },
    bio: {
      textAlign: 'center',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.xl,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing["3xl"],
      marginBottom: Spacing.lg,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontWeight: 'bold',
    },
    statLabel: {
      marginTop: Spacing.xs,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    followButton: {
      paddingHorizontal: Spacing["2xl"],
      paddingVertical: Spacing.md,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      minWidth: 120,
      alignItems: 'center',
    },
    followingButton: {
      backgroundColor: theme.backgroundTertiary,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    messageButton: {
      paddingHorizontal: Spacing["2xl"],
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      minWidth: 120,
      alignItems: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      backgroundColor: theme.backgroundDefault,
    },
    tab: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
    },
    postsContainer: {
      padding: Spacing.sm,
    },
    postItem: {
      marginBottom: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    postImage: {
      width: '100%',
      height: 200,
    },
    postContent: {
      padding: Spacing.md,
    },
    postTitle: {
      marginBottom: Spacing.xs,
    },
    postStats: {
      flexDirection: 'row',
      gap: Spacing.lg,
      marginTop: Spacing.sm,
    },
    emptyContainer: {
      paddingVertical: Spacing["3xl"],
      alignItems: 'center',
    },
  });
};

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      position: 'relative',
    },
    tabItemActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
    },
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
    messagesList: {
      padding: Spacing.lg,
      gap: Spacing.sm,
    },
    messageItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      gap: Spacing.md,
    },
    unreadItem: {
      backgroundColor: `${theme.primary}10`,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    messageTitle: {
      fontWeight: '600',
    },
    messageText: {
      lineHeight: 22,
    },
    postTitle: {
      marginTop: Spacing.xs,
    },
    messageRight: {
      alignItems: 'flex-end',
      gap: Spacing.xs,
      minHeight: 44,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    countBadge: {
      minWidth: 20,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

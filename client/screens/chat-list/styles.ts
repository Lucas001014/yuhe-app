import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    scrollContent: {
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing['5xl'],
    },
    emptyText: {
      marginTop: Spacing.lg,
    },
    chatsList: {
      padding: Spacing.md,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundDefault,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.sm,
    },
    avatarContainer: {
      marginRight: Spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.backgroundTertiary,
    },
    onlineIndicator: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.success,
      borderWidth: 2,
      borderColor: theme.backgroundDefault,
    },
    chatContent: {
      flex: 1,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    username: {
      fontWeight: '600',
    },
    lastMessage: {
      fontSize: 14,
    },
    chatRight: {
      marginLeft: Spacing.md,
      alignItems: 'flex-end',
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      backgroundColor: theme.backgroundDefault,
    },
    // 一级Tab - 分段控件样式
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.sm,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      padding: 4,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      position: 'relative',
    },
    tabItemActive: {
      backgroundColor: theme.backgroundDefault,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    // 通知筛选样式 - 更紧凑
    filterContainer: {
      backgroundColor: theme.backgroundRoot,
      paddingVertical: Spacing.xs,
    },
    filterScrollContent: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.xs,
    },
    filterItem: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.backgroundDefault,
      marginRight: Spacing.xs,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    filterItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
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

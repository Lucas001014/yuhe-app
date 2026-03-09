import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    // Tab 导航
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundDefault,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      position: 'relative',
    },
    tabItemActive: {},
    tabLabel: {
      marginTop: Spacing.xs,
      fontWeight: '600',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: -Spacing.sm,
      width: 24,
      height: 3,
      backgroundColor: theme.primary,
      borderRadius: 2,
    },
    // 列表
    listContent: {
      padding: Spacing.lg,
      flexGrow: 1,
    },
    // 帖子项
    postItem: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      overflow: 'hidden',
      shadowColor: '#00000008',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    postImage: {
      width: '100%',
      aspectRatio: 1.3,
      backgroundColor: theme.backgroundTertiary,
    },
    postContent: {
      padding: Spacing.md,
    },
    postTitle: {
      fontWeight: '600',
      marginBottom: Spacing.xs,
      lineHeight: 22,
    },
    postExcerpt: {
      marginBottom: Spacing.md,
      lineHeight: 18,
    },
    postMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    postAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    authorAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.backgroundTertiary,
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
    // 空状态
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: Spacing['5xl'],
      gap: Spacing.md,
    },
    emptyText: {
      textAlign: 'center',
    },
  });
};

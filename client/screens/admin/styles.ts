import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    header: {
      paddingVertical: Spacing.xl,
      gap: Spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing['2xl'],
    },
    statCard: {
      flex: 1,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    menuContainer: {
      gap: Spacing.lg,
    },
    menuTitle: {
      paddingHorizontal: Spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      gap: Spacing.lg,
    },
    menuIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContent: {
      flex: 1,
      gap: 2,
    },
  });
};

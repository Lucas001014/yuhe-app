import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      padding: Spacing.lg,
      paddingTop: Spacing['2xl'],
      paddingBottom: Spacing['5xl'],
    },
    balanceCard: {
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.xl,
    },
    balanceLabel: {
      marginBottom: Spacing.sm,
    },
    balanceAmount: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: Spacing.lg,
    },
    balanceRow: {
      flexDirection: 'row',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    balanceItem: {
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
    },
    actionButtonText: {
      marginLeft: Spacing.sm,
    },
    menuSection: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    menuIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    menuContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statsSection: {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      padding: Spacing.lg,
    },
    statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statContent: {
      marginLeft: Spacing.md,
    },
  });
};

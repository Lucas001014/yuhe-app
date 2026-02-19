import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      padding: Spacing.lg,
      paddingTop: Spacing['2xl'],
      paddingBottom: Spacing['5xl'],
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing['2xl'],
    },
    emptyText: {
      marginTop: Spacing.md,
    },
    transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
    },
    transactionIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    transactionContent: {
      flex: 1,
    },
  });
};

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      padding: Spacing.lg,
      paddingTop: Spacing['2xl'],
      paddingBottom: Spacing['5xl'],
    },
    balanceTip: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
      alignItems: 'center',
    },
    quickAmountSection: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
    },
    quickAmountGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    quickAmountButton: {
      flex: 1,
      minWidth: '40%',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    inputSection: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
    },
    input: {
      height: 50,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
    },
    inputHint: {
      marginTop: Spacing.sm,
    },
    submitButton: {
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
  });
};

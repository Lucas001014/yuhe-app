import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.lg,
    },
    header: {
      marginBottom: Spacing.xl,
    },
    balanceCard: {
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.xl,
    },
    balanceAmount: {
      marginVertical: Spacing.md,
    },
    balanceDetails: {
      gap: Spacing.xs,
    },
    withdrawButton: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    disabledButton: {
      opacity: 0.5,
    },
    recordsSection: {
      flex: 1,
    },
    recordsTitle: {
      marginBottom: Spacing.lg,
    },
    emptyContainer: {
      padding: Spacing['2xl'],
      alignItems: 'center',
    },
    recordItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
    },
    recordLeft: {
      gap: Spacing.xs,
    },
  });
};

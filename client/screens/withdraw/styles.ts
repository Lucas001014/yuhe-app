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
    subtitle: {
      marginTop: Spacing.xs,
    },
    form: {
      marginBottom: Spacing.xl,
    },
    formItem: {
      marginBottom: Spacing.xl,
    },
    label: {
      marginBottom: Spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
    },
    currencySymbol: {
      fontSize: 18,
      marginRight: Spacing.xs,
    },
    input: {
      flex: 1,
      height: 48,
      fontSize: 16,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    submitButton: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    loadingText: {
      color: theme.buttonPrimaryText,
      fontSize: 16,
    },
  });
};

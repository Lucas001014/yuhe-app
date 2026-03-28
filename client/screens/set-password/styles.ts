import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing['3xl'],
      paddingBottom: Spacing['3xl'],
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing['3xl'],
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: BorderRadius.xl,
      backgroundColor: `${theme.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    logo: {
      fontSize: 32,
      fontWeight: '700',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 14,
    },
    phoneHint: {
      fontSize: 15,
      marginTop: Spacing.md,
    },
    form: {
      gap: Spacing.md,
    },
    inputWrapper: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    input: {
      fontSize: 16,
      color: theme.textPrimary,
      padding: 0,
    },
    passwordHint: {
      marginTop: -Spacing.xs,
      marginBottom: Spacing.sm,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    disabledButton: {
      opacity: 0.6,
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.lg,
    },
    backText: {
      fontSize: 15,
    },
  });
};

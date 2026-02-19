import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing['4xl'],
    },
    subtitle: {
      marginTop: Spacing.sm,
      textAlign: 'center',
    },
    form: {
      gap: Spacing.lg,
    },
    input: {
      height: 56,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      fontSize: 16,
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    codeInput: {
      flex: 1,
    },
    codeButton: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
    },
    button: {
      height: 56,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.xl,
    },
    disabledButton: {
      opacity: 0.6,
    },
    switchButton: {
      alignItems: 'center',
      marginTop: Spacing.md,
    },
  });
};

import { StyleSheet } from 'react-native';
import { Theme, Spacing } from '@/constants/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 64,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      gap: 20,
    },
    input: {
      height: 52,
      paddingHorizontal: 18,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 14,
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    codeContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    codeInput: {
      flex: 1,
      height: 52,
      paddingHorizontal: 18,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: 14,
      fontSize: 16,
      color: theme.textPrimary,
    },
    codeButton: {
      paddingHorizontal: 24,
      height: 52,
      backgroundColor: `${theme.primary}15`,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 130,
    },
    submitButton: {
      height: 52,
      backgroundColor: theme.primary,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

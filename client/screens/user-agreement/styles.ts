import { StyleSheet } from 'react-native';
import { Theme, Spacing } from '@/constants/theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: Spacing.sm,
    },
    updateDate: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: Spacing.sm,
      marginTop: Spacing.lg,
    },
    content: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: Spacing.sm,
    },
    listItem: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: Spacing.xs,
      marginLeft: Spacing.md,
    },
  });

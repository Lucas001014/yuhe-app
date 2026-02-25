import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    menuContainer: {
      backgroundColor: theme.backgroundDefault,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.borderLight,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    versionContainer: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
      gap: Spacing.xs,
    },
  });
};

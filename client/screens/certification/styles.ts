import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Spacing['5xl'],
    },
    statusCard: {
      alignItems: 'center',
      padding: Spacing.xl,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
    },
    statusIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    sectionHeader: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      marginBottom: Spacing.sm,
    },
    merchantCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    merchantItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
    },
    merchantIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    merchantText: {
      marginLeft: Spacing.md,
      flex: 1,
    },
    permissionInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: Spacing.md,
      padding: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    typeOption: {
      flex: 1,
      alignItems: 'center',
      padding: Spacing.lg,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    typeOptionActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
    },
    input: {
      height: 56,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      fontSize: 16,
    },
    imageRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    imagePicker: {
      flex: 1,
      height: 120,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
    },
    idImage: {
      width: '100%',
      height: '100%',
    },
    submitButton: {
      height: 56,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    payCard: {
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
    },
    payButton: {
      marginTop: Spacing.lg,
      width: '100%',
      height: 56,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successCard: {
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
    },
  });
};

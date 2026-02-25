import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginButton: {
      paddingHorizontal: Spacing['2xl'],
      paddingVertical: Spacing.md,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.lg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Spacing['5xl'],
    },
    headerCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: Spacing.xl,
      backgroundColor: theme.backgroundDefault,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userDetails: {
      flex: 1,
      gap: Spacing.xs,
    },
    editButton: {
      padding: Spacing.sm,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
    },
    statsCard: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      paddingVertical: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    statItem: {
      alignItems: 'center',
      gap: Spacing.xs,
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 40,
    },
    balanceCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: Spacing.lg,
      padding: Spacing.xl,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: `${theme.primary}30`,
    },
    balanceInfo: {
      gap: Spacing.xs,
    },
    rechargeButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
    },
    tagsSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    tag: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.sm,
    },
    transactionsSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: Spacing['3xl'],
      gap: Spacing.md,
    },
    transactionsList: {
      gap: Spacing.sm,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
    },
    transactionInfo: {
      gap: Spacing.xs,
    },
    menuSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing['2xl'],
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      gap: Spacing.lg,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderTopLeftRadius: BorderRadius['2xl'],
      borderTopRightRadius: BorderRadius['2xl'],
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalBody: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    formLabel: {
      marginBottom: Spacing.sm,
    },
    input: {
      height: 56,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      fontSize: 16,
    },
    textarea: {
      minHeight: 120,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    modalFooter: {
      flexDirection: 'row',
      gap: Spacing.md,
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    modalButton: {
      flex: 1,
      height: 48,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    confirmButton: {
      backgroundColor: theme.primary,
    },
  });
};

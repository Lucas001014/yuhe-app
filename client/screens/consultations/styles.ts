import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    // 头部
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    // 列表
    listContent: {
      padding: Spacing.xl,
      paddingTop: 0,
      flexGrow: 1,
    },
    // 咨询项
    consultationItem: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: '#00000008',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    consultationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    consultantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    consultantDetails: {
      gap: Spacing.xs,
    },
    consultantNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    consultationInfo: {
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    feeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.sm,
      padding: Spacing.sm,
    },
    description: {
      lineHeight: 20,
      marginBottom: Spacing.md,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
    },
    payButton: {
      backgroundColor: theme.primary,
    },
    completeButton: {
      backgroundColor: theme.success,
    },
    refundButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
    reviewButton: {
      backgroundColor: '#FFD93D',
    },
    // 空状态
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing['5xl'],
      gap: Spacing.lg,
    },
    emptyText: {
      textAlign: 'center',
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalBody: {
      padding: Spacing.xl,
      gap: Spacing.lg,
    },
    modalFooter: {
      flexDirection: 'row',
      gap: Spacing.md,
      padding: Spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    label: {
      marginBottom: Spacing.sm,
      fontWeight: '600',
    },
    typeButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    typeButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    input: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    feeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    confirmButton: {
      backgroundColor: theme.primary,
    },
    // 支付 Modal
    payModalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      margin: Spacing.xl,
      alignItems: 'center',
    },
    payIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${theme.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    payTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: Spacing.xl,
    },
    payDetails: {
      width: '100%',
      marginBottom: Spacing.xl,
      gap: Spacing.sm,
    },
    payDetailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    payTotal: {
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      marginTop: Spacing.sm,
    },
    payConfirmButton: {
      width: '100%',
      backgroundColor: theme.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    payCancelButton: {
      paddingVertical: Spacing.md,
    },
  });
};

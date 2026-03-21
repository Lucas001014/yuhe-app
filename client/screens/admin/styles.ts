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
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tab: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginRight: Spacing.md,
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: Spacing['5xl'],
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    statCard: {
      flex: 1,
      padding: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: Spacing.lg,
    },
    filterBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    filterButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    certItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    certAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.backgroundTertiary,
    },
    certInfo: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    certHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: BorderRadius['2xl'],
      borderTopRightRadius: BorderRadius['2xl'],
      maxHeight: '85%',
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
      maxHeight: '60%',
    },
    detailSection: {
      marginBottom: Spacing.lg,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    imageRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    idImage: {
      flex: 1,
      height: 120,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
    },
    licenseImage: {
      width: '100%',
      height: 150,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
    },
    rejectReasonBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.lg,
    },
    modalFooter: {
      flexDirection: 'row',
      gap: Spacing.md,
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    actionButton: {
      flex: 1,
      height: 48,
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rejectModal: {
      margin: Spacing.xl,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
    },
    rejectInput: {
      height: 100,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      textAlignVertical: 'top',
    },
    rejectModalFooter: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  });
};

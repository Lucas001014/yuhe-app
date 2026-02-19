import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const createStyles = (theme: Theme) => {
  const isMobile = width < 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: isMobile ? 80 : 250,
      backgroundColor: theme.backgroundDefault,
      borderRightWidth: 1,
      borderRightColor: theme.border,
      padding: Spacing.lg,
      paddingTop: Spacing.xl,
      gap: isMobile ? Spacing.xl : Spacing.xl,
    },
    sidebarHeader: {
      alignItems: isMobile ? 'center' : 'flex-start',
      gap: Spacing.md,
      marginBottom: isMobile ? 0 : Spacing.xl,
    },
    sidebarTitle: {
      color: theme.textPrimary,
      fontSize: isMobile ? 12 : 20,
      fontWeight: '600',
    },
    menuContainer: {
      gap: Spacing.sm,
      flex: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      gap: Spacing.md,
    },
    menuItemActive: {
      backgroundColor: `${theme.primary}15`,
    },
    menuItemText: {
      color: theme.textMuted,
      flex: 1,
      fontSize: isMobile ? 12 : 14,
    },
    menuItemTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
    backButtonText: {
      color: theme.textMuted,
      fontSize: isMobile ? 12 : 14,
    },
    content: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    scrollContent: {
      padding: Spacing.xl,
      paddingBottom: Spacing['5xl'],
    },
    header: {
      marginBottom: Spacing.xl,
    },
    section: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
      shadowColor: theme.textMuted,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.lg,
      flexWrap: 'wrap',
    },
    statCard: {
      flex: 1,
      minWidth: isMobile ? width / 2 - Spacing.xl : 200,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      shadowColor: theme.textMuted,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textMuted,
    },
    tableContainer: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundTertiary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tableCell: {
      fontSize: 14,
      color: theme.textSecondary,
      paddingVertical: Spacing.xs,
    },
    tableCellHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    badge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    badgeSuccess: {
      backgroundColor: `${theme.success}20`,
      color: theme.success,
    },
    badgeWarning: {
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
    },
    badgeDanger: {
      backgroundColor: `${theme.error}20`,
      color: theme.error,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 60,
    },
    loadingContainer: {
      padding: Spacing['5xl'],
      alignItems: 'center',
    },
    loadingText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    emptyContainer: {
      padding: Spacing['5xl'],
      alignItems: 'center',
    },
    emptyText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    button: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
    },
    buttonPrimary: {
      backgroundColor: theme.primary,
    },
    buttonDanger: {
      backgroundColor: theme.error,
    },
    buttonText: {
      color: theme.buttonPrimaryText,
      fontSize: 14,
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    modalCloseButton: {
      padding: Spacing.sm,
    },
    modalBody: {
      marginBottom: Spacing.lg,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Spacing.md,
    },
    formGroup: {
      marginBottom: Spacing.lg,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textPrimary,
      marginBottom: Spacing.sm,
    },
    formInput: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontSize: 14,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });
};

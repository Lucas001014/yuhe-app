import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isMobile ? 'column' : 'row',
    },
    sidebar: {
      width: isMobile ? '100%' : 250,
      backgroundColor: theme.backgroundDefault,
      borderRightWidth: isMobile ? 0 : 1,
      borderRightColor: theme.border,
      borderBottomWidth: isMobile ? 1 : 0,
      borderBottomColor: theme.border,
      padding: Spacing.lg,
      paddingTop: Spacing.xl,
      gap: Spacing.lg,
    },
    sidebarHeader: {
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    sidebarTitle: {
      color: theme.textPrimary,
      fontSize: 18,
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
      fontSize: 14,
    },
    menuItemTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    menuItemContent: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    menuItemTitle: {
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    menuItemDesc: {
      color: theme.textMuted,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      gap: Spacing.md,
    },
    backButtonText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    mainContent: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    scrollContent: {
      flex: 1,
    },
    content: {
      padding: Spacing.xl,
      paddingBottom: Spacing['5xl'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.lg,
      flexWrap: 'wrap',
      marginBottom: Spacing.xl,
    },
    statCard: {
      flex: 1,
      minWidth: isMobile ? width / 2 - Spacing.xl : 150,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      shadowColor: theme.textMuted,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      gap: Spacing.sm,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.primary,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textMuted,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.lg,
      flexWrap: 'wrap',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
      flex: 1,
      justifyContent: 'center',
      minWidth: 120,
    },
    actionButtonPrimary: {
      backgroundColor: theme.primary,
    },
    actionButtonSuccess: {
      backgroundColor: theme.success,
    },
    actionButtonWarning: {
      backgroundColor: theme.warning,
    },
    actionButtonInfo: {
      backgroundColor: theme.accent,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    operationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    operationButtonPrimary: {
      backgroundColor: theme.primary,
    },
    operationButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textPrimary,
    },
    commandInput: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontSize: 14,
      borderWidth: 1,
      marginBottom: Spacing.md,
    },
    logsContainer: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      minHeight: 300,
      maxHeight: 500,
    },
    logEntry: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      gap: Spacing.md,
    },
    logTime: {
      fontSize: 12,
    },
    logLevel: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    logMessage: {
      flex: 1,
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      paddingVertical: Spacing.xl,
      color: theme.textMuted,
    },
  });

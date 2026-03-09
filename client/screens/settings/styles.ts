import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Spacing['2xl'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      padding: Spacing.lg,
      marginBottom: Spacing.xs,
    },
    sectionTitle: {
      marginBottom: Spacing.md,
      fontWeight: '600',
    },
    // 账户卡片
    profileCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
      shadowColor: '#00000008',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    profileAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.backgroundTertiary,
      marginRight: Spacing.md,
    },
    profileInfo: {
      flex: 1,
      gap: Spacing.xs,
    },
    // 设置项
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.xs,
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    settingValue: {
      maxWidth: 150,
    },
    // 退出登录
    logoutButton: {
      margin: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    logoutText: {
      fontWeight: '600',
    },
    // 底部
    footer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      marginTop: Spacing.xl,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      width: '100%',
      maxWidth: 320,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    modalMessage: {
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
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
  });
};

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 用户信息区
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    avatarContainer: {
      marginRight: Spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.backgroundDefault,
    },
    userInfo: {
      flex: 1,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    identityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      backgroundColor: `${theme.primary}10`,
      borderRadius: BorderRadius.sm,
      alignSelf: 'flex-start',
    },
    settingsButton: {
      padding: Spacing.sm,
      marginLeft: Spacing.sm,
    },
    // 认证卡片
    verifyCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    verifyCardRejected: {
      shadowColor: '#EF4444',
    },
    verifyCardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
    },
    verifyCardText: {
      flex: 1,
      gap: Spacing.xs,
    },
    verifyButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.sm,
    },
    retryButton: {
      backgroundColor: '#EF4444',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.sm,
    },
    // 发帖统计区
    statsSection: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: Spacing.lg,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    statItem: {
      flex: 1,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      alignItems: 'center',
      gap: Spacing.xs,
      shadowColor: '#00000008',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: Spacing.xs,
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
    // 头像编辑图标
    avatarEditIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.backgroundDefault,
    },
    // 输入框
    inputContainer: {
      marginBottom: Spacing.lg,
    },
    modalInput: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    // 账号切换
    accountSwitchContent: {
      maxWidth: 360,
    },
    accountList: {
      marginBottom: Spacing.lg,
    },
    addAccountButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: `${theme.primary}10`,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
    },
    accountAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: Spacing.md,
    },
    accountInfo: {
      flex: 1,
    },
    fullWidthButton: {
      width: '100%',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
    // 头像预览
    avatarPreviewContent: {
      alignItems: 'center',
    },
    avatarPreviewContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      overflow: 'hidden',
      marginBottom: Spacing.md,
      backgroundColor: theme.backgroundTertiary,
    },
    avatarPreviewImage: {
      width: '100%',
      height: '100%',
    },
    avatarPreviewHint: {
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
  });
};

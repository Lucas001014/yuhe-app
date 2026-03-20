import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_CROP_SIZE = SCREEN_WIDTH * 0.75;

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    // 背景图区域
    backgroundContainer: {
      height: SCREEN_HEIGHT * 0.3,
      position: 'relative',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    backgroundPlaceholder: {
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
    },
    gradientLayer: {
      flex: 1,
    },
    changeBackgroundButton: {
      position: 'absolute',
      bottom: Spacing.lg,
      right: Spacing.xl,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingsButton: {
      position: 'absolute',
      top: Spacing['2xl'],
      right: Spacing.lg,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // 用户信息区
    userInfoSection: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      marginTop: -Spacing['2xl'],
      alignItems: 'center',
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: Spacing.lg,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 4,
      borderColor: theme.backgroundRoot,
      backgroundColor: theme.backgroundDefault,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.backgroundRoot,
    },
    nameSection: {
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    identityRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    identityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: `${theme.primary}15`,
      borderRadius: BorderRadius.xl,
    },
    merchantBadge: {
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
    },
    bioSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
    },
    bioText: {
      flex: 1,
      textAlign: 'center',
    },
    // 底部统计板块
    statsSection: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    statItem: {
      flex: 1,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
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
      fontSize: 18,
      fontWeight: '700',
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: Spacing.lg,
    },
    modalInput: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      fontSize: 16,
      color: theme.textPrimary,
    },
    modalInputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
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
    },
    cancelButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    confirmButton: {
      backgroundColor: theme.primary,
    },
    // 头像裁剪
    avatarCropModalContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    avatarCropHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: SCREEN_HEIGHT * 0.06,
      paddingBottom: Spacing.lg,
    },
    avatarCropButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      minWidth: 60,
      alignItems: 'center',
    },
    avatarCropConfirmButton: {
      backgroundColor: '#6366F1',
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
    },
    avatarCropArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarCropImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH,
    },
    avatarCropCircle: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    avatarCropHint: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
  });
};

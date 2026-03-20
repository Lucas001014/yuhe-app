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
    // 全屏背景
    fullScreenBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    defaultBackground: {
      backgroundColor: theme.primary,
    },
    // 渐变遮罩
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    gradientTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT * 0.25,
    },
    gradientMiddle: {
      position: 'absolute',
      top: SCREEN_HEIGHT * 0.25,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT * 0.15,
    },
    gradientBottom: {
      position: 'absolute',
      top: SCREEN_HEIGHT * 0.4,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // 设置按钮 - 右上角
    settingsButton: {
      position: 'absolute',
      top: Spacing['2xl'],
      right: Spacing.lg,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    // 更换背景按钮
    changeBackgroundButton: {
      position: 'absolute',
      bottom: Spacing.xl + 60, // 避开底部导航
      right: Spacing.lg,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    // 滚动内容
    scrollContent: {
      flexGrow: 1,
      paddingTop: SCREEN_HEIGHT * 0.08, // 顶部安全区
    },
    topSpacer: {
      height: SCREEN_HEIGHT * 0.08,
    },
    // 用户信息区 - 靠左上
    userInfoSection: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      alignItems: 'flex-start',
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: Spacing.md,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      borderColor: theme.backgroundRoot,
      backgroundColor: theme.backgroundDefault,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.backgroundRoot,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },
    identityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.md,
    },
    merchantBadge: {
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
    },
    bioSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.lg,
    },
    bioText: {
      flex: 1,
    },
    // 底部统计板块 - 纯文字简洁版
    statsSection: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xl,
      marginTop: 'auto',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: Spacing.xs,
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

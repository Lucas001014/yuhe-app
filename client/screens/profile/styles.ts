import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_CROP_SIZE = SCREEN_WIDTH * 0.75;

// 天蓝色主题色 - 淡蓝色，非亮蓝
export const SKY_BLUE = '#38BDF8';
const SKY_BLUE_LIGHT = '#E0F2FE';
const SKY_BLUE_DARK = '#0EA5E9';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    // ========== 顶部用户信息区 ==========
    headerSection: {
      position: 'relative',
      paddingBottom: Spacing.lg,
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 180,
      backgroundColor: SKY_BLUE_LIGHT,
      opacity: 0.6,
    },
    headerTopBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing['2xl'],
      gap: Spacing.md,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInfoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#F3F4F6',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    avatarAddButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: SKY_BLUE,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    userTextInfo: {
      flex: 1,
      marginLeft: Spacing.lg,
      paddingTop: Spacing.xs,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    memberBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.xl,
      alignSelf: 'flex-start',
      marginBottom: Spacing.sm,
    },
    idRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    copyIdButton: {
      padding: Spacing.xs,
    },

    // ========== 数据统计区 ==========
    statsSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: '#FFFFFF',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '700',
    },
    editProfileButton: {
      marginLeft: 'auto',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: '#F3F4F6',
      borderRadius: BorderRadius.md,
    },
    bioRow: {
      marginBottom: Spacing.sm,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    tagItem: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: '#F3F4F6',
      borderRadius: BorderRadius.xl,
    },

    // ========== 功能快捷入口区 ==========
    featuresSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 8,
      borderTopColor: '#F9FAFB',
    },
    featuresRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: Spacing.lg,
    },
    featureItem: {
      alignItems: 'center',
    },
    featureIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: SKY_BLUE_LIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    featureName: {
      fontSize: 11,
      textAlign: 'center',
      maxWidth: 60,
    },
    activityBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F0F9FF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: SKY_BLUE_LIGHT,
    },
    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    bannerIconBg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerText: {
      gap: 2,
    },
    bannerAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },

    // ========== 内容展示区 ==========
    contentSection: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 8,
      borderTopColor: '#F9FAFB',
    },
    tabsRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.md,
      position: 'relative',
    },
    tabItemActive: {},
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '25%',
      right: '25%',
      height: 2,
      backgroundColor: SKY_BLUE,
      borderRadius: 1,
    },
    contentList: {
      padding: Spacing.lg,
    },
    projectGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    projectCard: {
      width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    projectCover: {
      width: '100%',
      height: 100,
      backgroundColor: '#F3F4F6',
    },
    projectInfo: {
      padding: Spacing.sm,
    },
    projectStats: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.xs,
    },
    projectStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    emptyContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['3xl'],
    },
    draftBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      backgroundColor: '#F9FAFB',
      borderRadius: BorderRadius.lg,
      gap: Spacing.sm,
    },
    draftIconBg: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    draftBadge: {
      marginLeft: 'auto',
      marginRight: Spacing.sm,
      backgroundColor: SKY_BLUE,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: BorderRadius.xl,
      minWidth: 20,
      alignItems: 'center',
    },

    // ========== Modal ==========
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
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
      backgroundColor: '#F3F4F6',
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
      backgroundColor: '#F3F4F6',
    },
    confirmButton: {
      backgroundColor: SKY_BLUE,
    },

    // ========== 头像裁剪 ==========
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
      backgroundColor: SKY_BLUE,
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

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 天蓝色主题色
export const SKY_BLUE = '#38BDF8';
const SKY_BLUE_LIGHT = '#E0F2FE';

// 头部尺寸常量
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 56;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    // ========== 固定顶部导航栏 ==========
    fixedHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_MIN_HEIGHT,
      zIndex: 100,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#1C1917',
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
    },

    // ========== 收缩后的迷你栏 ==========
    miniBar: {
      position: 'absolute',
      right: Spacing.lg,
      top: Platform.OS === 'ios' ? 48 : 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    miniStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    miniStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    miniStatText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '500',
    },
    miniButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    miniButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: SKY_BLUE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    miniButtonActive: {
      backgroundColor: '#F3F4F6',
    },

    // ========== 滚动视图 ==========
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 0,
    },

    // ========== 头部背景图 ==========
    headerImageContainer: {
      height: HEADER_MAX_HEIGHT - 80,
      position: 'relative',
    },
    headerImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#E5E7EB',
    },
    defaultHeaderBg: {
      backgroundColor: SKY_BLUE_LIGHT,
    },
    headerImageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },

    // ========== 头像 ==========
    avatarWrapper: {
      position: 'absolute',
      top: HEADER_MAX_HEIGHT - 120,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      backgroundColor: '#F3F4F6',
    },

    // ========== 用户名区域 ==========
    usernameSection: {
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: Spacing.xl,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bioRow: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },

    // ========== 数据统计区域 ==========
    statsSection: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing['4xl'],
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '700',
    },

    // ========== 操作按钮区域 ==========
    actionButtonsSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
    },
    followButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: SKY_BLUE,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      minWidth: 100,
    },
    followedButton: {
      backgroundColor: '#F3F4F6',
    },
    messageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F4F6',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      minWidth: 100,
    },

    // ========== 标签栏 ==========
    tabsSection: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      marginTop: Spacing.md,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.md,
      position: 'relative',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '25%',
      right: '25%',
      height: 2,
      backgroundColor: SKY_BLUE,
      borderRadius: 1,
    },

    // ========== 内容区域 ==========
    contentSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    postCard: {
      backgroundColor: '#FFFFFF',
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    postContent: {
      lineHeight: 24,
      marginBottom: Spacing.md,
    },
    postFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
    },
    postStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    emptyContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing['4xl'],
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
  });
};

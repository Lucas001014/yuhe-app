import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 天蓝色主题色
export const SKY_BLUE = '#38BDF8';
const SKY_BLUE_LIGHT = '#E0F2FE';

// 头部尺寸常量
const HEADER_HEIGHT = 200;
const AVATAR_SIZE = 80;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 24;
const NAV_HEIGHT = 44;

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    // ========== 固定顶部导航栏 ==========
    fixedNav: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: STATUS_BAR_HEIGHT + NAV_HEIGHT,
      zIndex: 100,
    },
    navBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
    },
    navContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
      paddingBottom: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#1C1917',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: Spacing.sm + 8,
      textAlign: 'center',
    },

    // ========== 滚动视图 ==========
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 0,
    },

    // ========== 头部背景图 ==========
    headerBg: {
      position: 'relative',
      overflow: 'hidden',
    },
    headerBgImage: {
      width: '100%',
      height: '100%',
      backgroundColor: SKY_BLUE_LIGHT,
    },
    headerBgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },

    // ========== 白色圆角卡片 ==========
    card: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24, // 向上覆盖背景图
      paddingTop: AVATAR_SIZE / 2 + 10, // 为头像留出空间
      minHeight: SCREEN_WIDTH * 1.5,
    },

    // ========== 头像 ==========
    avatarWrapper: {
      position: 'absolute',
      top: -AVATAR_SIZE / 2,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 3,
      borderColor: '#FFFFFF',
      backgroundColor: '#F3F4F6',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: SKY_BLUE,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    // ========== 简介 ==========
    bioWrapper: {
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginTop: Spacing.sm,
    },

    // ========== 用户名 ==========
    usernameWrapper: {
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginTop: Spacing.sm,
    },

    // ========== 数据统计区域 ==========
    statsSection: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
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
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      minWidth: 110,
    },
    followedButton: {
      backgroundColor: '#F3F4F6',
    },
    messageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing['2xl'],
      borderRadius: BorderRadius.xl,
      minWidth: 110,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },

    // ========== 标签栏 ==========
    tabsSection: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      marginTop: Spacing.sm,
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
      left: '20%',
      right: '20%',
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
  });
};

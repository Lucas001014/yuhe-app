import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 天蓝色主题色
export const SKY_BLUE = '#38BDF8';
const SKY_BLUE_LIGHT = '#E0F2FE';

// 头部尺寸常量
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 56 + (Platform.OS === 'ios' ? 44 : 20);
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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
      height: HEADER_MIN_HEIGHT,
      zIndex: 100,
    },
    navBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    navContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navTitle: {
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '600',
      color: '#1C1917',
    },

    // ========== 收缩后的迷你栏 ==========
    miniBar: {
      position: 'absolute',
      right: Spacing.lg + 44,
      top: Platform.OS === 'ios' ? 50 : 26,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    miniStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    miniStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    miniStatText: {
      fontSize: 11,
      color: '#666',
      fontWeight: '500',
    },
    miniButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    miniButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: SKY_BLUE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    miniButtonFollowed: {
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
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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

    // ========== 用户名 ==========
    usernameWrapper: {
      position: 'absolute',
      top: HEADER_MAX_HEIGHT - 25,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    verifiedBadge: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: SKY_BLUE,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ========== 简介 ==========
    bioWrapper: {
      alignItems: 'center',
      marginTop: 85,
      paddingHorizontal: Spacing.xl,
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

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing['3xl'],
      backgroundColor: '#FFFFFF', // 白色背景，保持干净清爽
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: Spacing['5xl'],
    },
    brandTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme.primary, // 深蓝色，品牌主色调
      marginBottom: Spacing.sm,
    },
    brandSubtitle: {
      fontSize: 16,
      color: '#666666', // 深灰色，副标题颜色
      textAlign: 'center',
      lineHeight: 24,
    },
    formContainer: {
      marginBottom: Spacing['3xl'],
    },
    input: {
      height: 52,
      paddingHorizontal: Spacing.lg,
      backgroundColor: '#F5F7FA', // 浅灰色背景，保持简洁
      borderRadius: BorderRadius.md,
      fontSize: 16,
      color: '#333333', // 深灰色文字
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: '#E0E0E0', // 浅灰色边框
    },
    loginButton: {
      height: 52,
      backgroundColor: theme.primary, // 深蓝色，登录按钮
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.md,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF', // 白色文字
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    registerLink: {
      marginLeft: Spacing.xs,
      fontWeight: '500',
      fontSize: 16,
    },
  });
};

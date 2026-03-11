import React from 'react';
import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from './styles';

export default function PrivacyPolicyScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
          隐私政策
        </ThemedText>

        <ThemedText variant="body" color={theme.textSecondary} style={styles.updateDate}>
          最后更新日期：2024年3月1日
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          1. 信息收集
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们可能收集以下类型的信息：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 账户信息：注册时提供的用户名、手机号、电子邮箱等
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 设备信息：设备型号、操作系统版本、设备标识符等
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 使用信息：您如何使用我们的应用、访问的页面、点击的链接等
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 位置信息：当您使用同城功能时，可能收集您的地理位置
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 内容信息：您发布的帖子、评论、图片等
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          2. 信息使用
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们可能使用收集的信息用于：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 提供和维护我们的服务
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 改进和优化我们的服务
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 分析使用趋势和模式
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 防止欺诈和滥用
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 符合法律法规要求
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          3. 信息共享
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们不会出售、出租或以其他方式共享您的个人信息，除非：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 获得您的明确同意
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 为提供服务所必需
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 遵守法律法规要求
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 保护我们的权利、财产或安全
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          4. 信息安全
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们采取合理的技术和组织措施来保护您的个人信息安全，包括：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 数据加密传输和存储
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 严格的访问控制
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 定期安全审计
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          但请注意，任何互联网传输都不是绝对安全的。我们无法保证信息的绝对安全。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          5. Cookie 使用
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们可能使用 Cookie 和类似技术来收集和存储信息，以便：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 记住您的登录信息
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 记住您的偏好设置
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 分析使用情况
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          您可以通过浏览器设置拒绝 Cookie，但这可能会影响您的使用体验。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          6. 您的权利
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          您有权：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 访问您的个人信息
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 更正您的个人信息
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 删除您的个人信息
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 限制信息的处理
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 撤回同意
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          7. 儿童隐私
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们的服务不面向 14 岁以下的儿童。如果我们发现收集了 14 岁以下儿童的信息，我们将采取措施删除该信息。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          8. 政策变更
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们保留随时修改本隐私政策的权利。修改后的政策将在本应用上公布。如果您继续使用本服务，即表示您接受修改后的政策。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          9. 联系我们
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          邮箱：privacy@yuhe.com
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

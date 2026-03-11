import React from 'react';
import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from './styles';

export default function UserAgreementScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText variant="h2" color={theme.textPrimary} style={styles.title}>
          用户协议
        </ThemedText>

        <ThemedText variant="body" color={theme.textSecondary} style={styles.updateDate}>
          最后更新日期：2024年3月1日
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          1. 服务条款的接受
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          欢迎使用遇合（以下简称&ldquo;本应用&rdquo;）。通过使用本应用，您表示同意遵守本用户协议的所有条款和条件。如果您不同意这些条款，请不要使用本应用。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          2. 账户注册
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          在注册账户时，您同意提供真实、准确、完整的个人信息。您有责任维护您的账户安全，并对您账户下发生的所有活动负责。如果您发现任何未经授权使用您账户的情况，应立即通知我们。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          3. 用户行为规范
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          您同意不会：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 发布违法、有害、威胁、辱骂、骚扰或其他不当内容
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 侵犯他人的知识产权或隐私权
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 发布虚假信息或误导性信息
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.listItem}>
          • 干扰或破坏本应用的正常运行
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          4. 知识产权
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          本应用中的所有内容，包括但不限于文字、图片、视频、软件、商标、标志等，均受知识产权法保护。未经我们事先书面许可，您不得以任何方式使用这些内容。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          5. 用户内容
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          您通过本应用发布的内容，您声明您拥有该内容的所有必要权利。您授予我们使用、修改、展示、分发您的内容的权利，以便我们提供相关服务。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          6. 免责声明
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          本应用按&ldquo;现状&rdquo;提供服务，不提供任何明示或暗示的保证。我们不保证服务不会中断、及时、安全或无错误。对于因使用本服务而造成的任何损失，我们不承担责任。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          7. 协议变更
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          我们保留随时修改本协议的权利。修改后的协议将在本应用上公布。如果您继续使用本服务，即表示您接受修改后的协议。
        </ThemedText>

        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          8. 联系我们
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          如果您对本协议有任何疑问，请通过以下方式联系我们：
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.content}>
          邮箱：support@yuhe.com
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

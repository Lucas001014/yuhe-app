import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
    fontWeight: '300',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 12,
    fontSize: 16,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 12,
    fontSize: 16,
    color: theme.textPrimary,
  },
  codeButton: {
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: `${theme.primary}15`,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  submitButton: {
    height: 56,
    backgroundColor: theme.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 8,
  },
});

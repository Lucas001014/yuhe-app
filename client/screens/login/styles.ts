import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 72,
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 52,
    paddingHorizontal: 18,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 14,
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
    height: 52,
    paddingHorizontal: 18,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 14,
    fontSize: 16,
    color: theme.textPrimary,
  },
  codeButton: {
    paddingHorizontal: 20,
    height: 52,
    backgroundColor: `${theme.primary}15`,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  codeButtonDisabled: {
    opacity: 0.6,
  },
  passwordHint: {
    paddingHorizontal: 4,
    gap: 4,
  },
  strengthBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  passwordRule: {
    marginTop: 2,
  },
  submitButton: {
    height: 52,
    backgroundColor: theme.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  socialLoginContainer: {
    marginTop: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.borderLight,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.backgroundDefault,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialHint: {
    textAlign: 'center',
    fontSize: 12,
  },
});

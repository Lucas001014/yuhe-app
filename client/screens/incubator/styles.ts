import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  inputSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    paddingTop: 16,
    fontSize: 16,
    color: theme.textPrimary,
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.border,
  },
  micButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
  },
  loadingSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  resultSection: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
  },
  feasibilityBadge: {
    backgroundColor: theme.warning,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  feasibilityBadgeHigh: {
    backgroundColor: theme.success,
  },
  feasibilityBadgeMedium: {
    backgroundColor: theme.warning,
  },
  feasibilityBadgeLow: {
    backgroundColor: theme.error,
  },
  feasibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 16,
  },
  tabContent: {
    minHeight: 200,
  },
  reportText: {
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  matchingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
  },
});

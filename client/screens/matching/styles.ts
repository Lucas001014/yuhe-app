import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  filterContainer: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.backgroundDefault,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonText: {
    fontSize: 14,
  },
  aiMatchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  aiMatchButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundTertiary,
    marginRight: 12,
    overflow: 'hidden',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    marginLeft: 4,
  },
  needInfo: {
    marginBottom: 16,
  },
  needType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  needDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cooperationTag: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.primary}15`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  connectButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
});

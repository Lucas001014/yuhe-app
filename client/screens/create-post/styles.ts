import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    publishButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    publishButtonDisabled: {
      opacity: 0.5,
    },
    scrollContent: {
      padding: Spacing.lg,
      paddingBottom: Spacing['5xl'],
    },
    input: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      color: theme.textPrimary,
    },
    titleInput: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: Spacing.md,
      minHeight: 50,
    },
    contentInput: {
      fontSize: 16,
      minHeight: 200,
      marginBottom: Spacing.lg,
    },
    imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -Spacing.xs,
      marginBottom: Spacing.lg,
    },
    imageWrapper: {
      width: (100 - Spacing.xs * 2) / 3,
      height: 100,
      marginHorizontal: Spacing.xs,
      marginBottom: Spacing.sm,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.md,
    },
    removeButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.textPrimary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addImageButton: {
      width: (100 - Spacing.xs * 2) / 3,
      height: 100,
      marginHorizontal: Spacing.xs,
      marginBottom: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderLight,
      borderStyle: 'dashed',
    },
    addImageLargeButton: {
      padding: Spacing['2xl'],
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      borderStyle: 'dashed',
    },
    addImageText: {
      marginTop: Spacing.md,
      fontWeight: '600',
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.backgroundDefault,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    tipText: {
      marginLeft: Spacing.sm,
      flex: 1,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: BorderRadius.md,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      marginTop: Spacing.xl,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
  });
};

import { StyleSheet, Platform } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: Spacing.md,
    },
    headerInfo: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    messageRow: {
      marginBottom: Spacing.md,
    },
    messageBubbleMine: {
      alignSelf: 'flex-end',
      maxWidth: '75%',
      backgroundColor: theme.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderTopRightRadius: BorderRadius.xs,
    },
    messageBubbleOther: {
      alignSelf: 'flex-start',
      maxWidth: '75%',
      backgroundColor: theme.backgroundDefault,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderTopLeftRadius: BorderRadius.xs,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    messageTime: {
      alignSelf: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      gap: Spacing.md,
      paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.lg,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.textMuted,
    },
  });
};

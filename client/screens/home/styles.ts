import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  // 瀑布流布局样式
  columnsContainer: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.backgroundDefault,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
  },
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.backgroundTertiary,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundTertiary,
  },
  typeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: theme.backgroundTertiary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

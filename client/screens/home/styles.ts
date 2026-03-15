import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 计算卡片宽度
export const getCardWidth = () => {
  return (SCREEN_WIDTH - 32 - 8) / 2; // 两列布局，左右各16px间距，列间距8px
};

export const createStyles = (theme: Theme, width?: number) => StyleSheet.create({
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
  typeTagText: {
    fontSize: 11,
  },
  cardContent: {
    padding: 10,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: theme.backgroundTertiary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 3,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 用户头像样式
  authorAvatarContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 10,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  // 悬赏Tab专用样式
  cardImage: {
    width: '100%',
  },
  bountyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  bountyTagText: {
    fontSize: 11,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 11,
  },
  // 瀑布流容器
  masonryContainer: {
    flexDirection: 'row',
  },
  masonryColumn: {
    flex: 1,
  },
  // 评论Modal样式
  commentModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentContainer: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  commentList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 18,
    fontSize: 14,
  },
  commentSubmit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
});

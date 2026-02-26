import express from 'express';

const router = express.Router();

// 生成随机数据
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 获取用户消息列表
 * GET /api/v1/messages
 * Query: { userId: number }
 */
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    // 生成模拟消息数据
    const messages = [
      {
        id: 1,
        type: 'chat',
        title: '私信消息',
        content: '你有一条新的私信消息',
        avatar: 'https://i.pravatar.cc/150?img=10',
        username: '用户10',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: true,
        count: randomInt(1, 10),
      },
      {
        id: 2,
        type: 'like',
        title: '点赞',
        content: '用户20 赞了你的帖子',
        avatar: 'https://i.pravatar.cc/150?img=20',
        username: '用户20',
        postId: 1,
        postTitle: '创业初期需要注意的三个关键点',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: true,
      },
      {
        id: 3,
        type: 'comment',
        title: '评论',
        content: '用户15 在你的帖子下评论了',
        avatar: 'https://i.pravatar.cc/150?img=15',
        username: '用户15',
        postId: 2,
        postTitle: '如何快速验证创业想法的可行性',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: true,
        count: randomInt(1, 5),
      },
      {
        id: 4,
        type: 'collect',
        title: '收藏',
        content: '用户25 收藏了你的帖子',
        avatar: 'https://i.pravatar.cc/150?img=25',
        username: '用户25',
        postId: 3,
        postTitle: '创业者如何平衡工作和生活',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
      {
        id: 5,
        type: 'forward',
        title: '转发',
        content: '用户30 转发了你的帖子',
        avatar: 'https://i.pravatar.cc/150?img=30',
        username: '用户30',
        postId: 4,
        postTitle: '从0到1的创业经验总结',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
      {
        id: 6,
        type: 'follow',
        title: '新粉丝',
        content: '有新的粉丝关注了你',
        avatar: 'https://i.pravatar.cc/150?img=35',
        username: '用户35',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: true,
        count: randomInt(1, 3),
      },
      {
        id: 7,
        type: 'like',
        title: '点赞',
        content: '用户40 赞了你的帖子',
        avatar: 'https://i.pravatar.cc/150?img=40',
        username: '用户40',
        postId: 5,
        postTitle: '创业者必备的时间管理技巧',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
      {
        id: 8,
        type: 'comment',
        title: '评论',
        content: '用户45 在你的帖子下评论了',
        avatar: 'https://i.pravatar.cc/150?img=45',
        username: '用户45',
        postId: 6,
        postTitle: '如何找到合适的创业合伙人',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
      {
        id: 9,
        type: 'follow',
        title: '新粉丝',
        content: '有新的粉丝关注了你',
        avatar: 'https://i.pravatar.cc/150?img=50',
        username: '用户50',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
      {
        id: 10,
        type: 'chat',
        title: '私信消息',
        content: '你有一条新的私信消息',
        avatar: 'https://i.pravatar.cc/150?img=5',
        username: '用户5',
        time: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
        unread: false,
      },
    ];

    // 按时间倒序排序
    messages.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({ error: '获取消息列表失败' });
  }
});

export default router;

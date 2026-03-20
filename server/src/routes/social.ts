import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// ============== 关注功能 ==============

/**
 * 关注/取消关注用户
 * POST /api/v1/social/follow
 * Body: { currentUserId: number, targetUserId: number }
 */
router.post('/follow', async (req, res) => {
  const db = (req as any).db;
  if (!db) {
    return res.status(500).json({ success: false, error: '数据库连接失败' });
  }

  const { currentUserId, targetUserId } = req.body;

  if (!currentUserId || !targetUserId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ success: false, error: '不能关注自己' });
  }

  try {
    // 检查是否已关注
    const checkResult = await db.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, targetUserId]
    );

    let isFollowing = false;

    if (checkResult.rows.length === 0) {
      // 关注
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [currentUserId, targetUserId]
      );
      isFollowing = true;

      // 创建关注通知
      await createNotification(db, targetUserId, currentUserId, 'follow', null, '关注了你');
    } else {
      // 取消关注
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, targetUserId]
      );
      isFollowing = false;
    }

    // 获取关注数和粉丝数
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count
    `, [targetUserId]);

    res.json({
      success: true,
      isFollowing,
      followingCount: parseInt(statsResult.rows[0].following_count),
      followerCount: parseInt(statsResult.rows[0].follower_count),
    });
  } catch (error: any) {
    console.error('关注操作失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 检查是否关注
 * GET /api/v1/social/follow/check
 * Query: { currentUserId: number, targetUserId: number }
 */
router.get('/follow/check', async (req, res) => {
  const db = (req as any).db;

  const { currentUserId, targetUserId } = req.query;

  if (!currentUserId || !targetUserId) {
    return res.json({ success: true, isFollowing: false });
  }

  try {
    const result = await db.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, targetUserId]
    );

    res.json({ success: true, isFollowing: result.rows.length > 0 });
  } catch (error: any) {
    console.error('检查关注状态失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取用户的关注列表
 * GET /api/v1/social/following/:userId
 */
router.get('/following/:userId', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;

  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, f.created_at
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({ success: true, list: result.rows });
  } catch (error: any) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取用户的粉丝列表
 * GET /api/v1/social/followers/:userId
 */
router.get('/followers/:userId', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;

  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, f.created_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({ success: true, list: result.rows });
  } catch (error: any) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 评论功能 ==============

/**
 * 获取帖子评论列表
 * GET /api/v1/social/comments/:postId
 */
router.get('/comments/:postId', async (req, res) => {
  const db = (req as any).db;
  const { postId } = req.params;

  try {
    const result = await db.query(`
      SELECT c.*, u.username, u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      LIMIT 100
    `, [postId]);

    const comments = result.rows.map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      parentId: row.parent_id,
      content: row.content,
      createdAt: row.created_at,
      username: row.username || '匿名用户',
      avatarUrl: row.avatar_url || 'https://i.pravatar.cc/150',
    }));

    res.json({ success: true, comments });
  } catch (error: any) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 发表评论
 * POST /api/v1/social/comments
 * Body: { postId: number, userId: number, content: string, parentId?: number }
 */
router.post('/comments', async (req, res) => {
  const db = (req as any).db;
  const { postId, userId, content, parentId } = req.body;

  if (!postId || !userId || !content) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }

  try {
    // 获取用户信息
    const userResult = await db.query(
      'SELECT username, avatar_url FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // 插入评论
    const result = await db.query(`
      INSERT INTO comments (post_id, author_id, parent_id, content, username, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [postId, userId, parentId || null, content, user?.username, user?.avatar_url]);

    // 更新帖子评论数
    await db.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
      [postId]
    );

    // 创建评论通知
    const postResult = await db.query('SELECT author_id, title FROM posts WHERE id = $1', [postId]);
    if (postResult.rows[0] && postResult.rows[0].author_id !== userId) {
      await createNotification(
        db,
        postResult.rows[0].author_id,
        userId,
        'comment',
        parseInt(postId),
        `评论了你的帖子「${postResult.rows[0].title || '无标题'}」`
      );
    }

    const comment = {
      id: result.rows[0].id,
      postId: result.rows[0].post_id,
      authorId: result.rows[0].author_id,
      parentId: result.rows[0].parent_id,
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
      username: user?.username || '匿名用户',
      avatarUrl: user?.avatar_url || 'https://i.pravatar.cc/150',
    };

    res.json({ success: true, comment });
  } catch (error: any) {
    console.error('发表评论失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 删除评论
 * DELETE /api/v1/social/comments/:commentId
 */
router.delete('/comments/:commentId', async (req, res) => {
  const db = (req as any).db;
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    // 检查评论是否属于该用户
    const checkResult = await db.query(
      'SELECT * FROM comments WHERE id = $1 AND author_id = $2',
      [commentId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, error: '无权删除此评论' });
    }

    const postId = checkResult.rows[0].post_id;

    // 删除评论
    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);

    // 更新帖子评论数
    await db.query(
      'UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1',
      [postId]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('删除评论失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 转发功能 ==============

/**
 * 转发帖子
 * POST /api/v1/social/share
 * Body: { postId: number, userId: number, shareTo?: string }
 */
router.post('/share', async (req, res) => {
  const db = (req as any).db;
  const { postId, userId, shareTo = 'timeline' } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }

  try {
    // 记录转发
    await db.query(
      'INSERT INTO post_shares (post_id, user_id, share_to) VALUES ($1, $2, $3)',
      [postId, userId, shareTo]
    );

    // 更新转发数
    await db.query(
      'UPDATE posts SET share_count = share_count + 1 WHERE id = $1',
      [postId]
    );

    // 创建转发通知
    const postResult = await db.query('SELECT author_id, title FROM posts WHERE id = $1', [postId]);
    if (postResult.rows[0] && postResult.rows[0].author_id !== userId) {
      await createNotification(
        db,
        postResult.rows[0].author_id,
        userId,
        'share',
        parseInt(postId),
        `转发了你的帖子「${postResult.rows[0].title || '无标题'}」`
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('转发失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 通知功能 ==============

/**
 * 获取用户通知列表
 * GET /api/v1/social/notifications
 * Query: { userId: number }
 */
router.get('/notifications', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  try {
    const result = await db.query(`
      SELECT n.*, u.username as from_username, u.avatar_url as from_user_avatar
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 100
    `, [userId]);

    const notifications = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content,
      postId: row.post_id,
      fromUserId: row.from_user_id,
      fromUsername: row.from_username || '系统',
      fromUserAvatar: row.from_user_avatar || 'https://i.pravatar.cc/150',
      isRead: row.is_read,
      createdAt: row.created_at,
    }));

    // 统计未读数
    const unreadResult = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      notifications,
      unreadCount: parseInt(unreadResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 标记通知为已读
 * POST /api/v1/social/notifications/read
 * Body: { userId: number, notificationId?: number }
 */
router.post('/notifications/read', async (req, res) => {
  const db = (req as any).db;
  const { userId, notificationId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  try {
    if (notificationId) {
      await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );
    } else {
      await db.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1',
        [userId]
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 私信功能 ==============

/**
 * 获取私信会话列表
 * GET /api/v1/social/chats
 * Query: { userId: number }
 */
router.get('/chats', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  try {
    // 获取所有私聊会话
    const result = await db.query(`
      SELECT 
        CASE 
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END as other_user_id,
        u.username as other_username,
        u.avatar_url as other_avatar,
        MAX(created_at) as last_message_time,
        MAX(content) as last_message,
        SUM(CASE WHEN receiver_id = $1 AND is_read = false THEN 1 ELSE 0 END) as unread_count
      FROM private_messages
      LEFT JOIN users u ON u.id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
      WHERE sender_id = $1 OR receiver_id = $1
      GROUP BY other_user_id, u.username, u.avatar_url
      ORDER BY last_message_time DESC
    `, [userId]);

    const chats = result.rows.map((row: any) => ({
      otherUserId: row.other_user_id,
      otherUsername: row.other_username || '匿名用户',
      otherAvatar: row.other_avatar || 'https://i.pravatar.cc/150',
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      unreadCount: parseInt(row.unread_count) || 0,
    }));

    res.json({ success: true, chats });
  } catch (error: any) {
    console.error('获取私信会话失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取与某用户的聊天记录
 * GET /api/v1/social/chats/:otherUserId
 * Query: { userId: number }
 */
router.get('/chats/:otherUserId', async (req, res) => {
  const db = (req as any).db;
  const { otherUserId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  try {
    const result = await db.query(`
      SELECT pm.*, u.username, u.avatar_url
      FROM private_messages pm
      LEFT JOIN users u ON pm.sender_id = u.id
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
      LIMIT 200
    `, [userId, otherUserId]);

    // 标记消息为已读
    await db.query(`
      UPDATE private_messages
      SET is_read = true
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [otherUserId, userId]);

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
      username: row.username,
      avatarUrl: row.avatar_url,
      isMine: row.sender_id === parseInt(userId as string),
    }));

    res.json({ success: true, messages });
  } catch (error: any) {
    console.error('获取聊天记录失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 发送私信
 * POST /api/v1/social/chats
 * Body: { senderId: number, receiverId: number, content: string }
 */
router.post('/chats', async (req, res) => {
  const db = (req as any).db;
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }

  try {
    const result = await db.query(`
      INSERT INTO private_messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [senderId, receiverId, content]);

    // 创建私信通知
    await createNotification(
      db,
      receiverId,
      senderId,
      'message',
      null,
      `给你发送了一条私信`
    );

    const message = {
      id: result.rows[0].id,
      senderId: result.rows[0].sender_id,
      receiverId: result.rows[0].receiver_id,
      content: result.rows[0].content,
      isRead: result.rows[0].is_read,
      createdAt: result.rows[0].created_at,
      isMine: true,
    };

    res.json({ success: true, message });
  } catch (error: any) {
    console.error('发送私信失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 用户主页 ==============

/**
 * 获取用户信息（包括关注数、粉丝数等）
 * GET /api/v1/social/user/:userId
 * Query: { currentUserId?: number }
 */
router.get('/user/:userId', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;
  const { currentUserId } = req.query;

  try {
    // 获取用户信息
    const userResult = await db.query(
      'SELECT id, username, avatar_url, bio, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const user = userResult.rows[0];

    // 获取关注数和粉丝数
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count,
        (SELECT COUNT(*) FROM posts WHERE author_id = $1 AND status = 'published') as post_count
    `, [userId]);

    // 检查是否已关注
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followResult = await db.query(
        'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, userId]
      );
      isFollowing = followResult.rows.length > 0;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        followingCount: parseInt(statsResult.rows[0].following_count),
        followerCount: parseInt(statsResult.rows[0].follower_count),
        postCount: parseInt(statsResult.rows[0].post_count),
        isFollowing,
      },
    });
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取用户的帖子列表
 * GET /api/v1/social/user/:userId/posts
 */
router.get('/user/:userId/posts', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;

  try {
    const result = await db.query(`
      SELECT * FROM posts
      WHERE author_id = $1 AND status = 'published' AND audit_status = 'approved'
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    const posts = result.rows.map((row: any) => ({
      ...row,
      images: row.images || [],
      tags: row.tags || [],
    }));

    res.json({ success: true, posts });
  } catch (error: any) {
    console.error('获取用户帖子失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 屏蔽功能 ==============

/**
 * 屏蔽/取消屏蔽用户
 * POST /api/v1/social/block
 * Body: { currentUserId: number, targetUserId: number }
 */
router.post('/block', async (req, res) => {
  const db = (req as any).db;
  const { currentUserId, targetUserId } = req.body;

  if (!currentUserId || !targetUserId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ success: false, error: '不能屏蔽自己' });
  }

  try {
    // 创建屏蔽表（如果不存在）
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        blocked_user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, blocked_user_id)
      )
    `);

    // 检查是否已屏蔽
    const checkResult = await db.query(
      'SELECT * FROM user_blocks WHERE user_id = $1 AND blocked_user_id = $2',
      [currentUserId, targetUserId]
    );

    let isBlocked = false;

    if (checkResult.rows.length === 0) {
      // 屏蔽
      await db.query(
        'INSERT INTO user_blocks (user_id, blocked_user_id) VALUES ($1, $2)',
        [currentUserId, targetUserId]
      );
      isBlocked = true;

      // 同时取消关注
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, targetUserId]
      );
    } else {
      // 取消屏蔽
      await db.query(
        'DELETE FROM user_blocks WHERE user_id = $1 AND blocked_user_id = $2',
        [currentUserId, targetUserId]
      );
      isBlocked = false;
    }

    res.json({
      success: true,
      isBlocked,
    });
  } catch (error: any) {
    console.error('屏蔽操作失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取屏蔽列表
 * GET /api/v1/social/blocked
 * Query: { userId: number }
 */
router.get('/blocked', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.avatar_url, ub.created_at
      FROM user_blocks ub
      JOIN users u ON ub.blocked_user_id = u.id
      WHERE ub.user_id = $1
      ORDER BY ub.created_at DESC
    `, [userId]);

    res.json({ success: true, list: result.rows });
  } catch (error: any) {
    console.error('获取屏蔽列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 投诉功能 ==============

/**
 * 投诉用户
 * POST /api/v1/social/report
 * Body: { currentUserId: number, targetUserId: number, reason: string }
 */
router.post('/report', async (req, res) => {
  const db = (req as any).db;
  const { currentUserId, targetUserId, reason } = req.body;

  if (!currentUserId || !targetUserId) {
    return res.status(400).json({ success: false, error: '用户ID不能为空' });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ success: false, error: '不能投诉自己' });
  }

  try {
    // 创建用户投诉表（如果不存在）
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reported_user_id INTEGER NOT NULL,
        reason VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 检查是否已投诉过
    const existingReport = await db.query(
      'SELECT * FROM user_reports WHERE user_id = $1 AND reported_user_id = $2',
      [currentUserId, targetUserId]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ success: false, error: '您已投诉过该用户' });
    }

    // 插入投诉记录
    await db.query(
      'INSERT INTO user_reports (user_id, reported_user_id, reason) VALUES ($1, $2, $3)',
      [currentUserId, targetUserId, reason]
    );

    res.json({
      success: true,
      message: '投诉已提交，我们会尽快处理',
    });
  } catch (error: any) {
    console.error('投诉操作失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== 辅助函数 ==============

/**
 * 创建通知
 */
async function createNotification(
  db: any,
  userId: number,
  fromUserId: number,
  type: string,
  postId: number | null,
  content: string
) {
  try {
    await db.query(`
      INSERT INTO notifications (user_id, from_user_id, type, post_id, content)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, fromUserId, type, postId, content]);
  } catch (error) {
    console.error('创建通知失败:', error);
  }
}

export default router;

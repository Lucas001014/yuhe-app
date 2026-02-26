import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// 获取数据库连接
declare global {
  var db: Pool;
}

const db = global.db;

/**
 * 获取用户消息列表
 * GET /api/v1/messages
 * Query: { userId: number }
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    // 从数据库获取通知
    const result = await db.query(
      `SELECT
        n.*,
        u.avatar as from_user_avatar
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50`,
      [parseInt(userId as string)]
    );

    const messages = result.rows.map((row: any) => {
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        avatar: row.from_user_avatar || 'https://i.pravatar.cc/150',
        username: row.from_username || '未知用户',
        postId: row.post_id,
        postTitle: row.content,
        time: row.created_at,
        unread: !row.is_read,
        count: row.type === 'comment' || row.type === 'follow' ? 1 : undefined,
      };
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({ error: '获取消息列表失败' });
  }
});

/**
 * 标记消息为已读
 * POST /api/v1/messages/read
 * Body: { userId: number, messageId?: number }
 */
router.post('/read', async (req, res) => {
  try {
    const { userId, messageId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    if (messageId) {
      // 标记单条消息为已读
      await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [messageId, userId]
      );
    } else {
      // 标记所有消息为已读
      await db.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1',
        [userId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('标记消息已读失败:', error);
    res.status(500).json({ error: '标记消息已读失败' });
  }
});

export default router;

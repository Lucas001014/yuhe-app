import express from 'express';

const router = express.Router();

/**
 * 购买付费问答
 * POST /api/v1/transactions/qa-purchase
 * Body: { userId: number, postId: number }
 */
router.post('/qa-purchase', async (req, res) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: '用户ID和帖子ID不能为空' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 查询帖子信息
    const postResult = await (req as any).db.query(
      'SELECT * FROM posts WHERE id = $1 AND type = $2',
      [postId, 'qa_paid']
    );

    if (postResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '付费问答帖子不存在' });
    }

    const post = postResult.rows[0];

    // 检查是否已购买
    const existingPurchase = await (req as any).db.query(
      'SELECT * FROM qa_purchases WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (existingPurchase.rows.length > 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '您已经购买过此付费问答' });
    }

    // 检查是否是作者
    if (post.author_id === userId) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '不能购买自己的付费问答' });
    }

    // 计算平台手续费（1%）
    const platformFee = post.qa_price * 0.01;
    const netAmount = post.qa_price - platformFee;

    // 检查用户余额
    const userResult = await (req as any).db.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '用户不存在' });
    }

    if (userResult.rows[0].balance < post.qa_price) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '余额不足，请充值' });
    }

    // 扣除购买者余额
    await (req as any).db.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [post.qa_price, userId]
    );

    // 增加作者余额
    await (req as any).db.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [netAmount, post.author_id]
    );

    // 创建交易记录
    await (req as any).db.query(
      `INSERT INTO transactions (user_id, target_user_id, type, post_id, amount, platform_fee, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, post.author_id, 'qa_payment', postId, post.qa_price, platformFee, 'completed']
    );

    // 创建购买记录
    await (req as any).db.query(
      'INSERT INTO qa_purchases (user_id, post_id, amount) VALUES ($1, $2, $3)',
      [userId, postId, post.qa_price]
    );

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '购买成功',
      amount: post.qa_price
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('购买付费问答失败:', error);
    res.status(500).json({ error: '购买付费问答失败' });
  }
});

/**
 * 提交悬赏解答
 * POST /api/v1/transactions/bounty-submit
 * Body: { userId: number, postId: number, content: string }
 */
router.post('/bounty-submit', async (req, res) => {
  const { userId, postId, content } = req.body;

  if (!userId || !postId || !content) {
    return res.status(400).json({ error: '用户ID、帖子ID和解答内容不能为空' });
  }

  try {
    // 查询帖子信息
    const postResult = await (req as any).db.query(
      'SELECT * FROM posts WHERE id = $1 AND type = $2',
      [postId, 'qa_bounty']
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: '悬赏帖子不存在' });
    }

    const post = postResult.rows[0];

    // 检查是否是作者
    if (post.author_id === userId) {
      return res.status(400).json({ error: '不能提交自己的悬赏解答' });
    }

    // 检查是否已有解答
    const existingComment = await (req as any).db.query(
      'SELECT * FROM comments WHERE post_id = $1 AND author_id = $2',
      [postId, userId]
    );

    if (existingComment.rows.length > 0) {
      return res.status(400).json({ error: '您已经提交过解答' });
    }

    // 提交解答（作为评论）
    const commentResult = await (req as any).db.query(
      `INSERT INTO comments (post_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, content]
    );

    // 增加评论数
    await (req as any).db.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [postId]);

    res.json({
      success: true,
      message: '提交解答成功',
      comment: commentResult.rows[0]
    });
  } catch (error) {
    console.error('提交悬赏解答失败:', error);
    res.status(500).json({ error: '提交悬赏解答失败' });
  }
});

/**
 * 确认悬赏最佳解答
 * POST /api/v1/transactions/bounty-confirm
 * Body: { userId: number, postId: number, winnerId: number }
 */
router.post('/bounty-confirm', async (req, res) => {
  const { userId, postId, winnerId } = req.body;

  if (!userId || !postId || !winnerId) {
    return res.status(400).json({ error: '用户ID、帖子ID和解答者ID不能为空' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 查询帖子信息
    const postResult = await (req as any).db.query(
      'SELECT * FROM posts WHERE id = $1 AND type = $2',
      [postId, 'qa_bounty']
    );

    if (postResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '悬赏帖子不存在' });
    }

    const post = postResult.rows[0];

    // 检查是否是作者
    if (post.author_id !== userId) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '只有悬赏发布者才能确认最佳解答' });
    }

    // 检查是否已确认
    if (post.bounty_winner_id) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '已经确认过最佳解答' });
    }

    // 计算平台手续费（1%）
    const platformFee = post.bounty_price * 0.01;
    const netAmount = post.bounty_price - platformFee;

    // 检查作者余额
    const authorResult = await (req as any).db.query(
      'SELECT balance FROM users WHERE id = $1',
      [post.author_id]
    );

    if (authorResult.rows[0].balance < post.bounty_price) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '余额不足，请充值' });
    }

    // 扣除作者余额
    await (req as any).db.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [post.bounty_price, post.author_id]
    );

    // 增加解答者余额
    await (req as any).db.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [netAmount, winnerId]
    );

    // 创建交易记录
    await (req as any).db.query(
      `INSERT INTO transactions (user_id, target_user_id, type, post_id, amount, platform_fee, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [post.author_id, winnerId, 'bounty_payment', postId, post.bounty_price, platformFee, 'completed']
    );

    // 更新帖子状态
    await (req as any).db.query(
      'UPDATE posts SET bounty_winner_id = $1, status = $2 WHERE id = $3',
      [winnerId, 'resolved', postId]
    );

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '确认最佳解答成功',
      amount: post.bounty_price
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('确认最佳解答失败:', error);
    res.status(500).json({ error: '确认最佳解答失败' });
  }
});

/**
 * 获取用户交易记录
 * GET /api/v1/transactions
 * Query: { userId: number, type?: string, page?: number, pageSize?: number }
 */
router.get('/', async (req, res) => {
  const { userId, type, page = 1, pageSize = 20 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '用户ID不能为空' });
  }

  try {
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const conditions: string[] = ['t.user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      conditions.push(`t.type = $${paramIndex++}`);
      values.push(type);
    }

    const whereClause = conditions.join(' AND ');

    // 查询交易列表
    const transactionsQuery = `
      SELECT
        t.*,
        p.title,
        p.type as post_type,
        u1.username as user_username,
        u2.username as target_user_username
      FROM transactions t
      LEFT JOIN posts p ON t.post_id = p.id
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.target_user_id = u2.id
      WHERE ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    const result = await (req as any).db.query(transactionsQuery, values);

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `;

    const countResult = await (req as any).db.query(countQuery, values.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page: Number(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ error: '获取交易记录失败' });
  }
});

export default router;

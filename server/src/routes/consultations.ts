import express from 'express';

const router = express.Router();

// 平台服务费比例 (3%)
const PLATFORM_FEE_RATE = 0.03;

/**
 * 创建咨询
 * POST /api/v1/consultations
 * Body: { userId: number, consultantId: number, type: 'hourly' | 'per_question', price: number, description?: string }
 */
router.post('/', async (req, res) => {
  const { userId, consultantId, type, price, description } = req.body;

  if (!userId || !consultantId || !type || !price) {
    return res.status(400).json({ error: '参数不完整' });
  }

  if (type !== 'hourly' && type !== 'per_question') {
    return res.status(400).json({ error: '计费类型无效' });
  }

  if (price < 10 || price > 1000) {
    return res.status(400).json({ error: '价格必须在 10-1000 元之间' });
  }

  if (type === 'per_question' && !description) {
    return res.status(400).json({ error: '按问题计费需要描述问题' });
  }

  try {
    // 检查顾问是否存在
    const consultantResult = await (req as any).db.query(
      'SELECT id, username, avatar_url, is_merchant FROM users WHERE id = $1',
      [consultantId]
    );

    if (consultantResult.rows.length === 0) {
      return res.status(404).json({ error: '顾问不存在' });
    }

    // 检查用户是否是顾问本人
    if (userId === consultantId) {
      return res.status(400).json({ error: '不能向自己创建咨询' });
    }

    // 创建咨询记录
    const result = await (req as any).db.query(
      `INSERT INTO consultations (user_id, consultant_id, type, price, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, consultantId, type, price, description || null]
    );

    const consultation = result.rows[0];

    res.json({
      success: true,
      consultation: {
        ...consultation,
        consultant: consultantResult.rows[0],
      },
    });
  } catch (error) {
    console.error('创建咨询失败:', error);
    res.status(500).json({ error: '创建咨询失败' });
  }
});

/**
 * 获取咨询列表
 * GET /api/v1/consultations
 * Query: { userId?: number, consultantId?: number, status?: string, page?: number, pageSize?: number }
 */
router.get('/', async (req, res) => {
  const { userId, consultantId, status, page = 1, pageSize = 20 } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`c.user_id = $${paramIndex++}`);
      values.push(userId);
    }

    if (consultantId) {
      conditions.push(`c.consultant_id = $${paramIndex++}`);
      values.push(consultantId);
    }

    if (status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询咨询列表
    const listQuery = `
      SELECT
        c.*,
        u.id as user_id_join,
        u.username as user_username,
        u.avatar_url as user_avatar,
        consultant.id as consultant_id_join,
        consultant.username as consultant_username,
        consultant.avatar_url as consultant_avatar,
        consultant.is_merchant as consultant_verified
      FROM consultations c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users consultant ON c.consultant_id = consultant.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    const result = await (req as any).db.query(listQuery, values);

    // 格式化结果
    const consultations = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      price: row.price,
      status: row.status,
      description: row.description,
      platformFee: row.platform_fee,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      consultant: {
        id: row.consultant_id_join,
        username: row.consultant_username,
        avatar: row.consultant_avatar,
        verified: row.consultant_verified,
      },
    }));

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM consultations c
      ${whereClause}
    `;

    const countResult = await (req as any).db.query(countQuery, values.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      consultations,
      pagination: {
        page: Number(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取咨询列表失败:', error);
    res.status(500).json({ error: '获取咨询列表失败' });
  }
});

/**
 * 支付咨询
 * POST /api/v1/consultations/:id/pay
 * Body: { userId: number, paymentMethod: 'wechat' | 'alipay' | 'balance' }
 */
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { userId, paymentMethod } = req.body;

  if (!userId || !paymentMethod) {
    return res.status(400).json({ error: '参数不完整' });
  }

  if (!['wechat', 'alipay', 'balance'].includes(paymentMethod)) {
    return res.status(400).json({ error: '支付方式无效' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 查询咨询信息
    const consultationResult = await (req as any).db.query(
      'SELECT * FROM consultations WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (consultationResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '咨询不存在' });
    }

    const consultation = consultationResult.rows[0];

    // 检查状态
    if (consultation.status !== 'pending') {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '咨询状态不正确' });
    }

    // 检查是否是用户本人
    if (consultation.user_id !== userId) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '只有咨询创建者才能支付' });
    }

    // 如果是余额支付，检查余额
    if (paymentMethod === 'balance') {
      const userResult = await (req as any).db.query(
        'SELECT balance FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows[0].balance < consultation.price) {
        await (req as any).db.query('ROLLBACK');
        return res.status(400).json({ error: '余额不足' });
      }

      // 扣除用户余额
      await (req as any).db.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [consultation.price, userId]
      );
    }

    // 更新咨询状态为已支付
    await (req as any).db.query(
      'UPDATE consultations SET status = $1, payment_method = $2, paid_at = NOW() WHERE id = $3',
      ['paid', paymentMethod, id]
    );

    // 创建支付交易记录（用户支付，不涉及服务费）
    await (req as any).db.query(
      `INSERT INTO transactions (user_id, target_user_id, type, amount, status, description)
       VALUES ($1, $2, 'consultation_payment', $3, 'completed', $4)`,
      [userId, consultation.consultant_id, consultation.price, '咨询支付']
    );

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '支付成功',
      amount: consultation.price,
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('支付咨询失败:', error);
    res.status(500).json({ error: '支付咨询失败' });
  }
});

/**
 * 完成咨询/结单
 * POST /api/v1/consultations/:id/complete
 * Body: { userId: number }
 * 
 * 业务逻辑：
 * 1. 用户确认完成咨询
 * 2. 平台自动扣除服务费（3%）
 * 3. 剩余金额到商家账户
 * 4. 服务费记录在交易流水中
 */
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 查询咨询信息
    const consultationResult = await (req as any).db.query(
      'SELECT * FROM consultations WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (consultationResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '咨询不存在' });
    }

    const consultation = consultationResult.rows[0];

    // 检查状态
    if (consultation.status !== 'paid' && consultation.status !== 'in_progress') {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '咨询状态不正确' });
    }

    // 检查是否是用户本人
    if (consultation.user_id !== userId) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '只有咨询创建者才能完成咨询' });
    }

    // 计算平台服务费和商家收入
    const platformFee = Number((consultation.price * PLATFORM_FEE_RATE).toFixed(2));
    const consultantIncome = Number((consultation.price - platformFee).toFixed(2));

    // 增加顾问余额（扣除服务费后的金额）
    await (req as any).db.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [consultantIncome, consultation.consultant_id]
    );

    // 更新咨询状态为已完成
    await (req as any).db.query(
      'UPDATE consultations SET status = $1, completed_at = NOW(), platform_fee = $2 WHERE id = $3',
      ['completed', platformFee, id]
    );

    // 创建收入交易记录（商家收入，包含服务费信息）
    await (req as any).db.query(
      `INSERT INTO transactions (user_id, target_user_id, type, amount, platform_fee, status, description)
       VALUES ($1, $2, 'consultation_income', $3, $4, 'completed', $5)`,
      [consultation.consultant_id, userId, consultantIncome, platformFee, '咨询收入']
    );

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '咨询已完成',
      data: {
        price: consultation.price,
        platformFee,
        consultantIncome,
      },
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('完成咨询失败:', error);
    res.status(500).json({ error: '完成咨询失败' });
  }
});

/**
 * 申请退款
 * POST /api/v1/consultations/:id/refund
 * Body: { userId: number, reason?: string }
 */
router.post('/:id/refund', async (req, res) => {
  const { id } = req.params;
  const { userId, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: '参数不完整' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 查询咨询信息
    const consultationResult = await (req as any).db.query(
      'SELECT * FROM consultations WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (consultationResult.rows.length === 0) {
      await (req as any).db.query('ROLLBACK');
      return res.status(404).json({ error: '咨询不存在' });
    }

    const consultation = consultationResult.rows[0];

    // 检查状态
    if (consultation.status !== 'paid' && consultation.status !== 'in_progress') {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '咨询状态不正确，无法退款' });
    }

    // 检查是否是用户本人
    if (consultation.user_id !== userId) {
      await (req as any).db.query('ROLLBACK');
      return res.status(400).json({ error: '只有咨询创建者才能申请退款' });
    }

    // 如果是余额支付，直接退款
    if (consultation.payment_method === 'balance') {
      // 退还用户余额
      await (req as any).db.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [consultation.price, userId]
      );
    }

    // 更新咨询状态为已退款
    await (req as any).db.query(
      'UPDATE consultations SET status = $1, refunded_at = NOW(), refund_reason = $2 WHERE id = $3',
      ['refunded', reason || null, id]
    );

    // 创建退款交易记录
    await (req as any).db.query(
      `INSERT INTO transactions (user_id, target_user_id, type, amount, status, description)
       VALUES ($1, $2, 'consultation_refund', $3, 'completed', $4)`,
      [userId, consultation.consultant_id, consultation.price, '咨询退款']
    );

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '退款成功',
      amount: consultation.price,
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('退款失败:', error);
    res.status(500).json({ error: '退款失败' });
  }
});

export default router;

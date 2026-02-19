import express from 'express';
const router = express.Router();

// 买家确认收货 → 自动分账（平台3%）
router.post('/order/confirm', async (req: any, res) => {
  try {
    const { orderId } = req.body;
    const db = req.db;

    // 查询订单
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await db.query(orderQuery, [orderId]);
    if (orderResult.rows.length === 0 || orderResult.rows[0].status !== 1) {
      return res.json({ code: -1, msg: '订单状态错误' });
    }
    const order = orderResult.rows[0];

    // 抽佣计算：平台3%，创作者97%
    const platformFee = Number(order.price) * 0.03;
    const creatorIncome = Number(order.price) * 0.97;

    // 开启事务
    await db.query('BEGIN');

    try {
      // 给创作者加余额
      await db.query(`
        UPDATE wallet
        SET balance = balance + $1, total_income = total_income + $1
        WHERE user_id = $2
      `, [creatorIncome, order.creator_id]);

      // 更新订单状态
      await db.query(`
        UPDATE orders
        SET status = 2, platform_fee = $1, creator_income = $2, complete_time = NOW()
        WHERE id = $3
      `, [platformFee, creatorIncome, orderId]);

      await db.query('COMMIT');

      res.json({
        code: 0,
        msg: '确认成功，创作者已收到收益',
        data: { platformFee, creatorIncome }
      });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('分账失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

// 获取订单列表
router.get('/order/list', async (req: any, res) => {
  try {
    const { page = 1, size = 20, status, userId } = req.query;
    const db = req.db;
    const offset = (Number(page) - 1) * Number(size);

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    query += ` ORDER BY create_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(size), offset);

    const listResult = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;
    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    if (userId) {
      countQuery += ` AND user_id = $${countParamIndex}`;
      countParams.push(userId);
      countParamIndex++;
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      code: 0,
      data: {
        list: listResult.rows,
        total: Number(countResult.rows[0].total),
        page: Number(page),
        size: Number(size)
      }
    });
  } catch (error) {
    console.error('获取订单列表失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

export default router;

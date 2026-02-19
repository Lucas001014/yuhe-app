import express from 'express';
const router = express.Router();

// 用户申请退款
router.post('/refund/apply', async (req: any, res) => {
  try {
    const { orderId, reason, refundRate = 1.0 } = req.body;
    const db = req.db;

    // 查询订单
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await db.query(orderQuery, [orderId]);
    if (orderResult.rows.length === 0 || orderResult.rows[0].status !== 1) {
      return res.json({ code: -1, msg: '仅托管中订单可申请退款' });
    }
    const order = orderResult.rows[0];

    // 计算退款金额
    const refundFee = Number(order.price) * Number(refundRate);

    // 创建退款申请
    const insertQuery = `
      INSERT INTO refunds (order_id, user_id, creator_id, reason, refund_fee, status)
      VALUES ($1, $2, $3, $4, $5, 0)
      RETURNING *
    `;
    await db.query(insertQuery, [orderId, order.user_id, order.creator_id, reason, refundFee]);

    res.json({ code: 0, msg: '退款申请已提交，平台审核中' });
  } catch (error) {
    console.error('退款申请失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

// 平台审核退款
router.post('/refund/audit', async (req: any, res) => {
  try {
    const { refundId, status } = req.body;
    const db = req.db;

    // 查询退款申请和订单
    const refundQuery = 'SELECT * FROM refunds WHERE id = $1';
    const refundResult = await db.query(refundQuery, [refundId]);
    if (refundResult.rows.length === 0) {
      return res.json({ code: -1, msg: '退款申请不存在' });
    }
    const refund = refundResult.rows[0];

    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await db.query(orderQuery, [refund.order_id]);
    const order = orderResult.rows[0];

    // 开启事务
    await db.query('BEGIN');

    try {
      if (status === 1) {
        // 同意退款：给买家加余额，更新订单状态为已退款
        await db.query(`
          UPDATE wallet
          SET balance = balance + $1
          WHERE user_id = $2
        `, [refund.refund_fee, refund.user_id]);

        await db.query(`
          UPDATE orders
          SET status = 3
          WHERE id = $1
        `, [order.id]);
      }

      // 更新退款单状态
      await db.query(`
        UPDATE refunds
        SET status = $1, audit_time = NOW()
        WHERE id = $2
      `, [status, refundId]);

      await db.query('COMMIT');

      res.json({ code: 0, msg: status === 1 ? '退款成功' : '退款已拒绝' });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('退款审核失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

export default router;

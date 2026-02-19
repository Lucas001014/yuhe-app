import express from 'express';
import { getDB } from '../utils/db';

const router = express.Router();

// 用户申请退款
router.post('/apply', async (req, res) => {
  try {
    const { orderId, reason, refundRate } = req.body;
    const db = getDB(req);

    const order = await db.find('orders', { id: orderId });
    if (!order) {
      return res.status(404).json({ code: -1, msg: '订单不存在' });
    }
    if (order.status !== 1) {
      return res.status(400).json({ code: -1, msg: '仅托管中订单可申请退款' });
    }

    // 计算退款金额
    const refundFee = Number(order.price) * (refundRate || 1);

    // 检查是否已有退款申请
    const existRefund = await db.find('refunds', { order_id: orderId, status: 0 });
    if (existRefund) {
      return res.status(400).json({ code: -1, msg: '退款申请已存在，请等待审核' });
    }

    const refund = await db.insert('refunds', {
      order_id: orderId,
      user_id: order.user_id,
      creator_id: order.creator_id,
      reason,
      refund_fee: refundFee,
      status: 0, // 待审核
    });

    res.json({ code: 0, msg: '退款申请已提交，平台审核中', data: refund });
  } catch (error: any) {
    console.error('退款申请失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 平台审核退款
router.post('/audit', async (req, res) => {
  try {
    const { refundId, status } = req.body;
    const db = getDB(req);

    const refund = await db.find('refunds', { id: refundId });
    if (!refund) {
      return res.status(404).json({ code: -1, msg: '退款单不存在' });
    }
    if (refund.status !== 0) {
      return res.status(400).json({ code: -1, msg: '退款单已审核' });
    }

    const order = await db.find('orders', { id: refund.order_id });

    if (status === 1) {
      // 同意退款：给买家加余额
      const wallet = await db.find('wallet', { user_id: refund.user_id });
      if (wallet) {
        await db.increment('wallet', { user_id: refund.user_id }, 'balance', Number(refund.refund_fee));
      }
      // 更新订单状态
      await db.update('orders', { id: order.id }, { status: 3 }); // 已退款
    }

    // 更新退款单状态
    await db.update('refunds', { id: refundId }, {
      status,
      audit_time: new Date(),
    });

    res.json({ code: 0, msg: status === 1 ? '退款成功' : '退款已拒绝' });
  } catch (error: any) {
    console.error('审核退款失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 获取我的退款记录
router.get('/my', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ code: -1, msg: 'userId参数错误' });
    }

    const db = getDB(req);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const result = await db.paginate('refunds', { user_id: userId }, {
      page,
      size,
      orderBy: 'create_time',
      order: 'DESC',
    });

    // 关联订单信息
    const list = await Promise.all(
      result.list.map(async (refund: any) => {
        const order = await db.find('orders', { id: refund.order_id });
        return { ...refund, order };
      })
    );

    res.json({ code: 0, data: { ...result, list } });
  } catch (error: any) {
    console.error('获取退款记录失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

export default router;

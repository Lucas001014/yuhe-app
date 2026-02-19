import express from 'express';
import { getDB } from '../utils/db';

const router = express.Router();

// 创建订单（支付成功后调用）
router.post('/create', async (req, res) => {
  try {
    const { userId, postId, transactionId } = req.body;
    const db = getDB(req);

    // 获取帖子信息
    const post = await db.find('posts', { id: postId });
    if (!post) {
      return res.status(404).json({ code: -1, msg: '帖子不存在' });
    }
    if (post.status !== 1) {
      return res.status(400).json({ code: -1, msg: '帖子未审核通过' });
    }

    // 防重复订单
    const existOrder = await db.find('orders', { transaction_id: transactionId });
    if (existOrder) {
      return res.json({ code: 0, msg: '订单已处理', data: existOrder });
    }

    // 创建订单
    const orderNo = 'O' + Date.now() + Math.floor(Math.random() * 1000);
    const order = await db.insert('orders', {
      order_no: orderNo,
      user_id: userId,
      post_id: postId,
      creator_id: post.user_id,
      price: post.price,
      transaction_id: transactionId,
      status: 1, // 已支付（托管）
    });

    res.json({ code: 0, msg: '购买成功，已解锁下载', data: order });
  } catch (error: any) {
    console.error('订单创建失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 买家确认收货 → 自动分账（平台3%）
router.post('/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;
    const db = getDB(req);

    const order = await db.find('orders', { id: orderId });
    if (!order) {
      return res.status(404).json({ code: -1, msg: '订单不存在' });
    }
    if (order.status !== 1) {
      return res.status(400).json({ code: -1, msg: '订单状态错误' });
    }

    // 抽佣计算：平台3%，创作者97%
    const platformFee = Number(order.price) * 0.03;
    const creatorIncome = Number(order.price) * 0.97;

    // 给创作者加余额
    await db.increment('wallet', { user_id: order.creator_id }, 'balance', creatorIncome);
    await db.increment('wallet', { user_id: order.creator_id }, 'total_income', creatorIncome);

    // 更新订单状态
    await db.update('orders', { id: orderId }, {
      status: 2,
      platform_fee: platformFee,
      creator_income: creatorIncome,
      complete_time: new Date(),
    });

    res.json({
      code: 0,
      msg: '确认成功，创作者已收到收益',
      data: { platformFee, creatorIncome },
    });
  } catch (error: any) {
    console.error('分账失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 获取我的订单列表
router.get('/my', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ code: -1, msg: 'userId参数错误' });
    }

    const db = getDB(req);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const result = await db.paginate('orders', { user_id: userId }, {
      page,
      size,
      orderBy: 'create_time',
      order: 'DESC',
    });

    // 关联帖子信息
    const list = await Promise.all(
      result.list.map(async (order: any) => {
        const post = await db.find('posts', { id: order.post_id });
        return { ...order, post };
      })
    );

    res.json({ code: 0, data: { ...result, list } });
  } catch (error: any) {
    console.error('获取订单列表失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const db = getDB(req);

    const order = await db.find('orders', { id: orderId });
    if (!order) {
      return res.status(404).json({ code: -1, msg: '订单不存在' });
    }

    // 关联帖子信息
    const post = await db.find('posts', { id: order.post_id });

    res.json({ code: 0, data: { ...order, post } });
  } catch (error: any) {
    console.error('获取订单详情失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

export default router;

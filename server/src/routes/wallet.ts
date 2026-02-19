import express from 'express';
import { getDB } from '../utils/db';

const router = express.Router();

// 获取钱包信息
router.get('/info', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ code: -1, msg: 'userId参数错误' });
    }

    const db = getDB(req);
    let wallet = await db.find('wallet', { user_id: userId });

    // 如果钱包不存在则创建
    if (!wallet) {
      wallet = await db.insert('wallet', {
        user_id: userId,
        balance: 0,
        freeze_balance: 0,
        total_income: 0,
        total_withdraw: 0,
      });
    }

    res.json({ code: 0, data: wallet });
  } catch (error: any) {
    console.error('获取钱包信息失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 获取钱包流水（这里简化实现，实际需要创建transaction表）
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ code: -1, msg: 'userId参数错误' });
    }

    const db = getDB(req);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    // 获取订单列表作为收入记录
    const orders = await db.paginate('orders', { creator_id: userId }, {
      page,
      size,
      orderBy: 'create_time',
      order: 'DESC',
    });

    // 获取提现记录
    const withdraws = await db.paginate('withdraw', { user_id: userId }, {
      page,
      size,
      orderBy: 'create_time',
      order: 'DESC',
    });

    // 合并并排序
    const transactions = [
      ...orders.list.map((o: any) => ({
        type: 'income',
        amount: o.creator_income || o.price,
        description: '订单收入',
        createTime: o.create_time,
      })),
      ...withdraws.list.map((w: any) => ({
        type: 'withdraw',
        amount: -w.amount,
        description: '提现',
        createTime: w.create_time,
      })),
    ].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

    res.json({
      code: 0,
      data: {
        list: transactions.slice(0, size),
        total: transactions.length,
        page,
        size,
      },
    });
  } catch (error: any) {
    console.error('获取钱包流水失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

export default router;

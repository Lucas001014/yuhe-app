import express from 'express';
import { getDB } from '../utils/db';

const router = express.Router();

// 用户申请提现
router.post('/apply', async (req, res) => {
  try {
    const { userId, amount, bankName, bankNo, bankUser } = req.body;
    const db = getDB(req);

    // 余额校验
    const wallet = await db.find('wallet', { user_id: userId });
    if (!wallet) {
      return res.status(404).json({ code: -1, msg: '钱包不存在' });
    }
    if (Number(wallet.balance) < amount || amount <= 0) {
      return res.status(400).json({ code: -1, msg: '提现金额无效' });
    }

    // 冻结金额
    await db.decrement('wallet', { user_id: userId }, 'balance', amount);
    await db.increment('wallet', { user_id: userId }, 'freeze_balance', amount);

    // 创建提现单
    const withdrawNo = 'W' + Date.now() + Math.floor(Math.random() * 1000);
    const withdraw = await db.insert('withdraw', {
      withdraw_no: withdrawNo,
      user_id: userId,
      amount,
      bank_name: bankName,
      bank_no: bankNo,
      bank_user: bankUser,
      status: 0, // 待审核
    });

    res.json({ code: 0, msg: '提现申请已提交，等待审核打款', data: withdraw });
  } catch (error: any) {
    console.error('提现申请失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 后台审核提现
router.post('/audit', async (req, res) => {
  try {
    const { withdrawId, status, auditUserId } = req.body;
    const db = getDB(req);

    const withdraw = await db.find('withdraw', { id: withdrawId });
    if (!withdraw) {
      return res.status(404).json({ code: -1, msg: '提现单不存在' });
    }
    if (withdraw.status !== 0) {
      return res.status(400).json({ code: -1, msg: '提现单已审核' });
    }

    if (status === 1) {
      // 同意提现：扣除冻结金额
      await db.decrement('wallet', { user_id: withdraw.user_id }, 'freeze_balance', Number(withdraw.amount));
      await db.increment('wallet', { user_id: withdraw.user_id }, 'total_withdraw', Number(withdraw.amount));
    } else {
      // 拒绝提现：解冻金额
      await db.increment('wallet', { user_id: withdraw.user_id }, 'balance', Number(withdraw.amount));
      await db.decrement('wallet', { user_id: withdraw.user_id }, 'freeze_balance', Number(withdraw.amount));
    }

    // 更新提现单
    await db.update('withdraw', { id: withdrawId }, {
      status,
      audit_user_id: auditUserId,
      audit_time: new Date(),
    });

    res.json({
      code: 0,
      msg: status === 1 ? '已同意提现（请手动打款）' : '已拒绝提现',
    });
  } catch (error: any) {
    console.error('审核提现失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 获取提现记录
router.get('/list', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ code: -1, msg: 'userId参数错误' });
    }

    const db = getDB(req);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const result = await db.paginate('withdraw', { user_id: userId }, {
      page,
      size,
      orderBy: 'create_time',
      order: 'DESC',
    });

    res.json({ code: 0, data: result });
  } catch (error: any) {
    console.error('获取提现记录失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

export default router;

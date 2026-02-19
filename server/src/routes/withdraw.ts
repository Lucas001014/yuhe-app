import express from 'express';
const router = express.Router();

// 用户申请提现
router.post('/withdraw/apply', async (req: any, res) => {
  try {
    const { userId, amount, bankName, bankNo, bankUser } = req.body;
    const db = req.db;

    // 查询钱包
    const walletQuery = 'SELECT * FROM wallet WHERE user_id = $1';
    const walletResult = await db.query(walletQuery, [userId]);
    if (walletResult.rows.length === 0) {
      return res.json({ code: -1, msg: '钱包不存在' });
    }
    const wallet = walletResult.rows[0];

    // 余额校验
    if (Number(wallet.balance) < Number(amount) || Number(amount) <= 0) {
      return res.json({ code: -1, msg: '提现金额无效' });
    }

    // 开启事务
    await db.query('BEGIN');

    try {
      // 冻结金额
      await db.query(`
        UPDATE wallet
        SET balance = balance - $1, freeze_balance = freeze_balance + $1
        WHERE user_id = $2
      `, [amount, userId]);

      // 创建提现单
      const withdrawNo = 'W' + Date.now();
      const insertQuery = `
        INSERT INTO withdraw (withdraw_no, user_id, amount, bank_name, bank_no, bank_user, status)
        VALUES ($1, $2, $3, $4, $5, $6, 0)
        RETURNING *
      `;
      await db.query(insertQuery, [withdrawNo, userId, amount, bankName, bankNo, bankUser]);

      await db.query('COMMIT');

      res.json({ code: 0, msg: '提现申请已提交，等待审核打款' });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('提现申请失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

// 后台审核提现
router.post('/withdraw/audit', async (req: any, res) => {
  try {
    const { withdrawId, status, auditUserId } = req.body;
    const db = req.db;

    // 查询提现单
    const withdrawQuery = 'SELECT * FROM withdraw WHERE id = $1';
    const withdrawResult = await db.query(withdrawQuery, [withdrawId]);
    if (withdrawResult.rows.length === 0) {
      return res.json({ code: -1, msg: '提现单不存在' });
    }
    const withdraw = withdrawResult.rows[0];

    // 开启事务
    await db.query('BEGIN');

    try {
      if (status === 1) {
        // 同意提现：扣除冻结金额
        await db.query(`
          UPDATE wallet
          SET freeze_balance = freeze_balance - $1, total_withdraw = total_withdraw + $1
          WHERE user_id = $2
        `, [withdraw.amount, withdraw.user_id]);
      } else {
        // 拒绝提现：解冻金额
        await db.query(`
          UPDATE wallet
          SET balance = balance + $1, freeze_balance = freeze_balance - $1
          WHERE user_id = $2
        `, [withdraw.amount, withdraw.user_id]);
      }

      // 更新提现单
      await db.query(`
        UPDATE withdraw
        SET status = $1, audit_user_id = $2, audit_time = NOW()
        WHERE id = $3
      `, [status, auditUserId, withdrawId]);

      await db.query('COMMIT');

      res.json({ code: 0, msg: status === 1 ? '已同意提现（请手动打款）' : '已拒绝提现' });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('提现审核失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

// 获取提现记录
router.get('/withdraw/list', async (req: any, res) => {
  try {
    const { userId } = req.query;
    const db = req.db;

    const query = `
      SELECT * FROM withdraw
      WHERE user_id = $1
      ORDER BY create_time DESC
    `;
    const result = await db.query(query, [userId]);

    res.json({ code: 0, data: { list: result.rows } });
  } catch (error) {
    console.error('获取提现记录失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

// 获取钱包信息
router.get('/wallet/info', async (req: any, res) => {
  try {
    const { userId } = req.query;
    const db = req.db;

    const query = 'SELECT * FROM wallet WHERE user_id = $1';
    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({ code: -1, msg: '钱包不存在' });
    }

    res.json({ code: 0, data: result.rows[0] });
  } catch (error) {
    console.error('获取钱包信息失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

export default router;

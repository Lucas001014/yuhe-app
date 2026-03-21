import express from 'express';

const router = express.Router();

// 入驻费金额
const SETTLEMENT_FEE = 1000;

/**
 * 申请身份认证
 * POST /api/v1/certification/apply
 * Body: { userId: number, realName: string, idCard: string, idCardFront: string, idCardBack: string, businessLicense?: string, type: 'individual' | 'enterprise' }
 */
router.post('/apply', async (req, res) => {
  try {
    const { userId, realName, idCard, idCardFront, idCardBack, businessLicense, type = 'individual' } = req.body;

    if (!userId || !realName || !idCard || !idCardFront || !idCardBack) {
      return res.status(400).json({ success: false, error: '请填写完整的认证信息' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    // 检查是否已申请过
    const existingResult = await db.query(
      'SELECT * FROM certifications WHERE user_id = $1',
      [userId]
    );

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === 'approved') {
        return res.status(400).json({ success: false, error: '您已完成身份认证' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, error: '您的认证申请正在审核中，请耐心等待' });
      }
      // 如果是已拒绝，允许重新申请
      await db.query(
        `UPDATE certifications SET real_name = $1, id_card = $2, id_card_front = $3, id_card_back = $4, business_license = $5, type = $6, status = 'pending', reject_reason = NULL, updated_at = NOW() WHERE user_id = $7`,
        [realName, idCard, idCardFront, idCardBack, businessLicense || null, type, userId]
      );
      return res.json({ success: true, message: '认证申请已重新提交，请等待审核' });
    }

    // 创建认证申请
    await db.query(
      `INSERT INTO certifications (user_id, real_name, id_card, id_card_front, id_card_back, business_license, type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [userId, realName, idCard, idCardFront, idCardBack, businessLicense || null, type]
    );

    res.json({ success: true, message: '认证申请已提交，请等待审核' });
  } catch (error: any) {
    console.error('申请认证失败:', error);
    res.status(500).json({ success: false, error: error.message || '申请失败' });
  }
});

/**
 * 获取用户认证状态
 * GET /api/v1/certification/status?userId=xxx
 */
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const result = await db.query(
      'SELECT * FROM certifications WHERE user_id = $1',
      [userId]
    );

    // 获取用户入驻费支付状态
    const userResult = await db.query(
      'SELECT is_merchant, merchant_paid FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0] || {};

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        certification: {
          status: 'none',
          message: '未申请认证',
        },
        merchant: {
          isMerchant: user.is_merchant || false,
          hasPaidSettlement: user.merchant_paid || false,
          settlementFee: SETTLEMENT_FEE,
        },
      });
    }

    const cert = result.rows[0];
    res.json({
      success: true,
      certification: {
        id: cert.id,
        status: cert.status,
        realName: cert.real_name,
        type: cert.type,
        rejectReason: cert.reject_reason,
        createdAt: cert.created_at,
        updatedAt: cert.updated_at,
      },
      merchant: {
        isMerchant: user.is_merchant || false,
        hasPaidSettlement: user.merchant_paid || false,
        settlementFee: SETTLEMENT_FEE,
      },
    });
  } catch (error: any) {
    console.error('获取认证状态失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 支付入驻费
 * POST /api/v1/certification/pay-settlement
 * Body: { userId: number, paymentMethod: 'balance' | 'wechat' | 'alipay' }
 */
router.post('/pay-settlement', async (req, res) => {
  try {
    const { userId, paymentMethod = 'balance' } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    // 检查认证状态
    const certResult = await db.query(
      "SELECT * FROM certifications WHERE user_id = $1 AND status = 'approved'",
      [userId]
    );

    if (certResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: '请先完成身份认证' });
    }

    // 检查是否已支付
    const userResult = await db.query(
      'SELECT merchant_paid, balance FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows[0]?.merchant_paid) {
      return res.status(400).json({ success: false, error: '您已支付入驻费' });
    }

    // 如果是余额支付
    if (paymentMethod === 'balance') {
      const balance = parseFloat(userResult.rows[0]?.balance || 0);
      if (balance < SETTLEMENT_FEE) {
        return res.status(400).json({ success: false, error: `余额不足，当前余额 ¥${balance}，需要 ¥${SETTLEMENT_FEE}` });
      }

      // 扣除余额
      await db.query(
        'UPDATE users SET balance = balance - $1, is_merchant = true, merchant_paid = true WHERE id = $2',
        [SETTLEMENT_FEE, userId]
      );
    } else {
      // 其他支付方式（这里简化处理，实际需要对接支付）
      await db.query(
        'UPDATE users SET is_merchant = true, merchant_paid = true WHERE id = $1',
        [userId]
      );
    }

    // 记录交易
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, status, description)
       VALUES ($1, 'settlement_fee', $2, 'completed', '入驻费支付')`,
      [userId, SETTLEMENT_FEE]
    );

    res.json({
      success: true,
      message: '入驻费支付成功，您现在可以发布知识库和产品内容',
    });
  } catch (error: any) {
    console.error('支付入驻费失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 检查发布权限
 * GET /api/v1/certification/check-publish-permission?userId=xxx&type=xxx
 */
router.get('/check-publish-permission', async (req, res) => {
  try {
    const { userId, type } = req.query;

    if (!userId || !type) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    // 获取用户认证和入驻状态
    const userResult = await db.query(
      `SELECT u.is_merchant, u.merchant_paid, c.status as cert_status 
       FROM users u 
       LEFT JOIN certifications c ON u.id = c.user_id 
       WHERE u.id = $1`,
      [userId]
    );

    const user = userResult.rows[0] || {};

    let canPublish = true;
    const requirements: string[] = [];
    const missingRequirements: string[] = [];

    // 检查发布权限
    if (type === 'qa_paid' || type === 'product') {
      // 知识库和产品：需要身份认证 + 入驻费
      if (user.cert_status !== 'approved') {
        canPublish = false;
        missingRequirements.push('identity_cert');
        requirements.push('身份认证');
      }
      if (!user.merchant_paid) {
        canPublish = false;
        missingRequirements.push('settlement_fee');
        requirements.push('入驻费');
      }
    } else if (type === 'qa_bounty') {
      // 悬赏：需要身份认证
      if (user.cert_status !== 'approved') {
        canPublish = false;
        missingRequirements.push('identity_cert');
        requirements.push('身份认证');
      }
    }

    res.json({
      success: true,
      canPublish,
      missingRequirements,
      requirements,
      certification: {
        status: user.cert_status || 'none',
      },
      merchant: {
        hasPaidSettlement: user.merchant_paid || false,
        settlementFee: SETTLEMENT_FEE,
      },
    });
  } catch (error: any) {
    console.error('检查发布权限失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取认证申请列表（管理员）
 * GET /api/v1/certification/admin/list?status=pending&page=1&pageSize=20
 */
router.get('/admin/list', async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let whereClause = '';
    const values: any[] = [];

    if (status && status !== 'all') {
      whereClause = 'WHERE c.status = $1';
      values.push(status);
    }

    const listQuery = `
      SELECT c.*, u.username, u.phone, u.avatar_url
      FROM certifications c
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await db.query(listQuery, values);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM certifications c ${whereClause}
    `;
    const countResult = await db.query(countQuery, values.slice(0, values.length));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      list: result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        phone: row.phone,
        avatar: row.avatar_url,
        realName: row.real_name,
        idCard: row.id_card?.substring(0, 6) + '****' + row.id_card?.substring(14), // 脱敏
        type: row.type,
        status: row.status,
        rejectReason: row.reject_reason,
        idCardFront: row.id_card_front,
        idCardBack: row.id_card_back,
        businessLicense: row.business_license,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      pagination: {
        page: Number(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('获取认证列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 审批认证申请（管理员）
 * POST /api/v1/certification/admin/approve
 * Body: { certificationId: number, action: 'approve' | 'reject', rejectReason?: string }
 */
router.post('/admin/approve', async (req, res) => {
  try {
    const { certificationId, action, rejectReason } = req.body;

    if (!certificationId || !action) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    if (action === 'approve') {
      // 获取用户ID
      const certResult = await db.query('SELECT user_id FROM certifications WHERE id = $1', [certificationId]);
      if (certResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: '认证记录不存在' });
      }
      
      const userId = certResult.rows[0].user_id;

      // 更新认证状态
      await db.query(
        "UPDATE certifications SET status = 'approved', updated_at = NOW() WHERE id = $1",
        [certificationId]
      );

      // 更新用户认证状态
      await db.query(
        'UPDATE users SET identity_verified = true WHERE id = $1',
        [userId]
      );

      res.json({ success: true, message: '认证已通过' });
    } else {
      // 拒绝
      await db.query(
        "UPDATE certifications SET status = 'rejected', reject_reason = $1, updated_at = NOW() WHERE id = $2",
        [rejectReason || '审核不通过', certificationId]
      );

      res.json({ success: true, message: '认证已拒绝' });
    }
  } catch (error: any) {
    console.error('审批认证失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 获取平台统计数据（管理员）
 * GET /api/v1/certification/admin/stats
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    // 待审核认证数
    const pendingCertResult = await db.query(
      "SELECT COUNT(*) as count FROM certifications WHERE status = 'pending'"
    );
    const pendingCerts = parseInt(pendingCertResult.rows[0].count);

    // 总用户数
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // 认证用户数
    const verifiedUsersResult = await db.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM certifications WHERE status = 'approved'"
    );
    const verifiedUsers = parseInt(verifiedUsersResult.rows[0].count);

    // 商家用户数
    const merchantsResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE merchant_paid = true'
    );
    const merchants = parseInt(merchantsResult.rows[0].count);

    // 入驻费总收入
    const settlementIncomeResult = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'settlement_fee' AND status = 'completed'"
    );
    const settlementIncome = parseFloat(settlementIncomeResult.rows[0].total);

    // 总帖子数
    const totalPostsResult = await db.query('SELECT COUNT(*) as count FROM posts');
    const totalPosts = parseInt(totalPostsResult.rows[0].count);

    // 今日新增帖子
    const todayPostsResult = await db.query(
      "SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = CURRENT_DATE"
    );
    const todayPosts = parseInt(todayPostsResult.rows[0].count);

    res.json({
      success: true,
      stats: {
        pendingCerts,
        totalUsers,
        verifiedUsers,
        merchants,
        settlementIncome,
        totalPosts,
        todayPosts,
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

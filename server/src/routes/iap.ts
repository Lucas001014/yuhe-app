import express from 'express';
import axios from 'axios';
const router = express.Router();

// 苹果IAP配置
const APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET || 'YOUR_SHARED_SECRET';
const APPLE_VERIFY_URL = {
  sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
  production: 'https://buy.itunes.apple.com/verifyReceipt'
};

// IAP凭证验证
const verifyIAP = async (receiptData: string) => {
  const verifyParams = {
    'receipt-data': receiptData,
    'password': APPLE_SHARED_SECRET,
    'exclude-old-transactions': true
  };
  // 先试正式环境，失败切沙箱
  try {
    let res = await axios.post(APPLE_VERIFY_URL.production, verifyParams);
    let result = res.data;
    if (result.status === 21007) {
      res = await axios.post(APPLE_VERIFY_URL.sandbox, verifyParams);
      result = res.data;
    }
    return result;
  } catch (error) {
    console.error('IAP验证失败:', error);
    throw error;
  }
};

// 创建托管订单（支付成功后调用）
router.post('/order/create', async (req: any, res) => {
  try {
    const { userId, postId, receiptData, productId } = req.body;
    const db = req.db;

    // 1. 验证IAP凭证
    const iapResult = await verifyIAP(receiptData);
    if (iapResult.status !== 0) {
      return res.json({ code: -1, msg: '支付凭证无效' });
    }
    const transactionId = iapResult.latest_receipt_info[0].transaction_id;

    // 2. 防重复订单
    const existQuery = 'SELECT * FROM orders WHERE transaction_id = $1';
    const existResult = await db.query(existQuery, [transactionId]);
    if (existResult.rows.length > 0) {
      return res.json({ code: 0, msg: '订单已处理' });
    }

    // 3. 获取帖子信息
    const postQuery = 'SELECT * FROM posts WHERE id = $1 AND status = 1';
    const postResult = await db.query(postQuery, [postId]);
    if (postResult.rows.length === 0) {
      return res.json({ code: -1, msg: '帖子不存在或未审核通过' });
    }
    const post = postResult.rows[0];

    // 4. 创建订单
    const orderNo = 'O' + Date.now();
    const insertQuery = `
      INSERT INTO orders (order_no, user_id, post_id, creator_id, price, transaction_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
      RETURNING *
    `;
    await db.query(insertQuery, [orderNo, userId, postId, post.user_id, post.price, transactionId]);

    res.json({ code: 0, msg: '购买成功，已解锁下载', data: { orderNo } });
  } catch (error) {
    console.error('订单创建失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

export default router;

import express from 'express';
import axios from 'axios';
import { getDB } from '../utils/db';

const router = express.Router();

// 苹果IAP配置（实际应用中这些应该从环境变量获取）
const APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET || '';
const APPLE_VERIFY_URL = {
  sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
  production: 'https://buy.itunes.apple.com/verifyReceipt',
};

// IAP凭证验证
const verifyIAP = async (receiptData: string) => {
  if (!APPLE_SHARED_SECRET) {
    // 如果没有配置，模拟验证成功（仅用于开发测试）
    console.warn('未配置APPLE_SHARED_SECRET，使用模拟验证');
    return {
      status: 0,
      latest_receipt_info: [{ transaction_id: 'TEST_' + Date.now() }],
    };
  }

  const verifyParams = {
    'receipt-data': receiptData,
    'password': APPLE_SHARED_SECRET,
    'exclude-old-transactions': true,
  };

  try {
    // 先试正式环境
    let res = await axios.post(APPLE_VERIFY_URL.production, verifyParams);
    let result = res.data;

    // 如果是沙箱环境，切到沙箱URL
    if (result.status === 21007) {
      res = await axios.post(APPLE_VERIFY_URL.sandbox, verifyParams);
      result = res.data;
    }

    return result;
  } catch (error) {
    console.error('IAP验证失败：', error);
    throw new Error('IAP验证失败');
  }
};

// IAP凭证验证接口（用于前端测试）
router.post('/verify', async (req, res) => {
  try {
    const { receiptData } = req.body;
    const result = await verifyIAP(receiptData);
    res.json({ code: 0, data: result });
  } catch (error: any) {
    res.status(500).json({ code: -1, msg: '验证失败', error: error.message });
  }
});

// 创建托管订单（支付成功后调用）
router.post('/order/create', async (req, res) => {
  try {
    const { userId, postId, receiptData, productId } = req.body;
    const db = getDB(req);

    // 1. 验证IAP凭证
    const iapResult = await verifyIAP(receiptData);
    if (iapResult.status !== 0) {
      return res.status(400).json({ code: -1, msg: '支付凭证无效', data: iapResult });
    }

    const transactionId = iapResult.latest_receipt_info?.[0]?.transaction_id;
    if (!transactionId) {
      return res.status(400).json({ code: -1, msg: '无法获取交易ID' });
    }

    // 2. 防重复订单
    const existOrder = await db.find('orders', { transaction_id: transactionId });
    if (existOrder) {
      return res.json({ code: 0, msg: '订单已处理', data: existOrder });
    }

    // 3. 获取帖子信息
    const post = await db.find('posts', { id: postId });
    if (!post || post.status !== 1) {
      return res.status(400).json({ code: -1, msg: '帖子不存在或未审核通过' });
    }

    // 4. 创建订单
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

// 恢复购买（苹果审核必需）
router.post('/restore', async (req, res) => {
  try {
    const { userId, receiptData } = req.body;
    const db = getDB(req);

    // 验证IAP凭证
    const iapResult = await verifyIAP(receiptData);
    if (iapResult.status !== 0) {
      return res.status(400).json({ code: -1, msg: '支付凭证无效' });
    }

    // 获取所有收据信息
    const receipts = iapResult.latest_receipt_info || [];

    // 查找对应的订单
    const restoredOrders = [];
    for (const receipt of receipts) {
      const transactionId = receipt.transaction_id;
      const order = await db.find('orders', { transaction_id: transactionId });
      if (order) {
        restoredOrders.push(order);
      }
    }

    res.json({
      code: 0,
      msg: '恢复购买成功',
      data: { orders: restoredOrders },
    });
  } catch (error: any) {
    console.error('恢复购买失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

export default router;

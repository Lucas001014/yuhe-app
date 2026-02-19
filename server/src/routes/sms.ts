import express from 'express';
const router = express.Router();

// 简单的内存存储（生产环境应使用 Redis）
const smsCodeStore: Map<string, { code: string; expireTime: number }> = new Map();
const smsLimitStore: Map<string, { expireTime: number }> = new Map();

// 清理过期数据
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of smsCodeStore.entries()) {
    if (value.expireTime < now) {
      smsCodeStore.delete(key);
    }
  }
  for (const [key, value] of smsLimitStore.entries()) {
    if (value.expireTime < now) {
      smsLimitStore.delete(key);
    }
  }
}, 60000);

// 发送验证码（模拟发送）
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    // 手机号校验
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.json({ code: -1, msg: '手机号格式错误' });
    }

    // 频率限制（1分钟1次）
    const limitData = smsLimitStore.get(phone);
    if (limitData && limitData.expireTime > Date.now()) {
      return res.json({ code: -1, msg: '验证码发送太频繁' });
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码（5分钟过期）
    smsCodeStore.set(phone, {
      code,
      expireTime: Date.now() + 5 * 60 * 1000
    });

    // 存储频率限制（1分钟）
    smsLimitStore.set(phone, {
      expireTime: Date.now() + 60 * 1000
    });

    console.log(`发送验证码到 ${phone}: ${code}`); // 开发环境打印验证码

    res.json({ code: 0, msg: '验证码发送成功' });
  } catch (error) {
    console.error('发送验证码失败：', error);
    res.json({ code: -1, msg: '验证码发送失败' });
  }
});

// 验证验证码
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const cacheCode = smsCodeStore.get(phone);
    if (!cacheCode || cacheCode.expireTime < Date.now() || cacheCode.code !== code) {
      return res.json({ code: -1, msg: '验证码错误或过期' });
    }

    // 验证成功后删除
    smsCodeStore.delete(phone);

    res.json({ code: 0, msg: '验证通过' });
  } catch (error) {
    console.error('验证码验证失败：', error);
    res.json({ code: -1, msg: '验证失败' });
  }
});

export default router;

import express from 'express';

const router = express.Router();

// 简单的内存存储（生产环境应使用Redis）
const smsCodeStore = new Map<string, { code: string; expireTime: number }>();
const smsLimitStore = new Map<string, { count: number; expireTime: number }>();

// 手机号校验
const validatePhone = (phone: string) => {
  const phoneReg = /^1[3-9]\d{9}$/;
  return phoneReg.test(phone);
};

// 生成6位验证码
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    // 手机号校验
    if (!validatePhone(phone)) {
      return res.status(400).json({ code: -1, msg: '手机号格式错误' });
    }

    const now = Date.now();

    // 频率限制（1分钟1次）
    const limitKey = phone;
    const limit = smsLimitStore.get(limitKey);
    if (limit && now < limit.expireTime) {
      return res.status(429).json({ code: -1, msg: '验证码发送太频繁，请稍后再试' });
    }

    // 生成6位验证码
    const code = generateCode();
    const expireTime = now + 5 * 60 * 1000; // 5分钟后过期

    // 存储验证码
    smsCodeStore.set(phone, { code, expireTime });
    smsLimitStore.set(limitKey, { count: 1, expireTime: now + 60 * 1000 });

    // TODO: 实际调用阿里云短信服务发送验证码
    console.log(`[短信验证码] 手机号: ${phone}, 验证码: ${code}`);

    // 开发环境直接返回验证码（仅用于测试）
    if (process.env.NODE_ENV === 'development') {
      res.json({ code: 0, msg: '验证码发送成功', data: { code } });
    } else {
      res.json({ code: 0, msg: '验证码已发送' });
    }
  } catch (error: any) {
    console.error('发送验证码失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 验证验证码
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const cached = smsCodeStore.get(phone);
    const now = Date.now();

    if (!cached || now > cached.expireTime) {
      return res.status(400).json({ code: -1, msg: '验证码已过期' });
    }

    if (cached.code !== code) {
      return res.status(400).json({ code: -1, msg: '验证码错误' });
    }

    // 验证成功后删除
    smsCodeStore.delete(phone);

    res.json({ code: 0, msg: '验证通过' });
  } catch (error: any) {
    console.error('验证验证码失败：', error);
    res.status(500).json({ code: -1, msg: '服务器错误', error: error.message });
  }
});

// 清理过期数据（定时任务）
setInterval(() => {
  const now = Date.now();

  // 清理过期验证码
  for (const [key, value] of smsCodeStore.entries()) {
    if (now > value.expireTime) {
      smsCodeStore.delete(key);
    }
  }

  // 清理过期限流记录
  for (const [key, value] of smsLimitStore.entries()) {
    if (now > value.expireTime) {
      smsLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // 每5分钟清理一次

export default router;

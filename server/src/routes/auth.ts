import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Dypnsapi20170525, { SendSmsVerifyCodeRequest } from '@alicloud/dypnsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';

// 处理 ES Module 和 CommonJS 兼容性
const DypnsapiClient = (Dypnsapi20170525 as any).default || Dypnsapi20170525;

const router = express.Router();

// 阿里云配置 - 必须通过环境变量配置
const ALIYUN_ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID;
const ALIYUN_ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET;
const ALIYUN_SMS_SIGN_NAME = process.env.ALIYUN_SMS_SIGN_NAME || '速通互联验证码';
const ALIYUN_SMS_TEMPLATE_CODE = process.env.ALIYUN_SMS_TEMPLATE_CODE || '100001';

// 初始化阿里云客户端
let dypnsClient: any = null;

function getDypnsClient(): any {
  if (!ALIYUN_ACCESS_KEY_ID || !ALIYUN_ACCESS_KEY_SECRET) {
    throw new Error('阿里云短信服务未配置，请设置环境变量 ALIYUN_ACCESS_KEY_ID 和 ALIYUN_ACCESS_KEY_SECRET');
  }
  if (!dypnsClient) {
    const config = new OpenApi.Config({
      accessKeyId: ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dypnsapi.aliyuncs.com',
    });
    dypnsClient = new DypnsapiClient(config);
  }
  return dypnsClient;
}

// 简单的内存存储验证码（生产环境应使用 Redis）
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// 生成随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 发送验证码
 * POST /api/v1/auth/send-code
 * Body: { phone: string }
 */
router.post('/send-code', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: '手机号不能为空' });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: '手机号格式不正确' });
  }

  // 生成验证码用于本地存储验证
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟后过期

  try {
    // 调用阿里云号码认证服务发送短信验证码
    const client = getDypnsClient();
    
    // 阿里云号码认证服务的短信验证码API会自动生成验证码
    // templateParam 中的 ##code## 会被阿里云自动替换为实际生成的验证码
    const request = new SendSmsVerifyCodeRequest({
      phoneNumber: `86${phone}`, // 中国大陆手机号需要加86前缀
      signName: ALIYUN_SMS_SIGN_NAME,
      templateCode: ALIYUN_SMS_TEMPLATE_CODE,
      templateParam: '{"code":"##code##"}', // 阿里云会自动替换为实际验证码
      codeLength: 6, // 6位验证码
      validTime: 300, // 5分钟有效期
      returnVerifyCode: true, // 返回验证码用于后端验证
    });

    const response = await client.sendSmsVerifyCode(request);
    
    console.log(`[短信发送] 手机号: ${phone}, 响应:`, JSON.stringify(response.body));

    if (response.body?.code !== 'OK') {
      console.error('[短信发送失败]', response.body);
      
      // 如果阿里云发送失败，保存本地生成的验证码用于开发调试
      verificationCodes.set(phone, { code, expiresAt });
      
      // 开发环境返回验证码方便调试
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: '验证码已发送（开发环境查看控制台）',
          devCode: code,
          aliyunError: response.body?.message
        });
      }
      
      return res.status(400).json({ 
        error: response.body?.message || '短信发送失败，请稍后重试'
      });
    }

    // 如果阿里云返回了验证码，使用阿里云的验证码
    const actualCode = response.body?.model?.verifyCode || code;
    verificationCodes.set(phone, { code: actualCode, expiresAt });
    
    console.log(`[短信发送成功] 手机号: ${phone}, 验证码: ${actualCode}`);

    res.json({
      success: true,
      message: '验证码已发送',
      bizId: response.body?.model?.bizId
    });
  } catch (error: any) {
    console.error('[短信发送异常]', error);
    
    // 开发环境：即使发送失败也保存验证码，方便调试
    verificationCodes.set(phone, { code, expiresAt });
    console.log(`[开发模式] 验证码: ${code}`);
    
    res.json({
      success: true,
      message: '验证码已发送（开发环境查看控制台）',
      ...(process.env.NODE_ENV === 'development' && { devCode: code })
    });
  }
});

/**
 * 验证验证码
 * POST /api/v1/auth/verify-code
 * Body: { phone: string, code: string }
 */
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: '手机号和验证码不能为空' });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: '手机号格式不正确' });
  }

  // 验证验证码
  const storedCode = verificationCodes.get(phone);
  if (!storedCode) {
    return res.status(400).json({ error: '验证码不存在或已过期，请重新获取' });
  }

  if (storedCode.code !== code) {
    return res.status(400).json({ error: '验证码不正确' });
  }

  if (Date.now() > storedCode.expiresAt) {
    verificationCodes.delete(phone);
    return res.status(400).json({ error: '验证码已过期，请重新获取' });
  }

  // 检查用户是否已存在
  try {
    const existingUser = await (req as any).db.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '该手机号已注册，请直接登录' });
    }
  } catch (error) {
    console.error('检查用户失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }

  // 验证通过，返回成功（不删除验证码，注册时还会用到）
  res.json({
    success: true,
    message: '验证码验证通过'
  });
});

/**
 * 验证密码强度
 * 要求：不低于8位，至少包含数字和字母两种组合
 */
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度不能低于8位' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '密码至少需要包含数字和字母两种组合' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 用户注册/登录
 * POST /api/v1/auth/register
 * Body: { phone: string, code: string, password: string, username?: string }
 */
router.post('/register', async (req, res) => {
  const { phone, code, password, username } = req.body;

  // 验证必填字段
  if (!phone || !code || !password) {
    return res.status(400).json({ error: '手机号、验证码和密码不能为空' });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: '手机号格式不正确' });
  }

  // 验证密码强度
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: passwordValidation.message });
  }

  // 验证验证码
  const storedCode = verificationCodes.get(phone);
  if (!storedCode) {
    return res.status(400).json({ error: '验证码不存在或已过期，请重新获取' });
  }

  if (storedCode.code !== code) {
    return res.status(400).json({ error: '验证码不正确' });
  }

  if (Date.now() > storedCode.expiresAt) {
    verificationCodes.delete(phone);
    return res.status(400).json({ error: '验证码已过期，请重新获取' });
  }

  // 清除已使用的验证码
  verificationCodes.delete(phone);

  try {
    // 检查用户是否已存在
    const existingUser = await (req as any).db.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '该手机号已注册，请直接登录' });
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await (req as any).db.query(
      `INSERT INTO users (phone, password_hash, username, tags)
       VALUES ($1, $2, $3, $4)
       RETURNING id, phone, username, avatar_url, bio, balance, tags, created_at`,
      [phone, passwordHash, username || `用户${phone.slice(-4)}`, []]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
        balance: user.balance,
        tags: user.tags,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

/**
 * 用户登录
 * POST /api/v1/auth/login
 * Body: { phone: string, password: string }
 */
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  // 验证必填字段
  if (!phone || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  try {
    // 查找用户
    const result = await (req as any).db.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: '用户不存在' });
    }

    const user = result.rows[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: '密码不正确' });
    }

    res.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
        balance: user.balance,
        tags: user.tags,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 * Query: { userId: number }
 */
router.get('/me', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '用户ID不能为空' });
  }

  try {
    // 获取用户基本信息
    const userResult = await (req as any).db.query(
      'SELECT id, phone, username, avatar_url, background_image, bio, balance, tags, is_merchant, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = userResult.rows[0];

    // 获取统计数据
    // 粉丝数（关注该用户的用户数）
    const followersResult = await (req as any).db.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = $1',
      [userId]
    );
    const followersCount = parseInt(followersResult.rows[0].count);

    // 关注数（该用户关注的用户数）
    const followingResult = await (req as any).db.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = $1',
      [userId]
    );
    const followingCount = parseInt(followingResult.rows[0].count);

    // 获赞数（该用户发布的帖子获得的点赞总数）
    const likesResult = await (req as any).db.query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)',
      [userId]
    );
    const likesCount = parseInt(likesResult.rows[0].count);

    res.json({
      success: true,
      user: {
        ...user,
        stats: {
          followersCount,
          followingCount,
          likesCount,
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

/**
 * 更新用户资料
 * POST /api/v1/auth/update-profile
 * Body: { userId: number, username?: string, bio?: string, avatar_url?: string, background_image?: string, tags?: string[] }
 */
router.post('/update-profile', async (req, res) => {
  const { userId, username, bio, avatar_url, background_image, tags } = req.body;

  if (!userId) {
    return res.status(400).json({ error: '用户ID不能为空' });
  }

  try {
    // 动态构建更新语句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatar_url);
    }
    if (background_image !== undefined) {
      updates.push(`background_image = $${paramIndex++}`);
      values.push(background_image);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(tags);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, phone, username, avatar_url, background_image, bio, balance, tags, updated_at
    `;

    const result = await (req as any).db.query(query, values);

    res.json({
      success: true,
      message: '更新成功',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ error: '更新用户资料失败' });
  }
});

/**
 * 微信登录
 * POST /api/v1/auth/wechat/login
 * Body: { code: string }
 */
router.post('/wechat/login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: '缺少code参数' });
  }

  try {
    // 微信开放平台配置
    const WECHAT_APPID = process.env.WECHAT_APPID || 'your_wechat_appid';
    const WECHAT_SECRET = process.env.WECHAT_SECRET || 'your_wechat_secret';

    // 1. 用code换取access_token和openid
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`
    );

    if (!tokenResponse.ok) {
      throw new Error('微信API请求失败');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      console.error('微信API错误:', tokenData);
      return res.status(400).json({ error: `微信登录失败: ${tokenData.errmsg}` });
    }

    const { access_token, openid, unionid } = tokenData;

    // 2. 获取用户信息
    const userResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
    );

    if (!userResponse.ok) {
      throw new Error('获取微信用户信息失败');
    }

    const wechatUser = await userResponse.json();

    if (wechatUser.errcode) {
      console.error('微信用户信息API错误:', wechatUser);
      // 即使获取用户信息失败，只要有openid也可以继续
    }

    // 3. 查询用户是否已存在
    const existingUser = await (req as any).db.query(
      'SELECT * FROM users WHERE wechat_openid = $1',
      [openid]
    );

    if (existingUser.rows.length > 0) {
      // 用户已存在
      const user = existingUser.rows[0];

      // 检查是否已绑定手机号
      if (!user.phone) {
        return res.json({
          success: true,
          needBindPhone: true,
          openid: openid,
          unionid: unionid,
          wechatUserInfo: {
            nickname: wechatUser.nickname || user.wechat_nickname,
            headimgurl: wechatUser.headimgurl || user.wechat_headimgurl
          },
          existingUserId: user.id
        });
      }

      // 已绑定手机号，直接登录成功
      res.json({
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          avatar_url: user.avatar_url,
          bio: user.bio,
          balance: user.balance,
          tags: user.tags,
          created_at: user.created_at
        }
      });
    } else {
      // 新用户，需要绑定手机号
      res.json({
        success: true,
        needBindPhone: true,
        openid: openid,
        unionid: unionid,
        wechatUserInfo: {
          nickname: wechatUser.nickname,
          headimgurl: wechatUser.headimgurl
        }
      });
    }
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ error: '微信登录失败，请稍后重试' });
  }
});

/**
 * 微信绑定手机号（注册/绑定现有账号）
 * POST /api/v1/auth/wechat/bind-phone
 * Body: { phone: string, code: string, openid: string, unionid?: string, wechatUserInfo?: object, existingUserId?: number }
 */
router.post('/wechat/bind-phone', async (req, res) => {
  const { phone, code, openid, unionid, wechatUserInfo, existingUserId } = req.body;

  // 验证必填字段
  if (!phone || !code || !openid) {
    return res.status(400).json({ error: '手机号、验证码和openid不能为空' });
  }

  // 验证验证码
  const storedCode = verificationCodes.get(phone);
  if (!storedCode || storedCode.code !== code || Date.now() > storedCode.expiresAt) {
    return res.status(400).json({ error: '验证码不正确或已过期' });
  }

  // 清除已使用的验证码
  verificationCodes.delete(phone);

  try {
    let user;

    if (existingUserId) {
      // 绑定到现有账号
      const updateUserResult = await (req as any).db.query(
        `UPDATE users
         SET wechat_openid = $1, wechat_unionid = $2, wechat_nickname = $3, wechat_headimgurl = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, phone, username, avatar_url, bio, balance, tags, created_at`,
        [openid, unionid, wechatUserInfo?.nickname, wechatUserInfo?.headimgurl, existingUserId]
      );

      user = updateUserResult.rows[0];
    } else {
      // 创建新用户
      const insertUserResult = await (req as any).db.query(
        `INSERT INTO users (phone, username, avatar_url, wechat_openid, wechat_unionid, wechat_nickname, wechat_headimgurl, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, phone, username, avatar_url, bio, balance, tags, created_at`,
        [
          phone,
          wechatUserInfo?.nickname || `用户${phone.slice(-4)}`,
          wechatUserInfo?.headimgurl,
          openid,
          unionid,
          wechatUserInfo?.nickname,
          wechatUserInfo?.headimgurl,
          []
        ]
      );

      user = insertUserResult.rows[0];
    }

    res.json({
      success: true,
      message: '绑定成功',
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
        balance: user.balance,
        tags: user.tags,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('绑定手机号错误:', error);

    // 检查是否是唯一约束错误（手机号已存在或openid已存在）
    if (error.code === '23505') {
      return res.status(400).json({ error: '该手机号或微信账号已被使用' });
    }

    res.status(500).json({ error: '绑定手机号失败，请稍后重试' });
  }
});

export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY';

// 管理员鉴权
const adminAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: -1, msg: '未登录' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== 'admin') return res.status(403).json({ code: -1, msg: '无管理员权限' });
    next();
  } catch (e) {
    res.status(401).json({ code: -1, msg: 'token无效' });
  }
};

// 审核帖子
router.post('/post/audit', adminAuth, async (req: any, res) => {
  try {
    const { postId, status, auditUserId, reason } = req.body;
    const db = req.db;

    const query = `
      UPDATE posts
      SET status = $1, audit_time = NOW(), audit_user_id = $2, audit_reason = $3
      WHERE id = $4
    `;
    await db.query(query, [status, auditUserId, reason, postId]);

    res.json({ code: 0, msg: status === 1 ? '帖子审核通过' : '帖子审核拒绝' });
  } catch (error) {
    console.error('帖子审核失败：', error);
    res.json({ code: -1, msg: '服务器错误' });
  }
});

export default router;

import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// 获取用户帖子统计
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = (req as any).db;

    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    // 我的帖子数
    const myPostsResult = await db.query(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = $1',
      [userId]
    );
    const myPosts = parseInt(myPostsResult.rows[0].count);

    // 点赞的帖子数
    const likedPostsResult = await db.query(
      'SELECT COUNT(*) as count FROM likes WHERE user_id = $1',
      [userId]
    );
    const likedPosts = parseInt(likedPostsResult.rows[0].count);

    // 收藏的帖子数
    const collectedPostsResult = await db.query(
      'SELECT COUNT(*) as count FROM collections WHERE user_id = $1',
      [userId]
    );
    const collectedPosts = parseInt(collectedPostsResult.rows[0].count);

    // 私密帖子数（设为私密的帖子）
    const privatePostsResult = await db.query(
      'SELECT COUNT(*) as count FROM posts WHERE author_id = $1 AND visibility = $2',
      [userId, 'private']
    );
    const privatePosts = parseInt(privatePostsResult.rows[0].count);

    res.json({
      success: true,
      stats: {
        myPosts,
        likedPosts,
        collectedPosts,
        privatePosts,
      },
    });
  } catch (error: any) {
    console.error('获取用户帖子统计失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户自己的帖子列表（包括所有状态）
router.get('/my-posts', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const query = `
      SELECT * FROM posts
      WHERE author_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, [parseInt(userId as string)]);

    const posts = result.rows.map((row: any) => {
      return {
        ...row,
        images: row.images || [],
        tags: row.tags || [],
        aspectRatio: calculateAspectRatio(row.images),
      };
    });

    res.json({ success: true, posts });
  } catch (error: any) {
    console.error('获取用户帖子列表失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取帖子列表（只返回已审核通过的）
router.get('/', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { type, userId } = req.query;
    const currentUserId = userId ? parseInt(userId as string) : null;

    let sqlQuery = `
      SELECT p.*,
        u.username as author_username,
        u.avatar_url as author_avatar,
        COALESCE(json_agg(
          json_build_object(
            'userId', pi.user_id,
            'interactionType', pi.interaction_type
          )
        ) FILTER (WHERE pi.user_id = $1), '[]') as user_interactions
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_interactions pi ON p.id = pi.post_id AND pi.user_id = $1
      WHERE p.status = 'published' AND p.audit_status = 'approved'
    `;

    const params: any[] = [];
    if (currentUserId) {
      params.push(currentUserId);
    } else {
      params.push(0); // 占位符
    }

    if (type) {
      sqlQuery += ` AND p.type = $${params.length + 1}`;
      params.push(type);
    }

    sqlQuery += `
      GROUP BY p.id, u.username, u.avatar_url
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(sqlQuery, params);

    const posts = result.rows.map((row: any) => {
      // 处理用户互动状态
      const interactions = row.user_interactions || [];
      const isLiked = interactions.some((i: any) => i.interactionType === 'like');
      const isCollected = interactions.some((i: any) => i.interactionType === 'collect');

      return {
        ...row,
        username: row.author_username,
        avatar: row.author_avatar,
        images: row.images || [],
        tags: row.tags || [],
        aspectRatio: calculateAspectRatio(row.images),
        isLiked,
        isCollected,
      };
    });

    res.json({ success: true, posts });
  } catch (error: any) {
    console.error('获取帖子列表失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 计算图片宽高比（简化实现）
function calculateAspectRatio(images: string[]): number {
  if (!images || images.length === 0) return 1;
  // 这里简化处理，实际应该从图片元数据获取
  return [0.8, 1.0, 1.2, 1.4][Math.floor(Math.random() * 4)];
}

// 创建帖子（自动审核）
router.post('/', async (req, res) => {
  const db = (req as any).db;
  if (!db) {
    return res.status(500).json({ success: false, error: '数据库连接失败' });
  }

  const client = await db.connect();
  try {
    const {
      userId,
      username,
      avatar,
      type = 'normal',
      title,
      content,
      images = [],
      category,
      tags = [],
      price = 0,
    } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ success: false, error: '缺少必填参数' });
    }

    await client.query('BEGIN');

    // 调用审核接口
    const auditResult = await auditContent(content, images);
    const auditStatus = auditResult.passed ? 'approved' : 'rejected';
    const auditTime = auditResult.passed ? new Date() : null;
    const auditReason = auditResult.reason || null;
    const status = auditResult.passed ? 'published' : 'draft';

    // 插入帖子
    const query = `
      INSERT INTO posts (
        author_id, type, title, content, images, tags,
        post_type, media_type, image_urls,
        status, audit_status, audit_time, audit_reason,
        view_count, like_count, comment_count, collect_count, share_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      userId,
      type === 'normal' ? 'article' : type,
      title,
      content,
      images,
      tags,
      'normal',
      images.length > 0 ? 'image' : 'text',
      images,
      status,
      auditStatus,
      auditTime,
      auditReason,
      0, // view_count
      0, // like_count
      0, // comment_count
      0, // collect_count
      0, // share_count
    ];

    const result = await client.query(query, values);
    const post = result.rows[0];

    await client.query('COMMIT');

    res.json({
      success: true,
      post: {
        ...post,
        images: post.images || post.image_urls || [],
        tags: post.tags || [],
        aspectRatio: calculateAspectRatio(post.images || post.image_urls),
        likeCount: post.like_count || 0,
        commentCount: post.comment_count || 0,
        forwardCount: post.share_count || 0,
        collectCount: post.collect_count || 0,
        viewCount: post.view_count || 0,
        status: post.status,
        auditStatus: post.audit_status,
      },
      message: auditStatus === 'approved' ? '发布成功' : `发布失败：${auditReason}`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('创建帖子失败：', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// 内容审核（自动审核）
async function auditContent(content: string, images: string[]) {
  try {
    // 1. 检查内容长度
    if (content.length > 10000) {
      return { passed: false, reason: '内容过长，请控制在10000字以内' };
    }

    if (content.length < 10) {
      return { passed: false, reason: '内容过短，至少需要10个字符' };
    }

    // 2. 检查敏感词（这里使用简化的敏感词列表，实际应接入专业审核API）
    const sensitiveWords = [
      '暴力', '色情', '赌博', '毒品', '诈骗', '违禁品',
      '敏感词1', '敏感词2', '敏感词3'
    ];

    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        return { passed: false, reason: `内容包含敏感词：${word}` };
      }
    }

    // 3. 检查图片数量
    if (images.length > 9) {
      return { passed: false, reason: '图片数量不能超过9张' };
    }

    // 4. 检查是否包含纯广告（简单规则：包含多个联系方式）
    const phonePattern = /1[3-9]\d{9}/g;
    const phoneMatches = content.match(phonePattern);
    if (phoneMatches && phoneMatches.length > 2) {
      return { passed: false, reason: '疑似广告信息，请勿发布过多联系方式' };
    }

    // TODO: 实际应调用专业审核API（如阿里云内容安全、腾讯云天御等）
    // 这里暂时使用简化的规则，实际生产环境应该调用真实审核API

    return { passed: true };
  } catch (error) {
    console.error('内容审核失败：', error);
    return { passed: false, reason: '审核服务异常' };
  }
}

// 获取帖子详情
router.get('/:id', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId } = req.query;
    const currentUserId = userId ? parseInt(userId as string) : null;

    // 更新浏览次数
    await db.query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);

    const query = `
      SELECT p.*,
        COALESCE(json_agg(
          json_build_object(
            'userId', pi.user_id,
            'interactionType', pi.interaction_type
          )
        ) FILTER (WHERE pi.user_id = $2), '[]') as user_interactions
      FROM posts p
      LEFT JOIN post_interactions pi ON p.id = pi.post_id AND pi.user_id = $2
      WHERE p.id = $1 AND p.status = 'published' AND p.audit_status = 'approved'
      GROUP BY p.id
    `;

    const params: any[] = [id];
    if (currentUserId) {
      params.push(currentUserId);
    } else {
      params.push(0);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }

    const row = result.rows[0];
    const interactions = row.user_interactions || [];
    const isLiked = interactions.some((i: any) => i.interactionType === 'like');
    const isCollected = interactions.some((i: any) => i.interactionType === 'collect');

    res.json({
      success: true,
      post: {
        ...row,
        images: row.images || [],
        tags: row.tags || [],
        aspectRatio: calculateAspectRatio(row.images),
        isLiked,
        isCollected,
      },
    });
  } catch (error: any) {
    console.error('获取帖子详情失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 点赞帖子
router.post('/:id/like', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId, username } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const client = await db.connect();

    try {
      // 检查是否已点赞
      const checkResult = await client.query(
        'SELECT * FROM post_interactions WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3',
        [id, userId, 'like']
      );

      let isLiked = false;
      let likeCount = 0;

      if (checkResult.rows.length === 0) {
        // 点赞
        await client.query(
          'INSERT INTO post_interactions (post_id, user_id, interaction_type) VALUES ($1, $2, $3)',
          [id, userId, 'like']
        );
        await client.query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [id]);
        isLiked = true;

        // 创建点赞通知
        await createNotification(db, parseInt(userId), parseInt(id), 'like', username);
      } else {
        // 取消点赞
        await client.query(
          'DELETE FROM post_interactions WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3',
          [id, userId, 'like']
        );
        await client.query('UPDATE posts SET like_count = like_count - 1 WHERE id = $1', [id]);
        isLiked = false;
      }

      const countResult = await client.query('SELECT like_count FROM posts WHERE id = $1', [id]);
      likeCount = countResult.rows[0].like_count;

      res.json({ success: true, isLiked, likeCount });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('点赞失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 收藏帖子
router.post('/:id/collect', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId, username } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    const client = await db.connect();

    try {
      const checkResult = await client.query(
        'SELECT * FROM post_interactions WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3',
        [id, userId, 'collect']
      );

      let isCollected = false;
      let collectCount = 0;

      if (checkResult.rows.length === 0) {
        // 收藏
        await client.query(
          'INSERT INTO post_interactions (post_id, user_id, interaction_type) VALUES ($1, $2, $3)',
          [id, userId, 'collect']
        );
        await client.query('UPDATE posts SET collect_count = collect_count + 1 WHERE id = $1', [id]);
        isCollected = true;

        // 创建收藏通知
        await createNotification(db, parseInt(userId), parseInt(id), 'collect', username);
      } else {
        // 取消收藏
        await client.query(
          'DELETE FROM post_interactions WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3',
          [id, userId, 'collect']
        );
        await client.query('UPDATE posts SET collect_count = collect_count - 1 WHERE id = $1', [id]);
        isCollected = false;
      }

      const countResult = await client.query('SELECT collect_count FROM posts WHERE id = $1', [id]);
      collectCount = countResult.rows[0].collect_count;

      res.json({ success: true, isCollected, collectCount, message: isCollected ? '收藏成功' : '取消收藏' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('收藏失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 转发帖子
router.post('/:id/forward', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId, username } = req.body;

    const client = await db.connect();

    try {
      await client.query(
        'INSERT INTO post_interactions (post_id, user_id, interaction_type) VALUES ($1, $2, $3)',
        [id, userId, 'forward']
      );
      await client.query('UPDATE posts SET forward_count = forward_count + 1 WHERE id = $1', [id]);

      // 创建转发通知
      await createNotification(db, parseInt(userId), parseInt(id), 'forward', username);

      const result = await client.query('SELECT forward_count FROM posts WHERE id = $1', [id]);

      res.json({
        success: true,
        forwardCount: result.rows[0].forward_count,
        shareUrl: `https://example.com/post/${id}`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('转发失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取帖子评论
router.get('/:id/comments', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM post_comments
       WHERE post_id = $1 AND parent_id IS NULL
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({ success: true, comments: result.rows });
  } catch (error: any) {
    console.error('获取评论失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发表评论
router.post('/:id/comments', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId, username, avatar, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ success: false, error: '缺少必填参数' });
    }

    const client = await db.connect();

    try {
      const result = await client.query(
        `INSERT INTO post_comments (post_id, user_id, username, avatar, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, userId, username, avatar, content]
      );

      // 更新帖子评论数
      await client.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [id]);

      // 创建评论通知
      await createNotification(db, parseInt(userId), parseInt(id), 'comment', username);

      res.json({ success: true, comment: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('发表评论失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 投诉帖子
router.post('/:id/report', async (req, res) => {
  try {
    const db = (req as any).db;
    if (!db) {
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: '用户ID不能为空' });
    }

    // 检查帖子是否存在
    const postResult = await db.query('SELECT id, author_id, title FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }

    // 检查是否已投诉过
    const existingReport = await db.query(
      'SELECT * FROM post_reports WHERE post_id = $1 AND reporter_id = $2',
      [id, userId]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ success: false, error: '您已投诉过此帖子' });
    }

    // 创建投诉表（如果不存在）
    await db.query(`
      CREATE TABLE IF NOT EXISTS post_reports (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        reporter_id INTEGER NOT NULL,
        reason VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入投诉记录
    await db.query(
      'INSERT INTO post_reports (post_id, reporter_id, reason) VALUES ($1, $2, $3)',
      [id, userId, reason]
    );

    // 检查投诉次数，如果超过阈值则自动下架
    const reportCount = await db.query(
      'SELECT COUNT(*) as count FROM post_reports WHERE post_id = $1',
      [id]
    );

    const count = parseInt(reportCount.rows[0].count);
    if (count >= 5) {
      await db.query(
        "UPDATE posts SET status = 'hidden', audit_status = 'rejected', audit_reason = '被多次投诉' WHERE id = $1",
        [id]
      );
    }

    res.json({
      success: true,
      message: '投诉已提交，我们会尽快处理',
    });
  } catch (error: any) {
    console.error('投诉失败：', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建通知
async function createNotification(db: Pool, userId: number, postId: number, type: string, username: string) {
  try {
    // 获取帖子作者ID
    const postResult = await db.query('SELECT author_id, title FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) return;

    const authorId = postResult.rows[0].author_id;
    const postTitle = postResult.rows[0].title;

    // 如果是自己对自己的帖子互动，不创建通知
    if (authorId === userId) return;

    // 检查是否已有通知表，如果没有则创建
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(500),
        content TEXT,
        from_user_id INTEGER,
        from_username VARCHAR(100),
        post_id INTEGER,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const titleMap: { [key: string]: string } = {
      like: '点赞',
      collect: '收藏',
      forward: '转发',
      comment: '评论',
    };

    await db.query(
      `INSERT INTO notifications (user_id, type, title, content, from_user_id, from_username, post_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        authorId,
        type,
        `${titleMap[type]}了你的帖子`,
        postTitle || '未知帖子',
        userId,
        username,
        postId,
      ]
    );

    console.log(`[通知] 用户${username}${titleMap[type]}了用户${authorId}的帖子${postId}`);
  } catch (error) {
    console.error('创建通知失败：', error);
  }
}

export default router;

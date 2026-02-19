import express from 'express';

const router = express.Router();

/**
 * 创建帖子
 * POST /api/v1/posts
 * Body: {
 *   userId: number,
 *   type: 'normal' | 'qa_paid' | 'qa_bounty' | 'product',
 *   title?: string,
 *   content: string,
 *   images?: string[],
 *   video_url?: string,
 *   qa_price?: number, // 付费问答价格
 *   bounty_price?: number, // 悬赏金额
 *   tags?: string[], // 创业赛道标签
 *   productName?: string, // 产品名称
 *   productPrice?: number, // 产品价格
 *   productDescription?: string, // 产品描述
 *   contactInfo?: string // 联系方式
 * }
 */
router.post('/', async (req, res) => {
  const {
    userId,
    type,
    title,
    content,
    images = [],
    video_url,
    qa_price,
    bounty_price,
    tags = [],
    productName,
    productPrice,
    productDescription,
    contactInfo
  } = req.body;

  // 验证必填字段
  if (!userId || !type || !content) {
    return res.status(400).json({ error: '用户ID、类型和内容不能为空' });
  }

  // 验证帖子类型
  const validTypes = ['normal', 'qa_paid', 'qa_bounty', 'product'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: '无效的帖子类型' });
  }

  // 付费问答必须设置价格
  if (type === 'qa_paid' && !qa_price) {
    return res.status(400).json({ error: '付费问答必须设置价格' });
  }

  // 悬赏帖必须设置金额
  if (type === 'qa_bounty' && !bounty_price) {
    return res.status(400).json({ error: '悬赏帖必须设置金额' });
  }

  // 产品帖必须有产品信息
  if (type === 'product' && (!productName || !productPrice)) {
    return res.status(400).json({ error: '产品帖必须填写产品名称和价格' });
  }

  try {
    // 开始事务
    await (req as any).db.query('BEGIN');

    // 创建帖子
    const postResult = await (req as any).db.query(
      `INSERT INTO posts (author_id, type, title, content, images, video_url, qa_price, bounty_price, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, type, title, content, images, video_url, qa_price, bounty_price, tags]
    );

    const post = postResult.rows[0];

    // 如果是产品帖，创建产品关联
    if (type === 'product') {
      await (req as any).db.query(
        `INSERT INTO post_products (post_id, product_name, product_price, product_description, contact_info)
         VALUES ($1, $2, $3, $4, $5)`,
        [post.id, productName, productPrice, productDescription, contactInfo]
      );
    }

    await (req as any).db.query('COMMIT');

    res.json({
      success: true,
      message: '发布成功',
      post
    });
  } catch (error) {
    await (req as any).db.query('ROLLBACK');
    console.error('创建帖子失败:', error);
    res.status(500).json({ error: '创建帖子失败' });
  }
});

/**
 * 获取帖子列表（首页推荐流）
 * GET /api/v1/posts
 * Query: {
 *   userId?: number, // 当前用户ID（用于检查是否已购买付费问答）
 *   type?: string, // 帖子类型筛选
 *   tag?: string, // 标签筛选
 *   page?: number,
 *   pageSize?: number
 * }
 */
router.get('/', async (req, res) => {
  const { userId, type, tag, page = 1, pageSize = 20 } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const conditions: string[] = ['p.status = $1'];
    const values: any[] = ['published'];
    let paramIndex = 2;

    if (type) {
      conditions.push(`p.type = $${paramIndex++}`);
      values.push(type);
    }

    if (tag) {
      conditions.push(`$${paramIndex} = ANY(p.tags)`);
      values.push(tag);
    }

    const whereClause = conditions.join(' AND ');

    // 查询帖子列表
    const postsQuery = `
      SELECT
        p.*,
        u.username,
        u.avatar_url,
        CASE
          WHEN p.type = 'qa_paid' AND EXISTS (
            SELECT 1 FROM qa_purchases qp
            WHERE qp.user_id = $${paramIndex} AND qp.post_id = p.id
          )
          THEN true
          WHEN p.type = 'qa_paid' AND p.author_id = $${paramIndex}
          THEN true
          ELSE false
        END as is_purchased,
        EXISTS (
          SELECT 1 FROM likes l
          WHERE l.user_id = $${paramIndex} AND l.post_id = p.id
        ) as is_liked,
        EXISTS (
          SELECT 1 FROM bookmarks b
          WHERE b.user_id = $${paramIndex} AND b.post_id = p.id
        ) as is_bookmarked
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
    `;

    values.push(userId || 0, limit, offset);

    const result = await (req as any).db.query(postsQuery, values);

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE ${whereClause}
    `;

    const countResult = await (req as any).db.query(countQuery, values.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      posts: result.rows,
      pagination: {
        page: Number(page),
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

/**
 * 获取帖子详情
 * GET /api/v1/posts/:id
 * Query: { userId?: number }
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    // 查询帖子详情
    const postQuery = `
      SELECT
        p.*,
        u.username,
        u.avatar_url,
        CASE
          WHEN p.type = 'qa_paid' AND EXISTS (
            SELECT 1 FROM qa_purchases qp
            WHERE qp.user_id = $1 AND qp.post_id = p.id
          )
          THEN true
          WHEN p.type = 'qa_paid' AND p.author_id = $1
          THEN true
          ELSE false
        END as is_purchased,
        EXISTS (
          SELECT 1 FROM likes l
          WHERE l.user_id = $1 AND l.post_id = p.id
        ) as is_liked,
        EXISTS (
          SELECT 1 FROM bookmarks b
          WHERE b.user_id = $1 AND b.post_id = p.id
        ) as is_bookmarked
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $2
    `;

    const postResult = await (req as any).db.query(postQuery, [userId || 0, id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const post = postResult.rows[0];

    // 查询产品信息（如果是产品帖）
    if (post.type === 'product') {
      const productResult = await (req as any).db.query(
        'SELECT * FROM post_products WHERE post_id = $1',
        [id]
      );
      if (productResult.rows.length > 0) {
        post.product = productResult.rows[0];
      }
    }

    // 增加浏览量
    await (req as any).db.query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);

    // 查询评论列表
    const commentsResult = await (req as any).db.query(
      `SELECT
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 20`,
      [id]
    );

    post.comments = commentsResult.rows;

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

/**
 * 点赞/取消点赞帖子
 * POST /api/v1/posts/:id/like
 * Body: { userId: number, action: 'like' | 'unlike' }
 */
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: '用户ID和操作类型不能为空' });
  }

  try {
    if (action === 'like') {
      // 添加点赞
      await (req as any).db.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, id]
      );
      await (req as any).db.query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [id]);
    } else if (action === 'unlike') {
      // 取消点赞
      await (req as any).db.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, id]);
      await (req as any).db.query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1', [id]);
    }

    res.json({
      success: true,
      message: action === 'like' ? '点赞成功' : '取消点赞成功'
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ error: '点赞操作失败' });
  }
});

/**
 * 收藏/取消收藏帖子
 * POST /api/v1/posts/:id/bookmark
 * Body: { userId: number, action: 'bookmark' | 'unbookmark' }
 */
router.post('/:id/bookmark', async (req, res) => {
  const { id } = req.params;
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: '用户ID和操作类型不能为空' });
  }

  try {
    if (action === 'bookmark') {
      // 添加收藏
      await (req as any).db.query(
        'INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, id]
      );
    } else if (action === 'unbookmark') {
      // 取消收藏
      await (req as any).db.query('DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2', [userId, id]);
    }

    res.json({
      success: true,
      message: action === 'bookmark' ? '收藏成功' : '取消收藏成功'
    });
  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({ error: '收藏操作失败' });
  }
});

/**
 * 发布评论
 * POST /api/v1/posts/:id/comments
 * Body: { userId: number, content: string, parentId?: number }
 */
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { userId, content, parentId } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: '用户ID和内容不能为空' });
  }

  try {
    const result = await (req as any).db.query(
      `INSERT INTO comments (post_id, author_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, content, parentId || null]
    );

    const comment = result.rows[0];

    // 增加评论数
    await (req as any).db.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [id]);

    // 查询评论作者信息
    const userResult = await (req as any).db.query(
      'SELECT username, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    comment.username = userResult.rows[0].username;
    comment.avatar_url = userResult.rows[0].avatar_url;

    res.json({
      success: true,
      message: '评论成功',
      comment
    });
  } catch (error) {
    console.error('发布评论失败:', error);
    res.status(500).json({ error: '发布评论失败' });
  }
});

export default router;

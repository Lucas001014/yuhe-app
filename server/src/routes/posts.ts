import express from 'express';
import { generatePosts, generateAllComments } from '../utils/mockData';

const router = express.Router();

// 生成模拟数据
const allPosts = generatePosts(100);
const allComments = generateAllComments(allPosts);

// 用户点赞状态存储
const userLikes = new Map<string, Set<number>>();
const userBookmarks = new Map<string, Set<number>>();

// 存储帖子的实时数据
const postsData = new Map<number, any>();

// 初始化帖子数据
allPosts.forEach(post => {
  postsData.set(post.id, { ...post, comments: allComments.get(post.id) || [] });
});

/**
 * 获取帖子列表
 * GET /api/v1/posts
 * Query: {
 *   userId?: number,
 *   type?: string,
 *   category?: string,
 *   page?: number,
 *   pageSize?: number
 * }
 */
router.get('/', (req, res) => {
  try {
    const { userId, type, category, page = 1, pageSize = 20 } = req.query;

    let filteredPosts = Array.from(postsData.values());

    // 按类型筛选
    if (type && type !== 'all') {
      filteredPosts = filteredPosts.filter((p: any) => p.type === type);
    }

    // 按类别筛选
    if (category && category !== '全部') {
      filteredPosts = filteredPosts.filter((p: any) => p.category === category);
    }

    // 更新用户点赞和收藏状态
    if (userId) {
      const userLikedPosts = userLikes.get(String(userId)) || new Set();
      const userBookmarkedPosts = userBookmarks.get(String(userId)) || new Set();

      filteredPosts = filteredPosts.map((post: any) => ({
        ...post,
        isLiked: userLikedPosts.has(post.id),
        isCollected: userBookmarkedPosts.has(post.id),
      }));
    }

    // 分页
    const offset = (Number(page) - 1) * Number(pageSize);
    const paginatedPosts = filteredPosts.slice(offset, offset + Number(pageSize));

    res.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / Number(pageSize))
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
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    // 更新用户状态
    let resultPost = { ...post };

    if (userId) {
      const userLikedPosts = userLikes.get(String(userId)) || new Set();
      const userBookmarkedPosts = userBookmarks.get(String(userId)) || new Set();

      resultPost = {
        ...resultPost,
        isLiked: userLikedPosts.has(post.id),
        isCollected: userBookmarkedPosts.has(post.id),
      };
    }

    res.json({
      success: true,
      post: resultPost
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

/**
 * 点赞/取消点赞
 * POST /api/v1/posts/:id/like
 * Body: { userId: number }
 */
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const userLikedPosts = userLikes.get(String(userId)) || new Set();

    if (userLikedPosts.has(post.id)) {
      // 取消点赞
      userLikedPosts.delete(post.id);
      post.likeCount -= 1;
      post.isLiked = false;
    } else {
      // 点赞
      userLikedPosts.add(post.id);
      post.likeCount += 1;
      post.isLiked = true;
    }

    userLikes.set(String(userId), userLikedPosts);
    postsData.set(post.id, post);

    res.json({
      success: true,
      message: post.isLiked ? '点赞成功' : '取消点赞',
      likeCount: post.likeCount,
      isLiked: post.isLiked
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ error: '点赞操作失败' });
  }
});

/**
 * 收藏/取消收藏
 * POST /api/v1/posts/:id/collect
 * Body: { userId: number }
 */
router.post('/:id/collect', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const userBookmarkedPosts = userBookmarks.get(String(userId)) || new Set();

    if (userBookmarkedPosts.has(post.id)) {
      // 取消收藏
      userBookmarkedPosts.delete(post.id);
      post.collectCount -= 1;
      post.isCollected = false;
    } else {
      // 收藏
      userBookmarkedPosts.add(post.id);
      post.collectCount += 1;
      post.isCollected = true;
    }

    userBookmarks.set(String(userId), userBookmarkedPosts);
    postsData.set(post.id, post);

    res.json({
      success: true,
      message: post.isCollected ? '收藏成功' : '取消收藏',
      collectCount: post.collectCount,
      isCollected: post.isCollected
    });
  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({ error: '收藏操作失败' });
  }
});

/**
 * 增加转发次数
 * POST /api/v1/posts/:id/forward
 */
router.post('/:id/forward', (req, res) => {
  try {
    const { id } = req.params;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    post.forwardCount += 1;
    postsData.set(post.id, post);

    res.json({
      success: true,
      message: '转发成功',
      forwardCount: post.forwardCount,
      shareUrl: `http://localhost:5000/post/${post.id}`
    });
  } catch (error) {
    console.error('转发操作失败:', error);
    res.status(500).json({ error: '转发操作失败' });
  }
});

/**
 * 购买虚拟资料
 * POST /api/v1/posts/:id/resources/:resourceId/purchase
 */
router.post('/:id/resources/:resourceId/purchase', (req, res) => {
  try {
    const { id, resourceId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const resource = post.virtualResources?.find((r: any) => r.id === Number(resourceId));

    if (!resource) {
      return res.status(404).json({ error: '资源不存在' });
    }

    // 模拟购买成功
    post.isPurchased = true;
    postsData.set(post.id, post);

    res.json({
      success: true,
      message: '购买成功',
      resource,
      isPurchased: true
    });
  } catch (error) {
    console.error('购买资源失败:', error);
    res.status(500).json({ error: '购买资源失败' });
  }
});

/**
 * 下载虚拟资料
 * GET /api/v1/posts/:id/resources/:resourceId/download
 */
router.get('/:id/resources/:resourceId/download', (req, res) => {
  try {
    const { id, resourceId } = req.params;
    const { userId } = req.query;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const resource = post.virtualResources?.find((r: any) => r.id === Number(resourceId));

    if (!resource) {
      return res.status(404).json({ error: '资源不存在' });
    }

    // 检查是否已购买
    if (!post.isPurchased) {
      return res.status(403).json({ error: '请先购买该资源' });
    }

    res.json({
      success: true,
      message: '下载链接已生成',
      resource,
      downloadUrl: resource.downloadUrl,
      resourceName: resource.name
    });
  } catch (error) {
    console.error('下载资源失败:', error);
    res.status(500).json({ error: '下载资源失败' });
  }
});

/**
 * 获取帖子评论
 * GET /api/v1/posts/:id/comments
 */
router.get('/:id/comments', (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const comments = post.comments || [];
    const offset = (Number(page) - 1) * Number(pageSize);
    const paginatedComments = comments.slice(offset, offset + Number(pageSize));

    res.json({
      success: true,
      comments: paginatedComments,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: comments.length,
        totalPages: Math.ceil(comments.length / Number(pageSize))
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

/**
 * 发表评论
 * POST /api/v1/posts/:id/comments
 * Body: {
 *   userId: number,
 *   username: string,
 *   avatar: string,
 *   content: string
 * }
 */
router.post('/:id/comments', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username, avatar, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: '用户ID和内容不能为空' });
    }

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const newComment = {
      id: Date.now(),
      userId,
      username: username || '匿名用户',
      avatar: avatar || 'https://i.pravatar.cc/150?img=1',
      content,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      replyCount: 0,
    };

    post.comments = post.comments || [];
    post.comments.unshift(newComment);
    post.commentCount += 1;

    postsData.set(post.id, post);

    res.json({
      success: true,
      message: '评论成功',
      comment: newComment,
      commentCount: post.commentCount
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({ error: '发表评论失败' });
  }
});

/**
 * 点赞评论
 * POST /api/v1/posts/:id/comments/:commentId/like
 */
router.post('/:id/comments/:commentId/like', (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const comment = (post.comments || []).find((c: any) => c.id === Number(commentId));

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    comment.likeCount += 1;
    postsData.set(post.id, post);

    res.json({
      success: true,
      message: '点赞成功',
      likeCount: comment.likeCount
    });
  } catch (error) {
    console.error('点赞评论失败:', error);
    res.status(500).json({ error: '点赞评论失败' });
  }
});

/**
 * 更新帖子（管理后台）
 * PUT /api/v1/posts/:id
 * Body: {
 *   title?: string,
 *   content?: string,
 *   category?: string,
 *   price?: number
 * }
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, price } = req.body;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    // 更新字段
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (price !== undefined) post.price = price;

    postsData.set(post.id, post);

    res.json({
      success: true,
      message: '帖子更新成功',
      post
    });
  } catch (error) {
    console.error('更新帖子失败:', error);
    res.status(500).json({ error: '更新帖子失败' });
  }
});

/**
 * 删除帖子（管理后台）
 * DELETE /api/v1/posts/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const post = postsData.get(Number(id));

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    postsData.delete(post.id);

    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ error: '删除帖子失败' });
  }
});

export default router;

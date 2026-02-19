import express from 'express';

const router = express.Router();

// 模拟数据 - 实际应该从数据库获取
interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
  };
  posts: {
    total: number;
    published: number;
    pending: number;
  };
  transactions: {
    total: number;
    totalAmount: number;
    successRate: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  postCount: number;
  transactionCount: number;
}

interface Post {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  type: 'free' | 'paid' | 'bounty';
  status: 'published' | 'pending' | 'deleted';
  createdAt: string;
  viewCount: number;
  likeCount: number;
}

interface Transaction {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  type: 'qa_payment' | 'bounty_payment' | 'product_purchase';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: string;
}

// 获取仪表板统计数据
router.get('/stats', (req, res) => {
  try {
    const stats: DashboardStats = {
      users: {
        total: 1250,
        active: 980,
        newThisWeek: 45
      },
      posts: {
        total: 3420,
        published: 3100,
        pending: 320
      },
      transactions: {
        total: 890,
        totalAmount: 158900,
        successRate: 95.5
      },
      revenue: {
        today: 3450,
        thisWeek: 18900,
        thisMonth: 67800
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    });
  }
});

// 获取用户列表
router.get('/users', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    // 模拟用户数据
    const allUsers: User[] = [
      {
        id: 1,
        username: 'tech_founder',
        email: 'founder@example.com',
        avatar: 'https://via.placeholder.com/100',
        status: 'active',
        createdAt: '2025-01-01T10:00:00Z',
        postCount: 45,
        transactionCount: 12
      },
      {
        id: 2,
        username: 'startup_mentor',
        email: 'mentor@example.com',
        avatar: 'https://via.placeholder.com/100',
        status: 'active',
        createdAt: '2025-01-02T10:00:00Z',
        postCount: 120,
        transactionCount: 89
      },
      {
        id: 3,
        username: 'new_entrepreneur',
        email: 'new@example.com',
        avatar: 'https://via.placeholder.com/100',
        status: 'active',
        createdAt: '2025-01-10T10:00:00Z',
        postCount: 5,
        transactionCount: 1
      },
      {
        id: 4,
        username: 'suspended_user',
        email: 'suspended@example.com',
        avatar: 'https://via.placeholder.com/100',
        status: 'suspended',
        createdAt: '2025-01-05T10:00:00Z',
        postCount: 23,
        transactionCount: 5
      }
    ];

    // 过滤和分页
    let filteredUsers = allUsers;
    if (status && status !== 'all') {
      filteredUsers = allUsers.filter(u => u.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    });
  }
});

// 更新用户状态
router.put('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 实际应该更新数据库
    res.json({
      success: true,
      message: `用户 ${id} 状态已更新为 ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新用户状态失败'
    });
  }
});

// 获取内容列表
router.get('/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const status = req.query.status as string;

    // 模拟帖子数据
    const allPosts: Post[] = [
      {
        id: 1,
        title: '如何从 0 到 1 打造 SaaS 产品',
        authorId: 1,
        authorName: 'tech_founder',
        type: 'free',
        status: 'published',
        createdAt: '2025-01-15T10:00:00Z',
        viewCount: 2340,
        likeCount: 156
      },
      {
        id: 2,
        title: '融资路演中的常见误区',
        authorId: 2,
        authorName: 'startup_mentor',
        type: 'paid',
        status: 'published',
        createdAt: '2025-01-14T10:00:00Z',
        viewCount: 890,
        likeCount: 67
      },
      {
        id: 3,
        title: '悬赏：寻找优秀的 UI 设计师',
        authorId: 1,
        authorName: 'tech_founder',
        type: 'bounty',
        status: 'published',
        createdAt: '2025-01-13T10:00:00Z',
        viewCount: 560,
        likeCount: 23
      },
      {
        id: 4,
        title: '待审核的产品推广内容',
        authorId: 3,
        authorName: 'new_entrepreneur',
        type: 'free',
        status: 'pending',
        createdAt: '2025-01-12T10:00:00Z',
        viewCount: 0,
        likeCount: 0
      }
    ];

    // 过滤和分页
    let filteredPosts = allPosts;
    if (type && type !== 'all') {
      filteredPosts = allPosts.filter(p => p.type === type);
    }
    if (status && status !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取内容列表失败'
    });
  }
});

// 删除帖子
router.delete('/posts/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 实际应该从数据库删除
    res.json({
      success: true,
      message: `帖子 ${id} 已删除`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除帖子失败'
    });
  }
});

// 批准待审核内容
router.put('/posts/:id/approve', (req, res) => {
  try {
    const { id } = req.params;

    // 实际应该更新数据库
    res.json({
      success: true,
      message: `帖子 ${id} 已批准发布`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '批准帖子失败'
    });
  }
});

// 获取交易记录
router.get('/transactions', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    // 模拟交易数据
    const allTransactions: Transaction[] = [
      {
        id: 1,
        userId: 1,
        userName: 'tech_founder',
        amount: 99,
        type: 'qa_payment',
        status: 'success',
        createdAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        userId: 2,
        userName: 'startup_mentor',
        amount: 299,
        type: 'bounty_payment',
        status: 'success',
        createdAt: '2025-01-14T10:00:00Z'
      },
      {
        id: 3,
        userId: 3,
        userName: 'new_entrepreneur',
        amount: 49,
        type: 'qa_payment',
        status: 'pending',
        createdAt: '2025-01-13T10:00:00Z'
      },
      {
        id: 4,
        userId: 1,
        userName: 'tech_founder',
        amount: 199,
        type: 'product_purchase',
        status: 'failed',
        createdAt: '2025-01-12T10:00:00Z'
      }
    ];

    // 过滤和分页
    let filteredTransactions = allTransactions;
    if (status && status !== 'all') {
      filteredTransactions = allTransactions.filter(t => t.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: filteredTransactions.length,
          totalPages: Math.ceil(filteredTransactions.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取交易记录失败'
    });
  }
});

// 处理退款
router.put('/transactions/:id/refund', (req, res) => {
  try {
    const { id } = req.params;

    // 实际应该调用支付接口并更新数据库
    res.json({
      success: true,
      message: `交易 ${id} 退款处理中`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '处理退款失败'
    });
  }
});

export default router;

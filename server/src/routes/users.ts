import express from 'express';

const router = express.Router();

// 模拟用户数据
interface User {
  id: number;
  username: string;
  avatar?: string;
  role: 'user' | 'merchant';
  createdAt: string;
}

const usersData: User[] = [
  { id: 1, username: 'tech_founder', avatar: 'https://i.pravatar.cc/150?img=1', role: 'merchant', createdAt: '2025-01-01T10:00:00Z' },
  { id: 2, username: 'startup_mentor', avatar: 'https://i.pravatar.cc/150?img=2', role: 'user', createdAt: '2025-01-02T10:00:00Z' },
  { id: 3, username: 'product_manager', avatar: 'https://i.pravatar.cc/150?img=3', role: 'merchant', createdAt: '2025-01-03T10:00:00Z' },
  { id: 4, username: 'dev_lead', avatar: 'https://i.pravatar.cc/150?img=4', role: 'user', createdAt: '2025-01-04T10:00:00Z' },
  { id: 5, username: 'marketing_guru', avatar: 'https://i.pravatar.cc/150?img=5', role: 'user', createdAt: '2025-01-05T10:00:00Z' },
  { id: 6, username: 'design_expert', avatar: 'https://i.pravatar.cc/150?img=6', role: 'merchant', createdAt: '2025-01-06T10:00:00Z' },
  { id: 7, username: 'growth_hacker', avatar: 'https://i.pravatar.cc/150?img=7', role: 'user', createdAt: '2025-01-07T10:00:00Z' },
  { id: 8, username: 'data_scientist', avatar: 'https://i.pravatar.cc/150?img=8', role: 'user', createdAt: '2025-01-08T10:00:00Z' },
  { id: 9, username: 'ai_researcher', avatar: 'https://i.pravatar.cc/150?img=9', role: 'merchant', createdAt: '2025-01-09T10:00:00Z' },
  { id: 10, username: 'saas_expert', avatar: 'https://i.pravatar.cc/150?img=10', role: 'user', createdAt: '2025-01-10T10:00:00Z' },
];

/**
 * 获取用户列表（管理后台）
 * GET /api/v1/users
 * Query: {
 *   page?: number,
 *   pageSize?: number
 * }
 */
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const offset = (page - 1) * pageSize;
    const paginatedUsers = usersData.slice(offset, offset + pageSize);

    res.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        page,
        pageSize,
        total: usersData.length,
        totalPages: Math.ceil(usersData.length / pageSize)
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    });
  }
});

/**
 * 切换用户角色（管理后台）
 * PUT /api/v1/users/:id/role
 * Body: {
 *   role: 'user' | 'merchant'
 * }
 */
router.put('/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'merchant'].includes(role)) {
      return res.status(400).json({ error: '无效的角色' });
    }

    const user = usersData.find(u => u.id === Number(id));

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    user.role = role as 'user' | 'merchant';

    res.json({
      success: true,
      message: '用户角色更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户角色失败'
    });
  }
});

/**
 * 封禁用户（管理后台）
 * PUT /api/v1/users/:id/ban
 */
router.put('/:id/ban', (req, res) => {
  try {
    const { id } = req.params;

    const user = usersData.find(u => u.id === Number(id));

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 实际应该更新数据库中的状态，这里只是模拟
    res.json({
      success: true,
      message: '用户已封禁',
      user
    });
  } catch (error) {
    console.error('封禁用户失败:', error);
    res.status(500).json({
      success: false,
      error: '封禁用户失败'
    });
  }
});

export default router;

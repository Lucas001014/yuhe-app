import express from 'express';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../utils/mockData';

const router = express.Router();

/**
 * 获取所有类别（管理后台）
 * GET /api/v1/categories
 */
router.get('/', (req, res) => {
  try {
    const categories = getCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('获取类别列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取类别列表失败'
    });
  }
});

/**
 * 创建类别（管理后台）
 * POST /api/v1/categories
 * Body: {
 *   name: string
 * }
 */
router.post('/', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: '类别名称不能为空' });
    }

    const newCategory = addCategory(name.trim());

    res.json({
      success: true,
      message: '类别创建成功',
      category: newCategory
    });
  } catch (error) {
    console.error('创建类别失败:', error);
    res.status(500).json({
      success: false,
      error: '创建类别失败'
    });
  }
});

/**
 * 更新类别（管理后台）
 * PUT /api/v1/categories/:id
 * Body: {
 *   name: string
 * }
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: '类别名称不能为空' });
    }

    const updatedCategory = updateCategory(Number(id), name.trim());

    if (!updatedCategory) {
      return res.status(404).json({ error: '类别不存在' });
    }

    res.json({
      success: true,
      message: '类别更新成功',
      category: updatedCategory
    });
  } catch (error) {
    console.error('更新类别失败:', error);
    res.status(500).json({
      success: false,
      error: '更新类别失败'
    });
  }
});

/**
 * 删除类别（管理后台）
 * DELETE /api/v1/categories/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const deleted = deleteCategory(Number(id));

    if (!deleted) {
      return res.status(404).json({ error: '类别不存在' });
    }

    res.json({
      success: true,
      message: '类别删除成功'
    });
  } catch (error) {
    console.error('删除类别失败:', error);
    res.status(500).json({
      success: false,
      error: '删除类别失败'
    });
  }
});

export default router;

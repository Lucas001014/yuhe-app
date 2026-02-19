import express from 'express';
const router = express.Router();

// 文本审核（模拟）
router.post('/text-audit', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.json({ code: -1, msg: '内容不能为空' });
    }

    // 简单的敏感词过滤（生产环境应使用阿里云内容安全）
    const forbiddenWords = ['赌博', '色情', '诈骗', '毒品'];
    for (const word of forbiddenWords) {
      if (content.includes(word)) {
        return res.json({ code: -1, msg: '内容违规，禁止发布' });
      }
    }

    res.json({ code: 0, msg: '内容审核通过' });
  } catch (error) {
    console.error('文本审核失败：', error);
    res.json({ code: -1, msg: '审核失败' });
  }
});

// 图片审核（模拟）
router.post('/image-audit', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.json({ code: -1, msg: '图片URL不能为空' });
    }

    // 生产环境应使用阿里云内容安全进行实际审核
    // 这里只是模拟，直接通过
    console.log(`审核图片：${imageUrl}`);

    res.json({ code: 0, msg: '图片审核通过' });
  } catch (error) {
    console.error('图片审核失败：', error);
    res.json({ code: -1, msg: '审核失败' });
  }
});

export default router;

import express from 'express';

const router = express.Router();

// 文本审核（简化实现，生产环境应接入阿里云内容安全等第三方服务）
router.post('/text-audit', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ code: -1, msg: '内容不能为空' });
    }

    // TODO: 实际应调用阿里云内容安全API
    // 这里做一个简单的关键词过滤示例
    const sensitiveWords = ['敏感词1', '敏感词2', '敏感词3'];
    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        return res.status(400).json({ code: -1, msg: '内容违规，禁止发布' });
      }
    }

    console.log(`[内容审核] 文本审核通过: ${content.substring(0, 50)}...`);

    res.json({ code: 0, msg: '内容审核通过' });
  } catch (error: any) {
    console.error('文本审核失败：', error);
    res.status(500).json({ code: -1, msg: '审核失败', error: error.message });
  }
});

// 图片审核（简化实现，生产环境应接入阿里云内容安全等第三方服务）
router.post('/image-audit', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ code: -1, msg: '图片URL不能为空' });
    }

    // TODO: 实际应调用阿里云内容安全API
    console.log(`[内容审核] 图片审核通过: ${imageUrl}`);

    res.json({ code: 0, msg: '图片审核通过' });
  } catch (error: any) {
    console.error('图片审核失败：', error);
    res.status(500).json({ code: -1, msg: '审核失败', error: error.message });
  }
});

export default router;

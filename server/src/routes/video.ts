import express from 'express';
import { VideoGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = express.Router();

// 根据图片生成视频
router.post('/generate', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ code: -1, msg: 'imageUrl参数错误' });
    }

    // 提取请求头并传递给SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);

    // 初始化配置和客户端
    const config = new Config();
    const client = new VideoGenerationClient(config, customHeaders);

    // 构建内容：使用提供的图片作为first_frame
    const content = [
      {
        type: 'image_url' as const,
        image_url: {
          url: imageUrl,
        },
        role: 'first_frame' as const,
      },
      {
        type: 'text' as const,
        text: prompt || 'Camera slowly zooms in with gentle movement, cinematic style',
      },
    ];

    // 生成视频
    const response = await client.videoGeneration(content, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: 5,
      ratio: '16:9',
      resolution: '720p',
      generateAudio: false,
      watermark: false,
    });

    if (response.videoUrl) {
      res.json({
        code: 0,
        msg: '视频生成成功',
        data: {
          videoUrl: response.videoUrl,
          taskId: response.response.id,
          status: response.response.status,
        },
      });
    } else {
      res.status(500).json({
        code: -1,
        msg: '视频生成失败',
        error: response.response.error_message,
      });
    }
  } catch (error: any) {
    console.error('视频生成失败：', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误',
      error: error.message,
    });
  }
});

// 根据文本生成视频
router.post('/text-to-video', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ code: -1, msg: 'prompt参数错误' });
    }

    // 提取请求头并传递给SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);

    // 初始化配置和客户端
    const config = new Config();
    const client = new VideoGenerationClient(config, customHeaders);

    // 构建内容
    const content = [
      {
        type: 'text' as const,
        text: prompt,
      },
    ];

    // 生成视频
    const response = await client.videoGeneration(content, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: 5,
      ratio: '16:9',
      resolution: '720p',
      generateAudio: false,
      watermark: false,
    });

    if (response.videoUrl) {
      res.json({
        code: 0,
        msg: '视频生成成功',
        data: {
          videoUrl: response.videoUrl,
          taskId: response.response.id,
          status: response.response.status,
        },
      });
    } else {
      res.status(500).json({
        code: -1,
        msg: '视频生成失败',
        error: response.response.error_message,
      });
    }
  } catch (error: any) {
    console.error('视频生成失败：', error);
    res.status(500).json({
      code: -1,
      msg: '服务器错误',
      error: error.message,
    });
  }
});

export default router;

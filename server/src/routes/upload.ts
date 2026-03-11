import express from 'express';
import multer from 'multer';
import { S3Storage } from 'coze-coding-dev-sdk';

const router = express.Router();

// 初始化 S3Storage
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 配置 multer 用于接收文件
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      file.mimetype
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式（jpeg, jpg, png, gif, webp）'));
    }
  },
});

/**
 * 上传图片接口
 * POST /api/v1/upload
 * Body: multipart/form-data with 'file' field
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const file = req.file;

    // 确定文件扩展名
    const extname = file.originalname.split('.').pop() || 'jpg';
    const fileName = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}.${extname}`;

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: file.buffer,
      fileName: fileName,
      contentType: file.mimetype,
    });

    // 生成访问 URL
    const url = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400 * 30, // 30天有效期
    });

    res.json({
      success: true,
      url: url,
      key: fileKey,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  } catch (error: any) {
    console.error('上传失败:', error);
    res.status(500).json({ success: false, error: error.message || '上传失败' });
  }
});

/**
 * 批量上传图片接口
 * POST /api/v1/upload/multiple
 * Body: multipart/form-data with 'files' field (max 9 files)
 */
router.post('/multiple', upload.array('files', 9), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: '请选择要上传的文件' });
    }

    const uploadResults = [];

    for (const file of files) {
      try {
        const extname = file.originalname.split('.').pop() || 'jpg';
        const fileName = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}.${extname}`;

        const fileKey = await storage.uploadFile({
          fileContent: file.buffer,
          fileName: fileName,
          contentType: file.mimetype,
        });

        const url = await storage.generatePresignedUrl({
          key: fileKey,
          expireTime: 86400 * 30,
        });

        uploadResults.push({
          success: true,
          url: url,
          key: fileKey,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      } catch (error: any) {
        uploadResults.push({
          success: false,
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results: uploadResults,
      total: uploadResults.length,
      succeeded: uploadResults.filter((r) => r.success).length,
      failed: uploadResults.filter((r) => !r.success).length,
    });
  } catch (error: any) {
    console.error('批量上传失败:', error);
    res.status(500).json({ success: false, error: error.message || '批量上传失败' });
  }
});

export default router;

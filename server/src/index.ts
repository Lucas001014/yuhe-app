import express from "express";
import cors from "cors";
import { Pool } from 'pg';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import transactionsRouter from './routes/transactions';
import adminRouter from './routes/admin';
import orderRouter from './routes/order';
import walletRouter from './routes/wallet';
import withdrawRouter from './routes/withdraw';
import refundRouter from './routes/refund';
import iapRouter from './routes/iap';
import smsRouter from './routes/sms';
import auditRouter from './routes/audit';

const app = express();
const port = process.env.PORT || 9091;

// 数据库连接
let pool;
try {
  // 尝试使用环境变量中的连接信息
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (connectionString) {
    pool = new Pool({ connectionString });
    console.log('使用 DATABASE_URL 连接数据库');
  } else {
    // 使用默认配置
    pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
    });
    console.log('使用默认配置连接数据库');
  }
} catch (error) {
  console.error('数据库连接池创建失败:', error);
}

// 测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功:', res.rows[0]);
  }
});

// 将数据库连接挂载到请求对象
app.use((req, res, next) => {
  (req as any).db = pool;
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 路由
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/withdraw', withdrawRouter);
app.use('/api/v1/refund', refundRouter);
app.use('/api/v1/iap', iapRouter);
app.use('/api/v1/sms', smsRouter);
app.use('/api/v1/audit', auditRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

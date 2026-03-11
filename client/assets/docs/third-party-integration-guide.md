# 遇合 - 第三方服务对接指南

**文档版本**：v1.0
**创建日期**：2026年3月11日
**适用场景**：应用商店上架前的第三方服务配置

---

## 概述

本文档详细说明了"遇合"应用需要对接的第三方服务、对接步骤和注意事项。

---

## 📌 已对接服务

### 1. 对象存储服务（S3 兼容）

**用途**：存储用户上传的图片和视频

**当前状态**：✅ 已对接

**对接位置**：
```
server/src/routes/upload.ts
```

**配置信息**：
- 存储桶：已创建
- 访问密钥：已配置
- 签名 URL：有效期 30 天

**支持的格式**：
- 图片：jpeg, jpg, png, gif, webp
- 单文件最大：10MB
- 批量上传：最多 9 张

---

### 2. 数据库服务（PostgreSQL）

**用途**：存储用户数据、帖子数据等

**当前状态**：✅ 已对接

**配置信息**：
- 数据库类型：PostgreSQL
- 连接字符串：已配置（环境变量 PGDATABASE_URL）

---

## 🔧 需要对接的服务

### 1. 支付服务（必需，如果有付费功能）

**用途**：处理付费内容购买

**当前状态**：⚠️ 需要对接

**推荐方案**：

#### 方案 A：微信支付（国内用户首选）

**注册步骤**：

1. **注册微信支付商户号**
   - 访问：https://pay.weixin.qq.com/
   - 注册微信支付商户账号
   - 提交资质审核（营业执照、法人身份证等）
   - 等待审核通过（1-3 天）

2. **获取 API 密钥**
   - 登录微信支付商户平台
   - 进入"账户中心" → "API安全"
   - 设置 API 密钥（32位字符）
   - 下载 API 证书

3. **配置应用**
   - 在微信支付商户平台添加应用
   - 填写应用基本信息
   - 获取应用 ID（AppID）

**后端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/server
pnpm add wechatpay-node-v3
```

2. **创建支付服务**
```typescript
// server/src/services/payment/wechat.ts
import { Wechatpay, Formatter } from 'wechatpay-node-v3';

const pay = new Wechatpay({
  appid: process.env.WECHAT_APP_ID,
  mchid: process.env.WECHAT_MCH_ID,
  public_key: process.env.WECHAT_PUBLIC_KEY,
  private_key: process.env.WECHAT_PRIVATE_KEY,
});

export async function createPayment(orderId: string, amount: number) {
  const params = {
    appid: process.env.WECHAT_APP_ID,
    mchid: process.env.WECHAT_MCH_ID,
    description: '购买付费内容',
    out_trade_no: orderId,
    notify_url: 'https://api.yuhe.app/v1/payment/wechat/notify',
    amount: {
      total: amount * 100, // 单位：分
      currency: 'CNY',
    },
  };

  const result = await pay.transactions_jsapi(params);
  return result;
}

export async function verifyPayment(data: any) {
  return pay.verifySign(data);
}
```

3. **创建支付接口**
```typescript
// server/src/routes/payment.ts
import express from 'express';
import { createPayment } from '../services/payment/wechat';

const router = express.Router();

// 创建支付订单
router.post('/create', async (req, res) => {
  const { orderId, amount } = req.body;
  const payment = await createPayment(orderId, amount);
  res.json({ success: true, payment });
});

// 支付回调
router.post('/wechat/notify', async (req, res) => {
  const isValid = await verifyPayment(req.body);
  if (isValid) {
    // 更新订单状态
    // 返回成功
  }
  res.json({ code: 'SUCCESS', message: '成功' });
});

export default router;
```

4. **配置环境变量**
```bash
# server/.env
WECHAT_APP_ID=你的微信AppID
WECHAT_MCH_ID=你的商户号
WECHAT_PUBLIC_KEY=你的公钥
WECHAT_PRIVATE_KEY=你的私钥
```

**前端集成步骤**：

1. **在应用内拉起支付**
```typescript
// client/screens/payment/index.tsx
import * as WeChat from 'react-native-wechat-lib';

const handlePayment = async () => {
  try {
    const result = await fetch(`${API_BASE_URL}/api/v1/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    });

    const data = await result.json();
    const payment = data.payment;

    // 拉起微信支付
    const payResult = await WeChat.pay({
      partnerId: payment.mchid,
      prepayId: payment.prepay_id,
      nonceStr: payment.nonce_str,
      timeStamp: payment.time_stamp,
      package: payment.package,
      sign: payment.sign,
    });

    if (payResult.success) {
      alert('支付成功');
      // 刷新页面
    }
  } catch (error) {
    alert('支付失败');
  }
};
```

---

#### 方案 B：支付宝（国内用户必备）

**注册步骤**：

1. **注册支付宝商户**
   - 访问：https://opendocs.alipay.com/
   - 注册支付宝开放平台账号
   - 创建应用并提交审核
   - 签约"手机网站支付"或"APP支付"

2. **获取应用密钥**
   - 进入支付宝开放平台
   - 生成应用密钥（RSA2）
   - 上传应用公钥

**后端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/server
pnpm add alipay-sdk
```

2. **创建支付服务**
```typescript
// server/src/services/payment/alipay.ts
import AlipaySdk from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
});

export async function createPayment(orderId: string, amount: number) {
  const result = await alipaySdk.exec('alipay.trade.app.pay', {
    notify_url: 'https://api.yuhe.app/v1/payment/alipay/notify',
    bizContent: {
      out_trade_no: orderId,
      total_amount: amount,
      subject: '购买付费内容',
    },
  });

  return result;
}
```

**前端集成步骤**：

使用 `react-native-alipay` 库。

---

#### 方案 C：Apple IAP（iOS 推荐）

**注册步骤**：

1. **配置 App 内购买**
   - 登录 App Store Connect
   - 选择应用 → "功能" → "App 内购买"
   - 创建消耗型商品或非消耗型商品
   - 填写商品信息、价格等
   - 提交审核

**后端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/server
pnpm add in-app-purchase
```

2. **创建验证接口**
```typescript
// server/src/routes/payment.ts
import inAppPurchase from 'in-app-purchase';

// 验证收据
router.post('/ios/verify', async (req, res) => {
  const { receiptData } = req.body;

  try {
    const isValid = await inAppPurchase.validate({
      'receipt-data': receiptData,
      password: process.env.IAP_SHARED_SECRET,
    });

    if (isValid) {
      // 更新订单状态
      res.json({ success: true });
    }
  } catch (error) {
    res.json({ success: false, error });
  }
});
```

**前端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/client
npx expo install expo-in-app-purchases
```

2. **实现购买流程**
```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// 初始化
await InAppPurchases.setIAPConnectionState(true);

// 获取商品
const { responseCode, results } = await InAppPurchases.getProductsAsync([
  'com.yuhe.app.premium1',
]);

// 购买
const purchase = await InAppPurchases.purchaseItemAsync('com.yuhe.app.premium1');

// 验证收据
await fetch(`${API_BASE_URL}/api/v1/payment/ios/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ receiptData: purchase.receipt }),
});
```

---

### 2. 推送服务（推荐）

**用途**：向用户推送消息通知

**当前状态**：⚠️ 需要对接

**推荐方案**：

#### 方案 A：极光推送（国内用户推荐）

**注册步骤**：

1. **注册极光推送**
   - 访问：https://www.jiguang.cn/
   - 注册账号并登录
   - 创建应用
   - 获取 AppKey 和 Master Secret

**后端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/server
pnpm add jpush-sdk
```

2. **创建推送服务**
```typescript
// server/src/services/push/jpush.ts
import JPush from 'jpush-sdk';

const jpush = new JPush({
  appKey: process.env.JPUSH_APP_KEY,
  masterSecret: process.env.JPUSH_MASTER_SECRET,
});

export async function sendPush(registrationId: string, message: string) {
  try {
    await jpush.push().setPlatform('all')
      .setAudience(JPush.registration_id(registrationId))
      .setNotification('遇合', message)
      .send();

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
```

**前端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/client
npx expo install expo-notifications
```

2. **获取推送 Token**
```typescript
import * as Notifications from 'expo-notifications';

// 获取推送 Token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-project-id',
});

// 发送 Token 到服务器
await fetch(`${API_BASE_URL}/api/v1/user/device`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
```

---

#### 方案 B：FCM（Firebase Cloud Messaging，国际用户推荐）

**注册步骤**：

1. **注册 Firebase**
   - 访问：https://firebase.google.com/
   - 创建新项目
   - 添加 Android/iOS 应用
   - 下载配置文件

**集成步骤**：

参考 Firebase 官方文档：https://firebase.google.com/docs/cloud-messaging

---

### 3. 内容审核服务（推荐）

**用途**：自动审核用户发布的内容

**当前状态**：⚠️ 当前使用本地规则，建议对接专业服务

**推荐方案**：

#### 方案 A：阿里云内容安全（国内推荐）

**注册步骤**：

1. **注册阿里云**
   - 访问：https://www.aliyun.com/
   - 注册并登录
   - 开通"内容安全"服务
   - 获取 AccessKey

**后端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/server
pnpm add @alicloud/green20220302
```

2. **创建审核服务**
```typescript
// server/src/services/audit/aliyun.ts
import Green, * as $Green from '@alicloud/green20220302';

const green = new Green({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  endpoint: 'green-cip.cn-shanghai.aliyuncs.com',
});

export async function auditText(text: string) {
  try {
    const result = await green.textModeration({
      Service: 'baselineCheck',
      ServiceParameters: JSON.stringify({
        content: text,
      }),
    });

    return {
      passed: result.Data.Result === 'pass',
      reason: result.Data.Labels?.join(','),
    };
  } catch (error) {
    console.error('内容审核失败', error);
    return { passed: false, reason: '审核服务异常' };
  }
}

export async function auditImage(imageUrl: string) {
  try {
    const result = await green.imageModeration({
      Service: 'baselineCheck',
      ServiceParameters: JSON.stringify({
        imageUrl: imageUrl,
      }),
    });

    return {
      passed: result.Data.Result === 'pass',
      reason: result.Data.Labels?.join(','),
    };
  } catch (error) {
    console.error('图片审核失败', error);
    return { passed: false, reason: '审核服务异常' };
  }
}
```

3. **更新审核逻辑**
```typescript
// server/src/routes/posts.ts
import { auditText, auditImage } from '../services/audit/aliyun';

async function auditContent(content: string, images: string[]) {
  // 审核文本
  const textResult = await auditText(content);
  if (!textResult.passed) {
    return { passed: false, reason: textResult.reason };
  }

  // 审核图片
  for (const imageUrl of images) {
    const imageResult = await auditImage(imageUrl);
    if (!imageResult.passed) {
      return { passed: false, reason: imageResult.reason };
    }
  }

  return { passed: true };
}
```

**配置环境变量**：
```bash
# server/.env
ALIYUN_ACCESS_KEY_ID=你的AccessKey ID
ALIYUN_ACCESS_KEY_SECRET=你的AccessKey Secret
```

---

#### 方案 B：腾讯云天御（国内推荐）

**注册步骤**：

1. **注册腾讯云**
   - 访问：https://cloud.tencent.com/
   - 开通"天御"内容安全服务
   - 获取 SecretId 和 SecretKey

**集成步骤**：

参考腾讯云官方文档：https://cloud.tencent.com/document/product/1124

---

### 4. 统计服务（推荐）

**用途**：统计分析用户行为和应用数据

**当前状态**：⚠️ 需要对接

**推荐方案**：

#### 方案 A：友盟统计（国内推荐）

**注册步骤**：

1. **注册友盟**
   - 访问：https://www.umeng.com/
   - 注册并登录
   - 创建应用
   - 获取 AppKey

**前端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/client
npx expo install react-native-umeng
```

2. **初始化统计**
```typescript
import Umeng from 'react-native-umeng';

// 初始化
Umeng.init({
  appKey: process.env.UMENG_APP_KEY,
  channel: 'App Store',
});

// 页面统计
Umeng.onPageStart('Home');
Umeng.onPageEnd('Home');

// 事件统计
Umeng.onEvent('click_like', { postId: 123 });
```

---

#### 方案 B：Google Analytics（国际用户推荐）

**注册步骤**：

1. **注册 Google Analytics**
   - 访问：https://analytics.google.com/
   - 创建账号和媒体资源
   - 获取跟踪 ID

**集成步骤**：

参考 Google Analytics 官方文档

---

### 5. 错误监控服务（推荐）

**用途**：监控应用崩溃和错误

**当前状态**：⚠️ 需要对接

**推荐方案**：

#### 方案 A：Sentry（推荐）

**注册步骤**：

1. **注册 Sentry**
   - 访问：https://sentry.io/
   - 注册并登录
   - 创建项目
   - 获取 DSN

**前端集成步骤**：

1. **安装 SDK**
```bash
cd /workspace/projects/client
npx expo install @sentry/react-native
```

2. **初始化 Sentry**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

**后端集成步骤**：

```bash
cd /workspace/projects/server
pnpm add @sentry/node

# server/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

---

## 📋 对接优先级

### 第一优先级（必需）

1. **支付服务**
   - 如果应用有付费功能
   - 微信支付 + 支付宝（国内）
   - Apple IAP（iOS）

### 第二优先级（推荐）

2. **推送服务**
   - 提升用户体验
   - 增加用户活跃度

3. **内容审核服务**
   - 保障社区质量
   - 降低人工审核成本

### 第三优先级（可选）

4. **统计服务**
   - 了解用户行为
   - 优化产品功能

5. **错误监控服务**
   - 及时发现和修复问题
   - 提升应用稳定性

---

## 💰 费用说明

| 服务 | 费用类型 | 估算费用 |
|------|---------|---------|
| 微信支付 | 交易手续费 | 0.6% |
| 支付宝 | 交易手续费 | 0.6% |
| Apple IAP | 交易手续费 | 15-30% |
| 极光推送 | 按量计费 | 免费/基础版 |
| 阿里云内容安全 | 按量计费 | 0.004元/次 |
| 友盟统计 | 免费 | 免费 |
| Sentry | 按错误量计费 | 免费版1万错误/月 |

---

## 🔗 相关链接

- 微信支付：https://pay.weixin.qq.com/
- 支付宝：https://opendocs.alipay.com/
- Apple IAP：https://developer.apple.com/in-app-purchase/
- 极光推送：https://www.jiguang.cn/
- 阿里云内容安全：https://www.aliyun.com/product/lvwang
- 腾讯云天御：https://cloud.tencent.com/product/tms
- 友盟统计：https://www.umeng.com/
- Sentry：https://sentry.io/

---

## 📞 技术支持

如果对接过程中遇到问题，请联系：

**技术支持**
- 邮箱：support@yuhe.app
- 电话：400-xxx-xxxx

---

最后更新：2026年3月11日
遇合团队

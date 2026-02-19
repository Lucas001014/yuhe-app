# SoloCoder App Store 上架指南

本文档说明如何将 SoloCoder 应用构建并提交到 Apple App Store。

## 前置条件

### 1. Apple 开发者账号
- 注册 Apple Developer Program（费用 $99/年）
- 下载并安装 Xcode（推荐最新版本）
- 配置开发者和发布证书

### 2. Expo 账号
- 注册 Expo 账号（免费）
- 在 Expo 控制台中创建新项目

### 3. 环境配置
- 安装 Node.js（推荐 v18+）
- 安装 Expo CLI：`npm install -g eas-cli`
- 登录 Expo：`eas login`

## 第一步：配置项目信息

### 1. 更新 app.config.ts

已配置以下信息（已完成）：
- 应用名称：SoloCoder - 创业者社区
- Bundle Identifier：`com.solocoder.app`
- 版本号：1.0.0
- 构建号：1
- 图标和启动屏
- 权限说明

### 2. 配置 EAS

编辑 `eas.json` 文件，填写以下信息：
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",  // 替换为您的 Apple ID
        "ascAppId": "YOUR_ASC_APP_ID",            // 在 App Store Connect 中创建后获取
        "appleTeamId": "YOUR_TEAM_ID"             // 在 Apple Developer 账户中获取
      }
    }
  }
}
```

## 第二步：在 App Store Connect 创建应用

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 点击"我的 App" → "创建新 App"
3. 填写应用信息：
   - 平台：iOS
   - 名称：SoloCoder
   - 主要语言：简体中文
   - 套装 ID：`com.solocoder.app`（需要在 Apple Developer 中创建）
   - SKU：`SOL001`（唯一标识符）
   - 用户访问权限：完全访问权限

## 第三步：构建应用

### 1. 初始化 EAS（首次使用）

在项目根目录执行：
```bash
cd client
eas build:configure
```

### 2. 测试构建（Preview）

先运行一次测试构建，确保配置正确：
```bash
eas build --platform ios --profile preview
```

### 3. 生产构建

测试通过后，运行生产构建：
```bash
eas build --platform ios --profile production
```

构建过程可能需要 30-60 分钟，具体时间取决于应用大小和服务器负载。

## 第四步：提交到 App Store

构建成功后，可以直接提交：

### 方式一：构建后自动提交
```bash
eas submit --platform ios --latest
```

### 方式二：手动提交
1. 在 Expo 控制台下载构建的 `.ipa` 文件
2. 使用 Xcode 的 Application Loader 上传
3. 或使用 Transporter 工具上传

## 第五步：App Store Connect 配置

提交成功后，需要在 App Store Connect 中完成以下配置：

### 1. 应用信息

- **应用图标**：上传 1024x1024 像素的图标
- **截图**：上传各尺寸设备截图（必需）
  - 6.7 英寸 iPhone：1290x2796
  - 6.5 英寸 iPhone：1242x2688
  - 5.5 英寸 iPhone：1242x2208
  - iPad Pro：2048x2732

### 2. 应用描述

使用 `docs/app-description.md` 中的内容。

### 3. 关键词

填入以下关键词：
```
创业, 创业者, 知识付费, 问答, 悬赏, 产品推广, 社交, 经验分享
```

### 4. 支持网址
- 营销网址：`https://solocoder.app`
- 隐私政策网址：需要托管 `docs/privacy-policy.md`
- 支持网址：`https://solocoder.app/support`

### 5. 内容权利

- 应用必须完全拥有所有内容的权利
- 如使用第三方素材，需获得授权

### 6. App 隐私

填写 App 隐私信息，参考 `PrivacyInfo.xcprivacy` 文件。

### 7. 审核信息

- **联系信息**：您的真实联系信息
- **演示账号**：如需登录才能使用，提供测试账号
- **备注**：说明应用的核心功能和特色

## 第六步：等待审核

提交后，Apple 会进行审核，通常需要 1-3 个工作日。

### 审核常见问题

1. **功能不完整**
   - 确保 App 的所有核心功能都可正常使用
   - 所有按钮都有响应，无"开发中"的占位符

2. **缺少隐私政策**
   - 必须提供隐私政策链接
   - 隐私政策必须详细说明数据收集和使用

3. **权限使用不当**
   - 只申请必要的权限
   - 在首次使用时明确告知用户为什么需要该权限

4. **内容违规**
   - 确保所有内容符合 Apple 审核指南
   - 不得包含违法、暴力、色情等内容

## 优化建议

### 1. 性能优化

- 减少应用启动时间
- 优化图片和资源加载
- 使用懒加载和缓存策略

### 2. 用户体验

- 确保界面流畅，无明显卡顿
- 提供清晰的用户引导
- 错误提示友好易懂

### 3. 多语言支持

考虑添加多语言支持：
- 简体中文（必需）
- 英文（推荐）
- 其他语言（根据目标用户）

## 常见问题

### Q1: 构建失败怎么办？

检查以下内容：
- Bundle Identifier 是否在 Apple Developer 中创建
- 证书和配置文件是否正确配置
- `app.config.ts` 中的配置是否正确
- 查看构建日志，定位具体错误

### Q2: 如何更新应用？

1. 修改 `app.config.ts` 中的版本号
2. 修改 `eas.json` 中的 `autoIncrement` 为 `true`
3. 重新构建和提交

### Q3: 如何测试 TestFlight？

1. 在 App Store Connect 中创建内部测试组
2. 添加测试人员
3. 分享 TestFlight 链接
4. 测试人员安装 TestFlight 应用并下载测试版

### Q4: 如何处理审核被拒？

仔细阅读 Apple 的拒绝理由，针对性修改：
- 通常是功能、内容或隐私政策问题
- 修改后重新提交审核
- 如有疑问，可通过 App Store Connect 联系 Apple

## 联系支持

如在上架过程中遇到问题，可以：
- 查看 [Expo 官方文档](https://docs.expo.dev)
- 查看 [Apple 审核指南](https://developer.apple.com/app-store/review/guidelines/)
- 联系 Expo 支持团队

---

**祝您上架成功！**

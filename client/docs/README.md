# App Store 上架配置文件

本目录包含 SoloCoder 应用上架 App Store 所需的所有配置文件和文档。

## 📁 文件结构

```
docs/
├── app-description.md           # 应用描述（用于 App Store）
├── privacy-policy.md            # 隐私政策
├── terms-of-service.md          # 服务条款
└── appstore-submission-guide.md # 上架指南
```

## 📋 配置清单

### ✅ 已完成的配置

- [x] 应用基础信息配置（`app.config.ts`）
  - [x] 应用名称
  - [x] Bundle Identifier
  - [x] 版本号和构建号
  - [x] 图标和启动屏配置

- [x] iOS 权限说明（`Info.plist`）
  - [x] 相机访问权限
  - [x] 相册访问权限
  - [x] 麦克风访问权限

- [x] 隐私清单（`PrivacyInfo.xcprivacy`）
  - [x] API 使用类型
  - [x] 数据收集类型
  - [x] 跟踪声明

- [x] EAS 构建配置（`eas.json`）
  - [x] 开发环境配置
  - [x] 预览环境配置
  - [x] 生产环境配置
  - [x] 提交配置

- [x] 应用文档
  - [x] 应用描述
  - [x] 隐私政策
  - [x] 服务条款
  - [x] 上架指南

## 🔧 需要您填写的信息

### 1. Apple Developer 配置

在提交前，您需要：

#### 创建 App ID
1. 登录 [Apple Developer](https://developer.apple.com)
2. 进入 Identifiers → App IDs
3. 创建新的 App ID
   - Bundle ID：`com.solocoder.app`
   - 选择需要的权限（Camera, Photo Library, Microphone, Location）

#### 创建证书和配置文件
1. 开发证书（用于测试）
2. 发布证书（用于 App Store）
3. 相应的 Provisioning Profile

### 2. EAS 配置

编辑 `../eas.json`，填写以下信息：

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",  // 您的 Apple ID
        "ascAppId": "YOUR_ASC_APP_ID",            // 在 App Store Connect 中创建应用后获取
        "appleTeamId": "YOUR_TEAM_ID"             // 在 Apple Developer 账户中获取
      }
    }
  }
}
```

### 3. App Store Connect 配置

在 [App Store Connect](https://appstoreconnect.apple.com) 中：

1. 创建新应用
   - 名称：SoloCoder
   - 套装 ID：`com.solocoder.app`
   - SKU：`SOL001`

2. 填写应用信息
   - 使用 `app-description.md` 中的内容
   - 上传应用图标（1024x1024）
   - 上传各尺寸截图

3. 配置隐私政策
   - 将 `privacy-policy.md` 托管到您的服务器
   - 填写隐私政策 URL

4. 配置 App 隐私
   - 参考 `PrivacyInfo.xcprivacy` 中的配置
   - 填写数据收集和使用说明

## 🚀 快速开始

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录 Expo

```bash
eas login
```

### 3. 配置项目

```bash
cd ..
eas build:configure
```

### 4. 构建应用

```bash
# 测试构建
eas build --platform ios --profile preview

# 生产构建
eas build --platform ios --profile production
```

### 5. 提交到 App Store

```bash
eas submit --platform ios --latest
```

## 📖 详细文档

请查看以下文档了解详细信息：

- [上架指南](./appstore-submission-guide.md) - 完整的上架步骤说明
- [应用描述](./app-description.md) - App Store 应用描述
- [隐私政策](./privacy-policy.md) - 用户隐私保护说明
- [服务条款](./terms-of-service.md) - 用户服务条款

## ⚠️ 注意事项

### 审核要点

1. **功能完整性**
   - 确保所有核心功能都可用
   - 无"开发中"或占位符
   - 所有按钮都有响应

2. **隐私政策**
   - 必须提供隐私政策链接
   - 详细说明数据收集和使用
   - 符合 Apple 隐私政策要求

3. **权限使用**
   - 只申请必要的权限
   - 首次使用时明确说明用途
   - 提供拒绝权限的备选方案

4. **内容合规**
   - 遵守 Apple 审核指南
   - 不得包含违法内容
   - 不得诱导用户付费

### 审核时间

- 首次提交：1-3 个工作日
- 更新提交：1-2 个工作日
- 如被拒绝：根据问题修改后重新提交

## 📞 技术支持

如遇到问题，可以：

1. 查看 [Expo 官方文档](https://docs.expo.dev)
2. 查看 [Apple 审核指南](https://developer.apple.com/app-store/review/guidelines/)
3. 查看 [EAS 构建文档](https://docs.expo.dev/build/introduction/)
4. 联系 SoloCoder 技术支持

## 📝 更新记录

- 2025-01-01：初始版本，完成基础配置和文档

---

**SoloCoder Team**

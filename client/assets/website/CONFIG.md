# 遇合官网配置说明

## ⚡ 快速配置下载链接

打开 `index.html` 文件，找到以下配置并修改：

```javascript
// 第一步：修改 APK 下载链接
const APK_DOWNLOAD_URL = 'https://github.com/YOUR_USERNAME/yuhe/releases/latest/download/yuhe.apk';
```

### 如何获取下载链接？

#### 方式1：使用 GitHub Releases（推荐）

1. 在 GitHub 仓库创建 Release 并上传 APK
2. 获取直接下载链接格式：
   ```
   https://github.com/用户名/仓库名/releases/download/标签名/文件名.apk
   ```
3. 使用 `latest` 可以自动获取最新版本：
   ```
   https://github.com/用户名/仓库名/releases/latest/download/yuhe.apk
   ```

#### 方式2：使用 CDN 或对象存储

如果有自己的服务器或 CDN：
```javascript
const APK_DOWNLOAD_URL = 'https://your-cdn.com/yuhe.apk';
```

---

## 🚀 部署更新

### 如果使用 Vercel

1. 将修改后的网站文件推送到 GitHub 仓库
2. Vercel 会自动部署更新
3. 或者手动触发重新部署

### 如果使用 GitHub Pages

1. 提交并推送更改
2. 等待 1-2 分钟自动部署

### 如果使用 Netlify

1. 拖拽上传新文件，或
2. Git 推送自动部署

---

## 📋 完整流程

### 自动构建 + 自动发布（推荐）

项目已配置 GitHub Actions 自动构建流程：

1. **推送代码** → 触发 GitHub Actions
2. **自动构建** → EAS Build 构建 APK
3. **自动发布** → 创建 GitHub Release 并上传 APK
4. **用户下载** → 点击官网下载按钮直接获取

### 手动发布

1. 本地构建 APK：
   ```bash
   cd client && eas build --platform android --profile preview
   ```
2. 下载构建好的 APK
3. 在 GitHub 仓库创建 Release
4. 上传 APK 文件
5. 更新官网下载链接

---

## ⚠️ 常见问题

### Q: 点击下载后没有反应？

A: 检查下载链接是否正确配置。确保 `APK_DOWNLOAD_URL` 指向有效的 APK 文件。

### Q: 提示"应用即将上线"？

A: 这说明线上版本是旧代码。请将修改后的网站文件重新部署。

### Q: 如何测试下载链接是否有效？

A: 在浏览器中直接访问下载链接，如果开始下载则配置正确。

---

## 🔗 iOS 配置

当 iOS 版本上架 App Store 后：

```javascript
const IOS_DOWNLOAD_URL = 'https://apps.apple.com/app/yuhe/id123456789';
```

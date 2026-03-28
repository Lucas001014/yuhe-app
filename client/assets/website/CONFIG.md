# 遇合官网配置说明

## 下载功能配置

### 1. 配置 GitHub 仓库地址

打开 `index.html` 文件，找到以下代码并修改：

```javascript
const GITHUB_REPO = 'YOUR_USERNAME/yuhe'; // 替换为实际的 GitHub 用户名/仓库名
```

例如，如果你的 GitHub 用户名是 `yuhe-app`，仓库地址是 `https://github.com/yuhe-app/yuhe`，则修改为：

```javascript
const GITHUB_REPO = 'yuhe-app/yuhe';
```

### 2. GitHub Actions 自动构建

项目已配置 GitHub Actions 自动构建流程，每次推送到 `main` 分支时：

1. 自动触发 EAS Build 构建 APK
2. 构建完成后自动创建 GitHub Release
3. APK 文件会自动上传到 Release 中

### 3. 下载流程

用户点击"下载应用"按钮后：

1. 官网通过 GitHub API 获取最新 Release 信息
2. 自动显示最新版本号和文件大小
3. 点击下载按钮直接下载 APK

### 4. 手动发布 Release

如果需要手动发布，可以：

1. 在本地构建 APK：`cd client && eas build --platform android --profile preview`
2. 下载构建好的 APK
3. 在 GitHub 仓库页面创建新的 Release
4. 上传 APK 文件

## 环境变量配置

### GitHub Secrets（在仓库设置中配置）

| 变量名 | 说明 |
|--------|------|
| `EXPO_TOKEN` | Expo 账号的访问令牌（从 https://expo.dev/accounts/[username]/settings/access-tokens 获取）|

## 常见问题

### Q: 下载按钮点击后跳转到 GitHub 页面？

A: 这是因为还没有配置正确的 GitHub 仓库地址，或者还没有发布任何 Release。请先配置 `GITHUB_REPO` 变量，并确保至少有一个 Release。

### Q: 如何更新下载链接？

A: 下载链接是动态获取的，每次构建都会自动更新。无需手动修改。

### Q: iOS 版本什么时候上线？

A: iOS 版本需要上架 App Store，请关注官网公告。上架后需要更新 `iosDownload` 的链接为 App Store 地址。

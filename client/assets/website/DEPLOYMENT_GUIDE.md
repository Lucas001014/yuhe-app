# 遇合官网部署指南

**文档版本**：v1.0
**创建日期**：2026年3月11日

---

## 📁 网站文件位置

所有网站文件位于：`client/assets/website/`

**文件列表**：
- `index.html` - 首页
- `privacy.html` - 隐私政策
- `terms.html` - 用户协议
- `support.html` - 联系我们
- `favicon.png` - 网站图标

---

## 🚀 快速部署方案

### 方案 1：GitHub Pages（推荐，免费）

**优点**：
- 完全免费
- 支持 HTTPS
- 稳定可靠
- 自定义域名

**步骤**：

#### 1. 创建 GitHub 仓库

```bash
# 1. 登录 GitHub：https://github.com
# 2. 点击右上角 "+" → "New repository"
# 3. 填写仓库信息：
#    - Repository name: yuhe-website
#    - Description: 遇合官网
#    - 选择 Public
#    - 勾选 "Add a README file"
# 4. 点击 "Create repository"
```

#### 2. 上传网站文件

**方法 A：使用 Git 命令行**

```bash
# 进入网站目录
cd /workspace/projects/client/assets/website

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 遇合官网"

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/yuhe-website.git

# 推送到 GitHub
git push -u origin main
```

**方法 B：手动上传**

1. 在 GitHub 仓库页面点击 "uploading an existing file"
2. 将 `client/assets/website/` 目录下的所有文件拖拽上传
3. 点击 "Commit changes"

#### 3. 启用 GitHub Pages

```bash
# 1. 进入仓库页面
# 2. 点击 "Settings"
# 3. 左侧菜单找到 "Pages"
# 4. Source 选择 "Deploy from a branch"
# 5. Branch 选择 "main"，文件夹选择 "/ (root)"
# 6. 点击 "Save"
```

#### 4. 访问网站

- **默认 URL**：`https://YOUR_USERNAME.github.io/yuhe-website/`
- 等待 1-2 分钟部署完成

#### 5. 自定义域名（可选）

```bash
# 1. 购买域名（如阿里云、腾讯云）
# 2. 在 GitHub Pages 设置中添加自定义域名
# 3. 在域名服务商处添加 CNAME 记录：
#    - 主机记录：www
#    - 记录类型：CNAME
#    - 记录值：YOUR_USERNAME.github.io
```

---

### 方案 2：Vercel（推荐，免费）

**优点**：
- 完全免费
- 自动部署
- CDN 加速
- 自定义域名

**步骤**：

#### 1. 注册 Vercel

```bash
# 访问：https://vercel.com
# 使用 GitHub 账号登录
```

#### 2. 导入项目

```bash
# 1. 点击 "New Project"
# 2. 选择 "Import Git Repository"
# 3. 选择你的 GitHub 仓库 yuhe-website
# 4. 点击 "Import"
# 5. Framework Preset 选择 "Other"
# 6. 点击 "Deploy"
```

#### 3. 访问网站

- **默认 URL**：`https://yuhe-website.vercel.app/`
- 自动部署，每次推送代码都会自动更新

---

### 方案 3：Netlify（免费）

**优点**：
- 完全免费
- 拖拽部署
- CDN 加速
- 自定义域名

**步骤**：

#### 1. 注册 Netlify

```bash
# 访问：https://www.netlify.com
# 使用 GitHub 账号登录
```

#### 2. 部署网站

**方法 A：拖拽部署**

```bash
# 1. 登录 Netlify
# 2. 点击 "Sites" → "Add new site" → "Deploy manually"
# 3. 将 client/assets/website/ 目录拖拽到页面上
# 4. 等待部署完成
```

**方法 B：Git 集成**

```bash
# 1. 点击 "Add new site" → "Import an existing project"
# 2. 选择 GitHub
# 3. 选择你的仓库 yuhe-website
# 4. 点击 "Deploy site"
```

#### 3. 访问网站

- **默认 URL**：`https://YOUR_SITE_NAME.netlify.app/`

---

### 方案 4：Cloudflare Pages（免费）

**优点**：
- 完全免费
- 全球 CDN
- 无限带宽
- 自定义域名

**步骤**：

#### 1. 注册 Cloudflare

```bash
# 访问：https://pages.cloudflare.com
# 使用 GitHub 账号登录
```

#### 2. 创建项目

```bash
# 1. 点击 "Create a project"
# 2. 选择 "Connect to Git"
# 3. 授权 GitHub 并选择仓库 yuhe-website
# 4. Framework preset 选择 "None"
# 5. 点击 "Save and Deploy"
```

#### 3. 访问网站

- **默认 URL**：`https://yuhe-website.pages.dev/`

---

## 📋 部署后检查清单

### 必需检查

- [ ] 首页可以正常访问
- [ ] 隐私政策页面可以正常访问
- [ ] 用户协议页面可以正常访问
- [ ] 联系我们页面可以正常访问
- [ ] 网站图标正常显示
- [ ] 所有链接可以正常跳转

### 应用商店配置

完成部署后，需要在应用商店填写以下 URL：

**隐私政策 URL**：
```
https://YOUR_DOMAIN/privacy.html
```

**用户协议 URL**：
```
https://YOUR_DOMAIN/terms.html
```

**技术支持 URL**：
```
https://YOUR_DOMAIN/support.html
```

---

## 🌐 推荐域名配置

### 如果使用默认域名

- GitHub Pages: `https://YOUR_USERNAME.github.io/yuhe-website/privacy.html`
- Vercel: `https://yuhe-website.vercel.app/privacy.html`
- Netlify: `https://YOUR_SITE_NAME.netlify.app/privacy.html`
- Cloudflare: `https://yuhe-website.pages.dev/privacy.html`

### 如果使用自定义域名

**推荐购买平台**：
- 阿里云：https://wanwang.aliyun.com/
- 腾讯云：https://dnspod.cloud.tencent.com/
- GoDaddy：https://www.godaddy.com/

**推荐域名**：
- `yuhe.app`（推荐）
- `yuhe.cn`
- `yuhe.com.cn`
- `www.yuhe.app`

---

## 💡 优化建议

### 0. 配置下载功能（重要）

官网下载功能通过 GitHub API 自动获取最新 Release 版本。

**配置步骤**：

1. 打开 `index.html` 文件
2. 找到以下代码：
```javascript
const GITHUB_REPO = 'YOUR_USERNAME/yuhe';
```
3. 替换为你的 GitHub 用户名和仓库名，例如：
```javascript
const GITHUB_REPO = 'yuhe-app/yuhe';
```

**工作原理**：
- 用户点击"下载应用"按钮时，官网会调用 GitHub API 获取最新 Release
- 自动显示最新版本号和文件大小
- 点击下载按钮直接下载 APK

**自动构建**：
- 项目已配置 GitHub Actions 自动构建
- 每次推送到 `main` 分支时自动构建 APK 并发布 Release
- 详见 `.github/workflows/eas-build.yml`

### 1. 添加 Google Analytics（可选）

在 `index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. 添加 SEO 优化

在每个 HTML 文件的 `<head>` 中添加：

```html
<meta name="description" content="遇合 - 创业者专属社交平台">
<meta name="keywords" content="遇合,创业者,社交,知识付费">
<meta name="author" content="遇合团队">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.yuhe.app/">
<meta property="og:title" content="遇合 - 创业者专属社交平台">
<meta property="og:description" content="分享创业经验、实现知识价值、对接商业资源">
<meta property="og:image" content="https://www.yuhe.app/favicon.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://www.yuhe.app/">
<meta property="twitter:title" content="遇合 - 创业者专属社交平台">
<meta property="twitter:description" content="分享创业经验、实现知识价值、对接商业资源">
<meta property="twitter:image" content="https://www.yuhe.app/favicon.png">
```

### 3. 添加网站地图（可选）

创建 `sitemap.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.yuhe.app/</loc>
    <lastmod>2026-03-11</lastmod>
  </url>
  <url>
    <loc>https://www.yuhe.app/privacy.html</loc>
    <lastmod>2026-03-11</lastmod>
  </url>
  <url>
    <loc>https://www.yuhe.app/terms.html</loc>
    <lastmod>2026-03-11</lastmod>
  </url>
  <url>
    <loc>https://www.yuhe.app/support.html</loc>
    <lastmod>2026-03-11</lastmod>
  </url>
</urlset>
```

---

## 📞 技术支持

如果部署过程中遇到问题，请联系：

- 邮箱：support@yuhe.app
- 电话：400-xxx-xxxx

---

## 🔗 相关链接

- GitHub Pages 文档：https://docs.github.com/en/pages
- Vercel 文档：https://vercel.com/docs
- Netlify 文档：https://docs.netlify.com/
- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/

---

最后更新：2026年3月11日
遇合团队

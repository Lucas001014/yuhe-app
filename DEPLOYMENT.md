# 遇合 App 部署指南

## 一、环境准备

### 1. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 2. 登录 Expo 账号
```bash
eas login
```

### 3. 配置环境变量

在 `client/` 目录下创建 `.env` 文件（或在 Expo 控制台配置）：

```env
# 后端 API 地址
EXPO_PUBLIC_BACKEND_BASE_URL=https://your-backend-url.com

# 微信开放平台 AppID（需要先申请移动应用）
EXPO_PUBLIC_WECHAT_APPID=wx1234567890abcdef
```

## 二、构建 Android APK

### 1. 生产构建
```bash
cd client
eas build --platform android --profile production
```

### 2. 预览构建（测试用）
```bash
eas build --platform android --profile preview
```

### 3. 构建完成后
- 在 Expo 控制台查看构建状态
- 下载 APK 文件
- 上传到对象存储或 CDN 获取下载链接

## 三、配置微信登录

### 1. 申请微信开放平台账号
1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册并完成开发者资质认证
3. 创建移动应用，获取 AppID 和 AppSecret

### 2. 配置应用签名
在微信开放平台配置应用签名：
- 使用 `keytool` 获取签名：`keytool -list -v -keystore your-keystore.jks`
- 或使用 EAS 自动签名

### 3. 配置 iOS Universal Link（如需 iOS）
```
https://yuhe.app/wechat/
```

### 4. 后端配置
在服务端配置环境变量：
```env
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your_wechat_secret
```

## 四、下载页面配置

### 1. 更新下载链接
编辑 `client/assets/website/index.html`：
```javascript
const DOWNLOAD_LINKS = {
    android: 'https://your-cdn.com/yuhe-1.0.0.apk',
    ios: 'https://apps.apple.com/app/yuhe/id123456789'
};
```

### 2. 部署官网
```bash
# 部署到 GitHub Pages
cd client/assets/website
# 推送到 gh-pages 分支
```

## 五、功能说明

### 手机号注册/登录
- 用户输入手机号 → 发送验证码 → 输入验证码和密码 → 注册成功
- 后端 API: `POST /api/v1/auth/register`
- 后端 API: `POST /api/v1/auth/login`

### 微信登录
1. 用户点击微信登录按钮
2. 跳转微信授权页面
3. 用户同意授权，返回 code
4. 前端将 code 发送到后端
5. 后端换取用户信息
6. 如果未绑定手机号，跳转绑定页面
7. 绑定成功后登录

### 数据上传
- 图片上传：使用 `expo-image-picker` 选择图片
- 通过 `FormData` 上传到后端
- 后端存储到对象存储，返回 URL

## 六、测试清单

- [ ] 手机号注册功能
- [ ] 手机号登录功能
- [ ] 验证码发送和验证
- [ ] 微信登录（需真实设备测试）
- [ ] 微信绑定手机号
- [ ] 图片上传
- [ ] 帖子发布
- [ ] 评论和点赞
- [ ] 关注和私信

## 七、注意事项

1. **微信登录限制**
   - 必须使用 Development Build 或生产构建
   - Expo Go 不支持微信登录
   - 需要真实的微信 AppID

2. **签名一致性**
   - 微信开放平台配置的签名必须与 APK 签名一致
   - EAS 构建会自动管理签名

3. **网络安全**
   - 后端 API 必须使用 HTTPS
   - 敏感数据需要加密传输

4. **权限申请**
   - 相机权限：拍照上传
   - 相册权限：选择图片上传
   - 麦克风权限：录制视频

## 八、常见问题

### Q: 微信登录提示"未安装微信"
A: 确保设备已安装微信客户端

### Q: 微信授权失败
A: 检查应用签名是否与微信开放平台配置一致

### Q: APK 无法安装
A: 检查 APK 签名是否正确，Android 11+ 需要允许安装未知来源应用

### Q: 网络请求失败
A: 检查 `EXPO_PUBLIC_BACKEND_BASE_URL` 配置是否正确，确保后端服务正常运行

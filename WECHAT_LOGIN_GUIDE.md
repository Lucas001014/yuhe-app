# 微信登录配置指南

## 一、后端配置

### 1. 环境变量配置

在 `server/.env` 文件中添加以下配置：

```bash
# 微信开放平台配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/yuhe
```

### 2. 获取微信 AppID 和 AppSecret

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号并认证
3. 创建移动应用
4. 填写应用信息：
   - 应用名称：遇合
   - 应用简介：创业者专属社交平台
   - 应用图标：上传应用图标
   - 应用包名：`com.yuhe.app`
   - 应用签名：使用 keystore 文件的 MD5 签名
5. 提交审核通过后，获取 **AppID** 和 **AppSecret**

### 3. 获取应用签名

Android:
```bash
keytool -list -v -keystore your-keystore.jks
```
复制 `MD5` 签名，去掉冒号并转为小写。

## 二、前端配置

### 1. 安装依赖

```bash
cd client
npx expo install react-native-wechat-lib
```

### 2. 配置 app.config.ts

在 `client/app.config.ts` 中添加微信插件配置：

```typescript
import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '遇合',
  slug: 'yuhe',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yuhe.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yuhe.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    // 微信登录插件
    [
      'react-native-wechat-lib',
      {
        appid: 'your_wechat_appid', // 替换为你的 AppID
        universalLink: 'https://yourdomain.com/' // 替换为你的 Universal Link
      }
    ],
    // 其他插件...
  ],
});
```

### 3. 配置 Universal Link

iOS:
1. 在苹果开发者中心创建 Associated Domains
2. 添加 `applinks:yourdomain.com`
3. 在 Xcode 项目配置中添加 Associated Domains
4. 在服务器根目录创建 `apple-app-site-association` 文件

Android:
1. 在微信开放平台配置 Universal Link
2. 在 AndroidManifest.xml 中添加 intent-filter

## 三、数据库配置

数据库迁移脚本已在 `server/migrations/add_social_auth.sql` 中创建，包含以下字段：

- `wechat_openid`: 微信 OpenID
- `wechat_unionid`: 微信 UnionID
- `wechat_nickname`: 微信昵称
- `wechat_headimgurl`: 微信头像URL
- `alipay_user_id`: 支付宝用户ID
- `alipay_nickname`: 支付宝昵称
- `alipay_avatar`: 支付宝头像URL

运行迁移：
```bash
cd server
psql -U your_user -d your_database -f migrations/add_social_auth.sql
```

## 四、构建 Development Build

由于微信登录需要原生代码，必须使用 Development Build 而不是 Expo Go。

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 配置 EAS

```bash
cd client
eas build:configure
```

### 3. 构建应用

Android:
```bash
eas build --platform android --profile development
```

iOS:
```bash
eas build --platform ios --profile development
```

### 4. 安装应用

构建完成后，扫描二维码或下载 APK/IPA 文件安装到设备。

## 五、测试流程

### 1. 启动后端服务

```bash
cd server
pnpm run dev
```

### 2. 启动前端服务

```bash
cd client
npx expo start --dev-client
```

### 3. 测试微信登录

1. 在登录页面点击微信登录按钮
2. 跳转到微信授权页面
3. 授权后返回应用
4. 如果是新用户，跳转到手机号绑定页面
5. 输入手机号和验证码完成绑定
6. 登录成功，跳转到首页

## 六、常见问题

### 1. "应用未注册"

**原因**: 应用包名、签名与微信开放平台配置不一致

**解决**:
- 检查 `app.config.ts` 中的 `android.package` 和 `ios.bundleIdentifier`
- 确认 keystore 签名与开放平台配置一致

### 2. "redirect_uri 参数错误"

**原因**: Universal Link 配置错误

**解决**:
- 确保 `apple-app-site-association` 文件可访问
- 检查 Universal Link 格式是否正确

### 3. "code 已使用"

**原因**: 重复使用同一个 code

**解决**:
- code 只能使用一次
- 确保后端正确处理 code 并不重复使用

### 4. Development Build 构建失败

**原因**: 依赖冲突或配置错误

**解决**:
- 清理缓存：`npx expo prebuild --clean`
- 删除 `node_modules` 和 `package-lock.json` 重新安装
- 检查 EAS 配置文件

## 七、安全注意事项

1. **AppSecret 保密**: 永远不要将 AppSecret 暴露在前端代码中
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **Code 一次性**: 微信返回的 code 只能使用一次
4. **State 验证**: 使用 state 参数防止 CSRF 攻击
5. **OpenID 验证**: 后端应验证 OpenID 的有效性

## 八、参考资料

- [微信开放平台文档](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
- [react-native-wechat-lib 文档](https://github.com/little-snow-fox/react-native-wechat-lib)
- [Expo Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Universal Link 配置](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)

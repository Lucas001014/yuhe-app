# 遇合 App - Android 上架指南

## 📋 前置要求

### 1. 账号准备
- ✅ [ ] 注册 Google Play 开发者账号（$25 一次性费用）
  - 访问：https://play.google.com/console
  - 支付注册费
  - 完成开发者信息验证

### 2. 应用素材准备

#### 必需素材
- **应用图标**：
  - 高分辨率图标：512x512px（PNG）
  - 适应性图标：1024x1024px（PNG，透明背景）
  - 前景图：512x512px（PNG，透明背景）
  - 背景色：#1677FF（蓝色）

- **应用截图**：
  - 手机截图（至少 2 张，最多 8 张）：1080x1920px 或更高
  - 推荐尺寸：1080x1920px (16:9)
  - 格式：PNG 或 JPG

- **功能图形**：
  - 透明背景 PNG
  - 尺寸：512x512px

#### 文档信息
- 应用名称：遇合
- 简短描述：创业者专属社交平台（80 字符以内）
- 完整描述：
```
遇合，书写属于自己的商业山河

【产品介绍】
遇合是一款专为创业者打造的社交平台，融合知识付费与内容分享功能。在这里，您可以：

✨ 核心功能
• 内容发布：分享创业心得、经验教训、行业洞察
• 知识付费：出售专业知识、课程、咨询服务
• 付费问答：发布悬赏，获取专业解答
• 合作对接：对接孵化舱、顾问资源、实时动态
• 社区互动：点赞、评论、收藏，建立创业者网络

【适用人群】
• 初创团队创始人
• 连续创业者
• 产品经理
• 技术创业者
• 寻找合作伙伴的创业者

【平台特色】
• 自动内容审核，保障社区质量
• 图片上传支持，分享精彩瞬间
• 智能匹配，精准对接资源
• 安全可靠，隐私保护

遇合，让每一位创业者都能找到属于自己的商业机会，书写属于自己的商业山河。
```

- 关键词：创业者、社交、知识付费、悬赏、对接、孵化、合作

#### 隐私政策
必须提供隐私政策 URL，可以使用以下服务生成：
- https://www.app-privacy-policy-generator.com/
- https://app-privacy-policy-generator.net/

---

## 🚀 发布流程

### 方式一：使用 EAS Build（推荐）

#### 第一步：配置 EAS
```bash
cd /workspace/projects/client

# 初始化 EAS 配置
npx eas build:configure
```

#### 第二步：构建 Android AAB 文件
```bash
# 构建生产版本 AAB
npx eas build --platform android --profile production
```

首次构建会要求：
1. 登录 Expo 账号
2. 选择构建方式：选择 "EAS Build"
3. 配置签名：使用 EAS 管理的签名密钥（推荐）
4. 等待构建完成（通常 10-20 分钟）

#### 第三步：下载 AAB 文件
构建完成后，EAS 会提供下载链接：
```bash
# 查看构建列表
npx eas build:list

# 下载构建产物（通过浏览器访问 EAS 提供的链接）
```

#### 第四步：上传到 Google Play Console

1. **创建新应用**
   - 登录：https://play.google.com/console
   - 点击 "创建应用"
   - 填写应用信息：
     - 应用名称：遇合
     - 应用语言：中文（简体）
     - 免费还是付费应用：免费

2. **上传 AAB 文件**
   - 选择"生产环境"或"测试轨道"
   - 点击"创建新版本"
   - 上传 AAB 文件
   - 等待 Google 处理（5-10 分钟）

3. **填写应用详情**

   **商店信息**：
   - 应用名称：遇合
   - 简短描述：创业者专属社交平台
   - 完整描述：（使用上面的完整描述）
   - 应用图标：上传 512x512px 图标
   - 功能图形：上传 512x512px 功能图
   - 应用截图：上传 2-8 张截图
   - 宣传图：1024x500px（可选）
   - 应用分类：社交
   - 标签：创业者, 社交, 知识付费
   - 联系方式：填写邮箱和网站

4. **内容评级**
   - 填写内容分级问卷
   - 选择年龄分级：12+

5. **定价和分发范围**
   - 免费：免费分发
   - 分发国家：选择目标市场（中国大陆、港澳台等）
   - 设备：选择手机和平板
   - 受管设备：不勾选

6. **隐私政策**
   - 输入隐私政策 URL
   - 确认隐私政策内容

7. **提交审核**
   - 检查所有信息
   - 点击"发布"
   - 等待 Google 审核（通常 1-3 天）

---

### 方式二：手动构建（需要本地环境）

#### 第一步：安装依赖
```bash
# 安装 Android SDK 和 JDK（需要安装 Android Studio）

# 配置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 第二步：生成签名密钥
```bash
# 生成签名密钥（只需一次）
keytool -genkeypair -v -storetype PKCS12 \
  -keystore upload-keystore.jks \
  -validity 10000 \
  -alias upload \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Yuhe App, OU=Development, O=Yuhe, L=Beijing, S=Beijing, C=CN"
```

⚠️ **重要**：请妥善保管以下信息：
- Keystore 文件：`upload-keystore.jks`
- Store Password
- Key Password
- Key Alias：`upload`

#### 第三步：配置签名信息

创建 `android/keystore.properties`：
```properties
YUHE_UPLOAD_STORE_FILE=upload-keystore.jks
YUHE_UPLOAD_KEY_ALIAS=upload
YUHE_UPLOAD_STORE_PASSWORD=YOUR_STORE_PASSWORD
YUHE_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

修改 `android/app/build.gradle`：
```groovy
android {
    ...

    signingConfigs {
        release {
            if (project.hasProperty('YUHE_UPLOAD_STORE_FILE')) {
                storeFile file(YUHE_UPLOAD_STORE_FILE)
                storePassword YUHE_UPLOAD_STORE_PASSWORD
                keyAlias YUHE_UPLOAD_KEY_ALIAS
                keyPassword YUHE_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

将 `upload-keystore.jks` 放到 `android/` 目录下。

#### 第四步：构建 AAB 文件
```bash
cd /workspace/projects/client

# 构建 Android 项目
npx expo prebuild --platform android

# 构建 AAB
cd android
./gradlew bundleRelease

# 生成的 AAB 文件位于：
# android/app/build/outputs/bundle/release/app-release.aab
```

#### 第五步：上传到 Google Play Console
按上述"方式一"的第四步操作。

---

## 🔧 EAS 配置文件

当前 `eas.json` 配置：
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

---

## 📦 快速命令参考

```bash
# 1. 查看构建状态
npx eas build:list

# 2. 查看构建日志
npx eas build:view [BUILD_ID]

# 3. 构建预览版本
npx eas build --platform android --profile preview

# 4. 构建生产版本
npx eas build --platform android --profile production

# 5. 提交到 Google Play（需要配置服务账号）
npx eas submit --platform android --latest

# 6. 配置构建环境
npx eas build:configure

# 7. 查看项目配置
npx eas config
```

---

## ⚠️ 注意事项

### 1. 应用版本管理
- 每次更新应用，需要增加版本号
- 修改 `app.config.ts` 中的 `version` 和 `android.versionCode`
- EAS 配置中的 `autoIncrement: true` 会自动增加构建号

### 2. 应用图标和截图要求
- 图标必须清晰，不能模糊
- 截图必须展示真实应用界面
- 不能使用其他应用的图标或截图
- 不能包含其他应用的标识

### 3. 内容审核要点
- 应用功能必须完整，不能有 TODO 或占位符
- 如果有登录功能，必须提供测试账号
- 隐私政策必须真实有效
- 不能包含色情、暴力、赌博等违规内容
- 不能诱导用户评分或评价

### 4. 权限使用说明
- 相机权限：拍摄照片和视频
- 相册权限：选择和上传图片
- 麦克风权限：录制音频和视频
- 位置权限：提供周边创业资源和服务

### 5. 数据安全
- 用户数据必须加密传输
- 不能在应用中硬编码敏感信息
- 必须遵守当地数据保护法规（如中国的网络安全法）

---

## 🐛 常见问题

### Q1: 构建失败怎么办？
A:
1. 检查网络连接
2. 查看构建日志：`npx eas build:view [BUILD_ID]`
3. 检查依赖版本是否兼容
4. 联系 Expo 支持

### Q2: 审核被拒怎么办？
A:
1. 仔细阅读审核反馈
2. 根据反馈修改应用
3. 重新提交审核
4. 使用 Resolution Center 与审核团队沟通

### Q3: 如何更新应用？
A:
1. 修改 `app.config.ts` 中的版本号
2. 重新构建 AAB
3. 在 Google Play Console 中创建新版本
4. 上传新 AAB
5. 提交审核

### Q4: 可以发布到其他应用商店吗？
A:
可以！AAB 文件可以发布到：
- Google Play Store（官方）
- 华为应用市场
- 小米应用商店
- OPPO 软件商店
- vivo 应用商店
- 应用宝（腾讯）
- 百度手机助手
- 魅族应用商店

但每个商店可能需要单独注册账号和审核。

### Q5: 签名密钥丢失了怎么办？
A:
如果丢失了签名密钥，将无法更新应用！请务必妥善保管：
- 备份签名密钥到安全位置
- 使用密码管理器管理密码
- 不要将密钥上传到 Git

---

## 📞 支持

- [Expo EAS 文档](https://docs.expo.dev/build/introduction/)
- [Google Play Console 帮助](https://support.google.com/googleplay/android-developer)
- [Expo 社区论坛](https://forums.expo.dev/)

---

## ✅ 上架检查清单

### 上架前检查
- [ ] 应用图标已制作完成（512x512px）
- [ ] 应用截图已准备（至少 2 张）
- [ ] 应用描述已撰写
- [ ] 隐私政策已创建
- [ ] 联系方式已确认
- [ ] 应用功能已测试完毕
- [ ] 无明显的 Bug 或崩溃问题
- [ ] 所有权限使用都有合理说明

### 构建检查
- [ ] `app.config.ts` 配置正确
- [ ] `eas.json` 配置正确
- [ ] 签名密钥已配置（如果手动构建）
- [ ] 版本号已更新

### 提交检查
- [ ] Google Play 开发者账号已注册
- [ ] 应用信息已完整填写
- [ ] AAB 文件已上传
- [ ] 内容评级已完成
- [ ] 分发范围已设置
- [ ] 隐私政策已添加
- [ ] 测试账号已提供（如果需要）

---

## 🎯 推荐工具

### 设计工具
- **Figma**：设计应用图标和截图
- **Canva**：快速创建应用素材
- **Sketch**：UI 设计工具

### 截图工具
- **Emulator**：Android 模拟器截图
- **ADB**：命令行截图
- **ScreenToGif**：录制应用演示视频

### 隐私政策生成
- **App Privacy Policy Generator**：免费生成隐私政策
- **TermsFeed**：专业的隐私政策生成服务

---

祝上架顺利！🎉

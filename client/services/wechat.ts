/**
 * 微信登录服务
 * 
 * 使用说明：
 * 1. 需要在微信开放平台申请移动应用，获取AppID
 * 2. 将AppID配置到环境变量 EXPO_PUBLIC_WECHAT_APPID
 * 3. 使用 Development Build 构建应用（不能使用 Expo Go）
 * 4. iOS 需要配置 Universal Link
 */

import * as WeChat from 'react-native-wechat-lib';

const WECHAT_APPID = process.env.EXPO_PUBLIC_WECHAT_APPID;

// 微信SDK是否已初始化
let isInitialized = false;

/**
 * 初始化微信SDK
 * 必须在使用其他微信功能前调用
 */
export const initWeChat = async (): Promise<boolean> => {
  if (!WECHAT_APPID || WECHAT_APPID === 'wx_placeholder_appid') {
    console.warn('微信AppID未配置，请设置环境变量 EXPO_PUBLIC_WECHAT_APPID');
    return false;
  }

  try {
    await WeChat.registerApp(WECHAT_APPID, 'https://yuhe.app/wechat/');
    isInitialized = true;
    console.log('微信SDK初始化成功');
    return true;
  } catch (error) {
    console.error('微信SDK初始化失败:', error);
    return false;
  }
};

/**
 * 检查微信是否已安装
 */
export const isWeChatInstalled = async (): Promise<boolean> => {
  try {
    return await WeChat.isWXAppInstalled();
  } catch (error) {
    console.error('检查微信安装状态失败:', error);
    return false;
  }
};

/**
 * 微信登录
 * @returns 微信授权code，用于后端换取用户信息
 */
export const weChatLogin = async (): Promise<{ success: boolean; code?: string; error?: string }> => {
  if (!isInitialized) {
    const initResult = await initWeChat();
    if (!initResult) {
      return { success: false, error: '微信SDK未初始化，请检查配置' };
    }
  }

  try {
    // 检查微信是否已安装
    const installed = await isWeChatInstalled();
    if (!installed) {
      return { success: false, error: '请先安装微信客户端' };
    }

    // 发起微信授权请求
    const result = await WeChat.sendAuthRequest('snsapi_userinfo', 'yuhe_login');
    
    if (result.errCode === 0 && result.code) {
      return { success: true, code: result.code };
    } else {
      return { success: false, error: result.errStr || '微信授权失败' };
    }
  } catch (error: any) {
    console.error('微信登录错误:', error);
    return { success: false, error: error.message || '微信登录失败' };
  }
};

/**
 * 分享到微信好友
 */
export const shareToWeChatFriend = async (
  webpageUrl: string,
  title: string,
  description: string,
  thumbImage?: string
): Promise<boolean> => {
  if (!isInitialized) {
    await initWeChat();
  }

  try {
    await WeChat.shareWebpage({
      webpageUrl,
      title,
      description,
      thumbImageUrl: thumbImage,
      scene: 0, // 0: 好友, 1: 朋友圈
    });
    return true;
  } catch (error) {
    console.error('分享到微信失败:', error);
    return false;
  }
};

/**
 * 分享到微信朋友圈
 */
export const shareToWeChatTimeline = async (
  webpageUrl: string,
  title: string,
  description: string,
  thumbImage?: string
): Promise<boolean> => {
  if (!isInitialized) {
    await initWeChat();
  }

  try {
    await WeChat.shareWebpage({
      webpageUrl,
      title,
      description,
      thumbImageUrl: thumbImage,
      scene: 1, // 0: 好友, 1: 朋友圈
    });
    return true;
  } catch (error) {
    console.error('分享到朋友圈失败:', error);
    return false;
  }
};

export default {
  initWeChat,
  isWeChatInstalled,
  weChatLogin,
  shareToWeChatFriend,
  shareToWeChatTimeline,
};

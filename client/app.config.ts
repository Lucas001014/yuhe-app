import { ExpoConfig, ConfigContext } from 'expo/config';

const appName = process.env.COZE_PROJECT_NAME || process.env.EXPO_PUBLIC_COZE_PROJECT_NAME || '应用';
const projectId = process.env.COZE_PROJECT_ID || process.env.EXPO_PUBLIC_COZE_PROJECT_ID;
const slugAppName = projectId ? `app${projectId}` : 'myapp';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": "遇合",
    "slug": "yuhe",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "yuhe",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "bundleIdentifier": "com.yuhe.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "CFBundleDisplayName": "遇合",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "NSCameraUsageDescription": "需要访问相机以拍摄照片和视频，分享您的创业故事",
        "NSPhotoLibraryUsageDescription": "需要访问相册以选择照片和视频，发布优质内容",
        "NSPhotoLibraryAddUsageDescription": "需要保存图片到相册，方便您收藏精彩内容",
        "NSMicrophoneUsageDescription": "需要访问麦克风以录制音频，支持语音功能"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1677FF"
      },
      "package": "com.yuhe.app"
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1677FF"
    },
    "plugins": [
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL ? [
        "expo-router",
        {
          "origin": process.env.EXPO_PUBLIC_BACKEND_BASE_URL
        }
      ] : 'expo-router',
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "允许遇合访问您的相册，以便您上传图片分享创业经验",
          "cameraPermission": "允许遇合使用您的相机，以便您直接拍摄照片上传",
          "microphonePermission": "允许遇合访问您的麦克风，以便您拍摄带有声音的视频"
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "遇合需要访问您的位置以提供周边创业资源和服务"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "遇合需要访问相机以拍摄照片和视频",
          "microphonePermission": "遇合需要访问麦克风以录制视频声音",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "遇合需要访问麦克风以录制音频内容"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "d595b377-5b13-4f09-a464-f858d9ea9a8e"
      }
    }
  }
}

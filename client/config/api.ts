/**
 * API 配置
 * 统一管理后端 API 地址
 */

// 从环境变量获取 API 地址，如果没有则使用默认地址
export const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'https://3d2f73a5-2786-4b27-8c79-5b459cae268c.dev.coze.site';

// API 版本前缀
export const API_VERSION = '/api/v1';

// 完整的 API 基础 URL
export const API_FULL_URL = `${API_BASE_URL}${API_VERSION}`;

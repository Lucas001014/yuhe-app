/**
 * API 配置
 * 统一管理后端 API 地址
 */

/**
 * API 基础 URL
 * - 在 Web 环境中，使用相对路径 ''（空字符串），让 nginx 代理 /api/* 到后端
 * - 这样可以避免跨域问题，也能正确处理前端域名和后端服务的关系
 */
export const API_BASE_URL = '';

// API 版本前缀
export const API_VERSION = '/api/v1';

// 完整的 API 基础 URL
export const API_FULL_URL = `${API_BASE_URL}${API_VERSION}`;

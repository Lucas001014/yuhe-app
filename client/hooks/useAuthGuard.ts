import { useEffect } from 'react';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 权限保护Hook
 * 如果用户未登录，重定向到登录页面
 *
 * @param redirectTo 登录成功后的重定向路径，默认为 '/'
 */
export function useAuthGuard(redirectTo: string = '/') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useSafeRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login', { redirect: redirectTo });
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

/**
 * 检查是否登录并执行操作的Hook
 * 返回一个函数，该函数在用户未登录时先跳转登录页，否则执行回调
 *
 * @param callback 用户登录后要执行的回调函数
 * @param redirectTo 登录成功后的重定向路径，默认为当前页
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useSafeRouter();

  const requireAuth = (
    callback: () => void,
    redirectTo: string = '/'
  ) => {
    return () => {
      if (isLoading) {
        // 加载中，不做任何操作
        return;
      }

      if (!isAuthenticated) {
        // 未登录，跳转到登录页
        router.push('/login', { redirect: redirectTo });
        return;
      }

      // 已登录，执行回调
      callback();
    };
  };

  return { isAuthenticated, isLoading, requireAuth };
}

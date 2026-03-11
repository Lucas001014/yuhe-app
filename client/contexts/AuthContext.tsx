import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username?: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      const avatar = await AsyncStorage.getItem('avatar');
      const authToken = await AsyncStorage.getItem('token');

      if (userId) {
        setUser({
          id: parseInt(userId, 10),
          username: username || undefined,
          avatar: avatar || undefined,
        });
        setToken(authToken);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    setUser(userData);
    // token可以在这里设置，目前简化处理
    await AsyncStorage.setItem('userId', String(userData.id));
    if (userData.username) {
      await AsyncStorage.setItem('username', userData.username);
    }
    if (userData.avatar) {
      await AsyncStorage.setItem('avatar', userData.avatar);
    }
    setToken('mock-token'); // 简化处理，实际应该从后端获取
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['userId', 'username', 'avatar', 'token']);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

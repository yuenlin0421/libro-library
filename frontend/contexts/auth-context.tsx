"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, User } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.checkAuth();
      if (response && response.authenticated) {
        // if (response.authenticated) {
        setUser(response.user);
      } else {
        // 2. 如果後端回傳未認證，嘗試手動刷新一次 Token
        try {
          const refreshRes = await authApi.refreshToken();
          if (refreshRes.access) {
            const userRes = await authApi.getProfile();
            setUser(userRes);
          }
        } catch (e) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null); // 401 錯誤會被這裡捕獲，我們安靜地處理它
    } finally {
      setLoading(false); // 確保最後一定會結束 Loading
    }
  };

  const login = async (code: string) => {
    try {
      const response = await authApi.googleLogin(code);
      setUser(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      apiClient.clearAuth();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Refresh user failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {/* {children} */}
      {!loading ? children : <div className="bg-[#050508] min-screen" />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

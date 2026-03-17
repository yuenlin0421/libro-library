// lib/api/auth.ts
import axios from "./client";
import { apiClient } from "./client";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    annual_goal: number;
    books_read_this_year: number;
    goal_progress: number;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user: User;
}

export const authApi = {
  /**
   * Login with Google OAuth code
   * Refresh Token 會由後端設定到 HttpOnly Cookie
   * Access Token 存在記憶體中
   */
  async googleLogin(code: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      "/api/auth/google/login/",
      { code },
      { withCredentials: true }, // 允許後端設定 HttpOnly Cookie
    );

    // 只儲存 Access Token 到記憶體
    // Refresh Token 已經在 HttpOnly Cookie 裡，JS 無法存取（安全）
    if (response.data.access) {
      apiClient.setAccessToken(response.data.access);
    }

    return response.data;
  },

  /**
   * Check authentication status
   */
  async checkAuth(): Promise<AuthCheckResponse> {
    const response = await axios.get<AuthCheckResponse>("/api/auth/check/", {
      withCredentials: true, // 確保 HttpOnly Cookie (Refresh Token) 能送出
    });
    return response.data;
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await axios.get<User>("/api/auth/profile/");
    return response.data;
  },

  /**
   * Update user profile (annual goal)
   */
  async updateProfile(annualGoal: number): Promise<User> {
    const response = await axios.put<User>("/api/auth/profile/", {
      annual_goal: annualGoal,
    });
    return response.data;
  },

  /**
   * Logout
   * 清除記憶體中的 Access Token 和 後端的 Refresh Token Cookie
   */
  async logout(): Promise<{ message: string }> {
    try {
      // 呼叫後端登出 API（會清除 HttpOnly Cookie）
      const response = await axios.post<{ message: string }>(
        "/api/auth/logout/",
        {},
        { withCredentials: true },
      );

      // 清除記憶體中的 Access Token
      apiClient.clearAuth();

      return response.data;
    } catch (error) {
      // 即使後端出錯，也要清除前端狀態
      apiClient.clearAuth();
      throw error;
    }
  },

  /**
   * Refresh access token
   * 使用 HttpOnly Cookie 中的 Refresh Token 換取新的 Access Token
   */
  async refreshToken(): Promise<{ access: string }> {
    const response = await axios.post<{ access: string }>(
      "/api/auth/refresh/",
      {},
      { withCredentials: true },
    );

    if (response.data.access) {
      apiClient.setAccessToken(response.data.access);
    }

    return response.data;
  },
};

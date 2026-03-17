// lib/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // 重要：允許帶 HttpOnly Cookie
    });

    // Request interceptor - 自動加上 Access Token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - 處理 401 自動刷新 Token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // 關鍵修正：定義不需要觸發 401 自動刷新的路徑
        const skipRefreshPaths = [
          // "/api/auth/check/", 移除 "/api/auth/check/"
          "/api/auth/refresh/",
          "/api/auth/google/login/",
        ];

        const isSkipPath = skipRefreshPaths.some((path) =>
          originalRequest.url?.includes(path),
        );

        // 如果是 401 且還沒重試過，嘗試刷新 Token
        // if (error.response?.status === 401 && !originalRequest._retry) {
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isSkipPath
        ) {
          originalRequest._retry = true;

          try {
            // 避免同時多個請求都去刷新 Token
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshAccessToken();
            }

            const newAccessToken = await this.refreshPromise;
            this.refreshPromise = null;

            // 更新原始請求的 Header
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // 重試原始請求
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh Token 也失效了，清除狀態並導向登入頁
            this.clearAuth();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * 刷新 Access Token
   * Refresh Token 會自動從 HttpOnly Cookie 帶上
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await axios.post<{ access: string }>(
        `${API_BASE_URL}/api/auth/refresh/`,
        {}, // Body 是空的，Refresh Token 在 Cookie 裡
        { withCredentials: true }, // 所有需要帶 Cookie 的請求都要加
      );

      const newAccessToken = response.data.access;
      this.setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  /**
   * 設定 Access Token（存在記憶體）
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * 取得當前 Access Token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * 清除認證狀態
   */
  clearAuth() {
    this.accessToken = null;
  }

  /**
   * 取得 Axios 實例
   */
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getClient();

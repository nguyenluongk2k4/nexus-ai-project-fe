// Auth API Gateway Implementation

import { AuthGateway, AuthResponse, LoginRequest, RegisterRequest, User } from "../domain/types";

import { apiConfig } from "@/shared/config/api.config";

const API_URL = apiConfig.getHttpUrl('/auth');

export class AuthApiGateway implements AuthGateway {

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Important for CORS with different ports
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) { /* ignore */ }
        throw new Error((errorData as any).detail || `Authentication failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const data = await this.request<any>("/login", {
      method: "POST",
      body: JSON.stringify(request),
    });

    this.saveToken(data.access_token);

    // Transform user object from snake_case to camelCase
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        fullName: data.user.full_name,
        avatarUrl: data.user.avatar_url,
        isActive: data.user.is_active,
        balance: data.user.balance,
        subscriptionTier: data.user.subscription_tier,
        subscriptionExpiresAt: data.user.subscription_expires_at,
        isAdmin: data.user.is_admin,
        role: data.user.role,
        forumRank: data.user.forum_rank,
        points: data.user.points,
        createdAt: data.user.created_at,
        lastLoginAt: data.user.last_login_at,
      }
    };
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    // Convert camelCase to snake_case for backend API
    const payload = {
      email: request.email,
      username: request.username,
      password: request.password,
      full_name: request.fullName,
    };

    const data = await this.request<any>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    this.saveToken(data.access_token);

    // Transform user object from snake_case to camelCase
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        fullName: data.user.full_name,
        avatarUrl: data.user.avatar_url,
        isActive: data.user.is_active,
        balance: data.user.balance,
        subscriptionTier: data.user.subscription_tier,
        subscriptionExpiresAt: data.user.subscription_expires_at,
        isAdmin: data.user.is_admin,
        role: data.user.role,
        forumRank: data.user.forum_rank,
        points: data.user.points,
        createdAt: data.user.created_at,
        lastLoginAt: data.user.last_login_at,
      }
    };
  }

  async me(): Promise<User> {
    const response = await this.request<any>("/me");

    // Transform snake_case from backend to camelCase for frontend
    return {
      id: response.id,
      email: response.email,
      username: response.username,
      fullName: response.full_name,
      avatarUrl: response.avatar_url,
      isActive: response.is_active,
      balance: response.balance,
      subscriptionTier: response.subscription_tier,
      subscriptionExpiresAt: response.subscription_expires_at,
      isAdmin: response.is_admin,
      role: response.role,
      forumRank: response.forum_rank,
      points: response.points,
      createdAt: response.created_at,
      lastLoginAt: response.last_login_at,
    };
  }

  logout(): void {
    localStorage.removeItem("token");
  }

  private saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  async getGoogleLoginUrl(): Promise<string> {
    const response = await this.request<{ url: string }>("/google/login");
    return response.url;
  }
}

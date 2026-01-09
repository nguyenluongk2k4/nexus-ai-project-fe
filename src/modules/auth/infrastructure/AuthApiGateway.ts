// Auth API Gateway Implementation

import { AuthGateway, AuthResponse, LoginRequest, RegisterRequest, User } from "../domain/types";

const API_URL = "http://localhost:8000/api/auth";

export class AuthApiGateway implements AuthGateway {
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Authentication failed");
    }

    return response.json();
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(request),
    });
    
    this.saveToken(data.access_token);
    return data;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    // Convert camelCase to snake_case for backend API
    const payload = {
      email: request.email,
      username: request.username,
      password: request.password,
      full_name: request.fullName,
    };
    
    const data = await this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    this.saveToken(data.access_token);
    return data;
  }

  async me(): Promise<User> {
    return this.request<any>("/me"); // Fix: endpoint returns UserResponse directly
  }

  logout(): void {
    localStorage.removeItem("token");
  }

  private saveToken(token: string) {
    localStorage.setItem("token", token);
  }
}

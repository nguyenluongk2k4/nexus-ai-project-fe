// Auth Context & Provider

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, LoginRequest, RegisterRequest, User } from "./domain/types";
import { AuthApiGateway } from "./infrastructure/AuthApiGateway";
import { notificationGateway } from "@/shared/infrastructure/NotificationGateway";
import { coinsStore } from "../coins/domain/services/CoinsStore";

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Singleton gateway
export const authGateway = new AuthApiGateway();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to avoid race condition with other requests on page load
      await new Promise(resolve => setTimeout(resolve, 100));

      const token = localStorage.getItem("token");

      if (!token) {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const user = await authGateway.me();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        authGateway.logout();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Connect notification gateway when user changes
  useEffect(() => {
    if (state.user) {
      notificationGateway.connect(state.user.id);
    } else {
      notificationGateway.disconnect();
    }
  }, [state.user]);

  const login = async (request: LoginRequest) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await authGateway.login(request);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: error.message || "Login failed",
      }));
      throw error;
    }
  };

  const register = async (request: RegisterRequest) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await authGateway.register(request);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: error.message || "Registration failed",
      }));
      throw error;
    }
  };

  const logout = () => {
    authGateway.logout();
    coinsStore.clear(); // Reset coins balance on logout
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

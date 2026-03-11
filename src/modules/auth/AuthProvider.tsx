// Auth Context & Provider

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, LoginRequest, RegisterRequest, User } from "./domain/types";
import { AuthApiGateway } from "./infrastructure/AuthApiGateway";
import { CompleteTourUseCase } from "./usecases/CompleteTourUseCase";
import { notificationGateway } from "@/shared/infrastructure/NotificationGateway";
import { coinsStore } from "../coins/domain/services/CoinsStore";
import { balanceStore } from "@/modules/profile/domain/services/BalanceStore";

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  forgotPassword: (request: { email: string }) => Promise<{ status: string, message: string }>;
  verifyOtp: (request: { email: string, otp: string }) => Promise<{ status: string, message: string, reset_token: string }>;
  resetPassword: (request: { email: string, resetToken: string, newPassword: string }) => Promise<{ status: string, message: string }>;
  logout: () => void;
  completeTour: (phase?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Singleton gateway and use case
export const authGateway = new AuthApiGateway();
const completeTourUseCase = new CompleteTourUseCase(authGateway);

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

  useEffect(() => {
    const subscription = balanceStore.balance$.subscribe((balance) => {
      if (balance === null) return;

      setState((current) => {
        if (!current.user || current.user.balance === balance) {
          return current;
        }

        return {
          ...current,
          user: {
            ...current.user,
            balance,
          },
        };
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (state.user) {
      balanceStore.setBalance(state.user.balance || 0);
      return;
    }

    balanceStore.clear();
  }, [state.user]);

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

  const forgotPassword = async (request: { email: string }) => {
    return await authGateway.forgotPassword(request);
  };

  const verifyOtp = async (request: { email: string, otp: string }) => {
    return await authGateway.verifyOtp(request);
  };

  const resetPassword = async (request: { email: string, resetToken: string, newPassword: string }) => {
    return await authGateway.resetPassword(request);
  };

  const logout = () => {
    authGateway.logout();
    coinsStore.clear(); // Reset coins balance on logout
    balanceStore.clear();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const completeTour = async (phase?: string) => {
    // 1. Optimistically update local state using functional update to prevent race conditions
    setState(s => {
      if (!s.user) return s;

      const updatedUser = { ...s.user };
      if (phase === 'dashboard') updatedUser.hasCompletedDashboardTour = true;
      else if (phase === 'skilltree') updatedUser.hasCompletedSkillTreeTour = true;
      else if (phase === 'masterskilltree') updatedUser.hasCompletedMasterSkillTreeTour = true;
      else updatedUser.hasCompletedTour = true;

      // Aggregation logic: If all individual tours are done, mark the whole thing as done
      if (updatedUser.hasCompletedDashboardTour &&
        updatedUser.hasCompletedSkillTreeTour &&
        updatedUser.hasCompletedMasterSkillTreeTour) {
        updatedUser.hasCompletedTour = true;
      }

      console.log('[DEBUG] user tour flags updated:', {
        phase,
        dash: updatedUser.hasCompletedDashboardTour,
        skill: updatedUser.hasCompletedSkillTreeTour,
        master: updatedUser.hasCompletedMasterSkillTreeTour,
        all: updatedUser.hasCompletedTour
      });

      return {
        ...s,
        user: updatedUser
      };
    });

    // 2. Then call the backend
    try {
      await completeTourUseCase.execute(phase);
    } catch (error) {
      console.error('Failed to complete tour on backend:', error);
      // Optional: Rollback state here if needed, but for tours usually not necessary
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setState(s => {
      if (!s.user) return s;
      return {
        ...s,
        user: { ...s.user, ...updates }
      };
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, forgotPassword, verifyOtp, resetPassword, logout, completeTour, updateUser }}>
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

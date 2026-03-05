// Auth Types and Domain Entities

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  isActive: boolean;
  balance: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: string;
  isAdmin: boolean;
  role: string;
  forumRank: string;
  points: number;
  hasCompletedTour: boolean;
  hasCompletedDashboardTour: boolean;
  hasCompletedSkillTreeTour: boolean;
  hasCompletedMasterSkillTreeTour: boolean;
  streak: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Domain Port
export interface AuthGateway {
  login(request: LoginRequest): Promise<AuthResponse>;
  register(request: RegisterRequest): Promise<AuthResponse>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ status: string, message: string }>;
  verifyOtp(request: VerifyOtpRequest): Promise<{ status: string, message: string, reset_token: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ status: string, message: string }>;
  me(): Promise<User>;
  logout(): void;
  completeTour(phase?: string): Promise<void>;
}

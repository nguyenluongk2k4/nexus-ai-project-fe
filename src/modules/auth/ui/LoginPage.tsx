import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, authGateway } from '../AuthProvider';
import { Mail, Lock, ArrowRight, TreeDeciduous, Github, Chrome, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/shared/components/PublicHeader';
import { DotLottiePlayer } from '@dotlottie/react-player';

export const LoginPage = () => {
  const { t } = useTranslation();

  type AuthMode = 'LOGIN' | 'FORGOT_PASSWORD_EMAIL' | 'FORGOT_PASSWORD_OTP' | 'RESET_PASSWORD';
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const { login, forgotPassword, verifyOtp, resetPassword, isLoading: isAuthLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  // Handle OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'FORGOT_PASSWORD_OTP' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setActionMessage({ type: 'error', text: 'Mã OTP đã hết hạn. Vui lòng thử lại.' });
    }
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'LOGIN') {
      try {
        await login({ email, password });
        navigate('/dashboard');
      } catch (err) {
        // Error handled by AuthProvider
      }
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setActionMessage({ type: 'error', text: 'Vui lòng nhập email.' });
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    try {
      await forgotPassword({ email });
      setMode('FORGOT_PASSWORD_OTP');
      setTimeLeft(120);
      setOtp(['', '', '', '', '', '']);
      setActionMessage({ type: 'success', text: 'Mã OTP đã được gửi đến email của bạn.' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Mã lỗi không xác định.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setActionMessage({ type: 'error', text: 'Vui lòng nhập đủ 6 số OTP.' });
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    try {
      const res = await verifyOtp({ email, otp: otpString });
      setResetToken(res.reset_token);
      setMode('RESET_PASSWORD');
      setActionMessage({ type: 'success', text: 'Xác thực thành công. Vui lòng nhập mật khẩu mới.' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'OTP không hợp lệ.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setActionMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    try {
      await resetPassword({ email, resetToken, newPassword });
      setMode('LOGIN');
      setPassword('');
      setActionMessage({ type: 'success', text: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi đổi mật khẩu.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Auto focus previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const resetToLogin = () => {
    setMode('LOGIN');
    setActionMessage(null);
  };


  const handleGoogleLogin = async () => {
    try {
      const url = await authGateway.getGoogleLoginUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 min-h-screen w-screen overflow-y-auto overflow-x-hidden flex flex-col relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}

        {/* Subtle Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M50,100 C50,60 50,40 50,20" fill="none" stroke="#7C3AED" strokeWidth="0.5" />
          <path d="M50,60 C50,40 30,50 10,30" fill="none" stroke="#7C3AED" strokeWidth="0.3" />
          <path d="M50,60 C50,40 70,50 90,30" fill="none" stroke="#7C3AED" strokeWidth="0.3" />
        </svg>
      </div>

      <div className="w-full z-50">
        <PublicHeader showAuthButtons={false} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start w-full px-4 pt-4 pb-8 sm:pt-8 md:pt-12 relative z-10">
        {/* Logo & Title */}
        <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
          {/* Glowing Icon */}
          <div className="relative mb-4 group">
            <div className="absolute inset-0 "></div>
            <img src="/logo.png" alt="NexusAI" className=" h-20" />

            {/* Lantern Animation - Top Right */}
            <div
              className="absolute pointer-events-none z-10 top-[-30px] right-[-60px] sm:right-[-90px] md:right-[-120px] transition-all duration-300"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transition-all duration-300">
                <DotLottiePlayer
                  src="/assets/Newyear lantern.lottie"
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>

            {/* Red Envelope Animation - Left of Logo */}
            <div className="absolute bottom-0 left-[-50px] sm:left-[-90px] md:left-[-110px] pointer-events-none z-10 transition-all duration-300">
              <div className="w-14 h-14 sm:w-20 sm:h-20">
                <DotLottiePlayer
                  src="/assets/Li_xi_do.lottie"
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
          <p className="text-violet-600 text-xs font-bold tracking-[0.2em] uppercase">{t('auth.login.subtitle')}</p>
        </div>

        {/* Glass Login Card */}
        <div className="w-full max-w-xl backdrop-blur-xl bg-white/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-violet-500/10 relative overflow-hidden border border-white/60">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-70"></div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full"></div>

          {/* Corner Stars */}
          <Star className="absolute top-4 right-4 w-4 h-4 text-violet-300 animate-pulse" />
          <Star className="absolute bottom-4 left-4 w-3 h-3 text-pink-300 animate-pulse" style={{ animationDelay: '1s' }} />

          {(actionMessage || authError) && (
            <div className={`mb-6 p-3 ${actionMessage?.type === 'success' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'} text-sm rounded-xl text-center animate-shake`}>
              {actionMessage?.text || authError}
            </div>
          )}

          {mode === 'LOGIN' && (
            <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2 group">
                <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                  {t('auth.login.emailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                    {t('auth.login.passwordLabel')}
                  </label>
                  <button type="button" onClick={() => { setMode('FORGOT_PASSWORD_EMAIL'); setActionMessage(null); }} className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isAuthLoading}
                className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Shimmer Effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

                <span className="relative flex items-center justify-center gap-2">
                  {isAuthLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          )}

          {mode === 'FORGOT_PASSWORD_EMAIL' && (
            <form className="space-y-6 sm:space-y-8 animate-fade-in" onSubmit={handleForgotPasswordRequest}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Khôi phục mật khẩu</h3>
                <p className="text-sm text-slate-500 mt-2">Nhập email của bạn, chúng tôi sẽ gửi mã gồm 6 số để xác thực.</p>
              </div>

              {/* Email */}
              <div className="space-y-2 group">
                <label htmlFor="reset-email" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isActionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Nhận mã OTP'
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {mode === 'FORGOT_PASSWORD_OTP' && (
            <form className="space-y-6 sm:space-y-8 animate-fade-in" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Xác thực mã OTP</h3>
                <p className="text-sm text-slate-500 mt-2">Mã đã được gửi đến: <span className="font-semibold">{email}</span></p>
                <div className="mt-4 inline-flex items-center gap-2 bg-violet-50 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className={`font-mono text-lg font-bold ${timeLeft < 30 ? 'text-red-500' : 'text-violet-600'}`}>{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl font-bold border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all shadow-sm focus:shadow-md"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isActionLoading || timeLeft === 0 || otp.join('').length < 6}
                  className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isActionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Xác thực'
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {mode === 'RESET_PASSWORD' && (
            <form className="space-y-6 sm:space-y-8 animate-fade-in" onSubmit={handleResetPassword}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Mật khẩu mới</h3>
                <p className="text-sm text-slate-500 mt-2">Hãy đặt mật khẩu mới ít nhất 6 ký tự để bảo mật tài khoản.</p>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <label htmlFor="new-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                  </div>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isActionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Lưu mật khẩu mới'
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Divider */}
          {mode === 'LOGIN' && (
            <>
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/90 backdrop-blur-sm text-slate-500 rounded-full text-xs font-semibold border border-slate-100 shadow-sm">
                    {t('auth.login.orContinueWith')}
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="mt-8 sm:mt-10 grid  gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white/60 backdrop-blur-sm text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
                >
                  <img
                    src="/logo-google.png"
                    alt="Google"
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-all"
                  />
                  {t('auth.login.googleLogin')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            {t('auth.login.dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="font-bold text-violet-600 hover:text-violet-700 transition-colors hover:underline"
            >
              {t('auth.login.signUpLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-blob {
          animation: blob 10s infinite;
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
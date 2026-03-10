import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, authGateway } from '../AuthProvider';
import {
  TreeDeciduous, User, IdCard, Mail, Lock,
  ArrowRight, Github, Chrome, Sparkles, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/shared/components/PublicHeader';
import { DotLottiePlayer } from '@dotlottie/react-player';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.register.passwordsDoNotMatch'));
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });
      navigate('/');
    } catch (err) {
      // Error handled by AuthProvider
    }
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
          </div>

          <p className="text-violet-600 text-xs font-bold tracking-[0.2em] uppercase">{t('auth.register.subtitle')}</p>
        </div>

        {/* Glass Signup Card */}
        <div className="w-full max-w-xl backdrop-blur-xl bg-white/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-violet-500/10 relative overflow-hidden border border-white/60">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-70"></div>

          {/* Corner Stars */}
          <Star className="absolute top-4 right-4 w-4 h-4 text-violet-300 animate-pulse" />
          <Star className="absolute bottom-4 left-4 w-3 h-3 text-pink-300 animate-pulse" style={{ animationDelay: '1s' }} />

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-2 group">
              <label htmlFor="username" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                {t('auth.register.usernameLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                  placeholder="johndoe"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2 group">
              <label htmlFor="fullName" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                {t('auth.register.fullNameLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                  placeholder="Alice Johnson"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 group">
              <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                {t('auth.register.emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                  placeholder="alice@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 group">
              <label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                {t('auth.register.passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 group">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-violet-600">
                {t('auth.register.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-violet-700 drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/60 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 focus:bg-white transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-600">
                {t('auth.register.termsAgreement')}{' '}
                <a href="#" className="font-semibold text-violet-600 hover:text-violet-700">
                  {t('auth.register.terms')}
                </a>
                {' '}{t('auth.register.and')}{' '}
                <a href="#" className="font-semibold text-violet-600 hover:text-violet-700">
                  {t('auth.register.privacy')}
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Shimmer Effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('auth.register.creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('auth.register.signUpButton')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 backdrop-blur-sm text-slate-500 rounded-full text-xs font-semibold border border-slate-100 shadow-sm">
                {t('auth.register.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="mt-8 sm:mt-10 grid gap-4">
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
              {t('auth.register.googleSignUp')}
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            {t('auth.register.alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-bold text-violet-600 hover:text-violet-700 transition-colors hover:underline"
            >
              {t('auth.register.signInLink')}
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

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div >
  );
};

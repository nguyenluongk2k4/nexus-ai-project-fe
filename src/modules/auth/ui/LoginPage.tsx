import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, TreeDeciduous, Github as GithubIcon, Chrome as GoogleIcon } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { ToastWithProgress } from '@/shared/components/ToastWithProgress';
import logo from '@/assets/logo.svg';
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/skilltree');
      toast.custom(() => (
        <ToastWithProgress 
          title={t('auth.login.success')}
          message="Welcome to Nexus Ai"
          type="success"
          duration={2000}
        />
      ), { duration: 2000 });
    } catch (err) {
      // Error handled by AuthProvider
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 relative overflow-hidden pt-24">
       {/* Header from Landing */}
       <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AI Skill Tree" className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>
      </header>

      {/* Background Blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-70"></div>
        <div className="absolute top-[20%] -right-[10%] w-[35rem] h-[35rem] bg-primary/30 dark:bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-70"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Removed duplicate Logo/Title here since it is in the Header now */}


        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-[#1e293b] py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100 dark:border-gray-700 transition-colors duration-200"
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('auth.login.title')}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-200 text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.login.emailLabel')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    {t('auth.login.forgotPassword')}
                  </a>
                </div>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-slate-700 dark:border-gray-600 dark:checked:bg-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                {t('auth.login.rememberMe')}
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed shadow-primary/25"
              >
                {isLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400">
                  {t('auth.login.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                  <span className="sr-only">Sign in with Google</span>
                  <GoogleIcon className="w-5 h-5 text-gray-500 dark:text-white" />
                </a>
              </div>
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                  <span className="sr-only">Sign in with GitHub</span>
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.login.dontHaveAccount')}
              <Link to="/register" className="font-medium text-primary hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-1">
                {t('auth.login.signUpLink')}
              </Link>
            </p>
          </div>
        </motion.div>
        
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          © 2024 AI Skill Tree. Grow your future.
        </p>
      </div>
    </div>
  );
};

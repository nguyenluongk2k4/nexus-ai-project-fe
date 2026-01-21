import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { 
  TreeDeciduous, UserPlus, IdCard, Mail, Lock, 
  ArrowRight, Github, Twitter, User, Chrome as GoogleIcon, Github as GithubIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';
export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        {/* Removed duplicate Logo/Title */}

        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-[#1e293b] py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100 dark:border-gray-700 transition-colors duration-200"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-slate-700 mb-4">
              <UserPlus className="text-primary w-6 h-6" />
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('auth.register.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-200 text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">
                {t('auth.register.usernameLabel')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400 w-5 h-5" />
                </div>
                <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="johndoe"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="fullName">
                {t('auth.register.fullNameLabel')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdCard className="text-gray-400 w-5 h-5" />
                </div>
                <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="Alice Johnson"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                {t('auth.register.emailLabel')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400 w-5 h-5" />
                </div>
                <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="alice@example.com"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                {t('auth.register.passwordLabel')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400 w-5 h-5" />
                </div>
                <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="••••••••"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                {t('auth.register.confirmPasswordLabel')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400 w-5 h-5" />
                </div>
                <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="••••••••"
                />
            </div>
            </div>

            <div className="flex items-center pt-2">
            <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-slate-700 dark:border-gray-600"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300" htmlFor="terms">
                {t('auth.register.termsAgreement')} <a href="#" className="font-medium text-primary hover:text-indigo-500">{t('auth.register.terms')}</a> {t('auth.register.and')} <a href="#" className="font-medium text-primary hover:text-indigo-500">{t('auth.register.privacy')}</a>
            </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed shadow-primary/25"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
              </span>
              {isLoading ? t('auth.register.creatingAccount') : t('auth.register.signUpButton')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400">
                  {t('auth.register.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="sr-only">Sign in with Google</span>
                  <GoogleIcon className="w-5 h-5 text-gray-500 dark:text-white" />
                </a>
              </div>
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="sr-only">Sign in with GitHub</span>
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {t('auth.register.alreadyHaveAccount')} 
            <Link to="/login" className="font-medium text-primary hover:text-indigo-500 transition-colors ml-1">
              {t('auth.register.signInLink')}
            </Link>
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          © 2024 AI Skill Tree. Grow your future.
        </p>
      </div>
    </div>
  );
};

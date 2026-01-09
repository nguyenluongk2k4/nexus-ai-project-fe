import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { 
  Trees, Menu, UserPlus, IdCard, Mail, Lock, 
  ArrowRight, Github, Twitter, User 
} from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
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
    <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 font-sans antialiased min-h-screen flex flex-col transition-colors duration-200">
      {/* Navigation */}
      <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer text-decoration-none">
              <Trees className="text-violet-500 w-8 h-8" />
              <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-teal-500">
                AI Skill Tree
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-violet-500 to-teal-500 hover:from-violet-600 hover:to-teal-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
            <div className="flex items-center md:hidden">
              <button aria-label="toggle menu" className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#1e293b] p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative z-10 transition-colors duration-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 mb-4">
              <UserPlus className="text-teal-500 w-6 h-6" />
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Join AI Skill Tree to start mapping your future.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-200 text-center">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">
                  Username
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="fullName">
                  Full Name
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="Alice Johnson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                  Email address
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="alice@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
                  Confirm Password
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded dark:bg-slate-700 dark:border-gray-600"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300" htmlFor="terms">
                I agree to the <a href="#" className="font-medium text-violet-600 hover:text-violet-500">Terms</a> and <a href="#" className="font-medium text-violet-600 hover:text-violet-500">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-violet-500 to-teal-500 hover:from-violet-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
              </span>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="sr-only">Sign in with Google</span>
                  {/* Google Icon SVG */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                  </svg>
                </a>
              </div>
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="sr-only">Sign in with GitHub</span>
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Already have an account? 
            <Link to="/login" className="font-medium text-violet-600 hover:text-teal-500 transition-colors ml-1">
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-gray-800 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 AI Skill Tree. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

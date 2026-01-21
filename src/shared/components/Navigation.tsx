import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Home, GitBranch, FileQuestion, Briefcase, TrendingUp, LogOut, MessageSquare, Users, Calendar, User, ChevronDown, TreeDeciduous, Languages } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ToastWithProgress } from './ToastWithProgress';
import logo from '@/assets/logo.svg';
export function Navigation() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'skilltree', label: t('nav.skilltree'), icon: GitBranch, path: '/skilltree' },
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home, path: '/dashboard' },
    // { id: 'quiz', label: t('nav.quiz'), icon: FileQuestion, path: '/quiz' },
    // { id: 'jobs', label: t('nav.jobs'), icon: Briefcase, path: '/jobs' },
    // { id: 'insights', label: t('nav.insights'), icon: TrendingUp, path: '/insights' },
    // { id: 'timeline', label: t('nav.timeline'), icon: Calendar, path: '/timeline' },
    // { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'forum', label: t('nav.forum'), icon: Users, path: '/forum' },
  ];

  const handleLogout = () => {
    navigate('/');
    // Defer logout to ensure navigation to public route completes first
    setTimeout(() => {
      logout();
      toast.custom(() => (
        <ToastWithProgress 
          title={t('auth.logout.success')}
          message="See you next time!"
          type="success"
          duration={2000}
        />
      ), { duration: 2000 });
    }, 0);
  };

  const changeLanguage = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-64 bg-white border-r border-border min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2">
            <img src={logo} alt="AI Skill Tree" className="h-13" />
          </div>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${isActive
                  ? 'bg-gradient-to-r from-violet-50 to-teal-50 text-violet-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Dropdown Menu */}
      {user && (
        <div className="border-t border-border pt-4 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:bg-accent"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-teal-400 flex items-center justify-center text-white font-semibold">
              {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('common.profile')}
              </button>
              <button
                onClick={() => { navigate('/my-skills'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <TreeDeciduous className="w-4 h-4" />
                {t('nav.skilltree')}
              </button>
              
              <div className="my-1 border-t border-gray-100" />
              
              {/* Language Switcher */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('common.language')}
              </div>
              <button
                onClick={() => changeLanguage('vi')}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${i18n.language === 'vi' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-auto rounded-sm" />
                Tiếng Việt
              </button>
               <button
                onClick={() => changeLanguage('en')}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${i18n.language === 'en' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-5 h-auto rounded-sm" />
                English
              </button>

              <div className="my-1 border-t border-gray-100" />
              
              <button
                onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

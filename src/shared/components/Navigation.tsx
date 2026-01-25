import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Home, GitBranch, FileQuestion, Briefcase, TrendingUp, LogOut, MessageSquare, Users, Calendar, User, ChevronDown, TreeDeciduous, Globe } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';

export function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    setIsDropdownOpen(false);
  };

  const navItems = [
    // { id: 'dashboard', label: t('nav.dashboard'), icon: Home, path: '/dashboard' },
    { id: 'skilltree', label: t('nav.skilltree'), icon: GitBranch, path: '/skilltree' },
    // { id: 'quiz', label: t('nav.quiz'), icon: FileQuestion, path: '/quiz' },
    // { id: 'jobs', label: t('nav.jobs'), icon: Briefcase, path: '/jobs' },
    // { id: 'insights', label: t('nav.insights'), icon: TrendingUp, path: '/insights' },
    { id: 'timeline', label: t('nav.timeline'), icon: Calendar, path: '/timeline' },
    // { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'forum', label: t('nav.forum'), icon: Users, path: '/forum' },
  ];

  const handleLogout = () => {
    logout();
    // Ensure logout state updates before navigating
    queueMicrotask(() => {
      navigate('/', { replace: true });
    });
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
    <nav 
      className={`
        bg-white border-r border-border min-h-screen p-4 flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <img src={logo} alt="Nexus AI" className="h-16 mb-1" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5 -rotate-90" /> : <ChevronDown className="w-5 h-5 rotate-90" />}
        </button>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium
                ${isActive
                  ? 'bg-gradient-to-r from-violet-50 to-teal-50 text-violet-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Dropdown Menu */}
      {user && (
        <div className={`pt-4 relative ${!isCollapsed && 'border-t border-border'}`} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              w-full flex items-center rounded-xl transition-all hover:bg-accent
              ${isCollapsed ? 'justify-center p-0' : 'gap-3 px-3 py-2'}
            `}
          >
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=random`}
              alt={user.fullName || user.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
            />
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className={`
              absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 w-56
              ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0'}
            `}
            >
               {/* Adding a user info header in popup for collapsed mode */}
               {isCollapsed && (
                 <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                 </div>
               )}

              <button
                onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('nav.profile')}
              </button>
              <button
                onClick={() => { navigate('/my-skills'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <TreeDeciduous className="w-4 h-4" />
                {t('nav.mySkillTree')}
              </button>
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}


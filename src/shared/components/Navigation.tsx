import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Home, GitBranch, FileQuestion, Briefcase, TrendingUp, LogOut, MessageSquare, Users, Calendar, User, ChevronDown, TreeDeciduous } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';

export function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'skilltree', label: 'Skill Tree', icon: GitBranch, path: '/skilltree' },
    { id: 'quiz', label: 'Quiz', icon: FileQuestion, path: '/quiz' },
    { id: 'jobs', label: 'Job Matches', icon: Briefcase, path: '/jobs' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, path: '/insights' },
    { id: 'timeline', label: 'Lịch Học', icon: Calendar, path: '/timeline' },
    // { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'forum', label: 'Diễn Đàn', icon: Users, path: '/forum' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500 font-bold text-xl">
          AI Skill Tree
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Learn & Grow</p>
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
                Profile
              </button>
              <button
                onClick={() => { navigate('/my-skills'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <TreeDeciduous className="w-4 h-4" />
                My Skill Tree
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}


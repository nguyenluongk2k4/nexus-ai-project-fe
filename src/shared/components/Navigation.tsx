import { NavLink, useNavigate } from 'react-router-dom';
import { Home, GitBranch, FileQuestion, Briefcase, TrendingUp, LogOut, MessageSquare, Users, Calendar, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';

export function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

      {/* User Info */}
      {user && (
        <div className="border-t border-border pt-4 mb-4">
          <NavLink
            to="/profile"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-xl transition-all
              ${isActive
                ? 'bg-gradient-to-r from-violet-50 to-teal-50'
                : 'hover:bg-accent'
              }
            `}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-teal-400 flex items-center justify-center text-white font-semibold">
              {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </NavLink>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Đăng xuất</span>
      </button>
    </nav>
  );
}

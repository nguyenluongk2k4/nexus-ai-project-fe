import { NavLink, useNavigate } from 'react-router-dom';
import { Home, GitBranch, FileQuestion, Briefcase, TrendingUp, LogOut, MessageSquare, Users, Calendar } from 'lucide-react';

export function Navigation() {
  const navigate = useNavigate();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'skilltree', label: 'Skill Tree', icon: GitBranch, path: '/skilltree' },
    { id: 'quiz', label: 'Quiz', icon: FileQuestion, path: '/quiz' },
    { id: 'jobs', label: 'Job Matches', icon: Briefcase, path: '/jobs' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, path: '/insights' },
    { id: 'timeline', label: 'Lịch Học', icon: Calendar, path: '/timeline' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'forum', label: 'Diễn Đàn', icon: Users, path: '/forum' },
  ];

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
      
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all font-medium mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </nav>
  );
}

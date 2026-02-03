import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { GitBranch, Calendar, Users, FileQuestion, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { DotLottiePlayer } from '@dotlottie/react-player';

export function Navigation() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home, path: '/dashboard' },
    { id: 'skilltree', label: t('nav.skilltree'), icon: GitBranch, path: '/skilltree' },
    // { id: 'quiz', label: t('nav.quiz'), icon: FileQuestion, path: '/quiz' },
    // { id: 'jobs', label: t('nav.jobs'), icon: Briefcase, path: '/jobs' },
    // { id: 'insights', label: t('nav.insights'), icon: TrendingUp, path: '/insights' },
    { id: 'timeline', label: t('nav.timeline'), icon: Calendar, path: '/timeline' },
    // { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
    { id: 'forum', label: t('nav.forum'), icon: Users, path: '/forum' },
    { id: 'missions', label: 'Nhiệm vụ', icon: FileQuestion, path: '/missions' },
    // { id: 'referral', label: 'Giới thiệu', icon: Users, path: '/referral' },
  ];

  return (
    <nav
      className={`
        bg-white border-r border-border min-h-screen p-4 flex flex-col transition-all duration-300 ease-in-out relative z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <img src="/logo.png" alt="Nexus AI" className="h-16 mb-1" />
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
                flex items-center gap-3 px-3 py-2.5 [@media(max-height:750px)]:py-1.5 rounded-xl transition-all font-medium
                ${isActive
                  ? 'bg-violet-50 text-violet-700'
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

        {/* Falling Flowers Animation - Hidden on very short screens */}
        {!isCollapsed && (
          <div className="flex justify-center -mx-4 mt-0 mb-1 overflow-visible [@media(max-height:620px)]:hidden">
            <DotLottiePlayer
              src="/assets/Hoa_dao_den_long.lottie"
              autoplay
              loop
              style={{ width: '100%', height: 'auto', border: 'none' }}
            />
          </div>
        )}

        {/* Happy New Year Animation - Hidden on medium-short screens */}
        {!isCollapsed && (
          <div className="flex justify-center relative z-10 py-1 [@media(max-height:720px)]:hidden">
            <DotLottiePlayer
              src="/assets/home/HAPPY NEW YEAR 2026.lottie"
              autoplay
              loop
              style={{ width: '240px', height: '120px', border: 'none' }}
            />
          </div>
        )}

        {/* Festive Animations - Hidden first on short screens */}
        {!isCollapsed && (
          <div className="mt-auto flex flex-col items-center gap-1 -mx-4 pb-0 pt-2 overflow-visible mb-0 [@media(max-height:820px)]:hidden -mt-12">
            {/* Peach Blossom - Smaller */}
            <div className="relative w-full flex justify-center">
              <DotLottiePlayer
                src="/assets/home/Animation - 1705409067911.lottie"
                autoplay
                loop
                style={{ width: '100%', height: 'auto', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

    </nav >
  );
}
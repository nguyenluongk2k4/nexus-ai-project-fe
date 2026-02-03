import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/modules/auth/AuthProvider';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface PublicHeaderProps {
  showAuthButtons?: boolean;
  className?: string;
}

export function PublicHeader({ showAuthButtons = true, className = '' }: PublicHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className={`sticky top-0 z-50 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 rounded-full px-6 py-4 flex justify-between items-center shadow-lg border border-slate-100">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="NexusAI" className="h-15" />
          </div>

          {/* New Year Banner - Desktop */}
          <div className="flex-shrink-0 mx-4 hidden md:block">
            <DotLottiePlayer
              src="/assets/home/Happy new year_banner.lottie"
              autoplay
              loop
              style={{ width: '280px', height: '80px', border: 'none' }}
            />
          </div>


          <div className="flex items-center gap-4">
            {showAuthButtons && !user && (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium hover:text-violet-600 transition-colors hidden sm:block"
              >
                {t('landing.header.signIn')}
              </button>
            )}

            <LanguageSwitcher variant="minimal" />

            {showAuthButtons && !user && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-500/50"
              >
                {t('landing.header.getStarted')}
              </Button>
            )}

            {user && (
              <div
                className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=random`}
                  alt={user.fullName || user.username}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

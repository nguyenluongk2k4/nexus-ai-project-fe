import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, Brain, Target, TreeDeciduous } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';

export function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AI Skill Tree" className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex text-slate-600 hover:text-primary hover:bg-slate-50">
              {t('landing.nav.signIn')}
            </Button>
            <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/25">
              {t('landing.nav.getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('landing.hero.badge')}
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              {t('landing.hero.title.line1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                {t('landing.hero.title.line2')}
              </span>
            </h1>
            <p className="text-slate-600 mb-8 text-lg max-w-lg leading-relaxed">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105"
              >
                {t('landing.hero.startFree')} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="px-8 h-12 rounded-xl text-base font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-slate-300">
                {t('landing.hero.learnMore')}
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                        {String.fromCharCode(64 + i)}
                    </div>
                 ))}
              </div>
              <p>{t('landing.hero.trustedBy')}</p>
            </div>
          </div>

          {/* Abstract Tree Illustration */}
          <div className="relative">
            <div className="relative w-full aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Tree trunk */}
                <line x1="200" y1="380" x2="200" y2="200" stroke="url(#gradient1)" strokeWidth="8" strokeLinecap="round" />
                
                {/* Main branches */}
                <line x1="200" y1="200" x2="100" y2="100" stroke="url(#gradient1)" strokeWidth="6" strokeLinecap="round" />
                <line x1="200" y1="200" x2="300" y2="100" stroke="url(#gradient1)" strokeWidth="6" strokeLinecap="round" />
                <line x1="200" y1="200" x2="150" y2="150" stroke="url(#gradient1)" strokeWidth="5" strokeLinecap="round" />
                <line x1="200" y1="200" x2="250" y2="150" stroke="url(#gradient1)" strokeWidth="5" strokeLinecap="round" />
                
                {/* Secondary branches */}
                <line x1="100" y1="100" x2="50" y2="50" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="100" x2="120" y2="40" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="300" y1="100" x2="350" y2="50" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="300" y1="100" x2="280" y2="40" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                
                {/* Nodes */}
                <circle cx="200" cy="200" r="16" fill="#8b5cf6" opacity="0.9" />
                <circle cx="100" cy="100" r="14" fill="#14b8a6" opacity="0.9" />
                <circle cx="300" cy="100" r="14" fill="#14b8a6" opacity="0.9" />
                    <circle cx="150" cy="150" r="12" fill="#8b5cf6" opacity="0.8" />
                    <circle cx="250" cy="150" r="12" fill="#8b5cf6" opacity="0.8" />
                <circle cx="50" cy="50" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="120" cy="40" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="350" cy="50" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="280" cy="40" r="10" fill="#0891b2" opacity="0.8" />
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">{t('landing.features.personalized.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.features.personalized.description')}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
              <TreeDeciduous className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">{t('landing.features.tracking.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.features.tracking.description')}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">{t('landing.features.career.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('landing.features.career.description')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

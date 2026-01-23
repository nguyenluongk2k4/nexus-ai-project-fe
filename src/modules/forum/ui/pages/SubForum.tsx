import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import {
  ChevronRight,
  MessageSquare,
  Eye,
  TrendingUp,
  Clock,
  Bot,
  Code,
  Database,
  Flame,
  Pin,
  Filter,
  Search,
  Bell,
  Moon,
} from 'lucide-react';
import { getPostsByCategoryUseCase } from '../../providers';
import { ForumPost, ForumCategory } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, any> = {
  Bot,
  Code,
  Database,
};

export function SubForum() {
  const { category: categoryId = 'ai' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'hot'>('latest');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getPostsByCategoryUseCase.execute(categoryId);
        setCategory(data.category);
        setThreads(data.posts);
      } catch (error) {
        console.error('Failed to load subforum data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  const onNavigateToThread = (id: number) => {
    navigate(`/thread/${id}`);
  };

  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'popular') {
      return (Number(b.stats.views) || 0) - (Number(a.stats.views) || 0);
    }
    if (sortBy === 'hot') {
      return (Number(b.stats.comments) || 0) - (Number(a.stats.comments) || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return t('forum.time.justNow');
    if (hours < 24) return t('forum.time.hoursAgo', { hours });
    const days = Math.floor(hours / 24);
    return t('forum.time.daysAgo', { days });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex-1 p-6 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-600">{t('forum.thread.categoryNotFound')}</p>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[category.iconName] || Bot;

  return (
    <div className="flex-1 overflow-auto min-h-screen relative flex flex-col">
      {/* Mesh Background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundColor: '#f3f4f6',
          backgroundImage: `
                        radial-gradient(at 10% 10%, hsla(260,80%,90%,1) 0px, transparent 50%),
                        radial-gradient(at 90% 10%, hsla(210,80%,90%,1) 0px, transparent 50%),
                        radial-gradient(at 50% 50%, hsla(240,60%,95%,1) 0px, transparent 50%),
                        radial-gradient(at 10% 90%, hsla(220,70%,92%,1) 0px, transparent 50%),
                        radial-gradient(at 90% 90%, hsla(280,60%,92%,1) 0px, transparent 50%)
                    `,
        }}
      ></div>

      {/* Header - Sticky & Glass */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
              <img 
                src={logo} 
                alt={t('forum.title')} 
                onClick={() => navigate('/forum')}
                className="h-8 cursor-pointer" 
              />
            <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
              <button
                onClick={() => navigate('/forum')}
                className="hover:text-violet-600 transition-colors"
              >
                {t('forum.home')}
              </button>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-slate-800">{category.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="hidden lg:flex relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              </span>
              <input
                className="pl-10 pr-4 py-2.5 rounded-full border border-slate-200/60 bg-white/50 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all w-64 backdrop-blur-sm shadow-sm outline-none"
                placeholder={t('forum.search.placeholderCategory', { category: category.name })}
                type="text"
              />
            </div>

            {/* Bell */}
            <button className="p-2.5 rounded-full text-slate-500 hover:bg-white/60 hover:text-violet-600 transition relative group">
              <Bell className="w-6 h-6 group-hover:animate-pulse" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 ring-2 ring-white rounded-full"></span>
            </button>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-blue-500 p-[2px] cursor-pointer shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow">
              <img
                alt="User Avatar"
                className="rounded-full bg-white h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZl2gxLZ2iLLClVdrVyiaRUAJVm_EKFKwPzt7m0rsTXMhSB7IHtYcY9accbQ-_T1RV67Sa15-oL0e44WOiLvjk7axQAPTnWZDKaAXtm--O1DSTyAqAurZ34ONlmm6XhQ8_550sMZbfwlBptKFBzGinPUC7R7xnRifBQSb2LirvJf1goAqWa2VWHh9KTYZWg7CFzQ23hJc9dnzP59pl_7imAy2cK30Eewp_9C8yVODGsCXHNRy5LUuJNhJ_gsNcE-0dnp16YESRqvzz"
              />
            </div>

            {/* Dark Mode Toggle - Visual Only */}
            <button className="p-2.5 rounded-full text-slate-500 hover:bg-white/60 transition">
              <Moon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        {/* Category Header - Glass Gradient */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-white/20 shadow-lg"
          style={{
            background: `linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95))`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Animated shimmer effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)',
              animation: 'rotate 30s linear infinite',
            }}
          ></div>

          {/* Icon */}
          <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl animate-float">
            <Icon className="w-16 h-16 md:w-20 md:h-20 text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
          </div>

          {/* Category Info */}
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">{category.name}</h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">{category.description}</p>
          </div>
        </div>

        {/* Filter Controls - Sticky Glass Panel */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-24 z-40 border border-white/50 shadow-sm">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${sortBy === 'latest'
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-slate-600 hover:bg-white hover:text-violet-600'
                }`}
            >
              <Clock className="w-5 h-5" />
              {t('forum.filter.new')}
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${sortBy === 'popular'
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-slate-600 hover:bg-white hover:text-violet-600'
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              {t('forum.filter.popular')}
            </button>
            <button
              onClick={() => setSortBy('hot')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${sortBy === 'hot'
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-slate-600 hover:bg-white hover:text-orange-500'
                }`}
            >
              <Flame className="w-5 h-5 text-orange-500" />
              Hot
            </button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-medium text-slate-500">
              {t('forum.filter.showing', { count: threads.length })}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-violet-600 border border-violet-200/50 hover:bg-violet-50 transition-colors font-semibold text-sm">
              <Filter className="w-5 h-5" />
              {t('forum.filter.filterBtn')}
            </button>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-5">
          {sortedThreads.map((thread) => (
            <article
              key={thread.id}
              onClick={() => onNavigateToThread(thread.id)}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-lg group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                borderColor: thread.isPinned ? 'rgba(139, 92, 246, 0.3)' : undefined,
              }}
            >
              {/* Content */}
              <div className="flex items-start gap-5 relative z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full opacity-60 blur-sm group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center text-xl border-2 border-white shadow-md">
                    {thread.author.avatar}
                  </div>
                </div>

                {/* Thread Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-violet-600 transition-colors flex-1 truncate">
                      {thread.title}
                    </h3>
                    {/* Badges - Inline */}
                    {(thread.isPinned || thread.isHot) && (
                      <div className="flex gap-2 flex-shrink-0">
                        {thread.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600 border border-purple-200 shadow-sm">
                            <Pin className="w-3 h-3 fill-current" />
                            {t('forum.badges.pinned')}
                          </span>
                        )}
                        {thread.isHot && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200 shadow-sm animate-pulse">
                            <Flame className="w-3 h-3 fill-current" />
                            {t('forum.badges.hot')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      <span>{thread.author.name}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5">{getTimeAgo(thread.createdAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 absolute top-1/2 -translate-y-1/2 right-8">
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <div className="flex items-center gap-1.5 text-violet-600 font-bold text-lg">
                      <MessageSquare className="w-5 h-5" />
                      {thread.stats.comments}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('forum.replies')}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <div className="flex items-center gap-1.5 text-green-500 font-bold text-lg">
                      <Eye className="w-5 h-5" />
                      {thread.stats.views}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('forum.views')}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="mt-6 pt-5 border-t border-slate-200/50 flex md:hidden items-center justify-end gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-violet-600 font-bold text-lg">
                    <MessageSquare className="w-5 h-5" />
                    {thread.stats.comments}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('forum.replies')}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-green-500 font-bold text-lg">
                    <Eye className="w-5 h-5" />
                    {thread.stats.views}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('forum.views')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-12 gap-2">
          <button className="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:border-violet-500 hover:text-violet-600 font-semibold text-sm transition-all hover:shadow-md backdrop-blur-sm">
            {t('forum.pagination.prev')}
          </button>
          <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white font-bold shadow-lg shadow-violet-500/30 transform scale-110">
            1
          </button>
          <button className="w-10 h-10 rounded-xl bg-white text-slate-600 border border-slate-200 hover:border-violet-500 hover:text-violet-600 font-bold transition-all hover:shadow-md backdrop-blur-sm">
            2
          </button>
          <button className="w-10 h-10 rounded-xl bg-white text-slate-600 border border-slate-200 hover:border-violet-500 hover:text-violet-600 font-bold transition-all hover:shadow-md backdrop-blur-sm">
            3
          </button>
          <button className="px-4 py-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:border-violet-500 hover:text-violet-600 font-semibold text-sm transition-all hover:shadow-md backdrop-blur-sm">
            {t('forum.pagination.next')}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200/50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          </div>
          <p className="text-sm font-medium text-slate-500">{t('forum.footer')}</p>
        </div>
      </footer>

      {/* CSS Animation for floating icon */}
      <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
}

import React from 'react';
import { Search, Filter, PenSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ForumHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedFilter: string;
    setSelectedFilter: (filter: string) => void;
    onCreatePost: () => void;
}

export const ForumHeader: React.FC<ForumHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    onCreatePost,
}) => {
    const { t } = useTranslation();

    return (
        <div className="sticky top-0 z-40 bg-white/95 border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur"></div>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('forum.search.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 font-medium text-slate-700 cursor-pointer shadow-sm hover:bg-white/80 transition-all"
                        >
                            <option value="all">{t('forum.filter.all')}</option>
                            <option value="hot">🔥 {t('forum.filter.hot')}</option>
                            <option value="new">✨ {t('forum.filter.new')}</option>
                            <option value="unanswered">❓ {t('forum.filter.unanswered')}</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={onCreatePost}
                        className="relative flex items-center gap-2 px-6 py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <PenSquare className="w-5 h-5 relative z-10" />
                        <span className="hidden sm:inline relative z-10">{t('forum.createPost')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

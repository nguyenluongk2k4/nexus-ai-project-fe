import React from 'react';
import { Bot, ArrowRight, Award } from 'lucide-react';
import { ForumCategory, ForumStats } from '../../domain/entities/ForumEntities';
import { MOCK_TOP_MEMBERS, MOCK_HOT_TAGS } from './ForumConstants';
import { useTranslation } from 'react-i18next';

interface ForumSidebarProps {
    stats: ForumStats | null;
    categories: ForumCategory[];
    onNavigateToSubForum: (categoryId: string) => void;
    iconMap: Record<string, any>;
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({
    stats,
    categories,
    onNavigateToSubForum,
    iconMap,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t('forum.sidebar.liveActivity')}
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">👥 {t('forum.stats.onlineMembers')}</span>
                        <span className="font-bold text-green-600">{stats?.onlineMembers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">💬 {t('forum.stats.activeDiscussions')}</span>
                        <span className="font-bold text-slate-900">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">✍️ {t('forum.stats.writing')}</span>
                        <span className="font-bold text-violet-600">3</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{t('forum.sidebar.categories')}</h3>
                <div className="space-y-2">
                    {categories.map((category) => {
                        const Icon = iconMap[category.iconName] || Bot;
                        return (
                            <button
                                key={category.id}
                                onClick={() => onNavigateToSubForum(category.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 transition-colors group text-left border border-transparent hover:border-violet-200"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-violet-600 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-slate-700 group-hover:text-violet-700 transition-colors">
                                        {category.name}
                                    </h4>
                                    <span className="text-xs text-slate-500">{category.postCount || 0} {t('forum.stats.totalPosts').toLowerCase()}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {stats && (
                <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">{t('forum.sidebar.stats')}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('forum.stats.totalPosts')}</span>
                            <span className="text-2xl font-bold text-slate-900">{stats.totalPosts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('forum.stats.members')}</span>
                            <span className="text-2xl font-bold text-slate-900">{stats.totalMembers.toLocaleString()}</span>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">{t('forum.stats.activity7Days')}</p>
                            <div className="h-20 flex items-end gap-1.5">
                                {[30, 45, 35, 60, 50, 75, 90].map((height, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-slate-200 hover:bg-violet-600 rounded-t transition-all cursor-pointer"
                                        style={{ height: `${height}%` }}
                                        title={`${100 + i * 10} posts`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{t('forum.sidebar.topMembers')}</h3>
                <div className="grid grid-cols-5 gap-3">
                    {MOCK_TOP_MEMBERS.map((member) => (
                        <div key={member.id} className="relative group cursor-pointer">
                            <img
                                className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover group-hover:border-violet-600 transition-all group-hover:scale-110"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                alt={member.name}
                                title={member.name}
                            />
                            {member.isTopContributor && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-200">
                                    <Award className="w-3 h-3 text-amber-500" />
                                </div>
                            )}
                            {member.isOnline && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 hover:border-violet-600 hover:text-violet-600 cursor-pointer transition-all">
                        +12
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{t('forum.hotTopics')}</h3>
                <div className="flex flex-wrap gap-2">
                    {MOCK_HOT_TAGS.map((tag, idx) => (
                        <button
                            key={idx}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-sm font-medium text-slate-700 hover:text-violet-700 rounded-lg transition-all"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

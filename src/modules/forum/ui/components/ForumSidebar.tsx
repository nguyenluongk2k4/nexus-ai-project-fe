import React from 'react';
import { Bot, ArrowRight, Award } from 'lucide-react';
import { ForumCategory, ForumStats, ForumUser } from '../../domain/entities/ForumEntities';
import { MOCK_TOP_MEMBERS, MOCK_HOT_TAGS } from './ForumConstants';
import { useTranslation } from 'react-i18next';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface ForumSidebarProps {
    stats: ForumStats | null;
    categories: ForumCategory[];
    onNavigateToSubForum: (categoryId: string) => void;
    iconMap: Record<string, any>;
    topMembers?: ForumUser[];
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({
    stats,
    categories,
    onNavigateToSubForum,
    iconMap,
    topMembers,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <DotLottiePlayer
                                src="/assets/forum/online.lottie"
                                autoplay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        {t('forum.sidebar.liveActivity')}
                    </h3>

                    <div className="space-y-4 text-base">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img alt="Online" src="/assets/forum/online-status.png" className="w-6 h-6 object-contain" />
                                <span className="text-slate-600 font-medium">{t('forum.stats.onlineMembers')}</span>
                            </div>
                            <span className="font-bold text-green-600">{stats?.onlineMembers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img alt="Discussions" src="/assets/forum/thao-luan.png" className="w-6 h-6 object-contain" />
                                <span className="text-slate-600 font-medium">{t('forum.stats.activeDiscussions')}</span>
                            </div>
                            <span className="font-bold text-slate-900">15</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img alt="Writing" src="/assets/forum/dang-viet-bai.png" className="w-6 h-6 object-contain" />
                                <span className="text-slate-600 font-medium">{t('forum.stats.writing')}</span>
                            </div>
                            <span className="font-bold text-violet-600">3</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{t('forum.sidebar.categories')}</h3>
                <div className="space-y-2">
                    {categories.map((category) => {
                        return (
                            <button
                                key={category.id}
                                onClick={() => onNavigateToSubForum(category.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 transition-colors group text-left border border-transparent hover:border-violet-200"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors overflow-hidden">
                                    {category.icon && (
                                        <img src={category.icon} alt={category.name} className="w-6 h-6 object-contain" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-base text-slate-700 group-hover:text-violet-700 transition-colors">
                                        {category.name}
                                    </h4>
                                    <span className="text-sm text-slate-500">{category.postCount || 0} {t('forum.stats.totalPosts').toLowerCase()}</span>
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
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">⭐ Top Members</h3>
                </div>

                <div className="space-y-4">
                    {topMembers && topMembers.length > 0 ? topMembers.map((member, index) => {
                        // Define border colors for top 3
                        let borderColor = 'border-slate-200';
                        let borderWidth = 'border-2';
                        if (index === 0) {
                            borderColor = 'border-yellow-400';
                            borderWidth = 'border-[3px]';
                        } else if (index === 1) {
                            borderColor = 'border-slate-300';
                            borderWidth = 'border-[3px]';
                        } else if (index === 2) {
                            borderColor = 'border-orange-400';
                            borderWidth = 'border-[3px]';
                        }

                        return (
                            <div key={member.id} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <img
                                    className={`w-10 h-10 rounded-full object-cover ${borderWidth} ${borderColor} shadow-sm`}
                                    src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                    alt={member.name}
                                />

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                                        {member.name}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        {member.postCount || 0} bài viết
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' :
                                        index === 1 ? 'text-slate-600' :
                                            index === 2 ? 'text-orange-600' : 'text-slate-400'
                                        }`}>
                                        {(member.points || 0) >= 1000
                                            ? `${((member.points || 0) / 1000).toFixed(1)}k`
                                            : member.points || 0} pts
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-6 text-slate-500 text-sm">
                            Chưa có thống kê
                        </div>
                    )}
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

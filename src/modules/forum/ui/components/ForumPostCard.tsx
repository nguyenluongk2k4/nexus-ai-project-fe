import React from 'react';
import {
    MessageSquare,
    Eye,
    Clock,
    Flame,
    ThumbsUp,
    ArrowRight,
    Sparkles,
    Diamond as DiamondIcon
} from 'lucide-react';
import { ForumPost } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';
import { ForumUserBadge } from './ForumUserBadge';

interface ForumPostCardProps {
    post: ForumPost;
    index: number;
    onNavigateToThread: (id: string) => void;
    getTimeAgo: (date: string | Date) => string;
    isHot: (post: ForumPost) => boolean;
    isNew: (post: ForumPost) => boolean;
    onLike: (postId: string) => void;
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({
    post,
    index,
    onNavigateToThread,
    getTimeAgo,
    isHot,
    isNew,
    onLike,
}) => {
    const { t } = useTranslation();

    return (
        <article
            onClick={() => onNavigateToThread(post.id)}
            className="group bg-white rounded-2xl border border-white/60 hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:-translate-y-1 animate-fade-in"
            style={{
                animationDelay: `${index * 100}ms`,
                transformStyle: 'preserve-3d'
            }}
        >
            <div className="p-7 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                                src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random&bold=true`}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">{post.author.name}</h4>
                                    <ForumUserBadge rank={post.author.rank} />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{getTimeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isHot(post) && (
                                <span className="shiny-tag flex items-center justify-center bg-red-500 text-white text-[16px] font-black rounded-full border border-white/20 min-w-[80px]">
                                    <span className="tracking-tight uppercase relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">HOT</span>
                                </span>
                            )}
                            {isNew(post) && (
                                <span className="shiny-tag flex items-center justify-center bg-cyan-500 text-white text-[16px] font-black rounded-full border border-white/20 min-w-[80px]">
                                    <span className="tracking-tight uppercase relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">{t('forum.badges.new')}</span>
                                </span>
                            )}
                            {post.categoryName && (
                                <span className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">
                                    {post.categoryName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors leading-snug">
                            {post.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed line-clamp-2">
                            {post.excerpt}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                        <div className="flex items-center gap-6">
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-600 rounded-lg transition-colors group/btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLike(post.id);
                                }}
                            >
                                <ThumbsUp className={`w-4 h-4 group-hover/btn:scale-110 transition-transform ${post.isLiked ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`} />
                                <span className={`text-sm font-bold ${post.isLiked ? 'text-blue-600' : 'text-slate-500'}`}>{post.stats.likes || 0}</span>
                            </button>

                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.stats.comments} {t('forum.comments')}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <Eye className="w-4 h-4" />
                                <span>{post.stats.views} {t('forum.views')}</span>
                            </div>
                        </div>

                        <span className="text-sm font-semibold text-violet-600 group-hover:text-violet-700 flex items-center gap-1">
                            {t('forum.readMore')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

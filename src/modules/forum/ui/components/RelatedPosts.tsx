import React from 'react';
import { MessageSquare, Code, Database, Bot } from 'lucide-react';
import { ForumPost } from '../../domain/entities/ForumEntities';
import { useNavigate } from 'react-router-dom';

interface RelatedPostsProps {
    posts: ForumPost[];
    loading?: boolean;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, loading }) => {
    const navigate = useNavigate();

    const getIcon = (categorySlug?: string) => {
        switch (categorySlug) {
            case 'software': return <Code className="w-4 h-4" />;
            case 'data': return <Database className="w-4 h-4" />;
            case 'ai': return <Bot className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getPaletteColor = (index: number) => {
        const palette = [
            'bg-blue-50 text-blue-600',
            'bg-orange-50 text-orange-600',
            'bg-violet-50 text-violet-600',
            'bg-pink-50 text-pink-600',
            'bg-emerald-50 text-emerald-600',
            'bg-cyan-50 text-cyan-600',
            'bg-indigo-50 text-indigo-600',
            'bg-rose-50 text-rose-600'
        ];
        return palette[index % palette.length];
    };

    const getTimeAgo = (dateInput: string | Date) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Vừa xong';
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        return `${days} ngày trước`;
    };

    if (loading) {
        return (
            <div className="rounded-2xl p-6" style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
            }}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                    <div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                <span className="p-2 bg-pink-100 rounded-lg text-pink-600 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-800">Chủ đề liên quan</h3>
            </div>
            <div className="space-y-4">
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        onClick={() => navigate(`/thread/${post.id}`)}
                        className="flex gap-3 group hover:bg-slate-50/80 p-2 -mx-2 rounded-xl transition-all cursor-pointer"
                    >
                        <div className="mt-1">
                            <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${getPaletteColor(index)}`}>
                                {/* Use category-specific icon, but cycle colors */}
                                {getIcon(post.categoryName?.toLowerCase().includes('software') ? 'software' :
                                    post.categoryName?.toLowerCase().includes('data') ? 'data' :
                                        post.categoryName?.toLowerCase().includes('ai') ? 'ai' : undefined)}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">
                                {post.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                <span className="flex items-center gap-0.5">
                                    <MessageSquare className="w-3 h-3" /> {post.stats.comments}
                                </span>
                                <span>•</span>
                                <span>{getTimeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { ChevronRight, ThumbsUp, MessageSquare, Share2, Bookmark, Clock, Reply, MoreHorizontal, Send, Image as ImageIcon, Code, Eye, Award, Edit, Trash } from 'lucide-react';
import { getThreadDetailsUseCase, addCommentUseCase, likePostUseCase, forumGateway, deletePostUseCase } from '../../providers';
import { ForumPost, ForumComment } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';
import { ForumUserBadge } from '../components/ForumUserBadge';
import { useTopContributors } from '../hooks/useTopContributors';
import { RelatedPosts } from '../components/RelatedPosts';
import { ImageGrid } from '../../../../shared/components/ImageGrid';

// Monthly Contributors Component (moved from ForumSidebar)
const MonthlyContributors = () => {
  const { contributors, loading, error } = useTopContributors(10);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500 text-sm">
        Không thể tải dữ liệu
      </div>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        Chưa có thống kê tháng này
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getMainContribution = (contributor: typeof contributors[0]) => {
    if (contributor.postsCount > contributor.commentsCount && contributor.postsCount > contributor.likesReceived) {
      return `${contributor.postsCount} bài viết`;
    } else if (contributor.likesReceived >= contributor.postsCount && contributor.likesReceived >= contributor.commentsCount) {
      return `${contributor.likesReceived} likes`;
    } else {
      return `${contributor.commentsCount} bình luận`;
    }
  };

  return (
    <div className="space-y-3">
      {contributors.map((contributor, index) => {
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
          <div
            key={contributor.userId}
            className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-slate-50/80 transition-all duration-200"
          >
            <img
              className={`w-10 h-10 rounded-full object-cover ${borderWidth} ${borderColor} shadow-sm`}
              src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.username)}&background=random`}
              alt={contributor.username}
            />

            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors">
                {contributor.username}
              </h5>
              <span className="text-xs text-slate-500">
                {getMainContribution(contributor)}
              </span>
            </div>

            <div className={`text-sm font-bold ${index === 0 ? 'text-yellow-500' :
              index === 1 ? 'text-slate-500' :
                index === 2 ? 'text-orange-500' : 'text-slate-400'
              }`}>
              {contributor.totalPoints >= 1000
                ? `${(contributor.totalPoints / 1000).toFixed(1)}k`
                : contributor.totalPoints} pts
            </div>
          </div>
        );
      })}
    </div>
  );
};


// Recursive CommentItem component for nested replies
interface CommentItemProps {
  comment: ForumComment;
  allComments: ForumComment[];
  depth: number;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  inlineReplyContent: string;
  setInlineReplyContent: (content: string) => void;
  isSubmitting: boolean;
  onSubmitReply: (parentId: string) => Promise<void>;
  postAuthorId: string;
}

function CommentItem({
  comment,
  allComments,
  depth,
  replyingToId,
  setReplyingToId,
  inlineReplyContent,
  setInlineReplyContent,
  isSubmitting,
  onSubmitReply,
  postAuthorId,
}: CommentItemProps) {
  const { t, i18n } = useTranslation();
  const replies = allComments.filter(c => c.parentId === comment.id);
  const maxDepth = 3;

  return (
    <>
      <div className={`${depth > 0 ? 'relative mt-4 ml-3 pl-3 sm:mt-6 sm:ml-10 sm:pl-8' : ''}`}>
        {/* Thread line for nested comments */}
        {depth > 0 && (
          <div
            className="absolute left-4 sm:left-7 top-[-20px] bottom-8 w-[2px] z-0"
            style={{
              background: 'linear-gradient(to bottom, #e2e8f0 0%, #e2e8f0 80%, transparent 100%)'
            }}
          />
        )}

        <div className="flex gap-3 sm:gap-4 relative z-10">
          <div className="flex-shrink-0">
            <img
              alt={comment.author.name}
              className={`${depth > 0 ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} rounded-full object-cover border border-white shadow-sm`}
              src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`${comment.author.id === postAuthorId ? 'bg-violet-500/5 border-violet-500/20' : 'bg-white border-slate-200'} rounded-2xl ${depth > 0 ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} shadow-sm border hover:border-violet-200 transition-colors`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{comment.author.name}</span>
                  <ForumUserBadge rank={comment.author.rank} />
                  {comment.author.id === postAuthorId && (
                    <ForumUserBadge isAuthor />
                  )}
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium ml-1">
                    {new Date(comment.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed overflow-wrap-anywhere">
                {comment.content}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2 ml-2">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {comment.likes > 0 ? comment.likes : '0'}
              </button>
              {depth < maxDepth && (
                <button
                  onClick={() => {
                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                    setInlineReplyContent('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('forum.thread.reply')}
                </button>
              )}
            </div>

            {/* Inline Reply Form */}
            {replyingToId === comment.id && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <textarea
                  value={inlineReplyContent}
                  onChange={(e) => setInlineReplyContent(e.target.value)}
                  placeholder={t('forum.thread.replyPlaceholder', { author: comment.author.name })}
                  className="w-full min-h-[60px] p-2 sm:p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs sm:text-sm bg-white/80"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={isSubmitting || !inlineReplyContent.trim()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] sm:text-xs font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? t('forum.thread.submitting') : t('forum.thread.submitComment')}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingToId(null);
                      setInlineReplyContent('');
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    {t('forum.thread.cancel')}
                  </button>
                </div>
              </div>
            )}
            {/* Render nested replies */}
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  allComments={allComments}
                  depth={depth + 1}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  inlineReplyContent={inlineReplyContent}
                  setInlineReplyContent={setInlineReplyContent}
                  isSubmitting={isSubmitting}
                  onSubmitReply={onSubmitReply}
                  postAuthorId={postAuthorId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [inlineReplyContent, setInlineReplyContent] = useState('');

  // Related Posts State
  const [relatedPosts, setRelatedPosts] = useState<ForumPost[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const handleDeletePost = async () => {
    if (!post) return;
    if (window.confirm(t('forum.thread.confirmDelete', 'Are you sure you want to delete this post?'))) {
      try {
        await deletePostUseCase.execute(post.id);
        navigate('/forum');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert(t('forum.thread.deleteFail', 'Failed to delete the post.'));
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getThreadDetailsUseCase.execute(id);
        setPost(data.post);
        setComments(data.comments);
        if (data.post) {
          setLikeCount(data.post.stats.likes);
          setIsLiked(data.post.isLiked || false);

          // Fetch related posts after getting the main post (to know category, though gateway handles it too)
          // But actually we can just pass categoryId if we had it, but here we just pass thread ID
          // and let backend handle lookup if category not passed, OR we pass it from data.post
          loadRelatedPosts(data.post.id, data.post.categoryId);
        }
      } catch (error) {
        console.error('Failed to load thread details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const loadRelatedPosts = async (postId: string, categoryId?: string) => {
    try {
      setRelatedLoading(true);
      const posts = await forumGateway.getRelatedPosts(postId, categoryId, 5);
      setRelatedPosts(posts);
    } catch (error) {
      console.error("Failed to load related posts", error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const onNavigateToSubForum = () => {
    if (post) {
      navigate(`/forum/${post.categoryId}`);
    } else {
      navigate('/forum');
    }
  };

  const handleLike = async () => {
    if (!id) return;
    try {
      const result = await likePostUseCase.execute(id);
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('Failed to like post:', error);
      alert(t('forum.thread.loginToLike'));
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !replyContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newComment = await addCommentUseCase.execute(id, replyContent.trim());
      setComments([...comments, newComment]);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(t('forum.thread.loginToComment'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">{t('forum.thread.notFound')}</div>
      </div>
    );
  }

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="flex-1 overflow-auto min-h-screen relative">
      {/* Mesh Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#f3f6ff',
          backgroundImage: `
            radial-gradient(at 10% 10%, hsla(256, 80%, 96%, 1) 0px, transparent 50%),
            radial-gradient(at 90% 10%, hsla(220, 80%, 96%, 1) 0px, transparent 50%),
            radial-gradient(at 50% 50%, hsla(280, 70%, 97%, 1) 0px, transparent 50%),
            radial-gradient(at 10% 90%, hsla(240, 70%, 96%, 1) 0px, transparent 50%),
            radial-gradient(at 90% 90%, hsla(200, 70%, 96%, 1) 0px, transparent 50%)
          `,
          backgroundAttachment: 'fixed'
        }}
      />

      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <button onClick={() => navigate('/forum')} className="hover:text-violet-600 transition-colors flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />{t('forum.home')}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <button onClick={onNavigateToSubForum} className="hover:text-violet-600 transition-colors">
            {post.categoryName}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-medium truncate">{post.title.substring(0, 40)}...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Thread Article - Glass Card */}
            <article
              className="rounded-3xl p-1 relative overflow-hidden shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
              }}
            >
              {/* Purple glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="bg-white/40 rounded-[1.3rem] p-4 sm:p-8 backdrop-blur-sm relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Avatar with ring */}
                    <div className="relative group cursor-pointer flex-shrink-0">
                      <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                        <img
                          alt={post.author.name}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white"
                          src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 hover:text-violet-600 cursor-pointer transition-colors truncate">
                          {post.author.name}
                        </h4>
                        <ForumUserBadge rank={post.author.rank} />
                        <ForumUserBadge isAuthor />
                        {post.author.points !== undefined && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {post.author.points} pts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> {getTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Category tag & Edit button */}
                  <div className="flex items-center gap-3 self-start sm:self-auto max-w-full">
                    {post.categoryName && (
                      <button
                        onClick={onNavigateToSubForum}
                        className="group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-all cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-500 animate-pulse flex-shrink-0"></span>
                        <span className="text-[10px] sm:text-xs font-bold text-violet-600 group-hover:text-violet-700 truncate">
                          {post.categoryName}
                        </span>
                      </button>
                    )}

                    {user?.id === post.author.id && (
                      <>
                        <button
                          onClick={() => navigate(`/forum/new?edit=${post.id}`)}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                          title={t('forum.thread.editPost', 'Edit Post')}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-bold truncate">
                            {t('forum.thread.edit', 'Edit')}
                          </span>
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 hover:text-red-700 transition-all cursor-pointer"
                          title={t('forum.thread.deletePost', 'Delete Post')}
                        >
                          <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-bold truncate">
                            {t('forum.thread.delete', 'Delete')}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight flex items-center gap-4">
                    {post.isHot && (
                      <span className="shiny-tag flex items-center justify-center bg-red-500 text-white text-[16px] font-black px-4 py-1 rounded-full border border-white/20 shadow-lg shadow-red-500/20">
                        <span className="tracking-tight uppercase relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">HOT</span>
                      </span>
                    )}
                    {post.title}
                  </h1>
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                    <p className="mb-4 whitespace-pre-wrap">{post.content || post.excerpt}</p>

                    {post.images && post.images.length > 0 && (
                      <div className="my-8">
                        <ImageGrid images={post.images} maxDisplay={4} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleLike}
                      className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${isLiked
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-500 hover:shadow-md'
                        }`}
                    >

                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-bold text-sm">{t('forum.thread.like')} ({likeCount})</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-500 text-slate-600 rounded-xl transition-all hover:shadow-md">
                      <Share2 className="w-5 h-5" />
                      <span className="font-bold text-sm hidden sm:inline">{t('forum.thread.share')}</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-yellow-400 hover:text-yellow-500 text-slate-600 rounded-xl transition-all hover:shadow-md">
                      <Bookmark className="w-5 h-5" />
                      <span className="font-bold text-sm hidden sm:inline">{t('forum.thread.save')}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {Number(post.stats.views).toLocaleString()} {t('forum.views')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> {comments.length} {t('forum.comments')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  {comments.length} {t('forum.comments')}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">{t('forum.thread.sort.label')}</span>
                  <select className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer p-0 pr-6">
                    <option>{t('forum.thread.sort.newest')}</option>
                    <option>{t('forum.thread.sort.mostLiked')}</option>
                    <option>{t('forum.thread.sort.oldest')}</option>
                  </select>
                </div>
              </div>

              {/* Comments List */}
              {rootComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl p-6 relative"
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)'
                  }}
                >
                  <CommentItem
                    comment={comment}
                    allComments={comments}
                    depth={0}
                    replyingToId={replyingToId}
                    setReplyingToId={setReplyingToId}
                    inlineReplyContent={inlineReplyContent}
                    setInlineReplyContent={setInlineReplyContent}
                    isSubmitting={isSubmitting}
                    postAuthorId={post.author.id}
                    onSubmitReply={async (parentId: string) => {
                      if (!id || !inlineReplyContent.trim() || isSubmitting) return;
                      try {
                        setIsSubmitting(true);
                        const newComment = await addCommentUseCase.execute(
                          id,
                          inlineReplyContent.trim(),
                          parentId
                        );
                        setComments([...comments, newComment]);
                        setInlineReplyContent('');
                        setReplyingToId(null);
                      } catch (error) {
                        setReplyingToId(null);
                        console.error('Failed to reply:', error);
                        alert(t('forum.thread.error.reply'));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Comment Form - Glass Card Sticky */}
            <div
              className="rounded-2xl p-6 sticky bottom-6 z-30 shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex gap-4">
                <img
                  alt="Me"
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`}
                />
                <div className="flex-1">
                  <form onSubmit={handleSubmitReply}>
                    <div className="relative group">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full bg-slate-50/80 border-0 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-violet-500/50 placeholder-slate-400 resize-y min-h-[100px] transition-all shadow-inner"
                        placeholder={t('forum.thread.writeComment')}
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-violet-600 transition-colors rounded-lg hover:bg-slate-200/50"
                          title="Chèn ảnh"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-violet-600 transition-colors rounded-lg hover:bg-slate-200/50"
                          title="Chèn code"
                        >
                          <Code className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{t('forum.thread.markdownSupported')}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyContent.trim()}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" /> {isSubmitting ? t('forum.thread.submitting') : t('forum.thread.submitComment')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Related Threads */}
            <RelatedPosts posts={relatedPosts} loading={relatedLoading} />

            {/* Top Contributors */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                <span className="p-2 bg-yellow-100 rounded-lg text-yellow-600 shadow-sm">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-800">🏆 Top Đóng Góp Tháng {new Date().getMonth() + 1} 🏆</h3>
              </div>
              <MonthlyContributors />
            </div>

            {/* Sponsored */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-center cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold text-white mb-3">
                  {t('forum.sidebar.sponsored.tag')}
                </span>
                <h3 className="text-white font-bold text-xl mb-2">{t('forum.sidebar.sponsored.title')}</h3>
                <p className="text-indigo-100 text-sm mb-4">{t('forum.sidebar.sponsored.desc')}</p>
                <button className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
                  {t('forum.sidebar.sponsored.button')}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200/50 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          </div>
          <p className="text-sm font-medium text-slate-500">{t('forum.footer')}</p>
        </div>
      </footer>
    </div>
  );
}

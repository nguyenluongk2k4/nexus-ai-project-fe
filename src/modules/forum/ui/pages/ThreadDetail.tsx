import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ThumbsUp, MessageSquare, Share2, Bookmark, Clock, Reply, MoreHorizontal, Send, Image as ImageIcon, Code, Eye, Award } from 'lucide-react';
import { getThreadDetailsUseCase, addCommentUseCase, likePostUseCase } from '../../providers';
import { ForumPost, ForumComment } from '../../domain/entities/ForumEntities';

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
  isAuthor?: boolean;
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
  isAuthor,
}: CommentItemProps) {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const maxDepth = 3;

  return (
    <>
      <div className={`${depth > 0 ? 'relative mt-6 ml-6 pl-6 sm:ml-10 sm:pl-8' : ''}`}>
        {/* Thread line for nested comments */}
        {depth > 0 && (
          <div
            className="absolute left-7 top-[-20px] bottom-8 w-[2px] z-0"
            style={{
              background: 'linear-gradient(to bottom, #e2e8f0 0%, #e2e8f0 80%, transparent 100%)'
            }}
          />
        )}

        <div className="flex gap-4 relative z-10">
          <div className="flex-shrink-0">
            <img
              alt={comment.author.name}
              className={`${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover border border-white shadow-sm`}
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`}
            />
          </div>
          <div className="flex-1">
            <div className={`${isAuthor ? 'bg-violet-500/5 border-violet-500/10' : 'bg-slate-50/80 border-slate-100'} rounded-2xl rounded-tl-none p-${depth > 0 ? '3.5' : '4'} shadow-sm border`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{comment.author.name}</span>
                  {isAuthor && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-600 text-white uppercase">
                      Author
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2 ml-2">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
                <ThumbsUp className="w-4 h-4" /> {comment.likes > 0 ? comment.likes : '0'}
              </button>
              {depth < maxDepth && (
                <button
                  onClick={() => {
                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                    setInlineReplyContent('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                >
                  <Reply className="w-4 h-4" /> Trả lời
                </button>
              )}
            </div>

            {/* Inline Reply Form */}
            {replyingToId === comment.id && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <textarea
                  value={inlineReplyContent}
                  onChange={(e) => setInlineReplyContent(e.target.value)}
                  placeholder={`Trả lời ${comment.author.name}...`}
                  className="w-full min-h-[60px] p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm bg-white/80"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={isSubmitting || !inlineReplyContent.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingToId(null);
                      setInlineReplyContent('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render nested replies */}
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
          isAuthor={false}
        />
      ))}
    </>
  );
}

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [inlineReplyContent, setInlineReplyContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getThreadDetailsUseCase.execute(Number(id));
        setPost(data.post);
        setComments(data.comments);
        if (data.post) {
          setLikeCount(data.post.stats.likes);
          setIsLiked(data.post.isLiked || false);
        }
      } catch (error) {
        console.error('Failed to load thread details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

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
      const result = await likePostUseCase.execute(Number(id));
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('Bạn cần đăng nhập để thích bài viết');
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !replyContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newComment = await addCommentUseCase.execute(Number(id), replyContent.trim());
      setComments([...comments, newComment]);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Bạn cần đăng nhập để bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
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
        <div className="text-xl font-bold">Thread not found</div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <button onClick={() => navigate('/forum')} className="hover:text-violet-600 transition-colors flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />Trang chủ
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

              <div className="bg-white/40 rounded-[1.3rem] p-6 sm:p-8 backdrop-blur-sm relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {/* Avatar with ring */}
                    <div className="relative group cursor-pointer">
                      <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                        <img
                          alt={post.author.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-slate-900 hover:text-violet-600 cursor-pointer transition-colors">
                          {post.author.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 uppercase tracking-wider shadow-sm">
                          VIP
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Code className="w-3.5 h-3.5" /> Tech Lead
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {getTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Category tag */}
                  {post.categoryName && (
                    <button
                      onClick={onNavigateToSubForum}
                      className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-all cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-violet-600 group-hover:text-violet-700">
                        {post.categoryName}
                      </span>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
                    {post.title}
                  </h1>
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                    <p className="mb-4 whitespace-pre-wrap">{post.content || post.excerpt}</p>
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
                      <span className="font-bold text-sm">Thích ({likeCount})</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-500 text-slate-600 rounded-xl transition-all hover:shadow-md">
                      <Share2 className="w-5 h-5" />
                      <span className="font-bold text-sm hidden sm:inline">Chia sẻ</span>
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-yellow-400 hover:text-yellow-500 text-slate-600 rounded-xl transition-all hover:shadow-md">
                      <Bookmark className="w-5 h-5" />
                      <span className="font-bold text-sm hidden sm:inline">Lưu</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {Number(post.stats.views).toLocaleString()} Lượt xem
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> {comments.length} Bình luận
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
                  {comments.length} Bình luận
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Sắp xếp:</span>
                  <select className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer p-0 pr-6">
                    <option>Mới nhất</option>
                    <option>Nhiều like nhất</option>
                    <option>Cũ nhất</option>
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
                    isAuthor={post.author.id === comment.author.id}
                    onSubmitReply={async (parentId: string) => {
                      if (!id || !inlineReplyContent.trim() || isSubmitting) return;
                      try {
                        setIsSubmitting(true);
                        const newComment = await addCommentUseCase.execute(
                          Number(id),
                          inlineReplyContent.trim(),
                          parentId
                        );
                        setComments([...comments, newComment]);
                        setInlineReplyContent('');
                        setReplyingToId(null);
                      } catch (error) {
                        console.error('Failed to reply:', error);
                        alert('Không thể trả lời. Vui lòng thử lại.');
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
                  src="https://ui-avatars.com/api/?name=User&background=random"
                />
                <div className="flex-1">
                  <form onSubmit={handleSubmitReply}>
                    <div className="relative group">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full bg-slate-50/80 border-0 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-violet-500/50 placeholder-slate-400 resize-y min-h-[100px] transition-all shadow-inner"
                        placeholder="Viết bình luận của bạn..."
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
                        <span className="text-xs text-slate-400">Định dạng Markdown được hỗ trợ</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyContent.trim()}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" /> {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
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
                <a className="flex gap-3 group hover:bg-slate-50/80 p-2 -mx-2 rounded-xl transition-all cursor-pointer" href="#">
                  <div className="mt-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                      <Code className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">
                      GPT-5 leak features: Multimodal native?
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" /> 32
                      </span>
                      <span>•</span>
                      <span>4 giờ trước</span>
                    </div>
                  </div>
                </a>
                <a className="flex gap-3 group hover:bg-slate-50/80 p-2 -mx-2 rounded-xl transition-all cursor-pointer" href="#">
                  <div className="mt-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600">
                      <Code className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">
                      Copilot X vs Cursor: Trải nghiệm thực tế cho Dev
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" /> 85
                      </span>
                      <span>•</span>
                      <span>1 ngày trước</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

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
                <h3 className="font-bold text-lg text-slate-800">Top đóng góp tháng</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-sm"
                        src="https://ui-avatars.com/api/?name=Nguyen+Luong&background=random"
                        alt="User"
                      />
                      <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                        #1
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">Nguyễn Lương</h5>
                      <span className="text-xs text-slate-500">240 bài viết</span>
                    </div>
                  </div>
                  <div className="text-yellow-500 font-bold text-sm">3.2k pts</div>
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-slate-300 shadow-sm"
                        src="https://ui-avatars.com/api/?name=Tran+Van+C&background=random"
                        alt="User"
                      />
                      <div className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                        #2
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">Trần Văn C</h5>
                      <span className="text-xs text-slate-500">180 bài viết</span>
                    </div>
                  </div>
                  <div className="text-slate-500 font-bold text-sm">2.1k pts</div>
                </div>
              </div>
            </div>

            {/* Sponsored */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-center cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold text-white mb-3">
                  Sponsored
                </span>
                <h3 className="text-white font-bold text-xl mb-2">Cloud Summit 2026</h3>
                <p className="text-indigo-100 text-sm mb-4">Sự kiện công nghệ lớn nhất năm. Đăng ký ngay để nhận vé Early Bird.</p>
                <button className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
                  Tìm hiểu thêm
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
          <p className="text-sm font-medium text-slate-500">© 2026 Diễn Đàn Công Nghệ. Crafted with passion.</p>
        </div>
      </footer>
    </div>
  );
}

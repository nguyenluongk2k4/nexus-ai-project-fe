import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ThumbsUp, MessageSquare, Share2, Bookmark, Clock, Reply } from 'lucide-react';
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
}: CommentItemProps) {
  // Find replies to this comment
  const replies = allComments.filter(c => c.parentId === comment.id);
  const maxDepth = 3; // Limit nesting depth

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-violet-100 pl-4' : ''}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className={`${depth > 0 ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-lg flex-shrink-0`}>
            {comment.author.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="text-foreground text-sm mb-2 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-600 transition-colors">
                <ThumbsUp className="w-3 h-3" />
                <span>{comment.likes}</span>
              </button>
              {depth < maxDepth && (
                <button
                  onClick={() => {
                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                    setInlineReplyContent('');
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-600 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Trả lời</span>
                </button>
              )}
            </div>

            {/* Inline Reply Form */}
            {replyingToId === comment.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <textarea
                  value={inlineReplyContent}
                  onChange={(e) => setInlineReplyContent(e.target.value)}
                  placeholder={`Trả lời ${comment.author.name}...`}
                  className="w-full min-h-[60px] p-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={isSubmitting || !inlineReplyContent.trim()}
                    className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-teal-500 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingToId(null);
                      setInlineReplyContent('');
                    }}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render replies recursively */}
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
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
            />
          ))}
        </div>
      )}
    </div>
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
          setIsLiked(data.post.isLiked || false);  // Initialize from server
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xl font-bold">Thread not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-[900px] mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
          <button
            onClick={() => navigate('/forum')}
            className="hover:text-violet-600 transition-colors"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={onNavigateToSubForum}
            className="hover:text-violet-600 transition-colors"
          >
            {post.categoryName}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[300px]">{post.title}</span>
        </div>

        {/* Main Thread Post */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-border mb-6">
          {/* Thread Header */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
                {post.author.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{post.author.name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span>•</span>
                  <span>{Number(post.stats.views).toLocaleString()} lượt xem</span>
                </div>
              </div>
              {post.categoryName && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${post.categoryColor || 'from-violet-500 to-purple-600'}`}>
                  {post.categoryName}
                </span>
              )}
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose prose-slate max-w-none mb-6">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {post.content || post.excerpt}
            </div>
          </div>

          {/* Thread Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${isLiked
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 hover:from-violet-100 hover:to-purple-100'
                }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>Thích ({likeCount})</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-all text-muted-foreground">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-all text-muted-foreground">
              <Bookmark className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            {comments.length} Bình luận
          </h2>

          <div className="space-y-4">
            {/* Build tree and render only root comments (no parentId) */}
            {comments
              .filter(c => !c.parentId)
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  allComments={comments}
                  depth={0}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  inlineReplyContent={inlineReplyContent}
                  setInlineReplyContent={setInlineReplyContent}
                  isSubmitting={isSubmitting}
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
              ))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
          <h3 className="text-lg font-bold mb-4">Viết bình luận</h3>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              className="w-full min-h-[120px] p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hãy lịch sự và tôn trọng mọi người trong cộng đồng
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

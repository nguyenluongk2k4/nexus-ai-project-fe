import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ThumbsUp, MessageSquare, Share2, Bookmark, Clock } from 'lucide-react';
import { getThreadDetailsUseCase } from '../../providers';
import { ForumPost, ForumComment } from '../../domain/entities/ForumEntities';

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getThreadDetailsUseCase.execute(Number(id));
        setPost(data.post);
        setComments(data.comments);
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

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reply submitted:', replyContent);
    // TODO: Call addCommentUseCase
    setReplyContent('');
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 hover:from-violet-100 hover:to-purple-100 transition-all font-medium">
              <ThumbsUp className="w-4 h-4" />
              <span>Thích ({post.stats.likes})</span>
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
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                    {comment.author.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.author.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-foreground mb-3 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
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
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Gửi bình luận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

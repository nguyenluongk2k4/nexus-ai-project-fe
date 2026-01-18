import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, User, PenSquare, Bot, Code, Database } from 'lucide-react';
import { getForumDashboardUseCase } from '../../providers';
import { ForumPost, ForumCategory, ForumStats } from '../../domain/entities/ForumEntities';

const ICON_MAP: Record<string, any> = {
  Bot,
  Code,
  Database,
};

export function Forum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getForumDashboardUseCase.execute();
        setPosts(data.latestPosts);
        setCategories(data.categories);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load forum data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const onNavigateToThread = (id: number) => {
    navigate(`/thread/${id}`);
  };

  const onNavigateToSubForum = (categoryId: string) => {
    navigate(`/forum/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/20">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
            Diễn Đàn Công Nghệ
          </h1>
          <p className="text-muted-foreground">
            Nơi chia sẻ kiến thức và kinh nghiệm về Công nghệ thông tin
          </p>
        </div>

        {/* Main Layout - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column - Latest Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-violet-600" />
              Bài viết mới nhất
            </h2>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border cursor-pointer"
                  onClick={() => onNavigateToThread(post.id)}
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl">
                      {post.author.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{post.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {post.categoryColor && (
                      <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${post.categoryColor}`}>
                        {post.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Post Title */}
                  <h3 className="text-xl font-bold mb-2 hover:text-violet-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Post Excerpt */}
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Post Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.stats.comments} bình luận</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.stats.views} lượt xem</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Categories & Actions */}
          <div className="space-y-4">
            {/* Create Post Button */}
            <button
              onClick={() => navigate('/forum/new')}
              className="w-full bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <PenSquare className="w-5 h-5" />
              Tạo bài viết mới
            </button>

            {/* Categories Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-bold mb-4">Danh mục Diễn đàn</h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.iconName] || Bot;
                  return (
                    <button
                      key={category.id}
                      onClick={() => onNavigateToSubForum(category.id)}
                      className="w-full flex items-start gap-3 p-4 rounded-lg hover:bg-accent transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1 group-hover:text-violet-600 transition-colors">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats Card */}
            {stats && (
              <div className="bg-gradient-to-br from-violet-50 to-teal-50 rounded-xl p-6 border border-violet-100">
                <h3 className="text-lg font-bold mb-4">Thống kê diễn đàn</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng bài viết</span>
                    <span className="font-bold text-violet-600">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Thành viên</span>
                    <span className="font-bold text-violet-600">{stats.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trực tuyến</span>
                    <span className="font-bold text-teal-600">{stats.onlineMembers}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

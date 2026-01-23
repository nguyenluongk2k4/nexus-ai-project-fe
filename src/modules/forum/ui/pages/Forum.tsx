import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  PenSquare,
  Bot,
  Code,
  Database,
  TrendingUp,
  Users,
  Tag,
  Award,
  ArrowRight,
  Search,
  Filter,
  Clock,
  Flame,
  Pin,
  ThumbsUp,
  Heart,
  Lightbulb,
  Target as TargetIcon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getForumDashboardUseCase } from '../../providers';
import { ForumPost, ForumCategory, ForumStats } from '../../domain/entities/ForumEntities';

const ICON_MAP: Record<string, any> = {
  Bot,
  Code,
  Database,
};

// Mock data for UI-only features
const MOCK_TOP_MEMBERS = [
  { id: 1, name: 'User A', avatar: '👤', isOnline: true, isTopContributor: true },
  { id: 2, name: 'User B', avatar: '👤', isOnline: true, isTopContributor: false },
  { id: 3, name: 'User C', avatar: '👤', isOnline: true, isTopContributor: false },
  { id: 4, name: 'User D', avatar: '👤', isOnline: false, isTopContributor: false },
];

const MOCK_HOT_TAGS = ['ReactJS', 'ChatGPT', 'Python', 'MachineLearning', 'Startup', 'CareerAdvice'];

const MOCK_REACTIONS = [
  { icon: ThumbsUp, label: 'Helpful', count: 24, color: 'text-blue-600' },
  { icon: Heart, label: 'Love', count: 18, color: 'text-rose-600' },
  { icon: Lightbulb, label: 'Insightful', count: 12, color: 'text-amber-600' },
];

export function Forum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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

  const getTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const isHot = (post: ForumPost) => Number(post.stats.views) > 500 || Number(post.stats.comments) > 20;
  const isNew = (post: ForumPost) => {
    const date = typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt;
    return Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-100/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Top Bar with Search - Glassmorphic */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/60 shadow-lg shadow-purple-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar with shimmer effect */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, thảo luận..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Filter with glass effect */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 font-medium text-slate-700 cursor-pointer shadow-sm hover:bg-white/80 transition-all"
              >
                <option value="all">Tất cả</option>
                <option value="hot">🔥 Hot</option>
                <option value="new">✨ Mới nhất</option>
                <option value="unanswered">❓ Chưa trả lời</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Create Button with glow */}
            <button
              onClick={() => navigate('/forum/new')}
              className="relative flex items-center gap-2 px-6 py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <PenSquare className="w-5 h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Tạo bài viết</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Thảo luận cộng đồng</h1>
                <p className="text-slate-600">Khám phá những bài viết chất lượng từ cộng đồng</p>
              </div>
            </div>

            {/* Posts List with Stagger Animation */}
            <div className="space-y-5">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  onClick={() => onNavigateToThread(post.id)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:-translate-y-1 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="p-7 relative">
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      {/* Author Info & Badges Row */}
                      <div className="flex items-start justify-between mb-4">
                        {/* Author Info - Left */}
                        <div className="flex items-center gap-3">
                          <img
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random&bold=true`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{post.author.name}</h4>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase tracking-wide">
                                Expert
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{getTimeAgo(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges - Right */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isHot(post) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 text-xs font-bold rounded-full border border-orange-200 shadow-sm animate-pulse-slow">
                              <Flame className="w-3.5 h-3.5 animate-pulse" />
                              HOT
                            </span>
                          )}
                          {isNew(post) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 shadow-sm">
                              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                              NEW
                            </span>
                          )}
                          {post.categoryName && (
                            <span className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">
                              {post.categoryName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Reactions Preview */}
                      <div className="flex items-center gap-4 mb-4">
                        {MOCK_REACTIONS.slice(0, 3).map((reaction, idx) => {
                          const Icon = reaction.icon;
                          return (
                            <button
                              key={idx}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group/reaction"
                            >
                              <Icon className={`w-4 h-4 ${reaction.color} group-hover/reaction:scale-110 transition-transform`} />
                              <span className="text-xs font-semibold text-slate-600">{Math.floor(Math.random() * 20) + 5}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Stats Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex gap-5 text-sm font-medium text-slate-500">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.stats.comments} câu trả lời</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{post.stats.views} lượt xem</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-violet-600 group-hover:text-violet-700 flex items-center gap-1">
                          Đọc chi tiết
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-4">
              <button className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-600 hover:text-violet-600 font-semibold rounded-xl transition-all">
                Tải thêm bài viết
              </button>
            </div>
          </div>

          {/* Sidebar - Glassmorphic */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Live Activity with glow */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Đang diễn ra
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">👥 Đang online</span>
                  <span className="font-bold text-green-600">{stats?.onlineMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">💬 Thảo luận active</span>
                  <span className="font-bold text-slate-900">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">✍️ Đang viết bài</span>
                  <span className="font-bold text-violet-600">3</span>
                </div>
              </div>
            </div>

            {/* Categories - Glass */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.iconName] || Bot;
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
                        <span className="text-xs text-slate-500">{category.postCount || 0} bài viết</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats - Animated */}
            {stats && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Tổng bài viết</span>
                    <span className="text-2xl font-bold text-slate-900">{stats.totalPosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Thành viên</span>
                    <span className="text-2xl font-bold text-slate-900">{stats.totalMembers.toLocaleString()}</span>
                  </div>

                  {/* Activity Chart */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Hoạt động 7 ngày</p>
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

            {/* Top Members - Interactive */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Thành viên nổi bật</h3>
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

            {/* Hot Tags - Animated */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Chủ đề nổi bật</h3>
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
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-blob {
          animation: blob 10s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

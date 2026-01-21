import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  PenSquare,
  Bot,
  Code,
  Database,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  Tag,
  Award,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getForumDashboardUseCase } from '../../providers';
import { ForumPost, ForumCategory, ForumStats } from '../../domain/entities/ForumEntities';

const ICON_MAP: Record<string, any> = {
  Bot,
  Code,
  Database,
};

const ICON_MAP_SIDEBAR: Record<string, any> = {
  Bot: 'smart_toy',
  Code: 'code',
  Database: 'storage',
};

// Mock data for UI-only features
const MOCK_TOP_MEMBERS = [
  { id: 1, name: 'User A', avatar: '👤', isOnline: true, isTopContributor: true },
  { id: 2, name: 'User B', avatar: '👤', isOnline: true, isTopContributor: false },
  { id: 3, name: 'User C', avatar: '👤', isOnline: true, isTopContributor: false },
  { id: 4, name: 'User D', avatar: '👤', isOnline: false, isTopContributor: false },
];

const MOCK_HOT_TAGS = ['#ReactJS', '#ChatGPT', '#Python', '#MachineLearning', '#Startup', '#Tuyendung'];

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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-screen relative">
      {/* Mesh Background */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-cyan-50"></div>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `
                        radial-gradient(at 80% 0%, hsla(250,60%,94%,1) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, hsla(220,70%,94%,1) 0px, transparent 50%),
                        radial-gradient(at 80% 50%, hsla(260,60%,92%,1) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, hsla(220,70%,96%,1) 0px, transparent 50%),
                        radial-gradient(at 80% 100%, hsla(240,60%,94%,1) 0px, transparent 50%)
                    `,
        }}
      ></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
                <Sparkles className="w-8 h-8 text-violet-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Thảo luận nổi bật</h2>
                <p className="text-sm text-slate-500">Những bài viết đang được quan tâm nhất</p>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onNavigateToThread(post.id)}
                  className="group bg-white/70 backdrop-blur-md rounded-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative cursor-pointer border border-white/50 shadow-sm hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-7 relative z-10">
                    {/* Header - Author & Category */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl border-2 border-white shadow-sm">
                            {post.author.avatar}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {post.author.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>Tech Lead</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{getTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {post.categoryName && (
                        <span
                          className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${post.categoryColor || 'from-purple-500 to-indigo-600'
                            } text-white shadow-md backdrop-blur-sm border border-white/20`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 shadow-sm"></span>
                          {post.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mb-5">
                      <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-cyan-600 transition-all">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-2 font-medium">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer - Stats & Action */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-200/50">
                      <div className="flex gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2 hover:text-violet-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100/50">
                          <MessageSquare className="w-5 h-5" />
                          <span>{post.stats.comments} thảo luận</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1">
                          <Eye className="w-5 h-5" />
                          <span>{post.stats.views} lượt xem</span>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1.5 transition-all group-hover:translate-x-1 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full">
                        Đọc chi tiết <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-12 pb-4">
              <button className="px-8 py-3.5 rounded-full border border-slate-200/60 bg-white/50 backdrop-blur-md text-slate-600 hover:bg-white hover:text-violet-600 hover:shadow-lg hover:shadow-violet-500/10 transition-all font-semibold text-sm">
                Xem thêm bài viết cũ hơn
              </button>
            </div>
          </div>

          {/* Sidebar - Right */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Create Post CTA */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl p-8 text-center transform hover:-translate-y-1 hover:shadow-2xl transition duration-500 border border-white/20"
              style={{
                background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
              }}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 bg-white/20 p-4 rounded-full backdrop-blur-md shadow-inner border border-white/30 hover:scale-110 transition-transform duration-300">
                  <PenSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-extrabold text-2xl mb-2">Bạn có câu hỏi?</h3>
                <p className="text-white/90 text-sm mb-6 font-medium leading-relaxed">
                  Kết nối cùng hàng ngàn chuyên gia công nghệ và nhận giải đáp ngay lập tức.
                </p>
                <button
                  onClick={() => navigate('/forum/new')}
                  className="w-full bg-white text-cyan-600 font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <PenSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Tạo bài viết mới
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-800">Danh mục</h3>
              </div>
              <div className="space-y-4">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.iconName] || Bot;
                  return (
                    <button
                      key={category.id}
                      onClick={() => onNavigateToSubForum(category.id)}
                      className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-white/40 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-purple-200/50 backdrop-blur-sm text-left"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-violet-600 transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                  <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-lg text-slate-800">Thống kê</h3>
                </div>
                <ul className="space-y-4 mb-6">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Tổng bài viết</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      {stats.totalPosts.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Thành viên</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      {stats.totalMembers.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Trực tuyến</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="font-bold text-green-600">{stats.onlineMembers}</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {/* Top Members - UI Only */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                <span className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-800">Thành viên ưu tú</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {MOCK_TOP_MEMBERS.map((member) => (
                  <div key={member.id} className="relative group cursor-pointer">
                    {member.isTopContributor && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                    )}
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center text-xl border-2 border-white shadow-sm group-hover:scale-110 transition duration-200">
                      {member.avatar}
                    </div>
                    {member.isOnline && (
                      <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    )}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 hover:text-violet-600 transition-colors">
                  +12
                </div>
              </div>
            </div>

            {/* Hot Tags - UI Only */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                <span className="p-2 bg-pink-100 rounded-lg text-pink-600">
                  <Tag className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-800">Chủ đề nóng</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {MOCK_HOT_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-violet-500/50 hover:text-violet-600 text-xs font-semibold text-slate-600 rounded-lg transition-all shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
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
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          </div>
          <p className="text-sm font-medium text-slate-500">© 2026 Diễn Đàn Công Nghệ. Crafted with passion.</p>
        </div>
      </footer>
    </div>
  );
}

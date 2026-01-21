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
    <div className="flex-1 overflow-auto min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{/*  */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header */}
            <div className="flex items-end gap-4 mb-10 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Thảo luận nổi bật</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Những bài viết chuyên sâu được cộng đồng quan tâm nhất</p>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onNavigateToThread(post.id)}
                  className="group bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer relative"
                >
                  {/* Header - Author & Category */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <img
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{post.author.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                          <span className="text-purple-700 font-semibold">Tech Lead</span>
                          <span className="text-slate-300">•</span>
                          <span>{getTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {post.categoryName && (
                      <span className="inline-flex items-center px-3 py-1 rounded border border-purple-100 bg-purple-50 text-purple-700 text-xs font-semibold tracking-wide">
                        {post.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors cursor-pointer leading-tight font-sans">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed font-normal">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer - Stats & Action */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex gap-6 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-2 hover:text-slate-800 cursor-pointer transition-colors">
                        <MessageSquare className="w-[18px] h-[18px]" />
                        <span>{post.stats.comments} thảo luận</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-[18px] h-[18px]" />
                        <span>{post.stats.views} lượt xem</span>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-all group-hover:translate-x-1">
                      Đọc chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-12 pb-4">
              <button className="px-8 py-3 rounded-md border border-slate-300 bg-white text-slate-600 hover:border-purple-700 hover:text-purple-700 transition-all font-semibold text-sm">
                Xem thêm bài viết cũ hơn
              </button>
            </div>
          </div>

          {/* Sidebar - Right */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Create Post CTA */}
            <div className="bg-white rounded-xl shadow-sm border-t-4 border-purple-700 p-8 text-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 bg-purple-50 p-3 rounded-full text-purple-700">
                  <PenSquare className="w-8 h-8" />
                </div>
                <h3 className="text-slate-900 font-serif font-bold text-xl mb-2">Bạn có câu hỏi?</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Kết nối cùng chuyên gia và nhận giải đáp ngay lập tức.
                </p>
                <button
                  onClick={() => navigate('/forum/new')}
                  className="w-full bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-purple-800 transition-colors flex items-center justify-center gap-2 group"
                >
                  <PenSquare className="w-5 h-5" />
                  Tạo bài viết mới
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 font-serif">Danh mục</h3>
              </div>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = ICON_MAP[category.iconName] || Bot;
                  return (
                    <button
                      key={category.id}
                      onClick={() => onNavigateToSubForum(category.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group text-left"
                    >
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-purple-700 transition-colors" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-slate-700 group-hover:text-purple-700 transition-colors">
                          {category.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{category.postCount || 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-lg text-slate-900 font-serif">Thống kê</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Tổng bài viết</span>
                    <span className="font-mono font-bold text-slate-900">{stats.totalPosts.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Thành viên</span>
                    <span className="font-mono font-bold text-slate-900">{stats.totalMembers.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Trực tuyến</span>
                    <span className="font-mono font-bold text-green-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {stats.onlineMembers}
                    </span>
                  </li>
                </ul>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Hoạt động tuần qua</p>
                  <div className="h-16 flex items-end gap-1.5 opacity-90">
                    <div className="w-1/7 bg-slate-200 rounded-sm h-[30%]"></div>
                    <div className="w-1/7 bg-slate-200 rounded-sm h-[45%]"></div>
                    <div className="w-1/7 bg-slate-200 rounded-sm h-[35%]"></div>
                    <div className="w-1/7 bg-slate-300 rounded-sm h-[60%]"></div>
                    <div className="w-1/7 bg-slate-300 rounded-sm h-[50%]"></div>
                    <div className="w-1/7 bg-purple-700/70 rounded-sm h-[75%]"></div>
                    <div className="w-1/7 bg-purple-700 rounded-sm h-[90%]"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Members - UI Only */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 font-serif">Thành viên ưu tú</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {MOCK_TOP_MEMBERS.map((member) => (
                  <div key={member.id} className="relative group cursor-pointer" title={member.name}>
                    <img
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover hover:border-purple-700 transition-colors"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                      alt={member.name}
                    />
                    {member.isTopContributor && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] border border-slate-200">
                        <Award className="w-3 h-3 text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer hover:border-purple-700 hover:text-purple-700 transition-colors">
                  +5
                </div>
              </div>
            </div>

            {/* Hot Tags - UI Only */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900 font-serif">Chủ đề nóng</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_HOT_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-700 hover:text-purple-700 text-xs font-semibold text-slate-600 rounded transition-all"
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
      <footer className="bg-white border-t border-slate-200 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4 opacity-50">
            <Code className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">© 2026 Diễn Đàn Công Nghệ. Professional Community.</p>
        </div>
      </footer>
    </div>
  );
}

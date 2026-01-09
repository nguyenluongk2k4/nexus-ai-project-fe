import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, MessageSquare, Eye, User, TrendingUp, Clock, Bot, Code, Database } from 'lucide-react';
import { getPostsByCategoryUseCase } from '../../providers';
import { ForumPost, ForumCategory } from '../../domain/entities/ForumEntities';

const ICON_MAP: Record<string, any> = {
  Bot,
  Code,
  Database,
};

export function SubForum() {
  const { category: categoryId = 'ai' } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getPostsByCategoryUseCase.execute(categoryId);
        setCategory(data.category);
        setThreads(data.posts);
      } catch (error) {
        console.error('Failed to load subforum data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  const onNavigateToThread = (id: number) => {
    navigate(`/thread/${id}`);
  };

  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === 'popular') {
      return (Number(b.stats.views) || 0) - (Number(a.stats.views) || 0); // Handle string views if needed or convert in entity
    }
    // Default to latest (createdAt)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
     return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!category) {
    return <div className="flex-1 p-6">Category not found</div>;
  }

  const Icon = ICON_MAP[category.iconName] || Bot;

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
          <button 
            onClick={() => navigate('/forum')}
            className="hover:text-violet-600 transition-colors"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-8 mb-6 text-white shadow-lg`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-white/90">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                sortBy === 'latest'
                  ? 'bg-gradient-to-r from-violet-600 to-teal-500 text-white'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                sortBy === 'popular'
                  ? 'bg-gradient-to-r from-violet-600 to-teal-500 text-white'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Phổ biến
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{threads.length}</span> chủ đề
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-2">
          {sortedThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onNavigateToThread(thread.id)}
              className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border cursor-pointer ${
                thread.isPinned ? 'border-violet-300 bg-violet-50/50' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                  {thread.author.avatar}
                </div>

                {/* Thread Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold hover:text-violet-600 transition-colors flex-1">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {thread.isPinned && (
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                          📌 Ghim
                        </span>
                      )}
                      {thread.isHot && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          🔥 Hot
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{thread.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-violet-600 font-semibold">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.stats.comments}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">trả lời</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-teal-600 font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>{thread.stats.views}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">lượt xem</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-white border border-border hover:bg-accent transition-all">
              Trang trước
            </button>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-teal-500 text-white font-medium">
              1
            </button>
            <button className="px-4 py-2 rounded-lg bg-white border border-border hover:bg-accent transition-all">
              2
            </button>
            <button className="px-4 py-2 rounded-lg bg-white border border-border hover:bg-accent transition-all">
              3
            </button>
            <button className="px-4 py-2 rounded-lg bg-white border border-border hover:bg-accent transition-all">
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, MessageSquare, Eye, User, TrendingUp, Clock, Bot, Code, Database } from 'lucide-react';

interface Thread {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isHot?: boolean;
}

export function SubForum() {
  const { category = 'ai' } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const onNavigateToThread = (id: number) => {
    navigate(`/thread/${id}`);
  };

  const categoryInfo = {
    ai: {
      name: 'Trí tuệ Nhân tạo (AI)',
      icon: Bot,
      color: 'from-violet-500 to-purple-600',
      description: 'Thảo luận về Machine Learning, Deep Learning, NLP và các công nghệ AI'
    },
    software: {
      name: 'Phát triển Phần mềm',
      icon: Code,
      color: 'from-blue-500 to-cyan-600',
      description: 'Chia sẻ kinh nghiệm về Web, Mobile, Desktop Development'
    },
    data: {
      name: 'Phân tích Dữ liệu',
      icon: Database,
      color: 'from-orange-500 to-red-600',
      description: 'Data Science, Analytics, Visualization và Big Data'
    }
  };

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.ai;
  const Icon = currentCategory.icon;

  const [threads] = useState<Thread[]>([
    {
      id: 1,
      title: "Thảo luận về mô hình GPT-4 và ứng dụng trong thực tế",
      author: "Nguyễn Văn A",
      authorAvatar: "👨‍💻",
      date: "29/10/2024",
      replies: 15,
      views: 2534,
      isPinned: true,
      isHot: true
    },
    {
      id: 4,
      title: "Machine Learning Deployment Best Practices 2024",
      author: "Phạm Thị D",
      authorAvatar: "👨‍🔬",
      date: "29/10/2024",
      replies: 31,
      views: 4123,
      isHot: true
    },
    {
      id: 7,
      title: "Neural Networks từ cơ bản đến nâng cao",
      author: "Đặng Văn G",
      authorAvatar: "🧑‍🏫",
      date: "28/10/2024",
      replies: 27,
      views: 5342
    },
    {
      id: 8,
      title: "Computer Vision với OpenCV và TensorFlow",
      author: "Mai Văn H",
      authorAvatar: "👨‍💼",
      date: "28/10/2024",
      replies: 19,
      views: 3256
    },
    {
      id: 9,
      title: "Natural Language Processing - Xử lý ngôn ngữ tự nhiên",
      author: "Phan Thị I",
      authorAvatar: "👩‍🔬",
      date: "27/10/2024",
      replies: 23,
      views: 2891
    },
    {
      id: 10,
      title: "Reinforcement Learning trong game AI",
      author: "Lý Văn K",
      authorAvatar: "🧑‍💻",
      date: "27/10/2024",
      replies: 14,
      views: 1876
    },
    {
      id: 11,
      title: "Transfer Learning và Fine-tuning models",
      author: "Bùi Thị L",
      authorAvatar: "👩‍🎓",
      date: "26/10/2024",
      replies: 18,
      views: 2145
    }
  ]);

  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === 'popular') {
      return b.views - a.views;
    }
    return 0; // Keep original order for 'latest'
  });

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/20">
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
          <span className="text-foreground font-medium">{currentCategory.name}</span>
        </div>

        {/* Category Header */}
        <div className={`bg-gradient-to-r ${currentCategory.color} rounded-2xl p-8 mb-6 text-white shadow-lg`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{currentCategory.name}</h1>
              <p className="text-white/90">{currentCategory.description}</p>
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
              onClick={() => onNavigateToThread?.(thread.id)}
              className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border cursor-pointer ${
                thread.isPinned ? 'border-violet-300 bg-violet-50/50' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                  {thread.authorAvatar}
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
                      <span>{thread.author}</span>
                    </div>
                    <span>•</span>
                    <span>{thread.date}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-violet-600 font-semibold">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.replies}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">trả lời</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-teal-600 font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>{thread.views.toLocaleString()}</span>
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

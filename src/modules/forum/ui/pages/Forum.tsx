import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Code,
  Database,
} from 'lucide-react';
import { getForumDashboardUseCase, likePostUseCase } from '../../providers';
import { ForumPost, ForumCategory, ForumStats } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';
import { PageLoading } from '@/shared/components/PageLoading';

// Sub-components
import { ForumHeader } from '../components/ForumHeader';
import { ForumPostCard } from '../components/ForumPostCard';
import { ForumSidebar } from '../components/ForumSidebar';

// Styles
import '../components/ForumStyles.css';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { t } = useTranslation();

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

  const onNavigateToThread = (id: string) => {
    navigate(`/thread/${id}`);
  };

  const onNavigateToSubForum = (categoryId: string) => {
    navigate(`/forum/${categoryId}`);
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

  const isHot = (post: ForumPost) => Number(post.stats.views) > 500 || Number(post.stats.comments) > 20;
  const isNew = (post: ForumPost) => {
    const date = typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt;
    return Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query)
      );
    }

    switch (selectedFilter) {
      case 'hot':
        result = result.filter((p) => isHot(p));
        result.sort((a, b) => Number(b.stats.views) - Number(a.stats.views));
        break;
      case 'new':
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'unanswered':
        result = result.filter((p) => Number(p.stats.comments) === 0);
        break;
      default:
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
    }

    return result;
  }, [posts, searchQuery, selectedFilter]);

  if (loading) return <PageLoading message={t('forum.loading')} />;

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          stats: {
            ...post.stats,
            likes: post.isLiked ? Number(post.stats.likes) - 1 : Number(post.stats.likes) + 1
          }
        };
      }
      return post;
    }));

    try {
      await likePostUseCase.execute(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert on error
      const data = await getForumDashboardUseCase.execute();
      setPosts(data.latestPosts);
    }
  };

  return (
    <div className="flex-1 overflow-auto min-h-screen relative bg-white">
      <ForumHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onCreatePost={() => navigate('/forum/new')}
      />

      <main className=" mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{t('forum.hero.title')}</h1>
              <p className="text-slate-600">{t('forum.hero.subtitle')}</p>
            </div>

            <div className="space-y-5">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-500 font-medium">{t('forum.noResults', 'Không tìm thấy bài viết nào')}</p>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    index={index}
                    onNavigateToThread={onNavigateToThread}
                    getTimeAgo={getTimeAgo}
                    isHot={isHot}
                    isNew={isNew}
                    onLike={handleLike}
                  />
                ))
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-violet-600 hover:text-violet-600 font-semibold rounded-xl transition-all">
                {t('forum.loadMore')}
              </button>
            </div>
          </div>

          <ForumSidebar
            stats={stats}
            categories={categories}
            onNavigateToSubForum={onNavigateToSubForum}
            iconMap={ICON_MAP}
            topMembers={stats?.topMembers}
          />
        </div>
      </main>
    </div>
  );
}

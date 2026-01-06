import { ForumGateway } from '../ports/ForumGateway';
import { ForumPost, ForumCategory, ForumStats } from '../entities/ForumEntities';

export class ForumService {
  constructor(private gateway: ForumGateway) {}

  async getDashboardData(): Promise<{
    stats: ForumStats;
    categories: ForumCategory[];
    latestPosts: ForumPost[];
  }> {
    const [stats, categories, latestPosts] = await Promise.all([
      this.gateway.getStats(),
      this.gateway.getCategories(),
      this.gateway.getLatestPosts(),
    ]);

    return {
      stats,
      categories,
      latestPosts,
    };
  }

  async getCategoryById(categoryId: string): Promise<ForumCategory | null> {
    return this.gateway.getCategoryById(categoryId);
  }

  async getPostsByCategory(categoryId: string): Promise<ForumPost[]> {
    return this.gateway.getPostsByCategory(categoryId);
  }

  async getPostDetails(postId: number) {
    const [post, comments] = await Promise.all([
      this.gateway.getPostDetails(postId),
      this.gateway.getComments(postId),
    ]);
    return { post, comments };
  }
}

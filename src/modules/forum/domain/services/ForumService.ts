import { ForumGateway, LikeResult } from '../ports/ForumGateway';
import { ForumPost, ForumCategory, ForumStats, ForumComment, ThreadDetails, ForumUser } from '../entities/ForumEntities';

export class ForumService {
  constructor(private gateway: ForumGateway) { }

  async getDashboardData(): Promise<{
    stats: ForumStats;
    categories: ForumCategory[];
    latestPosts: ForumPost[];
    topMembers: ForumUser[];
  }> {
    return this.gateway.getDashboard();
  }

  async getCategoryById(categoryId: string): Promise<ForumCategory | null> {
    return this.gateway.getCategoryById(categoryId);
  }

  async getPostsByCategory(categoryId: string, params?: any): Promise<{ posts: ForumPost[]; total: number }> {
    return this.gateway.getPostsByCategory(categoryId, params);
  }

  async getPostDetails(postId: string): Promise<ThreadDetails> {
    return this.gateway.getThreadDetails(postId);
  }

  async addComment(postId: string, content: string, parentId?: string): Promise<ForumComment> {
    return this.gateway.addComment(postId, content, parentId);
  }

  async likePost(postId: string): Promise<LikeResult> {
    return this.gateway.likePost(postId);
  }

  async createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost> {
    return this.gateway.createPost(post);
  }

  async deletePost(postId: string): Promise<boolean> {
    return this.gateway.deletePost(postId);
  }
}


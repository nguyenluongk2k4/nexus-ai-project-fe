import { ForumPost, ForumCategory, ForumComment, ForumStats, ThreadDetails, ForumUser, ContributorStats } from '../entities/ForumEntities';

export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

export interface GetPostsParams {
  sort?: 'newest' | 'popular' | 'hot';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ForumGateway {
  getStats(): Promise<ForumStats>;
  getCategories(): Promise<ForumCategory[]>;
  getCategoryById(id: string): Promise<ForumCategory | null>;
  getLatestPosts(): Promise<ForumPost[]>;
  getPostsByCategory(categoryId: string, params?: GetPostsParams): Promise<{ posts: ForumPost[]; total: number }>;
  getPostDetails(postId: string): Promise<ForumPost | null>;
  getComments(postId: string): Promise<ForumComment[]>;
  getThreadDetails(postId: string): Promise<ThreadDetails>;
  getDashboard(): Promise<{
    stats: ForumStats;
    categories: ForumCategory[];
    latestPosts: ForumPost[];
    topMembers: ForumUser[];
  }>;
  createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost>;
  addComment(postId: string, content: string, parentId?: string): Promise<ForumComment>;
  likePost(postId: string): Promise<LikeResult>;
  getTopContributors(limit?: number, month?: number, year?: number): Promise<ContributorStats[]>;
  getRelatedPosts(postId: string, categoryId?: string, limit?: number): Promise<ForumPost[]>;
}


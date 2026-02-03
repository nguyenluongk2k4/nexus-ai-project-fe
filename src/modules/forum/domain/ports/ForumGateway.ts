import { ForumPost, ForumCategory, ForumComment, ForumStats, ThreadDetails } from '../entities/ForumEntities';

export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

export interface ForumGateway {
  getStats(): Promise<ForumStats>;
  getCategories(): Promise<ForumCategory[]>;
  getCategoryById(id: string): Promise<ForumCategory | null>;
  getLatestPosts(): Promise<ForumPost[]>;
  getPostsByCategory(categoryId: string): Promise<ForumPost[]>;
  getPostDetails(postId: string): Promise<ForumPost | null>;
  getComments(postId: string): Promise<ForumComment[]>;
  getThreadDetails(postId: string): Promise<ThreadDetails>;
  createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost>;
  addComment(postId: string, content: string, parentId?: string): Promise<ForumComment>;
  likePost(postId: string): Promise<LikeResult>;
}


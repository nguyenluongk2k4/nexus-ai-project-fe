import { ForumPost, ForumCategory, ForumComment, ForumStats } from '../entities/ForumEntities';

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
  getPostDetails(postId: number): Promise<ForumPost | null>;
  getComments(postId: number): Promise<ForumComment[]>;
  createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost>;
  addComment(postId: number, content: string, parentId?: string): Promise<ForumComment>;
  likePost(postId: number): Promise<LikeResult>;
}


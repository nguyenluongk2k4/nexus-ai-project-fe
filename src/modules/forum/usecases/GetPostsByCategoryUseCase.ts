import { ForumService } from '../domain/services/ForumService';
import { ForumPost, ForumCategory } from '../domain/entities/ForumEntities';

export class GetPostsByCategoryUseCase {
  constructor(private forumService: ForumService) { }

  async execute(categoryId: string, params?: any): Promise<{ category: ForumCategory | null; posts: ForumPost[]; total: number }> {
    const [category, postsData] = await Promise.all([
      this.forumService.getCategoryById(categoryId),
      this.forumService.getPostsByCategory(categoryId, params)
    ]);
    return { category, posts: postsData.posts, total: postsData.total };
  }
}

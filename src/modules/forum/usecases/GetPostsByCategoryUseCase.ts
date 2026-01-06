import { ForumService } from '../domain/services/ForumService';
import { ForumPost, ForumCategory } from '../domain/entities/ForumEntities';

export class GetPostsByCategoryUseCase {
  constructor(private forumService: ForumService) {}

  async execute(categoryId: string): Promise<{ category: ForumCategory | null; posts: ForumPost[] }> {
    const [category, posts] = await Promise.all([
      this.forumService.getCategoryById(categoryId),
      this.forumService.getPostsByCategory(categoryId)
    ]);
    return { category, posts };
  }
}

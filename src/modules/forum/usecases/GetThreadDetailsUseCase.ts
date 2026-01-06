import { ForumService } from '../domain/services/ForumService';
import { ForumPost, ForumComment } from '../domain/entities/ForumEntities';

export class GetThreadDetailsUseCase {
  constructor(private forumService: ForumService) {}

  async execute(postId: number): Promise<{ post: ForumPost | null; comments: ForumComment[] }> {
    return this.forumService.getPostDetails(postId);
  }
}

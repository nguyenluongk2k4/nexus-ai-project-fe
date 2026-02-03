import { ForumService } from '../domain/services/ForumService';
import { ForumPost, ForumComment } from '../domain/entities/ForumEntities';

export class GetThreadDetailsUseCase {
  constructor(private forumService: ForumService) { }

  async execute(postId: string): Promise<{ post: ForumPost | null; comments: ForumComment[] }> {
    return this.forumService.getPostDetails(postId);
  }
}

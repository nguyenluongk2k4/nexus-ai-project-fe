import { ForumService } from '../domain/services/ForumService';
import { ForumComment } from '../domain/entities/ForumEntities';

export class AddCommentUseCase {
    constructor(private forumService: ForumService) { }

    async execute(postId: string, content: string, parentId?: string): Promise<ForumComment> {
        return this.forumService.addComment(postId, content, parentId);
    }
}

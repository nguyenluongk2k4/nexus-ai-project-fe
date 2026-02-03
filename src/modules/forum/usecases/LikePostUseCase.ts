import { ForumService } from '../domain/services/ForumService';
import { LikeResult } from '../domain/ports/ForumGateway';

export class LikePostUseCase {
    constructor(private forumService: ForumService) { }

    async execute(postId: string): Promise<LikeResult> {
        return this.forumService.likePost(postId);
    }
}

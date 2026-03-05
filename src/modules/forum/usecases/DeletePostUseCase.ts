import { ForumService } from '../domain/services/ForumService';

export class DeletePostUseCase {
    constructor(private forumService: ForumService) { }

    async execute(postId: string): Promise<boolean> {
        return this.forumService.deletePost(postId);
    }
}

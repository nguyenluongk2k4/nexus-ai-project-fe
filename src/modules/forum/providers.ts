// import { MockForumGateway } from './infrastructure/gateway/MockForumGateway';
import { HttpForumGateway } from './infrastructure/gateway/HttpForumGateway';
import { ForumService } from './domain/services/ForumService';
import { GetForumDashboardUseCase } from './usecases/GetForumDashboardUseCase';
import { GetPostsByCategoryUseCase } from './usecases/GetPostsByCategoryUseCase';
import { GetThreadDetailsUseCase } from './usecases/GetThreadDetailsUseCase';
import { AddCommentUseCase } from './usecases/AddCommentUseCase';
import { LikePostUseCase } from './usecases/LikePostUseCase';
import { GetTopContributorsUseCase } from './usecases/GetTopContributorsUseCase';
import { DeletePostUseCase } from './usecases/DeletePostUseCase';

// Use HTTP gateway for real API calls (switch to MockForumGateway for offline dev)
const forumGateway = new HttpForumGateway();
const forumService = new ForumService(forumGateway);

export const getForumDashboardUseCase = new GetForumDashboardUseCase(forumService);
export const getPostsByCategoryUseCase = new GetPostsByCategoryUseCase(forumService);
export const getThreadDetailsUseCase = new GetThreadDetailsUseCase(forumService);
export const addCommentUseCase = new AddCommentUseCase(forumService);
export const likePostUseCase = new LikePostUseCase(forumService);
export const getTopContributorsUseCase = new GetTopContributorsUseCase(forumGateway);
export const deletePostUseCase = new DeletePostUseCase(forumService);

// Export gateway for direct access when needed (e.g., for UUID mapping)
export { forumGateway };



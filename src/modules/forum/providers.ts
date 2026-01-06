import { MockForumGateway } from './infrastructure/gateway/MockForumGateway';
import { ForumService } from './domain/services/ForumService';
import { GetForumDashboardUseCase } from './usecases/GetForumDashboardUseCase';

import { GetPostsByCategoryUseCase } from './usecases/GetPostsByCategoryUseCase';
import { GetThreadDetailsUseCase } from './usecases/GetThreadDetailsUseCase';

const forumGateway = new MockForumGateway();
const forumService = new ForumService(forumGateway);

export const getForumDashboardUseCase = new GetForumDashboardUseCase(forumService);
export const getPostsByCategoryUseCase = new GetPostsByCategoryUseCase(forumService);
export const getThreadDetailsUseCase = new GetThreadDetailsUseCase(forumService);

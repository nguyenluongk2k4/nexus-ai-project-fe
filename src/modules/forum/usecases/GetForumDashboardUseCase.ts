import { ForumService } from '../domain/services/ForumService';

export class GetForumDashboardUseCase {
  constructor(private forumService: ForumService) {}

  async execute() {
    return this.forumService.getDashboardData();
  }
}

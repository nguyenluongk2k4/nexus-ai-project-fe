import { JobService } from '../domain/services/JobService';

export class GetJobRecommendationsUseCase {
  constructor(private jobService: JobService) {}

  async execute() {
    return this.jobService.getRecommendations();
  }
}

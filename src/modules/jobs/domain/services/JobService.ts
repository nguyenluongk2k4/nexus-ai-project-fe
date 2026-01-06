import { JobGateway } from '../ports/JobGateway';
import { Job } from '../entities/Job';
import { SuggestedSkill } from '../entities/SuggestedSkill';

export class JobService {
  constructor(private gateway: JobGateway) {}

  async getRecommendations(): Promise<{ jobs: Job[]; suggestedSkills: SuggestedSkill[] }> {
    const [jobs, suggestedSkills] = await Promise.all([
      this.gateway.getJobs(),
      this.gateway.getSuggestedSkills()
    ]);
    return { jobs, suggestedSkills };
  }
}

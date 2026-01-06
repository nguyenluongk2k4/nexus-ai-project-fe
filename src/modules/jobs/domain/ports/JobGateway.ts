import { Job } from '../entities/Job';
import { SuggestedSkill } from '../entities/SuggestedSkill';

export interface JobGateway {
  getJobs(): Promise<Job[]>;
  getSuggestedSkills(): Promise<SuggestedSkill[]>;
}

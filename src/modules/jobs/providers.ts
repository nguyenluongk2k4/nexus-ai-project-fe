import { JobService } from './domain/services/JobService';
import { MockJobGateway } from './infrastructure/gateway/MockJobGateway';
import { GetJobRecommendationsUseCase } from './usecases/GetJobRecommendationsUseCase';

const jobGateway = new MockJobGateway();
const jobService = new JobService(jobGateway);
export const getJobRecommendationsUseCase = new GetJobRecommendationsUseCase(jobService);

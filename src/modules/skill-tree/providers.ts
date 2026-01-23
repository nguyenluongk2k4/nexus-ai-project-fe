import { LearningService } from './domain/services/LearningService';
import { SkillTreeService } from './domain/services/SkillTreeService';
import { HttpLearningGateway } from './infrastructure/gateway/HttpLearningGateway';
import { InitializeLearningDataUseCase } from './usecases/InitializeLearningDataUseCase';
import { SyncLearningDataUseCase } from './usecases/SyncLearningDataUseCase';
import { CalculateStatsUseCase } from './usecases/CalculateStatsUseCase';

import { SkillTreeHttpGateway } from './infrastructure/gateway/SkillTreeHttpGateway';
import { LocalStorageLearningGateway } from './infrastructure/gateway/LocalStorageLearningGateway';

// Gateways (Infrastructure)
const learningGateway = new HttpLearningGateway();
export const skillTreeGateway = new SkillTreeHttpGateway();
export const httpLearningGateway = new HttpLearningGateway();

// Services (Domain)
const learningService = new LearningService(learningGateway);
const skillTreeService = new SkillTreeService(skillTreeGateway);

// UseCases (Application)
export const initializeLearningDataUseCase = new InitializeLearningDataUseCase(learningService);
export const syncLearningDataUseCase = new SyncLearningDataUseCase(learningGateway);
export const calculateStatsUseCase = new CalculateStatsUseCase(learningService);

// Expose for hooks
export const getSkillTreeService = () => skillTreeService;
export const getLearningService = () => learningService;
export { learningGateway };

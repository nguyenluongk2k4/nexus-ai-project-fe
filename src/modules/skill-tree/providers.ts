import { LearningService } from './domain/services/LearningService';
import { SkillTreeService } from './domain/services/SkillTreeService';
import { LocalStorageLearningGateway } from './infrastructure/gateway/LocalStorageLearningGateway';
import { InitializeLearningDataUseCase } from './usecases/InitializeLearningDataUseCase';
import { SyncLearningDataUseCase } from './usecases/SyncLearningDataUseCase';
import { CalculateStatsUseCase } from './usecases/CalculateStatsUseCase';

import { SkillTreeHttpGateway } from './infrastructure/gateway/SkillTreeHttpGateway';

// Gateways (Infrastructure)
const learningGateway = new LocalStorageLearningGateway();
export const skillTreeGateway = new SkillTreeHttpGateway();

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

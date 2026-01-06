import { LearningService } from './domain/services/LearningService';
import { LocalStorageLearningGateway } from './infrastructure/gateway/LocalStorageLearningGateway';
import { InitializeLearningDataUseCase } from './usecases/InitializeLearningDataUseCase';
import { SyncLearningDataUseCase } from './usecases/SyncLearningDataUseCase';
import { CalculateStatsUseCase } from './usecases/CalculateStatsUseCase';

const learningGateway = new LocalStorageLearningGateway();
const learningService = new LearningService(learningGateway);

export const initializeLearningDataUseCase = new InitializeLearningDataUseCase(learningService);
export const syncLearningDataUseCase = new SyncLearningDataUseCase(learningGateway);
export const calculateStatsUseCase = new CalculateStatsUseCase(learningService);

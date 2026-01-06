import { LearningService } from '../domain/services/LearningService';

export class InitializeLearningDataUseCase {
  constructor(private service: LearningService) {}

  async execute() {
    return this.service.loadAllData();
  }
}

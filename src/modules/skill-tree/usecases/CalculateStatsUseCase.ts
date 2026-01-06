import { LearningService } from '../domain/services/LearningService';
import { LearningProgress, StudySession } from '../domain/entities/LearningEntities';

export class CalculateStatsUseCase {
  constructor(private service: LearningService) {}

  execute(progress: LearningProgress[], sessions: StudySession[]) {
    return this.service.calculateStats(progress, sessions);
  }
}

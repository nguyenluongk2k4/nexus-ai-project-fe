import { LearningGateway } from '../domain/ports/LearningGateway';
import { LearningProgress, LearningReminder, TimelineItem, StudySession, DailyGoal } from '../domain/entities/LearningEntities';

export class SyncLearningDataUseCase {
  constructor(private gateway: LearningGateway) {}

  async saveProgress(data: LearningProgress[]) {
    return this.gateway.saveProgress(data);
  }

  async saveReminders(data: LearningReminder[]) {
    return this.gateway.saveReminders(data);
  }

  async saveTimeline(data: TimelineItem[]) {
    return this.gateway.saveTimeline(data);
  }

  async saveSessions(data: StudySession[]) {
    return this.gateway.saveSessions(data);
  }

  async saveGoals(data: DailyGoal[]) {
    return this.gateway.saveGoals(data);
  }
}

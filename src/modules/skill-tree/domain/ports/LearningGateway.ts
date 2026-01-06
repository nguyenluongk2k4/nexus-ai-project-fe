import { LearningProgress, LearningReminder, TimelineItem, StudySession, DailyGoal } from '../entities/LearningEntities';

export interface LearningGateway {
  loadProgress(): Promise<LearningProgress[]>;
  saveProgress(data: LearningProgress[]): Promise<void>;
  
  loadReminders(): Promise<LearningReminder[]>;
  saveReminders(data: LearningReminder[]): Promise<void>;
  
  loadTimeline(): Promise<TimelineItem[]>;
  saveTimeline(data: TimelineItem[]): Promise<void>;
  
  loadSessions(): Promise<StudySession[]>;
  saveSessions(data: StudySession[]): Promise<void>;
  
  loadGoals(): Promise<DailyGoal[]>;
  saveGoals(data: DailyGoal[]): Promise<void>;
}

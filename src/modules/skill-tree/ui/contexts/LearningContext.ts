import { createContext } from 'react';
import {
  LearningProgress,
  LearningReminder,
  TimelineItem,
  StudySession,
  LearningStats,
  LearningStatus,
  DailyGoal,
} from '../../domain/entities/LearningEntities';

export interface LearningProgressContextType {
  // Progress Management
  progressData: Map<string, LearningProgress>;
  getProgress: (resourceId: string) => LearningProgress | undefined;
  updateProgress: (resourceId: string, updates: Partial<LearningProgress>) => void;
  addResource: (resource: LearningProgress) => void;
  removeResource: (resourceId: string) => void;

  // Timeline Management
  timelineItems: TimelineItem[];
  addToTimeline: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  removeFromTimeline: (id: string) => void;

  // Reminder Management
  reminders: LearningReminder[];
  addReminder: (reminder: Omit<LearningReminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<LearningReminder>) => void;
  removeReminder: (id: string) => void;
  checkReminders: () => void;

  // Study Session Management
  studySessions: StudySession[];
  startSession: (resourceId: string) => void;
  endSession: (sessionId: string, notes?: string) => void;
  activeSession: StudySession | null;

  // Stats
  stats: LearningStats;
  refreshStats: () => void;

  // Daily Goals
  dailyGoals: DailyGoal[];
  setDailyGoal: (targetMinutes: number) => void;
  updateDailyProgress: (minutes: number) => void;

  // Filters
  filterByStatus: (status: LearningStatus) => LearningProgress[];
  getIncompleteResources: () => LearningProgress[];
  getOverdueItems: () => TimelineItem[];
}

export const LearningProgressContext = createContext<LearningProgressContextType | undefined>(undefined);


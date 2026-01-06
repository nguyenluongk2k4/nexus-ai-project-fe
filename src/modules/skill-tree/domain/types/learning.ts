// Types for Learning Progress Tracking System

export type LearningStatus = 'not_started' | 'in_progress' | 'completed';

export interface LearningResource {
  id: string;
  name?: string;
  title?: string;
  url: string;
  type?: string;
  author?: string;
}

export interface LearningProgress {
  resourceId: string;
  resourceName: string;
  resourceUrl: string;
  nodeId: string;
  nodeName: string;
  specializationId: string;
  specializationName: string;
  status: LearningStatus;
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  notes?: string;
  estimatedTime?: string;
  actualTimeSpent?: number; // in minutes
  rating?: number; // 1-5
}

export interface StudySession {
  id: string;
  resourceId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
}

export interface LearningReminder {
  id: string;
  resourceId: string;
  resourceName: string;
  scheduledTime: Date;
  recurring?: 'daily' | 'weekly' | 'custom';
  enabled: boolean;
  notificationSent?: boolean;
}

export interface TimelineItem {
  id: string;
  resourceId: string;
  resourceName: string;
  nodeId: string;
  nodeName: string;
  scheduledDate: Date;
  deadline?: Date;
  status: LearningStatus;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
}

export interface LearningStats {
  totalResources: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  totalTimeSpent: number; // in minutes
  averageRating: number;
  currentStreak: number; // days
  longestStreak: number; // days
  lastStudyDate?: Date;
}

export interface DailyGoal {
  date: Date;
  targetMinutes: number;
  completedMinutes: number;
  completed: boolean;
}

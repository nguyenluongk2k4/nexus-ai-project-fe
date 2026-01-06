import { LearningGateway } from '../../domain/ports/LearningGateway';
import { LearningProgress, LearningReminder, TimelineItem, StudySession, DailyGoal } from '../../domain/entities/LearningEntities';

const STORAGE_KEY = 'nexus_learning_progress';
const REMINDERS_KEY = 'nexus_learning_reminders';
const TIMELINE_KEY = 'nexus_learning_timeline';
const SESSIONS_KEY = 'nexus_study_sessions';
const GOALS_KEY = 'nexus_daily_goals';

export class LocalStorageLearningGateway implements LearningGateway {
  async loadProgress(): Promise<LearningProgress[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // Convert object to array if needed, initially context used Map
    return Object.values(parsed).map((p: any) => ({
      ...p,
      startedAt: p.startedAt ? new Date(p.startedAt) : undefined,
      completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
      lastAccessedAt: p.lastAccessedAt ? new Date(p.lastAccessedAt) : undefined,
    }));
  }

  async saveProgress(data: LearningProgress[]): Promise<void> {
    const obj = data.reduce((acc, curr) => ({ ...acc, [curr.resourceId]: curr }), {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  async loadReminders(): Promise<LearningReminder[]> {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (!saved) return [];
    return JSON.parse(saved).map((r: any) => ({
      ...r,
      scheduledTime: new Date(r.scheduledTime)
    }));
  }

  async saveReminders(data: LearningReminder[]): Promise<void> {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(data));
  }

  async loadTimeline(): Promise<TimelineItem[]> {
    const saved = localStorage.getItem(TIMELINE_KEY);
    if (!saved) return [];
    return JSON.parse(saved).map((t: any) => ({
      ...t,
      scheduledDate: new Date(t.scheduledDate),
      deadline: t.deadline ? new Date(t.deadline) : undefined
    }));
  }

  async saveTimeline(data: TimelineItem[]): Promise<void> {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(data));
  }

  async loadSessions(): Promise<StudySession[]> {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (!saved) return [];
    return JSON.parse(saved).map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined
    }));
  }

  async saveSessions(data: StudySession[]): Promise<void> {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
  }

  async loadGoals(): Promise<DailyGoal[]> {
    const saved = localStorage.getItem(GOALS_KEY);
    if (!saved) return [];
    return JSON.parse(saved).map((g: any) => ({
      ...g,
      date: new Date(g.date)
    }));
  }

  async saveGoals(data: DailyGoal[]): Promise<void> {
    localStorage.setItem(GOALS_KEY, JSON.stringify(data));
  }
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LearningProgress,
  LearningReminder,
  TimelineItem,
  StudySession,
  LearningStats,
  LearningStatus,
  DailyGoal,
} from '../types/learning';

interface LearningProgressContextType {
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

const LearningProgressContext = createContext<LearningProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'nexus_learning_progress';
const REMINDERS_KEY = 'nexus_learning_reminders';
const TIMELINE_KEY = 'nexus_learning_timeline';
const SESSIONS_KEY = 'nexus_study_sessions';
const GOALS_KEY = 'nexus_daily_goals';

export function LearningProgressProvider({ children }: { children: ReactNode }) {
  const [progressData, setProgressData] = useState<Map<string, LearningProgress>>(new Map());
  const [reminders, setReminders] = useState<LearningReminder[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalResources: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    totalTimeSpent: 0,
    averageRating: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          const map = new Map<string, LearningProgress>();
          Object.entries(parsed).forEach(([key, value]) => {
            const progress = value as LearningProgress;
            // Convert date strings back to Date objects
            if (progress.startedAt) progress.startedAt = new Date(progress.startedAt);
            if (progress.completedAt) progress.completedAt = new Date(progress.completedAt);
            if (progress.lastAccessedAt) progress.lastAccessedAt = new Date(progress.lastAccessedAt);
            map.set(key, progress);
          });
          setProgressData(map);
        }

        const savedReminders = localStorage.getItem(REMINDERS_KEY);
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          parsed.forEach((r: LearningReminder) => {
            r.scheduledTime = new Date(r.scheduledTime);
          });
          setReminders(parsed);
        }

        const savedTimeline = localStorage.getItem(TIMELINE_KEY);
        if (savedTimeline) {
          const parsed = JSON.parse(savedTimeline);
          parsed.forEach((t: TimelineItem) => {
            t.scheduledDate = new Date(t.scheduledDate);
            if (t.deadline) t.deadline = new Date(t.deadline);
          });
          setTimelineItems(parsed);
        }

        const savedSessions = localStorage.getItem(SESSIONS_KEY);
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          parsed.forEach((s: StudySession) => {
            s.startTime = new Date(s.startTime);
            if (s.endTime) s.endTime = new Date(s.endTime);
          });
          setStudySessions(parsed);
        }

        const savedGoals = localStorage.getItem(GOALS_KEY);
        if (savedGoals) {
          const parsed = JSON.parse(savedGoals);
          parsed.forEach((g: DailyGoal) => {
            g.date = new Date(g.date);
          });
          setDailyGoals(parsed);
        }
      } catch (error) {
        console.error('Error loading learning progress data:', error);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      const obj = Object.fromEntries(progressData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving progress data:', error);
    }
  }, [progressData]);

  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(timelineItems));
  }, [timelineItems]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // Calculate stats whenever progress data changes
  useEffect(() => {
    refreshStats();
  }, [progressData, studySessions]);

  const getProgress = (resourceId: string) => {
    return progressData.get(resourceId);
  };

  const updateProgress = (resourceId: string, updates: Partial<LearningProgress>) => {
    setProgressData((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(resourceId);
      if (existing) {
        newMap.set(resourceId, { ...existing, ...updates, lastAccessedAt: new Date() });
      }
      return newMap;
    });
  };

  const addResource = (resource: LearningProgress) => {
    setProgressData((prev) => {
      const newMap = new Map(prev);
      newMap.set(resource.resourceId, { ...resource, lastAccessedAt: new Date() });
      return newMap;
    });
  };

  const removeResource = (resourceId: string) => {
    setProgressData((prev) => {
      const newMap = new Map(prev);
      newMap.delete(resourceId);
      return newMap;
    });
  };

  const addToTimeline = (item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `timeline_${Date.now()}_${Math.random()}`,
    };
    setTimelineItems((prev) => [...prev, newItem]);
  };

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimelineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeFromTimeline = (id: string) => {
    setTimelineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addReminder = (reminder: Omit<LearningReminder, 'id'>) => {
    const newReminder: LearningReminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${Math.random()}`,
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<LearningReminder>) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder))
    );
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const checkReminders = () => {
    const now = new Date();
    reminders.forEach((reminder) => {
      if (
        reminder.enabled &&
        !reminder.notificationSent &&
        reminder.scheduledTime <= now
      ) {
        // Send notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nhắc nhở học tập', {
            body: `Đã đến giờ học: ${reminder.resourceName}`,
            icon: '/icon.png',
          });
        }
        // Mark as sent
        updateReminder(reminder.id, { notificationSent: true });
      }
    });
  };

  const startSession = (resourceId: string) => {
    const newSession: StudySession = {
      id: `session_${Date.now()}_${Math.random()}`,
      resourceId,
      startTime: new Date(),
    };
    setActiveSession(newSession);
    setStudySessions((prev) => [...prev, newSession]);

    // Update progress status
    const progress = progressData.get(resourceId);
    if (progress && progress.status === 'not_started') {
      updateProgress(resourceId, { status: 'in_progress', startedAt: new Date() });
    }
  };

  const endSession = (sessionId: string, notes?: string) => {
    const endTime = new Date();
    setStudySessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const duration = Math.round(
            (endTime.getTime() - session.startTime.getTime()) / 60000
          );
          return { ...session, endTime, duration, notes };
        }
        return session;
      })
    );

    if (activeSession?.id === sessionId) {
      setActiveSession(null);

      // Update resource time spent
      const session = studySessions.find((s) => s.id === sessionId);
      if (session) {
        const progress = progressData.get(session.resourceId);
        if (progress) {
          const duration = Math.round(
            (endTime.getTime() - session.startTime.getTime()) / 60000
          );
          const newTimeSpent = (progress.actualTimeSpent || 0) + duration;
          updateProgress(session.resourceId, { actualTimeSpent: newTimeSpent });

          // Update daily goal
          updateDailyProgress(duration);
        }
      }
    }
  };

  const filterByStatus = (status: LearningStatus): LearningProgress[] => {
    return Array.from(progressData.values()).filter((p) => p.status === status);
  };

  const getIncompleteResources = (): LearningProgress[] => {
    return Array.from(progressData.values()).filter((p) => p.status !== 'completed');
  };

  const getOverdueItems = (): TimelineItem[] => {
    const now = new Date();
    return timelineItems.filter(
      (item) =>
        item.deadline &&
        item.deadline < now &&
        item.status !== 'completed'
    );
  };

  const refreshStats = () => {
    const allProgress = Array.from(progressData.values());
    const notStarted = allProgress.filter((p) => p.status === 'not_started').length;
    const inProgress = allProgress.filter((p) => p.status === 'in_progress').length;
    const completed = allProgress.filter((p) => p.status === 'completed').length;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.actualTimeSpent || 0), 0);
    const ratings = allProgress.filter((p) => p.rating).map((p) => p.rating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // Calculate streak
    const studyDates = studySessions
      .map((s) => s.startTime.toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    studyDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (!lastDate) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const diffDays = Math.floor(
          (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
          if (dateStr === new Date().toDateString() || diffDays === 1) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = date;
    });

    const lastStudyDate = studyDates.length > 0 ? new Date(studyDates[0]) : undefined;

    setStats({
      totalResources: allProgress.length,
      notStarted,
      inProgress,
      completed,
      totalTimeSpent,
      averageRating,
      currentStreak,
      longestStreak,
      lastStudyDate,
    });
  };

  const setDailyGoal = (targetMinutes: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = dailyGoals.find(
      (g) => g.date.toDateString() === today.toDateString()
    );

    if (existing) {
      setDailyGoals((prev) =>
        prev.map((g) =>
          g.date.toDateString() === today.toDateString()
            ? { ...g, targetMinutes }
            : g
        )
      );
    } else {
      setDailyGoals((prev) => [
        ...prev,
        {
          date: today,
          targetMinutes,
          completedMinutes: 0,
          completed: false,
        },
      ]);
    }
  };

  const updateDailyProgress = (minutes: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = dailyGoals.find(
      (g) => g.date.toDateString() === today.toDateString()
    );

    if (existing) {
      const newCompleted = existing.completedMinutes + minutes;
      setDailyGoals((prev) =>
        prev.map((g) =>
          g.date.toDateString() === today.toDateString()
            ? {
                ...g,
                completedMinutes: newCompleted,
                completed: newCompleted >= g.targetMinutes,
              }
            : g
        )
      );
    }
  };

  // Check reminders periodically
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

  const value: LearningProgressContextType = {
    progressData,
    getProgress,
    updateProgress,
    addResource,
    removeResource,
    timelineItems,
    addToTimeline,
    updateTimelineItem,
    removeFromTimeline,
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    checkReminders,
    studySessions,
    startSession,
    endSession,
    activeSession,
    stats,
    refreshStats,
    dailyGoals,
    setDailyGoal,
    updateDailyProgress,
    filterByStatus,
    getIncompleteResources,
    getOverdueItems,
  };

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
}

export function useLearningProgress() {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within LearningProgressProvider');
  }
  return context;
}

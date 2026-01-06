import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LearningProgress,
  LearningReminder,
  TimelineItem,
  StudySession,
  LearningStats,
  LearningStatus,
  DailyGoal,
} from '../../domain/entities/LearningEntities';
import { initializeLearningDataUseCase, syncLearningDataUseCase, calculateStatsUseCase } from '../../providers';

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

  // Load data via UseCase
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await initializeLearningDataUseCase.execute();
        
        // Convert array back to Map for internal state
        const map = new Map<string, LearningProgress>();
        data.progress.forEach(p => map.set(p.resourceId, p));
        setProgressData(map);
        
        setReminders(data.reminders);
        setTimelineItems(data.timeline);
        setStudySessions(data.sessions);
        setDailyGoals(data.goals);
      } catch (error) {
        console.error('Error loading learning data:', error);
      }
    };

    loadData();
  }, []);

  // Sync data changes via UseCase
  useEffect(() => {
    syncLearningDataUseCase.saveProgress(Array.from(progressData.values()));
  }, [progressData]);

  useEffect(() => {
    syncLearningDataUseCase.saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    syncLearningDataUseCase.saveTimeline(timelineItems);
  }, [timelineItems]);

  useEffect(() => {
    syncLearningDataUseCase.saveSessions(studySessions);
  }, [studySessions]);

  useEffect(() => {
    syncLearningDataUseCase.saveGoals(dailyGoals);
  }, [dailyGoals]);

  // Calculate stats via UseCase
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
    const newStats = calculateStatsUseCase.execute(
      Array.from(progressData.values()),
      studySessions
    );
    setStats(newStats);
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

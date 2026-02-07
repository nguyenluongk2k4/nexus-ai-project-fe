/**
 * useDashboard Hook
 * Fetches and aggregates data for the dashboard from various sources
 */

import { useState, useEffect, useMemo } from 'react';
import { useLearningProgress } from '@/modules/skill-tree/ui/hooks/useLearningProgress';
import { QuizHttpGateway } from '@/modules/quiz/infrastructure/http/QuizHttpGateway';

interface ContinueResource {
  id: string;
  name: string;
  nodeName?: string;
  progress?: number;
  type?: string;
}

interface AIInsightsData {
  weakTopics: string[];
  recommendedFocus: string[];
  nodeId?: string;
}

interface DashboardStats {
  streak: number;
  todayItems: number;
  completedToday: number;
  totalQuizzes: number;
  totalNodes: number;
  completedNodes: number;
  overallProgress: number;
  treeName?: string;
}

interface WeeklyActivityData {
  day: string;
  hours: number;
}

export interface DashboardData {
  continueResource: ContinueResource | null;
  todayTimelineItems: any[];
  stats: DashboardStats;
  aiInsights: AIInsightsData;
  weeklyActivity: WeeklyActivityData[];
}

const quizGateway = new QuizHttpGateway();

export function useDashboard() {
  const {
    progressData,
    timelineItems,
    stats: learningStats
  } = useLearningProgress();

  const [aiInsights, setAiInsights] = useState<AIInsightsData>({
    weakTopics: [],
    recommendedFocus: [],
    nodeId: undefined
  });
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date string for filtering
  const todayStr = useMemo(() => new Date().toDateString(), []);

  // Find in-progress resource to continue
  const continueResource = useMemo((): ContinueResource | null => {
    // Check timeline items first (more immediate)
    const items = timelineItems || [];
    const inProgressTimeline = items.find(
      item => item.status === 'in_progress'
    );
    if (inProgressTimeline) {
      return {
        id: inProgressTimeline.resourceId || inProgressTimeline.id,
        name: inProgressTimeline.resourceName,
        nodeName: inProgressTimeline.nodeName,
        type: 'Timeline'
      };
    }

    // Then check progressData (Map)
    if (progressData && progressData.size > 0) {
      for (const [id, resource] of progressData.entries()) {
        if (resource.status === 'in_progress') {
          return {
            id,
            name: resource.resourceName || 'Learning Resource',
            progress: resource.progress,
            type: 'Resource'
          };
        }
      }
    }

    return null;
  }, [timelineItems, progressData]);

  // Filter timeline items for today
  const todayTimelineItems = useMemo(() => {
    const items = timelineItems || [];
    return items.filter(item => {
      if (!item.scheduledDate) return false;
      return item.scheduledDate.toDateString() === todayStr;
    });
  }, [timelineItems, todayStr]);

  // Calculate stats
  const stats = useMemo((): DashboardStats => {
    const completedToday = todayTimelineItems.filter(
      item => item.status === 'completed'
    ).length;

    // Count from progressData (Map)
    let completedNodes = 0;
    let totalNodes = 0;

    if (progressData) {
      totalNodes = progressData.size;
      for (const resource of progressData.values()) {
        if (resource.status === 'completed') {
          completedNodes++;
        }
      }
    }

    const overallProgress = totalNodes > 0
      ? Math.round((completedNodes / totalNodes) * 100)
      : 0;

    // Calculate streak from learning stats or timeline activity
    let streak = 0;
    if (learningStats) {
      streak = learningStats.currentStreak || 0;
    }

    return {
      streak,
      todayItems: todayTimelineItems.length,
      completedToday,
      totalQuizzes: quizCount,
      totalNodes,
      completedNodes,
      overallProgress,
      treeName: undefined
    };
  }, [todayTimelineItems, progressData, quizCount, learningStats]);

  // Weekly activity based on completed timeline items count
  const weeklyActivity = useMemo((): WeeklyActivityData[] => {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const items = timelineItems || [];

    // Count completed items by day of week
    const dayCount: number[] = new Array(7).fill(0);

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate Monday of current week
    // If today is Sunday (0), go back 6 days to get Monday
    // Otherwise subtract (currentDay - 1) days
    const weekStart = new Date(now);
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);

    console.log('📊 Weekly Activity Debug:', {
      now: now.toISOString(),
      currentDay,
      weekStart: weekStart.toISOString(),
      totalItems: items.length,
      completedItems: items.filter(i => i.status === 'completed').length
    });

    items.forEach(item => {
      if (item.status === 'completed' && item.scheduledDate) {
        const itemDate = new Date(item.scheduledDate);

        // Safety check for invalid date
        if (isNaN(itemDate.getTime())) {
          console.warn('⚠️ [useDashboard] Invalid date for item:', item.resourceName, item.scheduledDate);
          return;
        }

        console.log('  📅 Item:', item.resourceName, 'scheduledDate:', itemDate.toISOString(), 'status:', item.status);
        if (itemDate >= weekStart) {
          const dayIndex = itemDate.getDay();
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Monday = 0, Sunday = 6
          dayCount[adjustedIndex]++;
          console.log('    ✅ Counted for day index:', adjustedIndex);
        }
      }
    });

    console.log('📊 Day counts:', dayCount);

    return days.map((day, idx) => ({
      day,
      hours: dayCount[idx] // Number of completed items
    }));
  }, [timelineItems]);

  // Fetch quiz insights using new user-stats endpoint
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const userStats = await quizGateway.getUserStats();

        setQuizCount(userStats.totalQuizzesCompleted);

        if (userStats.weakTopics.length > 0 || userStats.recommendedFocus.length > 0) {
          setAiInsights({
            weakTopics: userStats.weakTopics,
            recommendedFocus: userStats.recommendedFocus,
            nodeId: userStats.recentNodeId
          });
        }
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const data: DashboardData = {
    continueResource,
    todayTimelineItems,
    stats,
    aiInsights,
    weeklyActivity
  };

  return {
    data,
    loading,
    error
  };
}

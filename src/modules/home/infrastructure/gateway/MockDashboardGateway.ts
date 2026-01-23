import { DashboardGateway } from '../../domain/ports/DashboardGateway';
import { DashboardData } from '../../domain/entities/DashboardData';

// Mock data moved from useDashboard hook
const mockDashboardData: DashboardData = {
  metrics: [
    { title: 'nav.dashboardPage.metrics.studyTime', value: '24h', subtitle: 'nav.dashboardPage.metrics.thisWeek', trend: '+12%' },
    { title: 'nav.dashboardPage.metrics.skillsEarned', value: '12', subtitle: 'nav.dashboardPage.metrics.totalBadges', trend: '+3' },
    { title: 'nav.dashboardPage.metrics.goalsCompleted', value: '8/10', subtitle: 'nav.dashboardPage.metrics.monthlyTarget', trend: '80%' }
  ],
  weeklyActivity: [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 3 },
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 2.5 }
  ],
  skillProgress: [
    { skill: 'JavaScript', progress: 85 },
    { skill: 'React', progress: 72 },
    { skill: 'TypeScript', progress: 65 },
    { skill: 'Node.js', progress: 58 }
  ],
  recentActivity: [
    { action: 'nav.dashboardPage.activity.completedQuiz', detail: 'React Fundamentals', score: '95%', time: 'common.time.hoursAgo' },
    { action: 'nav.dashboardPage.activity.earnedBadge', detail: 'JavaScript Master', time: 'common.time.hoursAgo' },
    { action: 'nav.dashboardPage.activity.finishedCourse', detail: 'Advanced TypeScript', score: '88%', time: 'common.time.yesterday' }
  ]
};

export class MockDashboardGateway implements DashboardGateway {
  async getDashboardData(): Promise<DashboardData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }
}


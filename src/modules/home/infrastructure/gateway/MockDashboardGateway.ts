import { DashboardGateway } from '../../domain/ports/DashboardGateway';
import { DashboardData } from '../../domain/entities/DashboardData';

// Mock data moved from useDashboard hook
const mockDashboardData: DashboardData = {
  metrics: [
    { title: 'Study Time', value: '24h', subtitle: 'This week', trend: '+12%' },
    { title: 'Skills Earned', value: '12', subtitle: 'Total badges', trend: '+3' },
    { title: 'Goals Completed', value: '8/10', subtitle: 'Monthly target', trend: '80%' }
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
    { action: 'Completed Quiz', detail: 'React Fundamentals', score: '95%', time: '2 hours ago' },
    { action: 'Earned Badge', detail: 'JavaScript Master', time: '5 hours ago' },
    { action: 'Finished Course', detail: 'Advanced TypeScript', score: '88%', time: 'Yesterday' }
  ]
};

export class MockDashboardGateway implements DashboardGateway {
  async getDashboardData(): Promise<DashboardData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }
}

import { useState, useEffect } from 'react';

// Mock data for dashboard (TODO: replace with real service)
const mockDashboardData = {
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

interface DashboardData {
  metrics: Array<{ title: string; value: string; subtitle: string; trend: string }>;
  weeklyActivity: Array<{ day: string; hours: number }>;
  skillProgress: Array<{ skill: string; progress: number }>;
  recentActivity: Array<{ action: string; detail: string; score?: string; time: string }>;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockDashboardData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

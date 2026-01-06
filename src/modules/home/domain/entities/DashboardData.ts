import { Metric } from './Metric';
import { WeeklyActivity, RecentActivity } from './Activity';
import { SkillProgress } from './SkillProgress';

export interface DashboardData {
  metrics: Metric[];
  weeklyActivity: WeeklyActivity[];
  skillProgress: SkillProgress[];
  recentActivity: RecentActivity[];
}

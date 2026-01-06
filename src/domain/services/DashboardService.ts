import { 
  DASHBOARD_METRICS, 
  WEEKLY_ACTIVITY_DATA, 
  SKILL_PROGRESS_DATA, 
  RECENT_ACTIVITY_DATA 
} from '../data/dashboardData';

export class DashboardService {
  async getMetrics() {
    // Giả lập API call
    return DASHBOARD_METRICS;
  }

  async getWeeklyActivity() {
    return WEEKLY_ACTIVITY_DATA;
  }

  async getSkillProgress() {
    return SKILL_PROGRESS_DATA;
  }

  async getRecentActivity() {
    return RECENT_ACTIVITY_DATA;
  }
}

import { DashboardService } from '../domain/services/DashboardService';

export class GetDashboardDataUseCase {
  constructor(private dashboardService: DashboardService) {}

  async execute() {
    const [metrics, weeklyActivity, skillProgress, recentActivity] = await Promise.all([
      this.dashboardService.getMetrics(),
      this.dashboardService.getWeeklyActivity(),
      this.dashboardService.getSkillProgress(),
      this.dashboardService.getRecentActivity()
    ]);

    return {
      metrics,
      weeklyActivity,
      skillProgress,
      recentActivity
    };
  }
}

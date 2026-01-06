import { DashboardService } from '../domain/services/DashboardService';

export class GetDashboardDataUseCase {
  constructor(private dashboardService: DashboardService) {}

  async execute() {
    return this.dashboardService.getDashboardData();
  }
}

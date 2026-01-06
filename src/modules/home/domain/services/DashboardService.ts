import { DashboardGateway } from '../ports/DashboardGateway';
import { DashboardData } from '../entities/DashboardData';

export class DashboardService {
  constructor(private gateway: DashboardGateway) {}

  async getDashboardData(): Promise<DashboardData> {
    return this.gateway.getDashboardData();
  }
}

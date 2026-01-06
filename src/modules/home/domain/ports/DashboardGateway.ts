import { DashboardData } from '../entities/DashboardData';

export interface DashboardGateway {
  getDashboardData(): Promise<DashboardData>;
}

import { DashboardService } from './domain/services/DashboardService';
import { MockDashboardGateway } from './infrastructure/gateway/MockDashboardGateway';
import { GetDashboardDataUseCase } from './usecases/GetDashboardDataUseCase';

const dashboardGateway = new MockDashboardGateway();
const dashboardService = new DashboardService(dashboardGateway);
export const getDashboardDataUseCase = new GetDashboardDataUseCase(dashboardService);

// Purchase Module Providers (Dependency Injection)

import { PurchaseApiGateway } from './infrastructure/PurchaseApiGateway';
import { PurchaseService } from './domain/services/PurchaseService';

// Singleton instances
const purchaseGateway = new PurchaseApiGateway();
const purchaseService = new PurchaseService(purchaseGateway);

export function getPurchaseService(): PurchaseService {
    return purchaseService;
}

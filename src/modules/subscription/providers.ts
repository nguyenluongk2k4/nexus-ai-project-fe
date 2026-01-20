// Subscription Module Providers (Dependency Injection)

import { SubscriptionApiGateway } from './infrastructure/SubscriptionApiGateway';
import { SubscriptionService } from './domain/services/SubscriptionService';

// Singleton instances
let subscriptionGateway: SubscriptionApiGateway | null = null;
let subscriptionService: SubscriptionService | null = null;

export function getSubscriptionGateway(): SubscriptionApiGateway {
    if (!subscriptionGateway) {
        subscriptionGateway = new SubscriptionApiGateway();
    }
    return subscriptionGateway;
}

export function getSubscriptionService(): SubscriptionService {
    if (!subscriptionService) {
        subscriptionService = new SubscriptionService(getSubscriptionGateway());
    }
    return subscriptionService;
}

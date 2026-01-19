// Subscription Gateway Port (Interface)

import { SubscriptionPlan, UserSubscription, PurchasePlanResult, BillingCycle } from '../entities/SubscriptionEntities';

export interface SubscriptionGateway {
    getPlans(): Promise<SubscriptionPlan[]>;
    getCurrentSubscription(): Promise<UserSubscription>;
    purchasePlan(planId: string, billingCycle: BillingCycle): Promise<PurchasePlanResult>;
}

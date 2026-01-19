// Subscription Domain Service

import { SubscriptionGateway } from '../ports/SubscriptionGateway';
import { SubscriptionPlan, UserSubscription, PurchasePlanResult, BillingCycle } from '../entities/SubscriptionEntities';

export class SubscriptionService {
    constructor(private gateway: SubscriptionGateway) { }

    async getPlans(): Promise<SubscriptionPlan[]> {
        return this.gateway.getPlans();
    }

    async getCurrentSubscription(): Promise<UserSubscription> {
        return this.gateway.getCurrentSubscription();
    }

    async purchasePlan(planId: string, billingCycle: BillingCycle): Promise<PurchasePlanResult> {
        if (!planId) {
            throw new Error('Vui lòng chọn gói đăng ký');
        }
        return this.gateway.purchasePlan(planId, billingCycle);
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
        const yearlyFromMonthly = monthlyPrice * 12;
        return yearlyFromMonthly - yearlyPrice;
    }
}

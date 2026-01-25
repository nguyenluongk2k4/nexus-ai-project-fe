// Subscription API Gateway (Infrastructure Adapter)

import { SubscriptionGateway } from '../domain/ports/SubscriptionGateway';
import { SubscriptionPlan, UserSubscription, PurchasePlanResult, BillingCycle } from '../domain/entities/SubscriptionEntities';

import { apiConfig } from "@/shared/config/api.config";

const API_SUBSCRIPTION_URL = apiConfig.getHttpUrl('/subscription');

export class SubscriptionApiGateway implements SubscriptionGateway {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await fetch(`${API_SUBSCRIPTION_URL}/plans`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách gói');
        }

        const data = await response.json();

        return data.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.price_monthly,
            priceYearly: plan.price_yearly,
            features: plan.features,
            badgeColor: plan.badge_color,
            isPopular: plan.is_popular,
        }));
    }

    async getCurrentSubscription(): Promise<UserSubscription> {
        const token = this.getToken();
        if (!token) {
            return {
                tier: 'free',
                tierName: 'Free',
                expiresAt: null,
                isActive: true,
            };
        }

        const response = await fetch(`${API_SUBSCRIPTION_URL}/current`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin gói');
        }

        const data = await response.json();

        return {
            tier: data.tier,
            tierName: data.tier_name,
            expiresAt: data.expires_at,
            isActive: data.is_active,
        };
    }

    async purchasePlan(planId: string, billingCycle: BillingCycle): Promise<PurchasePlanResult> {
        const token = this.getToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${API_SUBSCRIPTION_URL}/purchase`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                plan_id: planId,
                billing_cycle: billingCycle,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Không thể mua gói');
        }

        const data = await response.json();

        return {
            success: data.success,
            message: data.message,
            newTier: data.new_tier,
            expiresAt: data.expires_at,
            amountCharged: data.amount_charged,
        };
    }
}

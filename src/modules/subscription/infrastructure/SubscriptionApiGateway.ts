// Subscription API Gateway (Infrastructure Adapter)

import { SubscriptionGateway } from '../domain/ports/SubscriptionGateway';
import { SubscriptionPlan, UserSubscription, PurchasePlanResult, BillingCycle } from '../domain/entities/SubscriptionEntities';

import { apiConfig } from "@/shared/config/api.config";

const API_SUBSCRIPTION_URL = apiConfig.getHttpUrl('/subscription');
const API_PURCHASE_URL = apiConfig.getHttpUrl('/purchase');

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
        const response = await fetch(`${API_PURCHASE_URL}/packages`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách gói Xu');
        }

        const data = await response.json();

        return data.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            description: `Nhận ngay ${plan.coin_amount} Xu ${plan.bonus_amount > 0 ? `+ ${plan.bonus_amount} Bonus` : ''}`,
            priceMonthly: plan.price,
            priceYearly: plan.price,
            features: [
                `${plan.coin_amount} Xu mặc định`,
                ...(plan.bonus_amount > 0 ? [`${plan.bonus_amount} Xu thưởng thêm`] : []),
                'Không giới hạn thời gian sử dụng',
                'Nạp qua số dư hoặc chuyển khoản'
            ],
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

        // We use buy-with-balance first
        const response = await fetch(`${API_PURCHASE_URL}/packages/${planId}/buy-with-balance`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Không thể mua gói');
        }

        const data = await response.json();

        return {
            success: data.success,
            message: data.message,
            newTier: 'free',
            expiresAt: '',
            amountCharged: 0,
        };
    }
}

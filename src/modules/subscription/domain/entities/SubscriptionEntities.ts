// Subscription Domain Entities

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    badgeColor: string;
    isPopular: boolean;
}

export interface UserSubscription {
    tier: string;
    tierName: string;
    expiresAt: string | null;
    isActive: boolean;
}

export interface PurchasePlanResult {
    success: boolean;
    message: string;
    newTier: string;
    expiresAt: string;
    amountCharged: number;
}

export type BillingCycle = 'monthly' | 'yearly';

// Plan tier order for comparison
export const PLAN_TIERS = ['free', 'pro', 'premium', 'business'] as const;
export type PlanTier = typeof PLAN_TIERS[number];

export function isPlanUpgrade(currentTier: string, newTier: string): boolean {
    const currentIndex = PLAN_TIERS.indexOf(currentTier as PlanTier);
    const newIndex = PLAN_TIERS.indexOf(newTier as PlanTier);
    return newIndex > currentIndex;
}

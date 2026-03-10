// useSubscription hook

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionService } from '../../providers';
import { SubscriptionPlan, UserSubscription, BillingCycle } from '../../domain/entities/SubscriptionEntities';

interface UseSubscriptionResult {
    plans: SubscriptionPlan[];
    currentSubscription: UserSubscription | null;
    loading: boolean;
    purchasing: boolean;
    error: string | null;
    successMessage: string | null;
    purchasePlan: (planId: string) => Promise<void>;
    formatPrice: (price: number) => string;
    refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const subscriptionService = getSubscriptionService();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [plansData, subscriptionData] = await Promise.all([
                subscriptionService.getPlans(),
                subscriptionService.getCurrentSubscription(),
            ]);

            setPlans(plansData);
            setCurrentSubscription(subscriptionData);
        } catch (err: any) {
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const purchasePlan = async (planId: string) => {
        try {
            setPurchasing(true);
            setError(null);
            setSuccessMessage(null);

            const result = await subscriptionService.purchasePlan(planId, 'monthly'); // pass default

            setSuccessMessage(result.message);

            // Refresh subscription data
            const newSubscription = await subscriptionService.getCurrentSubscription();
            setCurrentSubscription(newSubscription);

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Không thể mua gói');
        } finally {
            setPurchasing(false);
        }
    };

    return {
        plans,
        currentSubscription,
        loading,
        purchasing,
        error,
        successMessage,
        purchasePlan,
        formatPrice: subscriptionService.formatPrice.bind(subscriptionService),
        refresh: loadData,
    };
}

// Plans Page - Subscription Plans Display (ChatGPT-style)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    Loader2,
    Crown,
    Sparkles,
    Building2,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { BillingCycle } from '../../domain/entities/SubscriptionEntities';

export function Plans() {
    const navigate = useNavigate();
    const {
        plans,
        currentSubscription,
        loading,
        purchasing,
        error,
        successMessage,
        billingCycle,
        setBillingCycle,
        purchasePlan,
        formatPrice,
    } = useSubscription();

    const [confirmPlan, setConfirmPlan] = useState<string | null>(null);

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'pro':
                return Sparkles;
            case 'premium':
                return Crown;
            case 'business':
                return Building2;
            default:
                return Check;
        }
    };

    const getPrice = (plan: any) => {
        return billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    };

    const handlePurchase = async (planId: string) => {
        if (confirmPlan === planId) {
            await purchasePlan(planId);
            setConfirmPlan(null);
        } else {
            setConfirmPlan(planId);
        }
    };



    return (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-violet-50">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại hồ sơ
                    </button>
                    <h1 className="text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                        Nâng cấp gói của bạn
                    </h1>
                    <p className="text-center text-muted-foreground">
                        Chọn gói phù hợp với nhu cầu của bạn
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 max-w-md mx-auto">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 max-w-md mx-auto">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <p className="text-red-700">{error}</p>
                            {error.includes('Số dư không đủ') && (
                                <button
                                    onClick={() => navigate('/purchase')}
                                    className="text-sm text-red-600 underline hover:text-red-700 mt-1"
                                >
                                    Nạp tiền ngay →
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-full p-1 shadow-sm border border-slate-200 inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Theo tháng
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Theo năm
                            <span className="ml-1 text-xs opacity-75">(tiết kiệm 17%)</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => {
                            const Icon = getPlanIcon(plan.id);
                            const isCurrentPlan = currentSubscription?.tier === plan.id;
                            const price = getPrice(plan);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-lg ${isCurrentPlan
                                            ? 'border-violet-500 ring-2 ring-violet-200'
                                            : plan.isPopular
                                                ? 'border-amber-400'
                                                : 'border-slate-200 hover:border-violet-300'
                                        }`}
                                >
                                    {/* Popular Badge */}
                                    {plan.isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                Phổ biến nhất
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Plan Badge */}
                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                Gói hiện tại
                                            </span>
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="text-center mb-6 pt-2">
                                        <div
                                            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                            style={{ backgroundColor: `${plan.badgeColor}20` }}
                                        >
                                            <Icon
                                                className="w-6 h-6"
                                                style={{ color: plan.badgeColor }}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-center mb-6">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold text-slate-900">
                                                {price === 0 ? 'Miễn phí' : formatPrice(price).replace('₫', '')}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-slate-500 text-sm">
                                                    đ/{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <button
                                        onClick={() => handlePurchase(plan.id)}
                                        disabled={isCurrentPlan || purchasing || plan.id === 'free'}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all mb-6 ${isCurrentPlan
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : plan.id === 'free'
                                                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                                    : confirmPlan === plan.id
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-primary hover:bg-primary/90 hover:shadow-lg text-white'
                                            }`}
                                    >
                                        {purchasing && confirmPlan === plan.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang xử lý...
                                            </span>
                                        ) : isCurrentPlan ? (
                                            'Gói hiện tại'
                                        ) : plan.id === 'free' ? (
                                            'Gói mặc định'
                                        ) : confirmPlan === plan.id ? (
                                            'Xác nhận mua'
                                        ) : (
                                            `Chọn ${plan.name}`
                                        )}
                                    </button>

                                    {/* Features */}
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check
                                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                                    style={{ color: plan.badgeColor }}
                                                />
                                                <span className="text-sm text-slate-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500">
                        Thanh toán được trừ từ số dư tài khoản.{' '}
                        <button
                            onClick={() => navigate('/purchase')}
                            className="text-violet-600 hover:underline"
                        >
                            Nạp tiền →
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

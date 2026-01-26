// Plans Page - Subscription Plans Display (Enterprise Design)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Check,
    Loader2,
    Crown,
    Sparkles,
    Building2,
    AlertCircle,
    CheckCircle,
    Circle,
    Diamond,
    Factory,
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { DotLottiePlayer } from '@dotlottie/react-player';

export function Plans() {
    const { t, i18n } = useTranslation();
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
                return Diamond;
            case 'business':
                return Factory;
            default:
                return Circle;
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

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto relative min-h-screen bg-slate-50">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 opacity-80"></div>
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
                <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 relative z-10">
                <button
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center text-slate-500 hover:text-indigo-900 transition-colors text-sm font-medium gap-2 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {t('common.back')}
                </button>
            </div>

            <main className="w-full pb-24 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 px-4 relative">
                    {/* Left Lantern - visible on lg+ */}
                    <div className="absolute top-10 -left-48 hidden lg:block pointer-events-none">
                        <DotLottiePlayer
                            src="/assets/Den_long_vang.lottie"
                            autoplay
                            loop
                            style={{ width: '160px', height: '160px' }}
                        />
                    </div>
                    {/* Right Lantern - visible on lg+ */}
                    <div className="absolute top-10 -right-48 hidden lg:block pointer-events-none">
                        <DotLottiePlayer
                            src="/assets/Den_long_vang.lottie"
                            autoplay
                            loop
                            style={{ width: '160px', height: '160px' }}
                        />
                    </div>
                    <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-xs mb-3 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
                        {t('profile.subscription.pricing')}
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800">
                        {t('profile.subscription.titleNew')}
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
                        {t('profile.subscription.subtitleNew')}
                    </p>

                    {/* Billing Cycle Toggle */}
                    <div className="inline-flex items-center bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-white/50 shadow-sm relative ring-1 ring-slate-200/50">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly'
                                ? 'text-white bg-slate-900 shadow-md'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {t('profile.subscription.monthly')}
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly'
                                ? 'text-white bg-slate-900 shadow-md'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {t('profile.subscription.yearly')}
                            <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-200/50">
                                {t('profile.subscription.savePercent')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Success/Error Messages */}
                <div className="max-w-md mx-auto px-4 mb-8">
                    {successMessage && (
                        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-700">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-red-700">{error}</p>
                                {error.includes('Số dư không đủ') && (
                                    <button
                                        onClick={() => navigate('/purchase')}
                                        className="text-sm text-red-600 underline hover:text-red-700 mt-1"
                                    >
                                        {t('profile.balance.deposit')} →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                        {plans.map((plan) => {
                            const Icon = getPlanIcon(plan.id);
                            const isCurrentPlan = currentSubscription?.tier === plan.id;
                            const price = getPrice(plan);

                            // Determine border color based on plan
                            const borderColors: Record<string, string> = {
                                free: 'border-t-cyan-500',
                                pro: 'border-t-purple-600',
                                premium: 'border-t-fuchsia-500',
                                business: 'border-t-slate-600',
                            };

                            const iconBgColors: Record<string, string> = {
                                free: 'bg-cyan-50 border-cyan-100 text-cyan-600',
                                pro: 'bg-purple-50 border-purple-100 text-purple-600',
                                premium: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30',
                                business: 'bg-slate-100 border-slate-200 text-slate-600',
                            };

                            const checkColors: Record<string, string> = {
                                free: 'text-cyan-600',
                                pro: 'text-purple-600',
                                premium: 'text-fuchsia-600',
                                business: 'text-slate-900',
                            };

                            const buttonGradients: Record<string, string> = {
                                free: 'from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/20',
                                pro: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20',
                                premium: 'from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-fuchsia-600/30',
                                business: 'from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-slate-500/20',
                            };

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-white/90 rounded-xl p-8 border-t-4 ${borderColors[plan.id]} border-x border-b border-slate-200 shadow-lg hover:shadow-xl flex flex-col h-full hover:-translate-y-1 transition-all duration-300 relative ${plan.isPopular ? 'ring-1 ring-fuchsia-500/10 bg-white' : ''
                                        }`}
                                >
                                    {/* Popular/Current Badge */}
                                    {plan.isPopular && !isCurrentPlan && (
                                        <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                            <div className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 border border-yellow-300 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-300/30">
                                                <Sparkles className="w-4 h-4 text-amber-800" />
                                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                                                    {t('profile.subscription.mostPopular')}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                            <span className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                                {t('profile.subscription.currentPlan')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6 pt-2">
                                        <div className={`w-12 h-12 rounded-lg ${iconBgColors[plan.id]} ${plan.id !== 'premium' ? 'border' : ''} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        {price === 0 ? (
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">{t('profile.subscription.free')}</span>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold text-slate-900 tracking-tight">
                                                    {formatPrice(price).replace('₫', '')}
                                                </span>
                                                <span className="text-sm text-slate-400 font-medium">
                                                    {i18n.language === 'en' ? 'VND' : 'đ'}{billingCycle === 'monthly' ? t('profile.subscription.perMonth') : t('profile.subscription.perYear')}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check className={`w-5 h-5 flex-shrink-0 ${checkColors[plan.id]}`} />
                                                <span className={plan.isPopular ? 'font-medium text-slate-700' : ''}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handlePurchase(plan.id)}
                                        disabled={isCurrentPlan || purchasing || plan.id === 'free'}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 text-sm ${isCurrentPlan
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            : plan.id === 'free'
                                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed shadow-none'
                                                : confirmPlan === plan.id
                                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                                    : `bg-gradient-to-r ${buttonGradients[plan.id]} text-white transform hover:-translate-y-0.5`
                                            }`}
                                    >
                                        {purchasing && confirmPlan === plan.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {t('profile.subscription.processing')}
                                            </span>
                                        ) : isCurrentPlan ? (
                                            t('profile.subscription.current')
                                        ) : plan.id === 'free' ? (
                                            t('profile.subscription.default')
                                        ) : confirmPlan === plan.id ? (
                                            t('profile.subscription.confirm')
                                        ) : (
                                            t('profile.subscription.select', { plan: plan.name })
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trusted by Industry Leaders */}
                <div className="mt-24 border-y border-white/50 bg-white/40 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <p className="text-center text-sm font-bold text-indigo-900/40 uppercase tracking-widest mb-8">
                            {t('profile.subscription.trustedBy')}
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 group cursor-default">
                                <CheckCircle className="w-8 h-8 text-slate-800 group-hover:text-blue-600 transition-colors" />
                                <span className="text-xl font-extrabold tracking-tighter text-slate-800">
                                    SECURE<span className="text-blue-600">TECH</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Circle className="w-8 h-8 text-slate-800 group-hover:text-purple-600 transition-colors" />
                                <span className="text-xl font-bold tracking-tight text-slate-800">NEXUS</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Diamond className="w-8 h-8 text-slate-800 group-hover:text-amber-500 transition-colors" />
                                <span className="text-xl font-bold tracking-tight text-slate-800">Orbital</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Sparkles className="w-8 h-8 text-slate-800 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-xl font-bold tracking-tight text-slate-800 italic">infinite</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Building2 className="w-8 h-8 text-slate-800 group-hover:text-cyan-600 transition-colors" />
                                <span className="text-xl font-bold tracking-tight text-slate-800">Stratos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto px-6 mt-24">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('profile.subscription.faq.title')}</h2>
                    <div className="space-y-3">
                        <details className="group bg-white/70 backdrop-blur-sm rounded-lg border border-white shadow-sm overflow-hidden transition-all duration-300">
                            <summary className="flex justify-between items-center cursor-pointer p-6 hover:bg-white transition-colors">
                                <span className="text-lg font-semibold text-slate-800">{t('profile.subscription.faq.changePlan.q')}</span>
                                <span className="text-slate-400 transition-transform duration-300 group-open:rotate-180">▼</span>
                            </summary>
                            <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed">
                                {t('profile.subscription.faq.changePlan.a')}
                            </div>
                        </details>

                        <details className="group bg-white/70 backdrop-blur-sm rounded-lg border border-white shadow-sm overflow-hidden transition-all duration-300">
                            <summary className="flex justify-between items-center cursor-pointer p-6 hover:bg-white transition-colors">
                                <span className="text-lg font-semibold text-slate-800">{t('profile.subscription.faq.freeTrial.q')}</span>
                                <span className="text-slate-400 transition-transform duration-300 group-open:rotate-180">▼</span>
                            </summary>
                            <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed">
                                {t('profile.subscription.faq.freeTrial.a')}
                            </div>
                        </details>

                        <details className="group bg-white/70 backdrop-blur-sm rounded-lg border border-white shadow-sm overflow-hidden transition-all duration-300">
                            <summary className="flex justify-between items-center cursor-pointer p-6 hover:bg-white transition-colors">
                                <span className="text-lg font-semibold text-slate-800">{t('profile.subscription.faq.payment.q')}</span>
                                <span className="text-slate-400 transition-transform duration-300 group-open:rotate-180">▼</span>
                            </summary>
                            <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed">
                                {t('profile.subscription.faq.payment.a')}
                            </div>
                        </details>

                        <details className="group bg-white/70 backdrop-blur-sm rounded-lg border border-white shadow-sm overflow-hidden transition-all duration-300">
                            <summary className="flex justify-between items-center cursor-pointer p-6 hover:bg-white transition-colors">
                                <span className="text-lg font-semibold text-slate-800">{t('profile.subscription.faq.security.q')}</span>
                                <span className="text-slate-400 transition-transform duration-300 group-open:rotate-180">▼</span>
                            </summary>
                            <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed">
                                {t('profile.subscription.faq.security.a')}
                            </div>
                        </details>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-sm text-slate-500 font-medium px-4">
                    {t('profile.subscription.footerNote')}{' '}
                    <button
                        onClick={() => navigate('/purchase')}
                        className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                    >
                        {t('profile.balance.deposit')} →
                    </button>
                </div>
            </main>
        </div>
    );
}

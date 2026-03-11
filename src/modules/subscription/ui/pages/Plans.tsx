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
    ArrowRightLeft,
    Plus,
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { PageLoading } from '@/shared/components/PageLoading';
import { CurrencyExchangeModal } from '@/modules/profile/ui/components/CurrencyExchangeModal';
import { useAuth } from '@/modules/auth/AuthProvider';
import { coinsStore } from '@/modules/coins/domain/services/CoinsStore';
import { useEffect } from 'react';

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
        purchasePlan,
        formatPrice,
    } = useSubscription();
    const { user } = useAuth();
    const [currentCoins, setCurrentCoins] = useState(coinsStore.currentBalance || 0);

    useEffect(() => {
        const sub = coinsStore.balance$.subscribe(val => {
            if (val !== null) setCurrentCoins(val);
        });
        return () => sub.unsubscribe();
    }, []);

    const [confirmPlan, setConfirmPlan] = useState<string | null>(null);
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'pack_59k':
                return Sparkles;
            case 'pack_139k':
                return Diamond;
            case 'pack_600k':
                return Crown;
            default:
                return Circle;
        }
    };

    const getPrice = (plan: any) => {
        return plan.priceMonthly; // Using priceMonthly as the single price struct mapped in gateway
    };

    const handlePurchase = async (planId: string) => {
        if (confirmPlan === planId) {
            try {
                await purchasePlan(planId);
            } finally {
                setConfirmPlan(null);
            }
        } else {
            setConfirmPlan(planId);
        }
    };

    if (loading) return <PageLoading />;

    return (
        <div
            className="flex-1 overflow-auto relative min-h-screen bg-white"
        >

            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 relative z-10 flex items-center justify-between">
                <button
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center text-slate-500 hover:text-indigo-900 transition-colors text-sm font-medium gap-2 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {t('common.back')}
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/purchase')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 px-4 py-2 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        {t('profile.balance.deposit', 'Nạp Tiền')}
                    </button>
                    <button
                        onClick={() => setIsExchangeOpen(true)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl font-bold text-sm border border-purple-200 transition-all inline-flex items-center gap-1.5"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        {t('profile.balance.exchange', 'Đổi Xu')}
                    </button>
                </div>
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

                    {/* Removed Billing Cycle Toggle since packages are one-off */}
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
                            // Coin packages can be purchased multiple times -> no "isCurrentPlan" check needed
                            const price = getPrice(plan);

                            // Determine border color based on plan
                            const borderColors: Record<string, string> = {
                                pack_10k: 'border-t-cyan-500',
                                pack_59k: 'border-t-purple-600',
                                pack_139k: 'border-t-fuchsia-500',
                                pack_600k: 'border-t-amber-500', // Premium gold colors for 600k
                            };

                            const iconBgColors: Record<string, string> = {
                                pack_10k: 'bg-cyan-50 border-cyan-100 text-cyan-600',
                                pack_59k: 'bg-purple-50 border-purple-100 text-purple-600',
                                pack_139k: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30',
                                pack_600k: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-lg shadow-amber-500/30',
                            };

                            const checkColors: Record<string, string> = {
                                pack_10k: 'text-cyan-600',
                                pack_59k: 'text-purple-600',
                                pack_139k: 'text-fuchsia-600',
                                pack_600k: 'text-amber-600',
                            };

                            const buttonGradients: Record<string, string> = {
                                pack_10k: 'from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/20',
                                pack_59k: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20',
                                pack_139k: 'from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-fuchsia-600/30',
                                pack_600k: 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/30',
                            };

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-white/90 rounded-xl p-8 border-t-4 ${borderColors[plan.id]} border-x border-b border-slate-200 shadow-lg hover:shadow-xl flex flex-col h-full hover:-translate-y-1 transition-all duration-300 relative ${plan.isPopular ? 'ring-1 ring-fuchsia-500/10 bg-white' : ''
                                        }`}
                                >
                                    {/* Popular Badge */}
                                    {plan.isPopular && (
                                        <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                            <div className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 border border-yellow-300 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-300/30">
                                                <Sparkles className="w-4 h-4 text-amber-800" />
                                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                                                    {t('profile.subscription.mostPopular')}
                                                </span>
                                            </div>
                                        </div>
                                    )}


                                    <div className="mb-6 pt-2">
                                        <div
                                            className={`w-12 h-12 rounded-lg ${iconBgColors[plan.id]} ${plan.id !== 'premium' ? 'border' : ''} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 cursor-pointer`}
                                            onDoubleClick={() => {
                                                if (plan.id === 'pack_600k' || plan.isPopular) {
                                                    alert("🎉 Chúc mừng bạn đã tìm thấy Mật mã bí mật: NX-VIP99. Chụp màn hình và gửi fanpage ngay!");
                                                }
                                            }}
                                            title={plan.id === 'pack_600k' || plan.isPopular ? "Secret Area" : undefined}
                                        >
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
                                                    {formatPrice(price)}
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
                                        disabled={purchasing}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 text-sm ${confirmPlan === plan.id
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : `bg-gradient-to-r ${buttonGradients[plan.id]} text-white transform hover:-translate-y-0.5`
                                            }`}
                                    >
                                        {purchasing && confirmPlan === plan.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : confirmPlan === plan.id ? (
                                            'Nhấn lại để Xác Nhận'
                                        ) : (
                                            `Mua ${plan.name}`
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

            {/* Modal */}
            <CurrencyExchangeModal
                isOpen={isExchangeOpen}
                onClose={() => setIsExchangeOpen(false)}
                currentBalance={user?.balance || 0}
                currentCoins={currentCoins}
                onExchangeSuccess={() => setIsExchangeOpen(false)}
            />
        </div>
    );
}

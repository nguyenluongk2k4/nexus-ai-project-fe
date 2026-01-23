// Purchase Success Page

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Wallet, ArrowRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PurchaseSuccess() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { amount, transactionCode } = location.state || {};

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { style: 'currency', currency: i18n.language === 'en' ? 'USD' : 'VND' }).format(i18n.language === 'en' ? value / 23000 : value);
    };

    // Auto redirect to profile after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-green-50">
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    {/* Success Animation */}
                    <div className="mb-8 relative">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-2xl animate-pulse">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                        {/* Confetti-like decoration */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full border-4 border-green-200 animate-ping opacity-75" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
                        {t('purchase.success.title')}
                    </h1>

                    <p className="text-muted-foreground mb-8">
                        {t('purchase.success.subtitle')}
                    </p>

                    {/* Transaction Details */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-8">
                        {amount && (
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Wallet className="w-8 h-8 text-green-600" />
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
                                    +{formatCurrency(amount)}
                                </span>
                            </div>
                        )}

                        {transactionCode && (
                            <p className="text-sm text-muted-foreground">
                                {t('purchase.success.transactionCode')}: <span className="font-mono font-semibold">{transactionCode}</span>
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >

                            <Wallet className="w-5 h-5" />
                            {t('purchase.success.viewBalance')}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center justify-center gap-2 bg-white text-foreground py-4 px-6 rounded-xl font-semibold border border-border hover:bg-accent transition-all"
                        >
                            <Home className="w-5 h-5" />
                            {t('purchase.success.home')}
                        </button>
                    </div>

                    {/* Auto redirect notice */}
                    <p className="text-xs text-muted-foreground mt-6">
                        {t('purchase.success.redirect', { seconds: 10 })}
                    </p>
                </div>
            </div>
        </div>
    );
}

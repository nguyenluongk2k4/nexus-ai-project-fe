// Purchase Page - Premium Vibrant Purple Design

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Wallet,
    QrCode,
    Copy,
    Check,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Building2,
    History,
    ChevronRight
} from 'lucide-react';
import { usePurchase } from '../hooks/usePurchase';

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        badgeColor: 'text-amber-600 bg-white/60 border-amber-100',
        accentColor: 'bg-amber-400',
        label: 'Đang chờ',
    },
    completed: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        textColor: 'text-emerald-700',
        badgeColor: 'text-emerald-600 bg-white/60 border-emerald-100',
        accentColor: 'bg-emerald-400',
        label: 'Thành công',
    },
    failed: {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeColor: 'text-red-600 bg-white/60 border-red-100',
        accentColor: 'bg-red-400',
        label: 'Thất bại',
    },
};

export function Purchase() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const {
        presetAmounts,
        selectedAmount,
        customAmount,
        qrInfo,
        history,
        loading,
        qrLoading,
        error,
        paymentStatus,
        selectAmount,
        setCustomAmount,
        generateQR,
        formatCurrency,
        resumePendingTransaction,
    } = usePurchase();

    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEffectiveAmount = () => {
        if (selectedAmount) return selectedAmount;
        if (customAmount) return parseInt(customAmount, 10) || 0;
        return 0;
    };

    return (
        <div
            className="flex-1 overflow-auto min-h-screen p-4 md:p-8"
            style={{
                backgroundColor: '#faf5ff',
                backgroundImage: 'radial-gradient(#e9d5ff 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => navigate('/profile')}
                        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors gap-1 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('purchase.back')}
                    </button>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-purple-600 tracking-tight">
                        {t('purchase.title')}
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">
                        {t('purchase.subtitle')}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Amount Selection Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50">
                            <div className="flex items-center gap-2 mb-6">
                                <Wallet className="w-5 h-5 text-purple-600" />
                                <h3 className="text-xl font-bold text-slate-900">{t('purchase.selectAmount')}</h3>
                            </div>

                            {/* Preset Amounts Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {presetAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => selectAmount(amount)}
                                        className={`py-4 px-2 rounded-xl font-bold transition-all shadow-sm ${selectedAmount === amount
                                                ? 'border-2 border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 text-slate-700'
                                            }`}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-500">
                                    {t('purchase.orCustom')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder={t('purchase.placeholder')}
                                        className={`w-full pl-5 pr-16 py-3.5 bg-white border rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm outline-none ${customAmount && !selectedAmount ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                                            }`}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                        {t('purchase.currency')}
                                    </span>
                                </div>
                            </div>

                            {/* Generate QR Button */}
                            <button
                                onClick={generateQR}
                                disabled={getEffectiveAmount() <= 0 || qrLoading}
                                className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all flex items-center justify-center gap-2 transform active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {qrLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('purchase.generating')}
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5 group-hover:animate-pulse" />
                                        {t('purchase.generateQR')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Bank Info Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50">
                            <div className="flex items-center gap-2 mb-6 text-purple-800">
                                <Building2 className="w-5 h-5" />
                                <h3 className="text-lg font-bold">{t('purchase.bankInfo.title')}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                    <span className="text-slate-500 font-medium">{t('purchase.bankInfo.bank')}</span>
                                    <span className="font-bold text-slate-900">MB Bank</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100 group">
                                    <span className="text-slate-500 font-medium">{t('purchase.bankInfo.account')}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900 font-mono text-lg tracking-wide">0123456789</span>
                                        <button
                                            onClick={() => copyToClipboard('0123456789', 'account')}
                                            className="text-purple-400 hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-100"
                                        >
                                            {copiedField === 'account' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100 group">
                                    <span className="text-slate-500 font-medium">{t('purchase.bankInfo.owner')}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900 uppercase">NEXUS AI PLATFORM</span>
                                        <button
                                            onClick={() => copyToClipboard('NEXUS AI PLATFORM', 'name')}
                                            className="text-purple-400 hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-100"
                                        >
                                            {copiedField === 'name' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Card */}
                        {paymentStatus !== 'idle' && (
                            <div className={`rounded-xl p-6 border ${paymentStatus === 'pending'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : paymentStatus === 'completed'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {paymentStatus === 'pending' && (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-yellow-700">{t('purchase.history.waiting')}</p>
                                                <p className="text-sm text-yellow-600">{t('purchase.history.prompt')}</p>
                                            </div>
                                        </>
                                    )}
                                    {paymentStatus === 'completed' && (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-700">{t('purchase.history.successTitle')}</p>
                                                <p className="text-sm text-green-600">{t('purchase.history.successDesc')}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* QR Code Display */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100/50 flex flex-col items-center text-center h-fit">
                            <h3 className="text-lg font-bold text-slate-900 mb-8 w-full text-left border-b border-purple-50 pb-4">
                                {t('purchase.qrTitle')}
                            </h3>

                            {qrInfo ? (
                                <div className="text-center w-full">
                                    {/* QR Image */}
                                    <div className="bg-white p-2 rounded-2xl inline-block mb-6 shadow-inner border border-slate-100">
                                        <img
                                            src={qrInfo.qrDataUrl}
                                            alt="Payment QR Code"
                                            className="w-48 h-48 mx-auto"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect fill="%23f1f5f9" width="192" height="192"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="%2364748b">QR Code</text></svg>';
                                            }}
                                        />
                                    </div>

                                    {/* Transfer Content */}
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-500 mb-2">{t('purchase.transferContent')}</p>
                                        <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                                            <code className="font-mono font-bold text-purple-700">{qrInfo.transferContent}</code>
                                            <button
                                                onClick={() => copyToClipboard(qrInfo.transferContent, 'content')}
                                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                            >
                                                {copiedField === 'content' ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="text-left bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold mb-2">{t('purchase.instructions.title')}</p>
                                        <ol className="text-sm text-slate-500 space-y-1 list-decimal list-inside">
                                            <li>{t('purchase.instructions.step1')}</li>
                                            <li>{t('purchase.instructions.step2')}</li>
                                            <li>{t('purchase.instructions.step3')}</li>
                                            <li>{t('purchase.instructions.step4')}</li>
                                            <li>{t('purchase.instructions.step5')}</li>
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl w-48 h-48 flex items-center justify-center mb-6">
                                        <QrCode className="w-16 h-16 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                        {t('purchase.selectAmount')} <span className="font-bold text-purple-700">"{t('purchase.generateQR')}"</span>
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Transaction History */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50 h-[480px] flex flex-col">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-purple-50">
                                <History className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-bold text-slate-900">{t('purchase.history.title')}</h3>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-slate-400 text-center">{t('purchase.history.empty')}</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                    {history.map((item) => {
                                        const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                        const StatusIcon = statusConfig.icon;
                                        const isPending = item.status === 'pending';

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => isPending && item.transactionCode && resumePendingTransaction(item.transactionCode)}
                                                className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} hover:shadow-md transition-all relative overflow-hidden ${isPending ? 'cursor-pointer' : ''} group`}
                                            >
                                                {/* Accent bar */}
                                                <div className={`absolute top-0 right-0 w-1 h-full ${statusConfig.accentColor}`}></div>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`${statusConfig.textColor} font-extrabold text-lg`}>
                                                        +{formatCurrency(item.amount)}
                                                    </span>
                                                    <span className={`flex items-center gap-1 text-xs font-bold ${statusConfig.badgeColor} px-2 py-1 rounded-full border`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className={`flex justify-between items-end text-xs ${statusConfig.textColor} opacity-70 font-medium mt-3`}>
                                                    {item.transactionCode && (
                                                        <span className="font-mono opacity-80">{item.transactionCode}</span>
                                                    )}
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                                {isPending && (
                                                    <div className={`mt-2 pt-2 border-t ${statusConfig.borderColor} flex items-center ${statusConfig.textColor} text-xs font-semibold gap-1`}>
                                                        <ChevronRight className="w-4 h-4" />
                                                        {t('purchase.history.resume')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-400 py-8 text-sm font-medium">
                    {t('profile.footer')}
                </footer>
            </div>
        </div>
    );
}

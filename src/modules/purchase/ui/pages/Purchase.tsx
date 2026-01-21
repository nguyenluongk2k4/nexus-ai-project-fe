// Purchase Page

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
    CreditCard,
    Building2
} from 'lucide-react';
import { usePurchase } from '../hooks/usePurchase';
import { PageLoading } from '@/shared/components/PageLoading';


// Status config moved inside component or use translation keys directly
// For simplicity, we'll keep structure but keys will come from hook
const STATUS_CONFIG_KEYS = {
    pending: {
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        labelKey: 'purchase.history.pending',
    },
    completed: {
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
        labelKey: 'purchase.history.completed',
    },
    failed: {
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        labelKey: 'purchase.history.failed',
    },
};

export function Purchase() {
    const { t } = useTranslation();
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
        return new Date(dateStr).toLocaleDateString('vi-VN', {
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

    if (loading && !history.length) {
      return <PageLoading />;
    }

    return (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/20">
            <div className="max-w-[1400px] mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('purchase.back')}
                    </button>
                    <h1 className="text-4xl font-bold mb-2 text-primary">
                        {t('purchase.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('purchase.subtitle')}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <p className="text-destructive">{error}</p>
                    </div>
                )}

                {/* Main Layout - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                    {/* Left Column - Amount Selection & QR */}
                    <div className="space-y-6">
                        {/* Amount Selection Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                {t('purchase.selectAmount')}
                            </h3>

                            {/* Preset Amounts Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {presetAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => selectAmount(amount)}
                                        className={`py-4 px-4 rounded-xl font-semibold transition-all border-2 ${selectedAmount === amount
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                            }`}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    {t('purchase.orCustom')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder={t('purchase.placeholder')}
                                        className={`w-full px-4 py-3 pr-16 rounded-lg border-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${customAmount && !selectedAmount ? 'border-primary bg-primary/5' : 'border-border'
                                            }`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                        VNĐ
                                    </span>
                                </div>
                            </div>

                            {/* Amount Display */}
                            {getEffectiveAmount() > 0 && (
                                <div className="p-4 rounded-xl bg-primary/5 mb-6">
                                    <p className="text-sm text-muted-foreground mb-1">{t('purchase.youWillDeposit')}</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {formatCurrency(getEffectiveAmount())}
                                    </p>
                                </div>
                            )}

                            {/* Generate QR Button */}
                            <button
                                onClick={generateQR}
                                disabled={getEffectiveAmount() <= 0 || qrLoading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-6 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {qrLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('purchase.generating')}
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5" />
                                        {t('purchase.generateQR')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Bank Info Card */}
                        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                {t('purchase.bankInfo.title')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('purchase.bankInfo.bank')}</span>
                                    <span className="font-semibold">MB Bank</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('purchase.bankInfo.account')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold font-mono">0123456789</span>
                                        <button
                                            onClick={() => copyToClipboard('0123456789', 'account')}
                                            className="p-1 hover:bg-background rounded transition-colors"
                                        >
                                            {copiedField === 'account' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('purchase.bankInfo.owner')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">NEXUS AI PLATFORM</span>
                                        <button
                                            onClick={() => copyToClipboard('NEXUS AI PLATFORM', 'name')}
                                            className="p-1 hover:bg-background rounded transition-colors"
                                        >
                                            {copiedField === 'name' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-muted-foreground" />
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

                    {/* Right Column - QR Code & History */}
                    <div className="space-y-6">
                        {/* QR Code Display */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4 text-center">{t('purchase.qrTitle')}</h3>

                            {qrInfo ? (
                                <div className="text-center">
                                    {/* QR Image */}
                                    <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner border border-slate-100">
                                        <img
                                            src={qrInfo.qrDataUrl}
                                            alt="Payment QR Code"
                                            className="w-64 h-64 mx-auto"
                                            onError={(e) => {
                                                // Fallback if image fails
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect fill="%23f1f5f9" width="256" height="256"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="%2364748b">QR Code</text></svg>';
                                            }}
                                        />
                                    </div>

                                    {/* Transfer Content */}
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground mb-1">{t('purchase.transferContent')}</p>
                                        <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                                            <code className="font-mono font-bold text-primary">{qrInfo.transferContent}</code>
                                            <button
                                                onClick={() => copyToClipboard(qrInfo.transferContent, 'content')}
                                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                            >
                                                {copiedField === 'content' ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="text-left bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold mb-2">{t('purchase.instructions.title')}</p>
                                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                            <li>{t('purchase.instructions.step1')}</li>
                                            <li>{t('purchase.instructions.step2')}</li>
                                            <li>{t('purchase.instructions.step3')}</li>
                                            <li>{t('purchase.instructions.step4')}</li>
                                            <li>{t('purchase.instructions.step5')}</li>
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <QrCode className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <p className="text-muted-foreground">
                                        Chọn số tiền và nhấn "Tạo mã QR" để hiển thị mã thanh toán
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Transaction History */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                {t('purchase.history.title')}
                            </h3>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    {t('purchase.history.empty')}
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {history.map((item) => {
                                        const statusConfig = STATUS_CONFIG_KEYS[item.status as keyof typeof STATUS_CONFIG_KEYS] || STATUS_CONFIG_KEYS.pending;
                                        const StatusIcon = statusConfig.icon;
                                        const isPending = item.status === 'pending';

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => isPending && item.transactionCode && resumePendingTransaction(item.transactionCode)}
                                                className={`p-4 rounded-lg border ${statusConfig.color} ${isPending ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                                                title={isPending ? t('purchase.history.resume') : ''}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-lg">
                                                        +{formatCurrency(item.amount)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <StatusIcon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{t(statusConfig.labelKey)}</span>
                                                        {isPending && (
                                                            <span className="text-xs ml-1">→ {t('purchase.history.resume')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground font-mono">
                                                        {item.transactionCode}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {formatDate(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Purchase Page

import { useState } from 'react';
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

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Đang chờ',
    },
    completed: {
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Thành công',
    },
    failed: {
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'Thất bại',
    },
};

export function Purchase() {
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
                        Quay lại hồ sơ
                    </button>
                    <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                        Nạp Tiền Vào Tài Khoản
                    </h1>
                    <p className="text-muted-foreground">
                        Quét mã QR để nạp tiền nhanh chóng và an toàn
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Main Layout - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                    {/* Left Column - Amount Selection & QR */}
                    <div className="space-y-6">
                        {/* Amount Selection Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-violet-600" />
                                Chọn số tiền nạp
                            </h3>

                            {/* Preset Amounts Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {presetAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => selectAmount(amount)}
                                        className={`py-4 px-4 rounded-xl font-semibold transition-all border-2 ${selectedAmount === amount
                                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                                            : 'border-border hover:border-violet-300 hover:bg-violet-50/50'
                                            }`}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Hoặc nhập số tiền khác
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Nhập số tiền..."
                                        className={`w-full px-4 py-3 pr-16 rounded-lg border-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${customAmount && !selectedAmount ? 'border-violet-500 bg-violet-50' : 'border-border'
                                            }`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                        VNĐ
                                    </span>
                                </div>
                            </div>

                            {/* Amount Display */}
                            {getEffectiveAmount() > 0 && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-teal-50 mb-6">
                                    <p className="text-sm text-muted-foreground mb-1">Bạn sẽ nạp:</p>
                                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                                        {formatCurrency(getEffectiveAmount())}
                                    </p>
                                </div>
                            )}

                            {/* Generate QR Button */}
                            <button
                                onClick={generateQR}
                                disabled={getEffectiveAmount() <= 0 || qrLoading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {qrLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang tạo mã QR...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5" />
                                        Tạo mã QR thanh toán
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Bank Info Card */}
                        <div className="bg-gradient-to-br from-violet-50 to-teal-50 rounded-xl p-6 border border-violet-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-violet-600" />
                                Thông tin tài khoản nhận
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Ngân hàng</span>
                                    <span className="font-semibold">MB Bank</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Số tài khoản</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold font-mono">0123456789</span>
                                        <button
                                            onClick={() => copyToClipboard('0123456789', 'account')}
                                            className="p-1 hover:bg-violet-100 rounded transition-colors"
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
                                    <span className="text-sm text-muted-foreground">Chủ tài khoản</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">NEXUS AI PLATFORM</span>
                                        <button
                                            onClick={() => copyToClipboard('NEXUS AI PLATFORM', 'name')}
                                            className="p-1 hover:bg-violet-100 rounded transition-colors"
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
                                                <p className="font-semibold text-yellow-700">Đang chờ thanh toán...</p>
                                                <p className="text-sm text-yellow-600">Vui lòng hoàn tất chuyển khoản</p>
                                            </div>
                                        </>
                                    )}
                                    {paymentStatus === 'completed' && (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-700">Nạp tiền thành công!</p>
                                                <p className="text-sm text-green-600">Số dư đã được cập nhật</p>
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
                            <h3 className="text-lg font-bold mb-4 text-center">Mã QR Thanh Toán</h3>

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
                                        <p className="text-sm text-muted-foreground mb-1">Nội dung chuyển khoản:</p>
                                        <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                                            <code className="font-mono font-bold text-violet-700">{qrInfo.transferContent}</code>
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
                                        <p className="text-sm font-semibold mb-2">Hướng dẫn:</p>
                                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                            <li>Mở ứng dụng ngân hàng</li>
                                            <li>Chọn quét mã QR</li>
                                            <li>Quét mã QR phía trên</li>
                                            <li>Kiểm tra thông tin và xác nhận</li>
                                            <li>Tiền sẽ được cộng trong vòng 5 phút</li>
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
                                <Clock className="w-5 h-5 text-violet-600" />
                                Lịch sử nạp tiền
                            </h3>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                                </div>
                            ) : history.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Chưa có giao dịch nào
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {history.map((item) => {
                                        const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                        const StatusIcon = statusConfig.icon;
                                        const isPending = item.status === 'pending';

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => isPending && item.transactionCode && resumePendingTransaction(item.transactionCode)}
                                                className={`p-4 rounded-lg border ${statusConfig.color} ${isPending ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                                                title={isPending ? 'Nhấn để tiếp tục thanh toán' : ''}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-lg">
                                                        +{formatCurrency(item.amount)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <StatusIcon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{statusConfig.label}</span>
                                                        {isPending && (
                                                            <span className="text-xs ml-1">→ Nhấn để tiếp tục</span>
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

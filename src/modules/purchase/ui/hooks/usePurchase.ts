// usePurchase hook - with polling for payment status

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchaseService } from '../../providers';
import { PurchaseHistory, QRPaymentInfo, PRESET_AMOUNTS, PresetAmount } from '../../domain/entities/PurchaseEntities';

interface UsePurchaseResult {
    presetAmounts: PresetAmount[];
    selectedAmount: number | null;
    customAmount: string;
    qrInfo: QRPaymentInfo | null;
    history: PurchaseHistory[];
    loading: boolean;
    qrLoading: boolean;
    error: string | null;
    paymentStatus: 'idle' | 'pending' | 'completed' | 'failed' | 'expired';
    selectAmount: (amount: number) => void;
    setCustomAmount: (value: string) => void;
    generateQR: () => Promise<void>;
    formatCurrency: (amount: number) => string;
    refresh: () => Promise<void>;
    cancelPolling: () => void;
    resumePendingTransaction: (transactionCode: string) => Promise<void>;
}

// Polling interval in milliseconds
const POLL_INTERVAL = 3000; // 3 seconds

export function usePurchase(): UsePurchaseResult {
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [qrInfo, setQrInfo] = useState<QRPaymentInfo | null>(null);
    const [history, setHistory] = useState<PurchaseHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrLoading, setQrLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed' | 'expired'>('idle');

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const purchaseService = getPurchaseService();

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const historyData = await purchaseService.getPurchaseHistory();
            setHistory(historyData);
        } catch (err: any) {
            setError(err.message || 'Không thể tải lịch sử nạp tiền');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Polling for payment status
    const startPolling = useCallback((transactionCode: string) => {
        // Clear any existing polling
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {
            try {
                const status = await purchaseService.checkPaymentStatus(transactionCode);

                if (status === 'completed') {
                    // Payment successful!
                    setPaymentStatus('completed');
                    clearInterval(pollingRef.current!);
                    pollingRef.current = null;

                    // Redirect to success page after a short delay
                    setTimeout(() => {
                        navigate('/purchase/success', {
                            state: {
                                amount: qrInfo?.amount,
                                transactionCode: transactionCode
                            }
                        });
                    }, 1500);
                } else if (status === 'failed') {
                    setPaymentStatus('failed');
                    clearInterval(pollingRef.current!);
                    pollingRef.current = null;
                } else if (status === 'expired') {
                    setPaymentStatus('expired');
                    clearInterval(pollingRef.current!);
                    pollingRef.current = null;
                }
                // If still pending, continue polling
            } catch (err) {
                console.error('Error polling payment status:', err);
                // Don't stop polling on error, just log it
            }
        }, POLL_INTERVAL);
    }, [navigate, qrInfo]);

    const cancelPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setPaymentStatus('idle');
        setQrInfo(null);
    }, []);

    const selectAmount = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
        setQrInfo(null);
        setPaymentStatus('idle');
        cancelPolling();
    };

    const handleSetCustomAmount = (value: string) => {
        // Only allow numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        setCustomAmount(numericValue);
        setSelectedAmount(null);
        setQrInfo(null);
        setPaymentStatus('idle');
        cancelPolling();
    };

    const getEffectiveAmount = (): number => {
        if (selectedAmount) return selectedAmount;
        if (customAmount) return parseInt(customAmount, 10) || 0;
        return 0;
    };

    const generateQR = async () => {
        const amount = getEffectiveAmount();
        if (amount <= 0) {
            setError('Vui lòng chọn hoặc nhập số tiền');
            return;
        }

        try {
            setQrLoading(true);
            setError(null);
            const qr = await purchaseService.createPaymentQR(amount);
            setQrInfo(qr);
            setPaymentStatus('pending');

            // Start polling for payment status
            startPolling(qr.transferContent);
        } catch (err: any) {
            setError(err.message || 'Không thể tạo mã QR');
        } finally {
            setQrLoading(false);
        }
    };

    // Resume a pending transaction
    const resumePendingTransaction = async (transactionCode: string) => {
        try {
            setQrLoading(true);
            setError(null);
            const qr = await purchaseService.resumePendingTransaction(transactionCode);
            setQrInfo(qr);
            setSelectedAmount(qr.amount);
            setPaymentStatus('pending');

            // Start polling for payment status
            startPolling(qr.transferContent);
        } catch (err: any) {
            setError(err.message || 'Không thể tiếp tục giao dịch');
        } finally {
            setQrLoading(false);
        }
    };

    return {
        presetAmounts: PRESET_AMOUNTS,
        selectedAmount,
        customAmount,
        qrInfo,
        history,
        loading,
        qrLoading,
        error,
        paymentStatus,
        selectAmount,
        setCustomAmount: handleSetCustomAmount,
        generateQR,
        formatCurrency: purchaseService.formatCurrency.bind(purchaseService),
        refresh: loadHistory,
        cancelPolling,
        resumePendingTransaction,
    };
}

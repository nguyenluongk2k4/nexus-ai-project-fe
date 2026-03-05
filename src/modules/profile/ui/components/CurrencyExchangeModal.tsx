import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRightLeft, Wallet, Coins, Loader2, CheckCircle2 } from 'lucide-react';
import { coinsStore } from '@/modules/coins/domain/services/CoinsStore';

interface CurrencyExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    currentCoins: number;
    onExchangeSuccess: () => void;
}

type ExchangeDirection = 'balance_to_coins' | 'coins_to_balance';

export const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({
    isOpen,
    onClose,
    currentBalance,
    currentCoins,
    onExchangeSuccess
}) => {
    const { t } = useTranslation();
    const [direction, setDirection] = useState<ExchangeDirection>('balance_to_coins');
    const [amount, setAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const EXCHANGE_RATE = 200; // 200 VND = 1 Coin (so 10000 VND = 50 Coins)

    const parsedAmount = parseFloat(amount) || 0;

    let isValid = false;
    let expectedReceive = 0;

    if (direction === 'balance_to_coins') {
        isValid = parsedAmount > 0 && parsedAmount <= currentBalance;
        expectedReceive = parsedAmount / EXCHANGE_RATE;
    } else {
        isValid = parsedAmount > 0 && parsedAmount <= currentCoins;
        expectedReceive = parsedAmount * EXCHANGE_RATE;
    }

    const handleExchange = async () => {
        if (!isValid) return;

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

            const reqBody = {
                from_currency: direction === 'balance_to_coins' ? 'balance' : 'coins',
                amount: parsedAmount
            };

            const response = await fetch(`${API_URL}/coins/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Exchange failed');
            }

            const data = await response.json();

            // Show success animation
            setSuccessMessage(data.message);

            // After 2 seconds, trigger refresh and close
            setTimeout(() => {
                onExchangeSuccess();
                // Optionally let coins store refresh itself via socket or API if we had it,
                // but for now relying on Profile reload to trigger app-wide sync
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMax = () => {
        setAmount(direction === 'balance_to_coins' ? currentBalance.toString() : currentCoins.toString());
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={!isSubmitting && !successMessage ? onClose : undefined}
            ></div>

            <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Header Gradient */}
                <div className="h-32 bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 p-6 relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting || !!successMessage}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-white mt-4">
                        <h2 className="text-2xl font-extrabold tracking-tight">Currency Exchange</h2>
                        <p className="text-white/80 text-sm font-medium">Instantly convert between Balance and Coins</p>
                    </div>
                </div>

                <div className="p-6">
                    {successMessage ? (
                        <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Exchange Successful!</h3>
                            <p className="text-slate-500 mb-6">{successMessage}</p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>


                            {/* Toggle Direction */}
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 mt-4">
                                <button
                                    onClick={() => { setDirection('balance_to_coins'); setAmount(''); setError(null); }}
                                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${direction === 'balance_to_coins' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    To Coins
                                </button>
                                <button
                                    onClick={() => { setDirection('coins_to_balance'); setAmount(''); setError(null); }}
                                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${direction === 'coins_to_balance' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    To Balance
                                </button>
                            </div>

                            {/* Exchange Graph */}
                            <div className="relative flex items-center justify-between mb-8 px-2">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${direction === 'balance_to_coins' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {direction === 'balance_to_coins' ? <Wallet size={28} /> : <Coins size={28} />}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        Avail: {direction === 'balance_to_coins' ? `${currentBalance.toLocaleString('vi-VN')}đ` : `${currentCoins.toLocaleString()} Coins`}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center border-t-2 border-dashed border-slate-200 mx-4 relative">
                                    <div className="absolute -top-3.5 bg-white px-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <span className="absolute top-4 text-[10px] font-bold text-slate-400 bg-white px-2 rounded-full border border-slate-100 uppercase tracking-widest whitespace-nowrap">
                                        Rate: 10,000đ = 50 Coins
                                    </span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${direction === 'balance_to_coins' ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-700'}`}>
                                        {direction === 'balance_to_coins' ? <Coins size={28} /> : <Wallet size={28} />}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        Receive
                                    </span>
                                </div>
                            </div>

                            {/* Input Form */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                                        Amount to exchange
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 opacity-50 font-bold flex items-center">
                                            {direction === 'balance_to_coins' ? 'đ' : <Coins className="w-4 h-4" />}
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => {
                                                setAmount(e.target.value);
                                                setError(null);
                                            }}
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-20 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-300"
                                        />
                                        <button
                                            onClick={handleMax}
                                            className="absolute right-4 text-xs font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-md transition"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                {parsedAmount > 0 && (
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-center justify-between mb-4 animate-fade-in">
                                        <span className="text-sm font-semibold text-purple-900">You will receive:</span>
                                        <span className="text-lg font-extrabold text-purple-700 flex items-center gap-1.5">
                                            {direction === 'balance_to_coins' ? (
                                                <><Coins className="w-5 h-5 text-yellow-500" /> {expectedReceive.toLocaleString('vi-VN')} Coins</>
                                            ) : (
                                                <><Wallet className="w-5 h-5 text-purple-500" /> {expectedReceive.toLocaleString('vi-VN')}đ</>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg border border-red-100 animate-fade-in text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleExchange}
                                    disabled={!isValid || isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-2 
                                        ${isValid && !isSubmitting
                                            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'}`}
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Exchange'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

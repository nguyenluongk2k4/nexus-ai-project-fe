import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { CoinsApiGateway } from '../../infrastructure/CoinsApiGateway';
import { GetBalanceUseCase } from '../../usecases/CoinsUseCases';
import { coinsStore } from '../../domain/services/CoinsStore';

const gateway = new CoinsApiGateway();
const getBalanceUseCase = new GetBalanceUseCase(gateway);

export const CoinsDisplay: React.FC<{ minimal?: boolean }> = ({ minimal }) => {
    const [balance, setBalance] = useState<number | null>(coinsStore.currentBalance);

    useEffect(() => {
        // Initial fetch if not in store
        if (coinsStore.currentBalance === null) {
            const fetchBalance = async () => {
                try {
                    const data = await getBalanceUseCase.execute();
                    coinsStore.setBalance(data.current_coins);
                } catch (error) {
                    console.error('Failed to fetch coins balance', error);
                }
            };
            fetchBalance();
        }

        const subscription = coinsStore.balance$.subscribe(val => {
            setBalance(val);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (balance === null) {
        if (minimal) return <span className="text-slate-400">0</span>;
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-full border border-slate-200 animate-pulse">
                <Coins className="w-4 h-4" />
                <span className="font-bold text-sm">...</span>
            </div>
        );
    }

    if (minimal) {
        return <span>{balance.toLocaleString()}</span>;
    }

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
            <Coins className="w-4 h-4" />
            <span className="font-bold text-sm">{balance.toLocaleString()}</span>
        </div>
    );
};

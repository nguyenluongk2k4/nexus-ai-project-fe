import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { CoinsApiGateway } from '../../infrastructure/CoinsApiGateway';
import { GetBalanceUseCase } from '../../usecases/CoinsUseCases';

const gateway = new CoinsApiGateway();
const getBalanceUseCase = new GetBalanceUseCase(gateway);

export const CoinsDisplay: React.FC<{ minimal?: boolean }> = ({ minimal }) => {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const data = await getBalanceUseCase.execute();
                setBalance(data.current_coins);
            } catch (error) {
                console.error('Failed to fetch coins balance', error);
            }
        };

        fetchBalance();

        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    if (balance === null) return null;

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

import React, { useEffect, useState } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface Coin {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    delay: number;
}

interface CoinBurstProps {
    startX: number;
    startY: number;
    onComplete?: () => void;
    count?: number;
}

export const CoinBurst: React.FC<CoinBurstProps> = ({ startX, startY, onComplete, count = 12 }) => {
    const [coins, setCoins] = useState<Coin[]>([]);

    useEffect(() => {
        const targetEl = document.getElementById('header-coins-target');
        const targetRect = targetEl?.getBoundingClientRect() || { left: window.innerWidth - 100, top: 20 };
        const targetX = targetRect.left + 20;
        const targetY = targetRect.top + 20;

        const newCoins: Coin[] = Array.from({ length: count }).map((_, i) => ({
            id: Date.now() + i,
            x: startX,
            y: startY,
            targetX,
            targetY,
            delay: i * 50, // Staggered start
        }));

        setCoins(newCoins);

        const timer = setTimeout(() => {
            onComplete?.();
        }, count * 50 + 1000); // Wait for the last coin to finish

        return () => clearTimeout(timer);
    }, [startX, startY, count, onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {coins.map((coin) => (
                <div
                    key={coin.id}
                    className="absolute w-8 h-8 animate-coin-fly"
                    style={{
                        left: coin.x,
                        top: coin.y,
                        '--target-x': `${coin.targetX - coin.x}px`,
                        '--target-y': `${coin.targetY - coin.y}px`,
                        animationDelay: `${coin.delay}ms`,
                    } as any}
                >
                    <DotLottiePlayer
                        src="/assets/coin.lottie"
                        autoplay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            ))}
            <style>{`
                @keyframes coin-fly {
                    0% {
                        transform: translate(0, 0) scale(0);
                        opacity: 0;
                    }
                    10% {
                        transform: translate(0, -50px) scale(1.2);
                        opacity: 1;
                    }
                    30% {
                        transform: translate(calc(var(--target-x) * 0.1), calc(-80px + var(--target-y) * 0.1)) scale(1);
                    }
                    100% {
                        transform: translate(var(--target-x), var(--target-y)) scale(0.5);
                        opacity: 0.5;
                    }
                }
                .animate-coin-fly {
                    animation: coin-fly 800ms cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
                }
            `}</style>
        </div>
    );
};

import { useEffect, useState, memo } from 'react';
import './TetFlowerEffect.css';

// Peach Blossom (Hoa Đào) - Pink SVG
const PeachBlossom = memo(({ size, color }: { size: number; color?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-90"
        style={{ color: color || '#F472B6' }}
    >
        <path
            d="M12 2C13.5 5 15.5 7 19 8C15.5 9 13.5 11 12 14C10.5 11 8.5 9 5 8C8.5 7 10.5 5 12 2Z"
            fill="currentColor"
        />
        <path
            d="M12 6C12.8 8 13.5 9 15 9.5C13.5 10 12.8 11 12 13C11.2 11 10.5 10 9 9.5C10.5 9 11.2 8 12 6Z"
            fill="#FBCFE8"
        />
    </svg>
));

// Apricot Blossom (Hoa Mai) - Yellow SVG
const ApricotBlossom = memo(({ size, color }: { size: number; color?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-90"
        style={{ color: color || '#FACC15' }}
    >
        <path
            d="M12 2C14.2 4.5 17 5.5 20 6C17 6.5 14.2 7.5 12 10C9.8 7.5 7 6.5 4 6C7 5.5 9.8 4.5 12 2Z"
            fill="currentColor"
        />
        <circle cx="12" cy="6" r="1.5" fill="#FEF08A" />
    </svg>
));

// Petal - Organic shape SVG
const Petal = memo(({ size, color }: { size: number; color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-80"
        style={{ color }}
    >
        <path
            d="M12 21C12 21 4 14 4 8C4 4.5 7 2 10 2C11.5 2 12 3 12 3C12 3 12.5 2 14 2C17 2 20 4.5 20 8C20 14 12 21 12 21Z"
            fill="currentColor"
        />
    </svg>
));

interface Particle {
    id: number;
    type: 'peach' | 'apricot' | 'petal';
    left: number;
    animationDelay: number;
    animationDuration: number;
    size: number;
    color: string;
    swayType: number; // 0, 1, or 2 for different sway patterns
}

interface TetFlowerEffectProps {
    count?: number;
    enabled?: boolean;
}

export const TetFlowerEffect = ({ count = 30, enabled = true }: TetFlowerEffectProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (!enabled) {
            setParticles([]);
            return;
        }

        // Palette for petals
        const petalColors = [
            '#FFB3C1', // Soft pink (Peach)
            '#FFC0CB', // Light pink
            '#FFD700', // Gold (Apricot)
            '#FFE4B5', // Moccasin
            '#EF4444', // Red-ish (Lucky)
        ];

        const particleCount = count;
        const newParticles = Array.from({ length: particleCount }, (_, i) => {
            const typeRandom = Math.random();

            let type: Particle['type'];
            let size: number;
            let color: string;

            if (typeRandom < 0.33) {
                // 33% Peach Blossom (Hoa Đào)
                type = 'peach';
                size = 14 + Math.random() * 12;
                color = '#F472B6';
            } else if (typeRandom < 0.66) {
                // 33% Apricot Blossom (Hoa Mai)
                type = 'apricot';
                size = 14 + Math.random() * 12;
                color = '#FACC15';
            } else {
                // 34% Petals
                type = 'petal';
                size = 10 + Math.random() * 10;
                color = petalColors[Math.floor(Math.random() * petalColors.length)];
            }

            return {
                id: i,
                type,
                left: Math.random() * 100,
                // Random delay to start
                animationDelay: Math.random() * 10,
                // Duration 10-18s
                animationDuration: 10 + Math.random() * 8,
                size,
                color,
                swayType: Math.floor(Math.random() * 3), // 3 variants of sway
            };
        });

        setParticles(newParticles);
    }, [count, enabled]);

    if (!enabled) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="tet-flower-particle"
                    style={{
                        left: `${particle.left}%`,
                        width: particle.size,
                        height: particle.size,
                        // Combine vertical fall and rotation with horizontal sway
                        // We use a wrapper for sway? easier to just put animation on the element
                        // But CSS animations override 'transform'.
                        // Solution: Standard Fall + Rotate on container, Sway on inner or vice versa.
                        // Better: Wrapper does Fall (Y), Inner does Sway (X) + Rotate.
                        animation: `tet-fall ${particle.animationDuration}s linear infinite`,
                        animationDelay: `-${particle.animationDelay}s`, // Negative delay starts mid-animation
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            animation: `tet-sway-${particle.swayType} ${particle.animationDuration / 2}s ease-in-out infinite alternate`
                        }}
                    >
                        {particle.type === 'peach' && <PeachBlossom size={particle.size} />}
                        {particle.type === 'apricot' && <ApricotBlossom size={particle.size} />}
                        {particle.type === 'petal' && <Petal size={particle.size} color={particle.color} />}
                    </div>
                </div>
            ))}
        </div>
    );
};

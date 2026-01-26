(function () {
    // 1. Create CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
        .tet-effect-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        }
        .tet-particle {
            position: absolute;
            top: -50px;
            will-change: transform;
        }
        @keyframes tet-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes tet-sway-0 {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(50px); }
        }
        @keyframes tet-sway-1 {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-50px); }
        }
        @keyframes tet-sway-2 {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(30px); }
            75% { transform: translateX(-30px); }
        }
    `;
    document.head.appendChild(style);

    // 2. Create Container
    const container = document.createElement('div');
    container.className = 'tet-effect-container';
    document.body.appendChild(container);

    // 3. SVG Strings (Optimized)
    const svgs = {
        peach: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" style="color:#F472B6;opacity:0.9"><path d="M12 2C13.5 5 15.5 7 19 8C15.5 9 13.5 11 12 14C10.5 11 8.5 9 5 8C8.5 7 10.5 5 12 2Z" fill="currentColor"/><path d="M12 6C12.8 8 13.5 9 15 9.5C13.5 10 12.8 11 12 13C11.2 11 10.5 10 9 9.5C10.5 9 11.2 8 12 6Z" fill="#FBCFE8"/></svg>`,
        apricot: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" style="color:#FACC15;opacity:0.9"><path d="M12 2C14.2 4.5 17 5.5 20 6C17 6.5 14.2 7.5 12 10C9.8 7.5 7 6.5 4 6C7 5.5 9.8 4.5 12 2Z" fill="currentColor"/><circle cx="12" cy="6" r="1.5" fill="#FEF08A"/></svg>`,
        petal: (color) => `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" style="color:${color};opacity:0.8"><path d="M12 21C12 21 4 14 4 8C4 4.5 7 2 10 2C11.5 2 12 3 12 3C12 3 12.5 2 14 2C17 2 20 4.5 20 8C20 14 12 21 12 21Z" fill="currentColor"/></svg>`
    };

    const petalColors = ['#FFB3C1', '#FFC0CB', '#FFD700', '#FFE4B5', '#EF4444'];

    // 4. Generate Particles
    const PARTICLE_COUNT = 25; // Adjusted for performance based on user feedback

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const div = document.createElement('div');
        div.className = 'tet-particle';

        // Random Properties
        const random = Math.random();
        let size, content;

        if (random < 0.33) {
            size = 14 + Math.random() * 12;
            content = svgs.peach;
        } else if (random < 0.66) {
            size = 14 + Math.random() * 12;
            content = svgs.apricot;
        } else {
            size = 10 + Math.random() * 10;
            const color = petalColors[Math.floor(Math.random() * petalColors.length)];
            content = svgs.petal(color);
        }

        // Styles
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 8; // 10-18s
        const delay = Math.random() * 10;
        const swayType = Math.floor(Math.random() * 3);

        div.style.left = `${left}%`;
        div.style.width = `${size}px`;
        div.style.height = `${size}px`;

        // Wrapper for sway
        div.style.animation = `tet-fall ${duration}s linear infinite -${delay}s`;

        const inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.animation = `tet-sway-${swayType} ${duration / 2}s ease-in-out infinite alternate`;
        inner.innerHTML = content;

        div.appendChild(inner);
        container.appendChild(div);
    }
})();

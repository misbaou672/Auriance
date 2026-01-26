import React, { useEffect, useRef, useState } from 'react';

export function VoiceWave({
    isActive = true,
    className = '',
    color = '#6366f1', // Indigo 500 par défaut (était #10B981)
    barCount = 40
}) {
    const containerRef = useRef(null);
    const [bars, setBars] = useState([]);

    useEffect(() => {
        setBars(Array.from({ length: barCount }, () => Math.random() * 0.5 + 0.2));
    }, [barCount]);

    useEffect(() => {
        if (!isActive) return undefined;

        const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2));
        }, 100);

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            className={`flex items-center justify-center gap-[2px] h-16 ${className}`}
        >
            {bars.map((height, index) => {
                const delay = index * 0.02;
                const centerDistance = Math.abs(index - barCount / 2) / (barCount / 2);
                const baseHeight = isActive ? height * (1 - centerDistance * 0.3) : 0.15;

                return (
                    <div
                        key={index}
                        className="rounded-full transition-all"
                        style={{
                            width: '3px',
                            height: `${baseHeight * 100}%`,
                            backgroundColor: color,
                            opacity: isActive ? 0.6 + (1 - centerDistance) * 0.4 : 0.3,
                            transitionDuration: isActive ? '100ms' : '300ms',
                            transitionDelay: `${delay}s`,
                            transform: `scaleY(${isActive ? 1 : 0.5})`,
                        }}
                    />
                );
            })}
        </div>
    );
}

export function VoiceWaveCircular({
    isActive = true,
    size = 200,
    className = ''
}) {
    const [waves, setWaves] = useState([0, 0, 0]);

    useEffect(() => {
        if (!isActive) return undefined;

        const interval = setInterval(() => {
            setWaves(prev => {
                const newWaves = [...prev];
                newWaves.unshift(1);
                if (newWaves.length > 3) newWaves.pop();
                return newWaves;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            {waves.map((_, index) => (
                <div
                    key={index}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500"
                    style={{
                        animation: isActive ? 'ripple 2.4s ease-out infinite' : 'none',
                        animationDelay: `${index * 0.8}s`,
                        opacity: 0,
                    }}
                />
            ))}

            <div
                className={`absolute inset-0 m-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-100 animate-pulse-glow' : 'scale-90'
                    }`}
                style={{ width: size * 0.4, height: size * 0.4 }}
            >
                <svg
                    className="w-1/2 h-1/2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            </div>

            <style>{`
                @keyframes ripple {
                    0% { transform: scale(0.4); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

export function VoiceWaveBackground({ className = '' }) {
    const canvasRef = useRef(null);
    const animationRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.setTransform(2, 0, 0, 2, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        let time = 0;

        const draw = () => {
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            ctx.clearRect(0, 0, width, height);

            const layers = [
                { amplitude: 30, frequency: 0.02, speed: 0.015, opacity: 0.15, offset: 0 },
                { amplitude: 20, frequency: 0.03, speed: 0.02, opacity: 0.1, offset: Math.PI / 3 },
                { amplitude: 15, frequency: 0.025, speed: 0.025, opacity: 0.08, offset: Math.PI / 2 },
            ];

            layers.forEach(layer => {
                ctx.beginPath();
                ctx.moveTo(0, height / 2);

                for (let x = 0; x <= width; x += 1) {
                    const y =
                        height / 2 +
                        Math.sin(x * layer.frequency + time * layer.speed + layer.offset) * layer.amplitude +
                        Math.sin(x * layer.frequency * 0.5 + time * layer.speed * 1.5) * layer.amplitude * 0.5;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                const gradient = ctx.createLinearGradient(0, height / 2 - 50, 0, height);
                // Violet profond plus visible
                gradient.addColorStop(0, `rgba(124, 58, 237, ${layer.opacity * 2.5})`); // Violet 600 avec opacité doublée
                gradient.addColorStop(0.5, `rgba(76, 29, 149, ${layer.opacity * 1.5})`); // Violet 900
                gradient.addColorStop(1, 'rgba(76, 29, 149, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            time += 0.6;
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full ${className}`}
            style={{ display: 'block' }}
        />
    );
}

export function SoundBars({
    isActive = true,
    barCount = 5,
    className = ''
}) {
    return (
        <div className={`flex items-end gap-1 h-6 ${className}`}>
            {Array.from({ length: barCount }).map((_, i) => (
                <div
                    key={i}
                    className="w-1 bg-indigo-500 rounded-full transition-all"
                    style={{
                        height: isActive ? '100%' : '20%',
                        animation: isActive ? 'soundBar 0.5s ease-in-out infinite alternate' : 'none',
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes soundBar {
                    0% { height: 20%; }
                    100% { height: 100%; }
                }
            `}</style>
        </div>
    );
}

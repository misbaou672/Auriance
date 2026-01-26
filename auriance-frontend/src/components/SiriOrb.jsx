import React, { useEffect, useRef } from 'react';

export default function SiriOrb({ isListening, audioLevel = 0 }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let time = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const baseRadius = 120;

            // Créer plusieurs couches pour l'effet Siri
            for (let i = 0; i < 3; i++) {
                const radius = baseRadius + (isListening ? Math.sin(time + i) * 15 * (1 + audioLevel) : 0);

                // Gradient radial
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, radius
                );

                if (isListening) {
                    // Couleurs animées quand on écoute
                    gradient.addColorStop(0, `rgba(147, 51, 234, ${0.8 - i * 0.2})`); // violet
                    gradient.addColorStop(0.4, `rgba(59, 130, 246, ${0.6 - i * 0.15})`); // bleu
                    gradient.addColorStop(0.7, `rgba(30, 58, 138, ${0.4 - i * 0.1})`); // bleu foncé
                    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.2 - i * 0.05})`); // noir
                } else {
                    // Couleurs statiques
                    gradient.addColorStop(0, `rgba(147, 51, 234, ${0.4 - i * 0.1})`);
                    gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.3 - i * 0.1})`);
                    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.1 - i * 0.03})`);
                }

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - i * 10, 0, Math.PI * 2);
                ctx.fill();
            }

            // Animation continue si on écoute
            if (isListening) {
                time += 0.05;
                animationRef.current = requestAnimationFrame(draw);
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isListening, audioLevel]);

    return (
        <div className="relative inline-block">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="mx-auto"
            />
            {isListening && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-72 h-72 rounded-full bg-purple-500/10 animate-ping" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animation-delay-150">
                        <div className="w-64 h-64 rounded-full bg-blue-500/10 animate-ping" />
                    </div>
                </>
            )}
        </div>
    );
}

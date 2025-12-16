import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    duration: number;
    size: number;
}

interface ConfettiProps {
    active: boolean;
    duration?: number;
}

const colors = [
    '#2D9B83', // Primary
    '#3FB39A', // Primary light
    '#D4AF37', // Gold
    '#F4D03F', // Gold light
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
];

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (active) {
            setIsActive(true);
            const newPieces: ConfettiPiece[] = [];

            for (let i = 0; i < 100; i++) {
                newPieces.push({
                    id: i,
                    x: Math.random() * 100,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    delay: Math.random() * 0.5,
                    duration: 2 + Math.random() * 2,
                    size: 6 + Math.random() * 8,
                });
            }

            setPieces(newPieces);

            const timeout = setTimeout(() => {
                setIsActive(false);
                setPieces([]);
            }, duration);

            return () => clearTimeout(timeout);
        }
    }, [active, duration]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${piece.x}%`,
                        top: '-20px',
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg) scale(0);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti-fall ease-out forwards;
                }
            `}</style>
        </div>
    );
}

// Success Celebration Modal
interface SuccessCelebrationProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function SuccessCelebration({
    show,
    onClose,
    title = 'تم بنجاح! 🎉',
    message = 'تمت العملية بنجاح',
    action
}: SuccessCelebrationProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (show) {
            setShowConfetti(true);
        }
    }, [show]);

    if (!show) return null;

    return (
        <>
            <Confetti active={showConfetti} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
                    {/* Success Icon */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse" />
                        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {/* Sparkles */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 text-gold animate-ping">✨</div>
                        <div className="absolute -bottom-1 -left-2 w-5 h-5 text-primary animate-ping" style={{ animationDelay: '0.3s' }}>⭐</div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                    <p className="text-slate-500 mb-6">{message}</p>

                    <div className="flex flex-col gap-3">
                        {action && (
                            <button
                                onClick={action.onClick}
                                className="w-full py-4 gradient-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                            >
                                {action.label}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out;
                }
            `}</style>
        </>
    );
}

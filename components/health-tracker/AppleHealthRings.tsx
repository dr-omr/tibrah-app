import React from 'react';

interface RingProps {
    progress: number; // 0-100
    color: string;
    size: number;
    strokeWidth: number;
    label: string;
    value: string;
}

interface ActivityRing {
    id: string;
    progress: number;
    color: string;
    bgColor: string;
    label: string;
    value: string;
    goal: string;
    icon: string;
}

const SingleRing: React.FC<RingProps> = ({ progress, color, size, strokeWidth, label, value }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-700">{value}</span>
                <span className="text-[10px] text-slate-400">{label}</span>
            </div>
        </div>
    );
};

interface AppleHealthRingsProps {
    moveProgress: number;      // Calories burned
    exerciseProgress: number;  // Exercise minutes
    standProgress: number;     // Stand hours
    moveGoal: number;
    exerciseGoal: number;
    standGoal: number;
    currentMove: number;
    currentExercise: number;
    currentStand: number;
}

export default function AppleHealthRings({
    moveProgress = 0,
    exerciseProgress = 0,
    standProgress = 0,
    moveGoal = 500,
    exerciseGoal = 30,
    standGoal = 12,
    currentMove = 0,
    currentExercise = 0,
    currentStand = 0
}: AppleHealthRingsProps) {
    const rings: ActivityRing[] = [
        {
            id: 'move',
            progress: moveProgress,
            color: '#FF2D55', // Apple Red
            bgColor: 'rgba(255, 45, 85, 0.2)',
            label: 'التحرك',
            value: `${currentMove}`,
            goal: `${moveGoal} سعرة`,
            icon: '🔥'
        },
        {
            id: 'exercise',
            progress: exerciseProgress,
            color: '#32D74B', // Apple Green
            bgColor: 'rgba(50, 215, 75, 0.2)',
            label: 'التمرين',
            value: `${currentExercise}`,
            goal: `${exerciseGoal} دقيقة`,
            icon: '💪'
        },
        {
            id: 'stand',
            progress: standProgress,
            color: '#0A84FF', // Apple Blue
            bgColor: 'rgba(10, 132, 255, 0.2)',
            label: 'الوقوف',
            value: `${currentStand}`,
            goal: `${standGoal} ساعة`,
            icon: '🧍'
        }
    ];

    return (
        <div className="glass rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="flex items-center gap-6">
                {/* Nested Rings - Apple Style */}
                <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                    {/* Outer Ring - Move (Red) */}
                    <div className="absolute inset-0">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle
                                cx="80" cy="80" r="72"
                                stroke="rgba(255, 45, 85, 0.2)"
                                strokeWidth="14"
                                fill="none"
                            />
                            <circle
                                cx="80" cy="80" r="72"
                                stroke="#FF2D55"
                                strokeWidth="14"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={452.4}
                                strokeDashoffset={452.4 - (Math.min(moveProgress, 100) / 100) * 452.4}
                                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]"
                            />
                        </svg>
                    </div>

                    {/* Middle Ring - Exercise (Green) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="transform -rotate-90" width="130" height="130">
                            <circle
                                cx="65" cy="65" r="56"
                                stroke="rgba(50, 215, 75, 0.2)"
                                strokeWidth="14"
                                fill="none"
                            />
                            <circle
                                cx="65" cy="65" r="56"
                                stroke="#32D74B"
                                strokeWidth="14"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={351.9}
                                strokeDashoffset={351.9 - (Math.min(exerciseProgress, 100) / 100) * 351.9}
                                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(50,215,75,0.6)]"
                            />
                        </svg>
                    </div>

                    {/* Inner Ring - Stand (Blue) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="transform -rotate-90" width="100" height="100">
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="rgba(10, 132, 255, 0.2)"
                                strokeWidth="14"
                                fill="none"
                            />
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="#0A84FF"
                                strokeWidth="14"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={251.3}
                                strokeDashoffset={251.3 - (Math.min(standProgress, 100) / 100) * 251.3}
                                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(10,132,255,0.6)]"
                            />
                        </svg>
                    </div>
                </div>

                {/* Ring Labels */}
                <div className="flex-1 space-y-3">
                    {rings.map((ring) => (
                        <div key={ring.id} className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: ring.color, boxShadow: `0 0 8px ${ring.color}` }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold text-lg">{ring.value}</span>
                                    <span className="text-slate-400 text-sm">/ {ring.goal}</span>
                                </div>
                                <span className="text-slate-500 text-xs">{ring.label}</span>
                            </div>
                            <span className="text-2xl">{ring.icon}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Summary */}
            <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">أداء اليوم</span>
                    <span className="text-white font-bold">
                        {Math.round((moveProgress + exerciseProgress + standProgress) / 3)}% مكتمل
                    </span>
                </div>
            </div>
        </div>
    );
}

export { SingleRing };

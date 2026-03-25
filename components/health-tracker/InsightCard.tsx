// components/health-tracker/InsightCard.tsx
// iOS-style insight cards with soft tinted backgrounds

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronLeft } from 'lucide-react';

interface InsightCardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    emoji?: string;
    color: 'pink' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red' | 'gradient';
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    children?: React.ReactNode;
    image?: string;
}

const colorStyles = {
    pink: 'bg-pink-50 dark:bg-pink-950/20 text-pink-800 dark:text-pink-200 border-pink-100 dark:border-pink-800/30',
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-800/30',
    green: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800/30',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-800/30',
    orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200 border-orange-100 dark:border-orange-800/30',
    teal: 'bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-200 border-teal-100 dark:border-teal-800/30',
    red: 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 border-red-100 dark:border-red-800/30',
    gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent',
};

const sizeStyles = {
    small: 'p-4 min-h-[100px]',
    medium: 'p-4 min-h-[120px]',
    large: 'p-5 min-h-[140px]',
};

export default function InsightCard({
    title,
    subtitle,
    icon: Icon,
    emoji,
    color,
    size = 'medium',
    onClick,
    children,
    image
}: InsightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onClick}
            className={`
                ${colorStyles[color]} 
                ${sizeStyles[size]}
                rounded-2xl cursor-pointer overflow-hidden
                shadow-sm border
                relative flex flex-col justify-between
            `}
        >
            {/* Background Image (optional) */}
            {image && (
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                {/* Icon or Emoji */}
                {(Icon || emoji) && (
                    <div className="mb-2">
                        {Icon ? (
                            <Icon className="w-6 h-6" />
                        ) : (
                            <span className="text-2xl">{emoji}</span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="font-bold text-sm leading-tight mb-0.5">
                    {title}
                </h3>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xs opacity-70 leading-snug">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Children (for custom content) */}
            {children && (
                <div className="relative z-10 mt-auto">
                    {children}
                </div>
            )}

            {/* Arrow indicator */}
            {onClick && (
                <div className="absolute bottom-3 left-3 opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                </div>
            )}
        </motion.div>
    );
}

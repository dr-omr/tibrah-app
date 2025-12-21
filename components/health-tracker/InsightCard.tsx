// components/health-tracker/InsightCard.tsx
// Apple-style colorful insight cards (inspired by Omo, Flo, iCardiac)

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

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
    pink: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800',
    blue: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800',
    green: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800',
    purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800',
    orange: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800',
    teal: 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-800',
    red: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800',
    gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
};

const sizeStyles = {
    small: 'p-4 min-h-[120px]',
    medium: 'p-5 min-h-[160px]',
    large: 'p-6 min-h-[200px]',
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.8
            }}
            onClick={onClick}
            className={`
                ${colorStyles[color]} 
                ${sizeStyles[size]}
                rounded-3xl cursor-pointer overflow-hidden
                shadow-lg shadow-black/5
                relative flex flex-col justify-between
                backdrop-blur-sm
            `}
        >
            {/* Background Image (optional) */}
            {image && (
                <div
                    className="absolute inset-0 opacity-20"
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
                    <motion.div
                        className="mb-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                    >
                        {Icon ? (
                            <Icon className="w-8 h-8" />
                        ) : (
                            <span className="text-3xl">{emoji}</span>
                        )}
                    </motion.div>
                )}

                {/* Title */}
                <h3 className="font-bold text-lg leading-tight mb-1">
                    {title}
                </h3>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-sm opacity-80 leading-snug">
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

            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 pointer-events-none">
                <div className="w-full h-full rounded-full bg-white/20 blur-2xl transform translate-x-1/2 translate-y-1/2" />
            </div>
        </motion.div>
    );
}

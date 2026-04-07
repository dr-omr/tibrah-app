import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Haptics } from '../utils/haptics';

interface FrostedSocialNodeProps {
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading: boolean;
}

export default function FrostedSocialNode({ name, icon, onClick, isLoading }: FrostedSocialNodeProps) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.88 }}
            onTapStart={() => !isLoading && Haptics.tick()}
            onClick={onClick}
            disabled={isLoading}
            title={name}
            className="relative flex flex-col items-center justify-center aspect-square rounded-2xl overflow-hidden group"
            style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(16,24,34,0.06)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 2px 8px rgba(16,24,34,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
                height: '56px',
            }}
        >
            {/* Inner specular highlight */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
                 style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)' }} />

            {/* Hover teal glow */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle at center, rgba(43,154,137,0.1) 0%, transparent 65%)' }}
            />

            {/* Hover border teal tint */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(43,154,137,0.15)' }}
            />

            {/* Icon or loader */}
            {isLoading ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#2B9A89' }} />
                </motion.div>
            ) : (
                <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                    {icon}
                </div>
            )}

            {/* Name tooltip on hover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-bottom-5 pointer-events-none z-20">
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
                      style={{ backgroundColor: '#101822', color: '#fff' }}>
                    {name}
                </span>
            </div>
        </motion.button>
    );
}

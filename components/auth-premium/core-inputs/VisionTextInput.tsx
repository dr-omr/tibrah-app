import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, AlertCircle } from 'lucide-react';

interface VisionTextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    icon?: LucideIcon;
    label: string;
    error?: string;
}

export default function VisionTextInput({
    icon: Icon, label, error, className = '', onFocus, onBlur, ...props
}: VisionTextInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && props.value.toString().length > 0;
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <div className="group w-full block relative pt-6 mb-2">

            {/* Floating Label */}
            <motion.label
                initial={false}
                animate={{
                    y: isFloating ? -26 : 18,
                    x: isFloating ? 0 : (Icon ? -36 : -16),
                    scale: isFloating ? 0.82 : 1,
                    opacity: isFloating ? 1 : 0.45,
                }}
                style={{
                    color: error ? '#f43f5e' : isFocused ? '#2B9A89' : '#101822'
                }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`absolute right-4 font-bold tracking-wide pointer-events-none origin-top-right z-10 text-[15px] ${isFloating ? 'text-[11px] uppercase tracking-widest' : ''}`}
            >
                {label}
            </motion.label>

            <div className="relative">
                {/* Icon */}
                {Icon && (
                    <motion.div
                        animate={{ scale: isFocused ? 1.1 : 1, opacity: isFocused ? 1 : 0.35 }}
                        style={{ color: error ? '#f43f5e' : isFocused ? '#2B9A89' : '#64748B' }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors"
                    >
                        <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </motion.div>
                )}

                {/* Input */}
                <motion.input
                    animate={{
                        borderColor: error
                            ? 'rgba(244,63,94,0.45)'
                            : isFocused
                                ? 'rgba(43,154,137,0.5)'
                                : 'rgba(16,24,34,0.08)',
                        boxShadow: isFocused
                            ? '0 0 0 4px rgba(43,154,137,0.09)'
                            : '0 2px 8px rgba(16,24,34,0.03)',
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                        background: 'rgba(255,255,255,0.75)',
                        backdropFilter: 'blur(20px)',
                        color: '#101822',
                        fontWeight: 600,
                        fontSize: '15px',
                    }}
                    className={`${Icon ? 'pr-12' : 'pr-5'} pl-5 w-full h-[64px] rounded-[20px] outline-none border ${className}`}
                    {...(props as any)}
                />

                {/* Error Icon */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: '#f43f5e' }}
                        >
                            <AlertCircle className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-[12px] mt-2 font-semibold pr-2 flex items-center gap-2"
                        style={{ color: '#f43f5e' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: '#f43f5e', boxShadow: '0 0 5px rgba(244,63,94,0.5)' }} />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

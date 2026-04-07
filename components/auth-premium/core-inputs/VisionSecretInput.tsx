import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface VisionSecretInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
    label: string;
    showStrength?: boolean;
    error?: string;
}

export default function VisionSecretInput({
    label, showStrength = false, error, className = '',
    onFocus, onBlur, value, ...props
}: VisionSecretInputProps) {
    const [showPwd, setShowPwd] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const pwdValue = typeof value === 'string' || typeof value === 'number' ? value.toString() : '';
    const hasValue = pwdValue.length > 0;
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    // Strength calculation
    let strength = 0;
    if (pwdValue.length >= 8) strength++;
    if (/[A-Z]/.test(pwdValue)) strength++;
    if (/[0-9]/.test(pwdValue)) strength++;
    if (/[^A-Za-z0-9]/.test(pwdValue)) strength++;

    const strengthColors = ['transparent', '#f43f5e', '#fbbf24', '#34d399', '#2B9A89'];
    const strengthLabels = ['', 'ضعيف', 'متوسط', 'جيد', 'قوي جداً'];
    const strengthWidths = ['0%', '25%', '50%', '75%', '100%'];

    return (
        <div className="group w-full block relative pt-6 mb-2">

            {/* Floating Label */}
            <motion.label
                initial={false}
                animate={{
                    y: isFloating ? -26 : 18,
                    x: isFloating ? 0 : -36,
                    scale: isFloating ? 0.82 : 1,
                    opacity: isFloating ? 1 : 0.45,
                }}
                style={{ color: error ? '#f43f5e' : isFocused ? '#2B9A89' : '#101822' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`absolute right-4 font-bold tracking-wide pointer-events-none origin-top-right z-10 text-[15px] ${isFloating ? 'text-[11px] uppercase tracking-widest' : ''}`}
            >
                {label}
            </motion.label>

            <div className="relative">
                {/* Lock Icon */}
                <motion.div
                    animate={{ scale: isFocused ? 1.1 : 1, opacity: isFocused ? 1 : 0.35 }}
                    style={{ color: error ? '#f43f5e' : isFocused ? '#2B9A89' : '#64748B' }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                >
                    <Lock className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </motion.div>

                {/* Input */}
                <motion.input
                    type={showPwd ? 'text' : 'password'}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
                    style={{
                        background: 'rgba(255,255,255,0.75)',
                        backdropFilter: 'blur(20px)',
                        color: '#101822',
                        fontWeight: 600,
                        fontSize: '15px',
                        letterSpacing: hasValue && !showPwd ? '0.2em' : '0',
                    }}
                    className={`pr-12 pl-14 w-full h-[64px] rounded-[20px] outline-none border ${className}`}
                    dir="ltr"
                    {...(props as any)}
                />

                {/* Toggle show/hide */}
                <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    tabIndex={-1}
                    style={{ color: '#64748B' }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none opacity-60 hover:opacity-100"
                >
                    {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>

                {/* Strength bar */}
                {showStrength && hasValue && (
                    <div className="absolute -bottom-2 left-5 right-5 h-[3px] rounded-full overflow-hidden"
                         style={{ backgroundColor: 'rgba(16,24,34,0.06)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strengthWidths[strength], backgroundColor: strengthColors[strength] }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ boxShadow: `0 0 8px ${strengthColors[strength]}` }}
                        />
                    </div>
                )}
            </div>

            {/* Strength label */}
            <AnimatePresence>
                {showStrength && hasValue && strength > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center gap-2"
                    >
                        {strength === 4 ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                 style={{ backgroundColor: 'rgba(43,154,137,0.08)', border: '1px solid rgba(43,154,137,0.2)' }}>
                                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#2B9A89' }} />
                                <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#2B9A89' }}>
                                    محمي بالكامل
                                </span>
                            </div>
                        ) : (
                            <span className="text-[11px] font-semibold"
                                  style={{ color: strengthColors[strength] }}>
                                {strengthLabels[strength]}
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
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

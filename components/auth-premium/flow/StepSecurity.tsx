import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Eye, Fingerprint, ShieldCheck, Heart, Clock, KeyRound } from 'lucide-react';
import VisionSecretInput from '../core-inputs/VisionSecretInput';
import ActionCoreBtn from '../interactives/ActionCoreBtn';
import { Haptics } from '../utils/haptics';

interface StepSecurityProps {
    email: string;
    isRegister: boolean;
    onBack: () => void;
    onSubmit: (password: string) => void;
    onForgotPassword?: () => void;
    loading: boolean;
}

const stagger = (i: number) => ({ delay: 0.06 + i * 0.07 });

export default function StepSecurity({ email, isRegister, onBack, onSubmit, onForgotPassword, loading }: StepSecurityProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    // Password strength calculation (enriched)
    const checks = [
        { ok: password.length >= 8, text: '٨ حروف أو أكثر', icon: Lock },
        { ok: /[A-Z]/.test(password), text: 'حرف كبير واحد (A-Z)', icon: Eye },
        { ok: /[0-9]/.test(password), text: 'رقم واحد على الأقل', icon: Fingerprint },
        { ok: /[^A-Za-z0-9]/.test(password), text: 'رمز خاص واحد (!@#$)', icon: ShieldCheck },
    ];
    const passedChecks = checks.filter(c => c.ok).length;
    const allPassed = passedChecks === checks.length;

    const prevPassedRef = useRef(0);
    useEffect(() => {
        if (passedChecks > prevPassedRef.current) {
            if (passedChecks === checks.length) {
                Haptics.success();
            } else {
                Haptics.tick();
            }
        }
        prevPassedRef.current = passedChecks;
    }, [passedChecks, checks.length]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative"
        >
            {/* ─── BACK BUTTON ─── */}
            <motion.button
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={stagger(0)}
                onClick={onBack}
                type="button"
                className="flex items-center gap-1.5 mb-7 group"
            >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: '#94a3b8' }} />
                <span className="text-[12px] font-semibold" style={{ color: '#94a3b8' }}>رجوع</span>
            </motion.button>

            {/* ─── HEADER ─── */}
            <div className="mb-9">
                {/* Eyebrow label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={stagger(1)}
                    className="flex items-center gap-2 mb-4"
                >
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#2B9A89' }} />
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.35em]" style={{ color: '#2B9A89' }}>
                        {isRegister ? 'تأمين ملفك الصحي' : 'تحقق الهوية'}
                    </span>
                </motion.div>

                {/* Main heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(2)}
                    className="text-[34px] sm:text-[40px] font-black leading-[1.18] tracking-tight mb-4"
                    style={{ color: '#101822' }}
                >
                    {isRegister ? (
                        <>
                            بياناتك <span style={{ color: '#2B9A89' }}>أمانة</span>
                            <br />
                            عندنا، تسلم.
                        </>
                    ) : (
                        <>
                            يا هلا <span style={{ color: '#2B9A89' }}>بعودتك</span> ❤️
                        </>
                    )}
                </motion.h2>

                {/* Warm subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(3)}
                    className="text-[14px] leading-[1.85] max-w-[350px]"
                    style={{ color: '#64748B' }}
                >
                    {isRegister
                        ? 'اختر كلمة سر قوية — الله يعافيك — عشان نحمي ملفك الصحي زي ما نحمي صحتك.'
                        : 'ملفك الصحي منتظرك. ادخل كلمة السر وارجع لرحلتك الصحية.'
                    }
                </motion.p>

                {/* Email pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={stagger(4)}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl mt-5"
                    style={{ background: 'rgba(43,154,137,0.04)', border: '1px solid rgba(43,154,137,0.1)' }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#2B9A89' }}
                    />
                    <span className="text-[13px] font-semibold" style={{ color: '#101822' }} dir="ltr">{email}</span>
                </motion.div>

                {/* Login-only: last login hint */}
                {!isRegister && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={stagger(5)}
                        className="flex items-center gap-1.5 mt-3"
                    >
                        <Clock className="w-3 h-3" style={{ color: '#c4cdd5' }} />
                        <span className="text-[10px] font-medium" style={{ color: '#c4cdd5' }}>
                            آخر دخول: قبل ٣ أيام
                        </span>
                    </motion.div>
                )}
            </div>

            {/* ─── FORM ─── */}
            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(5)}
                >
                    <VisionSecretInput
                        label={isRegister ? 'أنشئ كلمة مرور قوية' : 'كلمة المرور'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showStrength={isRegister}
                        autoFocus
                    />
                </motion.div>

                {/* Forgot password link (login only) */}
                {!isRegister && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={stagger(6)}
                        className="flex justify-start mt-2 mb-4"
                    >
                        <button type="button" onClick={onForgotPassword} className="text-[12px] font-semibold transition-colors hover:underline underline-offset-2"
                                style={{ color: '#2B9A89' }}>
                            نسيت كلمة المرور؟
                        </button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(7)}
                    className="mt-4"
                >
                    <ActionCoreBtn
                        type="submit"
                        loading={loading}
                        disabled={password.length < 6}
                        variant="primary"
                        label={
                            <span className="flex items-center gap-2 text-[13px]">
                                {isRegister ? <Lock className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                                {isRegister ? 'احفظ وانطلق' : 'تفضّل ادخل'}
                            </span>
                        }
                    />
                </motion.div>
            </form>

            {/* ─── PASSWORD REQUIREMENTS (register only) ─── */}
            {isRegister && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(8)}
                    className="mt-8 p-5 rounded-2xl relative overflow-hidden"
                    style={{
                        background: allPassed ? 'rgba(43,154,137,0.05)' : 'rgba(43,154,137,0.02)',
                        border: `1px solid ${allPassed ? 'rgba(43,154,137,0.2)' : 'rgba(43,154,137,0.06)'}`,
                        borderRight: `3px solid ${allPassed ? '#2B9A89' : 'rgba(43,154,137,0.15)'}`,
                        transition: 'all 0.4s ease',
                    }}
                >
                    {/* Section title */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5" style={{ color: '#2B9A89' }} />
                            <span className="text-[10px] font-bold" style={{ color: '#2B9A89' }}>عشان نحميك 🛡️</span>
                        </div>
                        {/* Progress counter */}
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                  backgroundColor: allPassed ? 'rgba(43,154,137,0.1)' : 'rgba(16,24,34,0.04)',
                                  color: allPassed ? '#2B9A89' : '#94a3b8',
                              }}>
                            {passedChecks}/{checks.length}
                        </span>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-3.5">
                        {checks.map((r, i) => (
                            <motion.div
                                key={i}
                                animate={{ x: r.ok ? [0, -3, 0] : 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <motion.div
                                    animate={{
                                        backgroundColor: r.ok ? '#2B9A89' : 'rgba(16,24,34,0.04)',
                                        scale: r.ok ? [1, 1.2, 1] : 1,
                                        boxShadow: r.ok ? '0 0 8px rgba(43,154,137,0.3)' : 'none',
                                    }}
                                    transition={{ duration: 0.35 }}
                                    className="w-[20px] h-[20px] rounded-lg flex items-center justify-center flex-shrink-0"
                                >
                                    {r.ok ? (
                                        <motion.svg
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            className="w-3 h-3 text-white"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </motion.svg>
                                    ) : (
                                        <r.icon className="w-2.5 h-2.5" style={{ color: '#c4cdd5' }} />
                                    )}
                                </motion.div>
                                <span className="text-[12px] font-medium transition-colors duration-300"
                                      style={{ color: r.ok ? '#101822' : '#94a3b8' }}>
                                    {r.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* All passed celebration */}
                    <AnimatePresence>
                        {allPassed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center gap-2 overflow-hidden"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: 2, duration: 0.4 }}
                                    className="text-[16px]"
                                >
                                    🎉
                                </motion.div>
                                <span className="text-[11px] font-bold" style={{ color: '#2B9A89' }}>
                                    ما شاء الله! كلمة مرور قوية جداً
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ─── TRUST STATEMENT ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(10)}
                className="mt-8 text-center"
            >
                <p className="text-[10px] leading-[1.8]" style={{ color: '#c4cdd5' }}>
                    بياناتك مشفرة بتقنية AES-256 ولا يمكن لأي أحد الوصول لها.
                    <br />
                    خصوصيتك أمانة عندنا — تسلم.
                </p>
            </motion.div>
        </motion.div>
    );
}

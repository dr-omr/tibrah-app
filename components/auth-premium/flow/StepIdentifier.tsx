import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import VisionTextInput from '../core-inputs/VisionTextInput';
import ActionCoreBtn from '../interactives/ActionCoreBtn';
import CeramicSocialGrid from '../interactives/CeramicSocialGrid';
import { useAuth } from '@/contexts/AuthContext';

interface StepIdentifierProps {
    emailStr: string;
    onChange: (val: string) => void;
    onSubmit: (e: React.FormEvent, isNew: boolean) => void;
    loading: boolean;
}

/* 
 * Micro-animation choreography:
 * Each element enters with a staggered delay creating a
 * top-to-bottom cascade that guides the eye naturally.
 */
const stagger = (i: number) => ({ delay: 0.08 + i * 0.08 });

export default function StepIdentifier({ emailStr, onChange, onSubmit, loading }: StepIdentifierProps) {
    const { signInAsGuest } = useAuth();
    const [actionIsNew, setActionIsNew] = useState(false);

    const handleSubmit = (e: React.FormEvent, isNew: boolean) => {
        e.preventDefault();
        setActionIsNew(isNew);
        onSubmit(e, isNew);
    };

    // Pre-generated avatar initials for social proof (stable across renders)
    const avatars = useMemo(() => [
        { bg: '#2B9A89', letter: 'م' },
        { bg: '#3b82f6', letter: 'ع' },
        { bg: '#f43f5e', letter: 'ف' },
        { bg: '#fbbf24', letter: 'ن' },
    ], []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
        >
            {/* ─── GREETING ─── */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(0)}
                className="inline-block text-[13px] font-semibold mb-5"
                style={{ color: '#2B9A89' }}
            >
                حيّاك الله 👋
            </motion.span>

            {/* ─── HEADING ─── */}
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(1)}
                className="text-[28px] sm:text-[40px] font-black leading-[1.2] tracking-tight mb-2 sm:mb-3"
                style={{ color: '#101822' }}
            >
                صحتك أمانة،{' '}
                <span style={{ color: '#2B9A89' }}>ونحن أهلها.</span>
            </motion.h2>

            {/* ─── SUBTITLE ─── */}
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(2)}
                className="text-[13px] sm:text-[14px] leading-[1.7] mb-5 sm:mb-6 max-w-[370px]"
                style={{ color: '#64748B' }}
            >
                سجّل دخولك وارجع لملفك الصحي، أو ابدأ رحلتك معنا —
                نسمعك، نفهمك، ونعالج الجذور بإذن الله.
            </motion.p>

            {/* ─── SOCIAL PROOF ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(3)}
                className="flex items-center gap-4 mb-6 sm:mb-8"
            >
                <div className="flex -space-x-2 rtl:space-x-reverse">
                    {avatars.map((a, i) => (
                        <div
                            key={i}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-[2px] ring-white"
                            style={{ backgroundColor: a.bg, zIndex: 4 - i }}
                        >
                            {a.letter}
                        </div>
                    ))}
                </div>
                <p className="text-[11px] leading-snug" style={{ color: '#64748B' }}>
                    <strong style={{ color: '#101822' }}>+٢٤ ألف</strong> يثقون بنا
                </p>
            </motion.div>

            {/* ─── EMAIL FORM ─── */}
            <form onSubmit={(e) => handleSubmit(e, false)}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(4)}
                >
                    <VisionTextInput
                        label="بريدك الإلكتروني"
                        type="email"
                        icon={Mail}
                        value={emailStr}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="you@example.com"
                        dir="ltr"
                        required
                    />
                </motion.div>

                {/* ─── BUTTONS ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(5)}
                    className="flex gap-2.5 mt-6"
                >
                    <div className="flex-[3]">
                        <ActionCoreBtn
                            loading={loading && !actionIsNew}
                            disabled={loading && actionIsNew}
                            type="submit"
                            variant="primary"
                            onClick={(e) => handleSubmit(e, false)}
                            label={
                                <span className="flex items-center gap-2 text-[13px]">
                                    <ArrowLeft className="w-4 h-4" />
                                    تفضّل ادخل
                                </span>
                            }
                        />
                    </div>
                    <div className="flex-[2]">
                        <ActionCoreBtn
                            loading={loading && actionIsNew}
                            disabled={loading && !actionIsNew}
                            type="button"
                            variant="secondary"
                            onClick={(e) => handleSubmit(e, true)}
                            label={<span className="text-[13px]">حساب جديد</span>}
                        />
                    </div>
                </motion.div>
            </form>

            {/* ─── SOCIAL LOGIN ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(7)}
                className="pb-4"
            >
                <CeramicSocialGrid />
                
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await signInAsGuest();
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        className="text-[12px] font-semibold text-[#64748B] hover:text-[#2B9A89] transition-colors border-b border-transparent hover:border-[#2B9A89] pb-0.5"
                    >
                        أو استكشف طِبرَا كزائر ✨
                    </button>
                </div>
            </motion.div>

            {/* ─── TRUST FLOOR ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(9)}
                className="flex items-center justify-center gap-2 mt-6"
            >
                <Shield className="w-3 h-3" style={{ color: '#c4cdd5' }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#c4cdd5' }}>
                    ٢٥٦-BIT SSL · HIPAA COMPLIANT
                </span>
            </motion.div>
        </motion.div>
    );
}

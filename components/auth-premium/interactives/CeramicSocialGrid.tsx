import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Shield, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/notification-engine';

import GoogleIcon from '@/components/auth/icons/GoogleIcon';
import AppleIcon from '@/components/auth/icons/AppleIcon';
import { TikTokIcon } from '../providers/SocialProviderGrid';
import FrostedSocialNode from './FrostedSocialNode';

export default function CeramicSocialGrid() {
    const { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithInstagram, signInWithTikTok } = useAuth();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleSocialAuth = useCallback(async (providerName: string, authFunction: () => Promise<void>) => {
        setLoadingProvider(providerName);
        try {
            await authFunction();
            toast.success(`يا هلا! تم الدخول عبر ${providerName} 🎉`);
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error(error.message || `ما قدرنا نوصّلك بـ ${providerName}، جرّب مرة ثانية`);
            }
        } finally {
            setLoadingProvider(null);
        }
    }, []);

    const providers = useMemo(() => [
        {
            name: 'Google',
            icon: <GoogleIcon className="w-[20px] h-[20px]" />,
            fn: signInWithGoogle,
        },
        {
            name: 'Apple',
            // Force black fill so it's visible on white background
            icon: <AppleIcon className="w-[20px] h-[20px]" />,
            wrapStyle: { color: '#000000' } as React.CSSProperties,
            fn: signInWithApple,
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-[20px] h-[20px]" fill="#1877F2" stroke="none" />,
            fn: signInWithFacebook,
        },
        {
            name: 'Instagram',
            icon: <Instagram className="w-[20px] h-[20px]" style={{ color: '#E4405F' }} />,
            fn: signInWithInstagram,
        },
        {
            name: 'TikTok',
            // Force black fill so it's visible on white background
            icon: <TikTokIcon className="w-[18px] h-[18px]" />,
            wrapStyle: { color: '#000000' } as React.CSSProperties,
            fn: signInWithTikTok,
        },
    ], [signInWithGoogle, signInWithApple, signInWithFacebook, signInWithInstagram, signInWithTikTok]);

    return (
        <div className="w-full mt-8">
            {/* ─── DIVIDER ─── */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(16,24,34,0.05), transparent)' }} />
                <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: '#b0b8c4' }}>
                    أو سجّل بسرعة
                </span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(16,24,34,0.05), transparent)' }} />
            </div>

            {/* ─── SOCIAL GRID ─── */}
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.3 } }
                }}
                className="grid grid-cols-5 gap-2.5"
            >
                {providers.map((p) => (
                    <motion.div
                        key={p.name}
                        variants={{ hidden: { opacity: 0, y: 8, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                        style={p.wrapStyle}
                    >
                        <FrostedSocialNode
                            name={p.name}
                            icon={p.icon}
                            onClick={() => handleSocialAuth(p.name, p.fn)}
                            isLoading={loadingProvider === p.name}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* ─── QUICK TRUST SIGNALS ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 mt-5"
            >
                <div className="flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" style={{ color: '#c4cdd5' }} />
                    <span className="text-[8px] font-medium" style={{ color: '#c4cdd5' }}>تشفير كامل</span>
                </div>
                <div className="w-px h-3" style={{ backgroundColor: 'rgba(16,24,34,0.06)' }} />
                <div className="flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" style={{ color: '#c4cdd5' }} />
                    <span className="text-[8px] font-medium" style={{ color: '#c4cdd5' }}>لا نشارك بياناتك</span>
                </div>
            </motion.div>

            {/* ─── FOOTER ─── */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-[10px] mt-5 leading-[1.8] font-medium"
                style={{ color: '#b0b8c4' }}
            >
                بالمتابعة أنت موافق على{' '}
                <a href="/terms" className="underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: '#2B9A89' }}>الشروط</a>
                {' '}و{' '}
                <a href="/privacy" className="underline underline-offset-2 transition-colors hover:opacity-80" style={{ color: '#2B9A89' }}>الخصوصية</a>
                .
                <br />
                <span style={{ color: '#c4cdd5' }}>بياناتك مشفرة ومحمية — تسلم.</span>
            </motion.p>
        </div>
    );
}

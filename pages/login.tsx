import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Globe, Clock, ArrowRight } from 'lucide-react';

import MedicalBrandingSide from '@/components/auth-premium/layout/MedicalBrandingSide';
import AuthFlowController from '@/components/auth-premium/flow/AuthFlowController';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState('');

    const { user, loading } = useAuth();

    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('ar-SA', { hour: 'numeric', minute: '2-digit', hour12: true });
        setCurrentTime(fmt.format(new Date()));
    }, []);

    useEffect(() => {
        if (!loading && user) {
            const returnUrl = (router.query.redirect as string) || (router.query.returnUrl as string) || '/';
            router.push(returnUrl);
        }
    }, [user, loading, router]);

    const handleComplete = () => {
        const returnUrl = (router.query.redirect as string) || (router.query.returnUrl as string) || '/';
        router.push(returnUrl);
    };

    return (
        <>
            <Head>
                <title>طِبرَا | بوابة الرعاية الصحية الذكية</title>
                <meta name="description" content="سجّل دخولك إلى منظومة طِبرَا للرعاية الصحية الشاملة والطب الوظيفي" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <meta name="theme-color" content="#FBFDFD" />
            </Head>

            <div
                className="flex min-h-screen w-full font-sans overflow-hidden"
                style={{ backgroundColor: '#FBFDFD' }}
                dir="rtl"
            >
                {/* Left Side: Immersive Medical Identity (Desktop Only) */}
                <MedicalBrandingSide />

                {/* Right Side: The Auth Engine */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-[8%] overflow-y-auto">

                    {/* Subtle grid overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            opacity: 0.4,
                            backgroundImage: `
                                linear-gradient(to right, rgba(43,154,137,0.025) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(43,154,137,0.025) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />

                    {/* Return to App Floating Button */}
                    <Link 
                        href="/" 
                        className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 group"
                        style={{ 
                            background: 'rgba(255,255,255,0.7)', 
                            border: '1px solid rgba(16,24,34,0.06)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 2px 10px rgba(16,24,34,0.03)'
                        }}
                    >
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#64748B' }}>الرئيسية</span>
                    </Link>

                    {/* Ambient corner glow */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none z-0"
                        style={{ background: 'radial-gradient(circle at top right, rgba(43,154,137,0.04) 0%, transparent 60%)' }} />

                    {/* Form Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-[440px]"
                    >
                        {/* Top Brand Mark for Mobile */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-between mb-6 lg:hidden"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: '#101822', boxShadow: '0 4px 12px rgba(16,24,34,0.2)' }}>
                                    <span className="text-white font-black text-lg leading-none">ط</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tight" style={{ color: '#101822' }}>طِبرَا</h1>
                                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#94a3b8' }}>
                                        Functional Medicine
                                    </p>
                                </div>
                            </div>
                            {/* Current time (mobile) */}
                            {currentTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" style={{ color: '#c4cdd5' }} />
                                    <span className="text-[10px] font-medium" style={{ color: '#c4cdd5' }}>{currentTime}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* The Auth Flow Engine */}
                        <AuthFlowController initialMode="LOGIN" onComplete={handleComplete} />

                        {/* Switch to register */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center mt-10"
                        >
                            <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                                ما عندك حساب؟{' '}
                                <Link href="/register" className="font-bold underline underline-offset-2" style={{ color: '#2B9A89' }}>
                                    سجّل الحين
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Security Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-10"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,24,34,0.04)' }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#2B9A89' }} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: '#94a3b8' }}>
                                SECURED · HIPAA · TIBRAH VAULT
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" style={{ color: '#c4cdd5' }} />
                            <span className="text-[8px] font-medium" style={{ color: '#c4cdd5' }}>
                                المملكة العربية السعودية
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

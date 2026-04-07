import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface AuthShellProps {
    children: React.ReactNode;
    brandTitle?: string;
    brandSubtitle?: string;
    className?: string;
}

export default function AuthShell({
    children,
    brandTitle = 'الطب الواعي',
    className = ''
}: AuthShellProps) {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#000407] transition-colors duration-[2000ms] ease-in-out p-4 sm:p-6 ${className}`} dir="rtl">

            {/* The Outer Atmosphere (Deep Water / Healing Environment) */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
                {/* Oceanic / Breath Lights */}
                <div className="absolute w-[120vw] h-[120vw] bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(5,74,68,0.15),transparent_70%)] blur-[120px] mix-blend-screen animate-[breathe_14s_ease-in-out_infinite]" />
                <div className="absolute left-[10%] top-[20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.04),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.06),transparent_60%)] blur-[100px] mix-blend-screen animate-[breathe_18s_ease-in-out_infinite_2s]" />
                <div className="absolute right-[10%] bottom-[10%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.03),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)] blur-[110px] mix-blend-screen animate-[breathe_22s_ease-in-out_infinite_4s]" />

                {/* Structural Orbits (Sacred Geometry / Convergence) */}
                <div className="absolute w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] rounded-full border border-teal-600/[0.02] dark:border-teal-400/[0.015] animate-[spin_60s_linear_infinite]" />
                <div className="absolute w-[90vw] h-[90vw] sm:w-[60vw] sm:h-[60vw] rounded-full border border-teal-600/[0.01] dark:border-teal-400/[0.01] animate-[spin_80s_linear_infinite_reverse]" />
            </div>

            {/* Subtle Ethereal Noise / Grain */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay" />

            {/* Hidden / Minimal Theme Toggle */}
            {mounted && (
                <button
                    onClick={toggleDarkMode}
                    className="absolute top-8 left-8 sm:top-12 sm:left-12 p-2 rounded-full text-teal-800/20 dark:text-white/10 hover:text-teal-900/60 dark:hover:text-white/40 transition-colors duration-1000 z-20 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                    aria-label="تبديل مظهر العرض"
                >
                    {isDarkMode ? <Sun className="w-5 h-5 stroke-[1]" /> : <Moon className="w-5 h-5 stroke-[1]" />}
                </button>
            )}

            {/* The Chamber (Borderless Threshold) */}
            <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">

                {/* Identity Anchor */}
                <div className="flex flex-col items-center text-center mb-16 relative">
                    {/* Light Bloom behind logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-teal-400/20 dark:bg-teal-500/10 blur-[40px] rounded-full pointer-events-none" />

                    {/* Monolithic Logo */}
                    <div className="relative w-16 h-16 flex items-center justify-center mb-10 transition-all duration-1000">
                        {/* Inner Refraction */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 dark:from-white/10 dark:to-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_40px_rgba(0,10,15,0.8)] rotate-45 transform origin-center transition-transform duration-[2000ms] hover:rotate-[135deg]" />
                        <span className="relative z-10 text-4xl font-light text-slate-800 dark:text-slate-100 mix-blend-normal">ط</span>
                    </div>

                    <h1 className="text-[26px] font-medium text-slate-800 dark:text-white/80 tracking-normal transition-colors duration-1000 font-serif" style={{ fontVariationSettings: '"wght" 400' }}>
                        {brandTitle}
                    </h1>
                </div>

                {/* The Embedded Input Zone */}
                <div className="w-full relative px-6 sm:px-12 py-12 flex flex-col transition-all duration-1000 z-10">
                    {/* The soft protective field behind the form, no hard borders */}
                    <div className="absolute inset-0 bg-white/20 dark:bg-[#030e16]/40 backdrop-blur-[60px] border border-white/30 dark:border-slate-800/30 rounded-[32px] sm:rounded-[48px] shadow-[0_30px_80px_-20px_rgba(13,148,136,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col gap-6">
                        {children}
                    </div>
                </div>

                {/* Subtle Protective Footer */}
                <div className="mt-16 flex items-center justify-center gap-4 opacity-40">
                    <div className="w-[1px] h-3 bg-teal-900/20 dark:bg-teal-100/20" />
                    <span className="text-[10px] font-medium text-teal-900/60 dark:text-white/40 uppercase tracking-[0.3em] font-mono">Continuous Safe Entry</span>
                    <div className="w-[1px] h-3 bg-teal-900/20 dark:bg-teal-100/20" />
                </div>
            </div>

            {/* Core Spatial CSS Material System V2 */}
            <style jsx global>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }

                /* Deep Chamber Inputs - Feels like carving into the glass */
                .anesthetic-well {
                    background: rgba(255, 255, 255, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.6) !important;
                    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02) !important;
                    color: #0f172a !important;
                    border-radius: 16px !important;
                    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    font-weight: 400 !important;
                }
                .anesthetic-well::placeholder {
                    color: rgba(15, 23, 42, 0.5) !important;
                    font-weight: 400 !important;
                    letter-spacing: 0em !important;
                }
                .anesthetic-well:focus-within, .anesthetic-well:focus {
                    background: rgba(255, 255, 255, 0.8) !important;
                    border-color: rgba(20, 184, 166, 0.3) !important;
                    box-shadow: inset 0 1px 4px rgba(20, 184, 166, 0.02), 0 10px 40px rgba(20, 184, 166, 0.08) !important;
                    outline: none !important;
                    transform: translateY(-1px);
                }

                .dark .anesthetic-well {
                    background: rgba(255, 255, 255, 0.04) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.95) !important;
                }
                .dark .anesthetic-well::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                .dark .anesthetic-well:focus-within, .dark .anesthetic-well:focus {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border-color: rgba(45, 212, 191, 0.4) !important;
                    box-shadow: inset 0 2px 15px rgba(0, 0, 0, 0.6), 0 10px 40px rgba(20, 184, 166, 0.1) !important;
                }

                /* Luminous Inevitable Button (The Threshold Crossing CTA) */
                .luminary-pill {
                    background: rgba(13, 148, 136, 0.1);
                    color: #0d9488;
                    border: 1px solid rgba(20, 184, 166, 0.2);
                    border-radius: 16px;
                    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }
                .luminary-pill::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.1), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.7s ease;
                }
                .luminary-pill:hover::before {
                    transform: translateX(100%);
                }
                .luminary-pill:hover {
                    background: rgba(13, 148, 136, 0.15);
                    border-color: rgba(20, 184, 166, 0.4);
                    box-shadow: 0 10px 30px rgba(20, 184, 166, 0.1);
                }

                .dark .luminary-pill {
                    background: rgba(20, 184, 166, 0.15);
                    color: rgba(255, 255, 255, 0.95);
                    border: 1px solid rgba(45, 212, 191, 0.4);
                    box-shadow: 0 4px 20px rgba(20, 184, 166, 0.2);
                }
                .dark .luminary-pill::before {
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
                }
                .dark .luminary-pill:hover {
                    background: rgba(20, 184, 166, 0.25);
                    border-color: rgba(45, 212, 191, 0.6);
                    box-shadow: 0 10px 40px rgba(20, 184, 166, 0.3);
                }

                /* Minimal Integrated Providers */
                .pure-symbol {
                    background: transparent;
                    border: 1px solid rgba(15, 23, 42, 0.08);
                    color: rgba(15, 23, 42, 0.5);
                    border-radius: 12px; /* More embedded, less standalone circle */
                    transition: all 0.5s ease;
                }
                .pure-symbol:hover {
                    background: rgba(255, 255, 255, 0.6);
                    border-color: rgba(15, 23, 42, 0.15);
                    color: rgba(15, 23, 42, 0.8);
                }
                
                .dark .pure-symbol {
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.3);
                }
                .dark .pure-symbol:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                /* Error/Alert Banners */
                .auth-alert-box {
                    background: rgba(225, 29, 72, 0.02);
                    border: 1px solid rgba(225, 29, 72, 0.1);
                    border-radius: 12px;
                    box-shadow: none;
                }
                .dark .auth-alert-box {
                    background: rgba(225, 29, 72, 0.05);
                    border: 1px solid rgba(225, 29, 72, 0.15);
                }
            `}</style>
        </div>
    );
}

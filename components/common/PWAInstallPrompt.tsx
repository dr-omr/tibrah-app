import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after a delay if not dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Show iOS prompt if on iOS and not in standalone
    useEffect(() => {
        if (isIOS && !isStandalone) {
            const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 5000);
            }
        }
    }, [isIOS, isStandalone]);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem('pwa-install-dismissed-ios', 'true');
        } else {
            localStorage.setItem('pwa-install-dismissed', 'true');
        }
    };

    // Don't show if already installed
    if (isStandalone || !showPrompt) return null;

    // iOS specific instructions
    if (isIOS) {
        return (
            <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-50 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="gradient-primary p-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">ثبّت تطبيق طِبرَا</h3>
                            <p className="text-white/80 text-sm">للوصول السريع من الشاشة الرئيسية</p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* iOS Instructions */}
                    <div className="p-4 space-y-3">
                        <p className="text-slate-600 text-sm">اتبع الخطوات التالية:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-[#2D9B83] text-white text-sm flex items-center justify-center font-bold">1</span>
                                <span className="text-slate-700 text-sm">اضغط على زر المشاركة <span className="inline-block px-1.5 py-0.5 bg-slate-200 rounded text-xs">⬆️</span></span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-[#2D9B83] text-white text-sm flex items-center justify-center font-bold">2</span>
                                <span className="text-slate-700 text-sm">اختر "إضافة إلى الشاشة الرئيسية"</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-[#2D9B83] text-white text-sm flex items-center justify-center font-bold">3</span>
                                <span className="text-slate-700 text-sm">اضغط "إضافة" ✓</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Chrome/Android Install Prompt
    return (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="gradient-primary p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">ثبّت تطبيق طِبرَا</h3>
                        <p className="text-white/80 text-sm">تجربة أسرع وبدون متصفح</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <span className="text-[#2D9B83]">✓</span>
                            <span>وصول سريع من الشاشة الرئيسية</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#2D9B83]">✓</span>
                            <span>يعمل بملء الشاشة بدون متصفح</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#2D9B83]">✓</span>
                            <span>تحميل أسرع وتجربة أفضل</span>
                        </li>
                    </ul>

                    <button
                        onClick={handleInstall}
                        className="w-full py-3 gradient-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Download className="w-5 h-5 inline-block ml-2" />
                        تثبيت التطبيق
                    </button>
                </div>
            </div>
        </div>
    );
}

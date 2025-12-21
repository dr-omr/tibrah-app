// components/common/NetworkStatusBanner.tsx
// مكون محسن لعرض حالة الاتصال

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle, X, RefreshCw, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useNetworkStatus from '@/hooks/useNetworkStatus';

export default function NetworkStatusBanner() {
    const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();
    const [dismissed, setDismissed] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    // تتبع متى يعود الاتصال
    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
            setDismissed(false);
        } else if (wasOffline && isOnline) {
            setShowReconnected(true);
            setWasOffline(false);
            // إخفاء رسالة إعادة الاتصال بعد 3 ثواني
            const timer = setTimeout(() => setShowReconnected(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    // لا تعرض شيء إذا كان متصل وتم تجاهل الرسالة
    if (isOnline && !isSlowConnection && !showReconnected) return null;
    if (dismissed && isOnline) return null;

    // رسالة إعادة الاتصال
    if (showReconnected) {
        return (
            <div
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top duration-300 shadow-lg"
                role="status"
                aria-live="polite"
            >
                <Wifi className="w-4 h-4" />
                <span>تم استعادة الاتصال بالانترنت ✓</span>
            </div>
        );
    }

    // رسالة اتصال بطيء
    if (isSlowConnection && isOnline) {
        return (
            <div
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between gap-2 text-sm font-medium animate-in slide-in-from-top duration-300 shadow-lg"
                role="alert"
                aria-live="polite"
            >
                <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4" />
                    <span>
                        الاتصال بطيء ({effectiveType}) - قد يتأخر التحميل
                    </span>
                </div>
                <button

                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="إخفاء الرسالة"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // رسالة عدم الاتصال
    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-3 animate-in slide-in-from-top duration-300 shadow-lg"
            role="alert"
            aria-live="assertive"
        >
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <WifiOff className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">أنت غير متصل بالانترنت</p>
                            <p className="text-xs text-slate-300">يمكنك تصفح المحتوى المحفوظ مؤقتاً</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 rounded-xl"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="w-4 h-4 ml-1" />
                        أعد المحاولة
                    </Button>
                </div>
            </div>
        </div>
    );
}

// مكون بسيط لأيقونة حالة الاتصال (للاستخدام في Header مثلاً)
export function NetworkStatusIcon() {
    const { isOnline, isSlowConnection } = useNetworkStatus();

    if (!isOnline) {
        return (
            <div className="relative" title="غير متصل">
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
        );
    }

    if (isSlowConnection) {
        return (
            <div className="relative" title="اتصال بطيء">
                <Signal className="w-4 h-4 text-amber-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </div>
        );
    }

    return null;
}

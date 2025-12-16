import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
    // Initialize to true to avoid SSR hydration mismatch
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial state on client side
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top">
            <WifiOff className="w-4 h-4" />
            <span>أنت غير متصل بالانترنت - تصفح النسخة المحفوظة</span>
        </div>
    );
}
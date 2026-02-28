/**
 * NetworkStatus — Shows a banner when the user goes offline/online
 * For PWA: gives clear feedback about connectivity state
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [showBanner, setShowBanner] = useState(false);
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const goOnline = () => {
            setIsOnline(true);
            setJustReconnected(true);
            setShowBanner(true);
            // Hide "back online" banner after 3 seconds
            setTimeout(() => {
                setShowBanner(false);
                setJustReconnected(false);
            }, 3000);
        };

        const goOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    if (!showBanner && isOnline) return null;

    return (
        <div
            className={`fixed bottom-20 left-4 right-4 z-[9998] transition-all duration-500 transform ${showBanner ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            <div
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm ${isOnline && justReconnected
                        ? 'bg-green-500/95 text-white'
                        : 'bg-red-500/95 text-white'
                    }`}
            >
                {isOnline ? (
                    <>
                        <Wifi className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">تم استعادة الاتصال ✓</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-5 h-5 flex-shrink-0 animate-pulse" />
                        <div>
                            <span className="text-sm font-bold block">لا يوجد اتصال بالإنترنت</span>
                            <span className="text-xs opacity-80">بعض الميزات قد لا تعمل بشكل كامل</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

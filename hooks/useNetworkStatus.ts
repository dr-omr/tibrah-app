// hooks/useNetworkStatus.ts
// Hook لمراقبة حالة الاتصال بالانترنت

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
    isOnline: boolean;
    isSlowConnection: boolean;
    connectionType: string | null;
    effectiveType: string | null;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
}

interface NetworkInformation extends EventTarget {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    type?: string;
    addEventListener(type: 'change', listener: () => void): void;
    removeEventListener(type: 'change', listener: () => void): void;
}

declare global {
    interface Navigator {
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
    }
}

export default function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: true,
        isSlowConnection: false,
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
        saveData: false,
    });

    const getConnection = useCallback((): NetworkInformation | null => {
        if (typeof navigator === 'undefined') return null;
        return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    }, []);

    const updateNetworkStatus = useCallback(() => {
        const connection = getConnection();
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        // تحديد ما إذا كان الاتصال بطيء
        const isSlowConnection = connection
            ? connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || (connection.rtt && connection.rtt > 500)
            : false;

        setStatus({
            isOnline,
            isSlowConnection,
            connectionType: connection?.type || null,
            effectiveType: connection?.effectiveType || null,
            downlink: connection?.downlink || null,
            rtt: connection?.rtt || null,
            saveData: connection?.saveData || false,
        });
    }, [getConnection]);

    useEffect(() => {
        // تحديث الحالة الأولية
        updateNetworkStatus();

        // الاستماع لتغييرات الاتصال
        const handleOnline = () => updateNetworkStatus();
        const handleOffline = () => updateNetworkStatus();

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // الاستماع لتغييرات جودة الاتصال
        const connection = getConnection();
        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, [updateNetworkStatus, getConnection]);

    return status;
}

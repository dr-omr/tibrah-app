import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// VAPID Public Key - In production, this should come from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'BJg9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJ';

interface PushNotificationState {
    isSupported: boolean;
    permission: NotificationPermission | 'unsupported';
    subscription: PushSubscription | null;
    isLoading: boolean;
}

interface UsePushNotificationsReturn extends PushNotificationState {
    requestPermission: () => Promise<boolean>;
    subscribe: () => Promise<PushSubscription | null>;
    unsubscribe: () => Promise<void>;
    sendLocalNotification: (title: string, options?: NotificationOptions) => void;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        permission: 'unsupported',
        subscription: null,
        isLoading: false,
    });

    // Check support and current permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            setState(prev => ({
                ...prev,
                isSupported: true,
                permission: Notification.permission,
            }));

            // Check for existing subscription
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setState(prev => ({ ...prev, subscription }));
                });
            }).catch(console.error);
        }
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported) {
            toast.error('متصفحك لا يدعم الإشعارات');
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission, isLoading: false }));

            if (permission === 'granted') {
                toast.success('تم تفعيل إذن الإشعارات');
                return true;
            } else if (permission === 'denied') {
                toast.error('تم رفض إذن الإشعارات. يمكنك تغيير ذلك من إعدادات المتصفح.');
                return false;
            } else {
                toast.info('لم يتم اتخاذ قرار بشأن الإشعارات');
                return false;
            }
        } catch (error) {
            console.error('Failed to request permission:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            toast.error('فشل طلب إذن الإشعارات');
            return false;
        }
    }, [state.isSupported]);

    // Subscribe to push notifications
    const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
        if (!state.isSupported) {
            return null;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Ensure permission is granted
            if (state.permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    setState(prev => ({ ...prev, isLoading: false }));
                    return null;
                }
            }

            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
            });

            setState(prev => ({ ...prev, subscription, isLoading: false }));
            toast.success('تم تفعيل الإشعارات الفورية بنجاح');

            // Here you would send the subscription to your backend
            // await saveSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            toast.error('فشل تفعيل الإشعارات الفورية');
            return null;
        }
    }, [state.isSupported, state.permission, requestPermission]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!state.subscription) return;

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            await state.subscription.unsubscribe();
            setState(prev => ({ ...prev, subscription: null, isLoading: false }));
            toast.success('تم إيقاف الإشعارات الفورية');
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            toast.error('فشل إيقاف الإشعارات');
        }
    }, [state.subscription]);

    // Send a local notification (doesn't require server)
    const sendLocalNotification = useCallback((title: string, options?: NotificationOptions): void => {
        if (!state.isSupported || state.permission !== 'granted') {
            toast.info(title);
            return;
        }

        const defaultOptions: NotificationOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            dir: 'rtl',
            lang: 'ar',
            ...options,
        };

        new Notification(title, defaultOptions);
    }, [state.isSupported, state.permission]);

    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        sendLocalNotification,
    };
}

export default usePushNotifications;

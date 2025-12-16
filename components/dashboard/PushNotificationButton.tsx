import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

// VAPID Public Key - This is a placeholder. 
// In a real app, you would generate this on your backend.
const VAPID_PUBLIC_KEY = 'BJg9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJj9qfI7_y_ZqjJ';

export default function PushNotificationButton() {
    const [permission, setPermission] = useState('default');
    const [loading, setLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const urlBase64ToUint8Array = (base64String) => {
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
    };

    const subscribeUser = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Request permission if not granted
            if (permission !== 'granted') {
                const newPermission = await Notification.requestPermission();
                setPermission(newPermission);
                if (newPermission !== 'granted') {
                    throw new Error('Permission denied');
                }
            }

            // Subscribe logic would go here if we had a valid VAPID key
            // const subscription = await registration.pushManager.subscribe({
            //   userVisibleOnly: true,
            //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            // });

            // Simulate subscription for UI demo since we don't have a real VAPID key
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save preference to user settings
            await base44.auth.updateMe({
                settings: {
                    notificationsEnabled: true,
                    // pushSubscription: JSON.stringify(subscription) 
                }
            });

            toast.success('تم تفعيل الإشعارات بنجاح');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error('فشل تفعيل الإشعارات: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isSupported) return null;

    if (permission === 'granted') {
        return (
            <Button variant="outline" className="w-full flex items-center gap-2 text-[#2D9B83] border-[#2D9B83]/20 bg-[#2D9B83]/5">
                <Bell className="w-4 h-4" />
                الإشعارات مفعلة
            </Button>
        );
    }

    return (
        <Button
            onClick={subscribeUser}
            disabled={loading}
            className="w-full flex items-center gap-2 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            تفعيل الإشعارات
        </Button>
    );
}
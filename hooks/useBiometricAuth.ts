import { useState, useEffect } from 'react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export function useBiometricAuth() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        setIsChecking(true);
        if (!Capacitor.isNativePlatform()) {
            // Not native platform - fail open for web testing or handle separately
            setIsAvailable(false);
            setIsChecking(false);
            return;
        }

        try {
            const result = await NativeBiometric.isAvailable();
            setIsAvailable(result.isAvailable);
        } catch (error) {
            console.error('Biometric availability error:', error);
            setIsAvailable(false);
        } finally {
            setIsChecking(false);
        }
    };

    const authenticate = async (reason: string = 'الرجاء توثيق هويتك للمتابعة'): Promise<boolean> => {
        if (!Capacitor.isNativePlatform()) {
             // For web testing, bypass or simulate prompt
             toast.info('تم تجاوز البصمة (نسخة الويب)');
             setIsAuthenticated(true);
             return true;
        }

        if (!isAvailable) {
            toast.error('المصادقة الحيوية غير متوفرة على هذا الجهاز');
            return false;
        }

        try {
            const verified = await NativeBiometric.verifyIdentity({
                reason: reason,
                title: 'تأمين البيانات',
                subtitle: 'استخدم البصمة أو FaceID',
                description: 'مطلوب للوصول إلى بياناتك الصحية الحساسة'
            });

            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Biometric auth failed:', error);
            setIsAuthenticated(false);
            toast.error('فشلت المصادقة');
            return false;
        }
    };
    
    const resetAuthentication = () => {
        setIsAuthenticated(false);
    };

    return {
        isAvailable,
        isAuthenticated,
        isChecking,
        authenticate,
        resetAuthentication
    };
}

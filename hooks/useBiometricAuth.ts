import { useState, useEffect, useCallback } from 'react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { bridge } from '@/lib/native/NativeBridge';
import { toast } from '@/components/notification-engine';
import { haptic } from '@/lib/HapticFeedback';

export function useBiometricAuth() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'none'>('none');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const checkAvailability = useCallback(async () => {
        setIsChecking(true);
        if (!bridge.isNative) {
            // Not native platform - fail open for web testing or handle separately
            setIsAvailable(false);
            setBiometricType('none');
            setIsChecking(false);
            return;
        }

        try {
            const result = await NativeBiometric.isAvailable();
            setIsAvailable(result.isAvailable);
            
            // Determine type (FaceID vs TouchID/Fingerprint)
            const typeValue = String(result.biometryType).toUpperCase();
            if (typeValue.includes('FACE') || typeValue.includes('IRIS')) {
                setBiometricType('face');
            } else if (typeValue.includes('FINGERPRINT') || typeValue.includes('TOUCH')) {
                setBiometricType('fingerprint');
            } else {
                setBiometricType('none');
            }
        } catch (error) {
            console.error('[Biometric] availability error:', error);
            setIsAvailable(false);
            setBiometricType('none');
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    const authenticate = async (reason: string = 'الرجاء توثيق هويتك للمتابعة'): Promise<boolean> => {
        if (!bridge.isNative) {
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
            haptic.trigger('light'); // خفيفة قبل الـ prompt
            await NativeBiometric.verifyIdentity({
                reason: reason,
                title: 'تأمين البيانات الذكي',
                subtitle: biometricType === 'face' ? 'استخدم FaceID' : 'استخدم البصمة',
                description: 'مطلوب للوصول إلى السجل الطبي وتجنب الاحتيال',
            });

            haptic.success(); // اهتزاز نجاح
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('[Biometric] auth failed:', error);
            haptic.error(); // اهتزاز خطأ
            setIsAuthenticated(false);
            
            // We shouldn't show error if user just cancelled
            const errStr = String(error).toLowerCase();
            if (!errStr.includes('cancel') && !errStr.includes('user_cancel')) {
                toast.error('فشلت المصادقة');
            }
            return false;
        }
    };
    
    const resetAuthentication = useCallback(() => {
        setIsAuthenticated(false);
    }, []);

    return {
        isAvailable,
        biometricType,
        isAuthenticated,
        isChecking,
        authenticate,
        resetAuthentication
    };
}


import React, { useReducer, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/notification-engine';
import { useRouter } from 'next/router';
import { authStateReducer, AuthStep } from '../engines/authStateMachine';
import { BiometricsService, BiometricAvailability } from '../services/biometricsService';

import StepIdentifier from './StepIdentifier';
import StepSecurity from './StepSecurity';
import StepMedicalIntent from './StepMedicalIntent';

import FaceScanningOverlay from '../biometrics/FaceScanningOverlay';
import FingerprintOverlay from '../biometrics/FingerprintOverlay';

interface AuthFlowControllerProps {
    initialMode: 'LOGIN' | 'REGISTER';
    onComplete: () => void;
}

export default function AuthFlowController({ initialMode, onComplete }: AuthFlowControllerProps) {
    const { signInWithEmail, signUp } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [biometricInfo, setBiometricInfo] = useState<BiometricAvailability>({ available: false, type: 'NONE' });
    const [email, setEmail] = useState('');

    const [state, dispatch] = useReducer(authStateReducer, {
        step: 'IDENTIFY',
        context: { email: '', flowType: initialMode, isBiometricAvailable: false, tempToken: null, medicalIntent: [] }
    });

    useEffect(() => {
        BiometricsService.checkAvailability().then(setBiometricInfo);
    }, []);

    const handleIdentifierSubmit = useCallback(async (e: React.FormEvent, isRegister: boolean) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('ادخل بريدك الإلكتروني عشان نكمل 📧');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setLoading(false);
        // FIX: Use dispatch instead of direct state mutation
        dispatch({ type: 'SUBMIT_EMAIL', payload: { email, isNewUser: isRegister } });
    }, [email, dispatch]);

    const handlePasswordSubmit = useCallback(async (password: string) => {
        setLoading(true);
        try {
            if (state.context.flowType === 'REGISTER') {
                await signUp(state.context.email, password, 'مستخدم جديد');
                dispatch({ type: 'SUBMIT_NEW_PASSWORD' });
                toast.success('تم تأمين ملفك، الله يحفظك 🛡️');
            } else {
                await signInWithEmail(state.context.email, password);
                dispatch({ type: 'SUBMIT_PASSWORD_LOGIN' });
                toast.success('يا هلا بعودتك! 🫶');
                onComplete();
            }
        } catch (error: any) {
            const msg = error?.code === 'auth/wrong-password'
                ? 'كلمة المرور غلط، جرّب مرة ثانية'
                : error?.code === 'auth/user-not-found'
                ? 'ما لقينا هالحساب، سجّل حساب جديد'
                : error?.code === 'auth/email-already-in-use'
                ? 'الإيميل هذا مسجل عندنا من قبل، ارجع وسجل دخول ❤️'
                : error?.code === 'auth/too-many-requests'
                ? 'محاولات كثيرة، انتظر شوي وجرّب بعدين'
                : error?.message || 'صار خطأ، جرّب مرة ثانية';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [state.context, signInWithEmail, signUp, onComplete]);

    const handleMedicalIntentSubmit = useCallback(async (intents: string[]) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        setLoading(false);
        dispatch({ type: 'SUBMIT_MEDICAL_INTENT', payload: { intents } });
        toast.success('بروتوكولك جاهز، يا هلا بك في طِبرَا 🧬');
        onComplete();
    }, [onComplete]);

    const handleBiometricSuccess = useCallback(() => {
        dispatch({ type: 'BIOMETRIC_SUCCESS' });
        toast.success('تم التحقق بنجاح 🎉');
        onComplete();
    }, [onComplete]);

    const currentStep = state.step;

    return (
        <div className="relative w-full">
            {/* Step progress indicator */}
            <div className="flex items-center gap-1.5 mb-8">
                {(['IDENTIFY', 'VERIFY_PASSWORD', 'ONBOARD_MEDICAL_INTENT'] as AuthStep[]).map((step, i) => {
                    const stepOrder = { IDENTIFY: 0, BIOMETRIC_PROMPT: 1, VERIFY_PASSWORD: 1, ONBOARD_BASIC: 1, VERIFY_OTP: 1, ONBOARD_MEDICAL_INTENT: 2, COMPLETE: 3 };
                    const currentOrder = stepOrder[currentStep] ?? 0;
                    const thisOrder = i;
                    const isActive = currentOrder === thisOrder;
                    const isDone = currentOrder > thisOrder;
                    return (
                        <div
                            key={step}
                            className="h-[3px] rounded-full transition-all duration-500"
                            style={{
                                flex: isActive ? 3 : 1,
                                backgroundColor: isDone ? '#2B9A89' : isActive ? '#2B9A89' : 'rgba(16,24,34,0.06)',
                                opacity: isDone ? 0.4 : 1,
                            }}
                        />
                    );
                })}
            </div>
            <motion.div layout className="relative w-full">
                <AnimatePresence mode="popLayout">
                    {currentStep === 'IDENTIFY' && (
                    <StepIdentifier
                        key="identify"
                        emailStr={email}
                        onChange={setEmail}
                        onSubmit={handleIdentifierSubmit}
                        loading={loading}
                    />
                )}

                {currentStep === 'BIOMETRIC_PROMPT' && (
                    biometricInfo.type === 'FACE_ID' ? (
                        <FaceScanningOverlay
                            key="face"
                            isActive={true}
                            onSuccess={handleBiometricSuccess}
                            onFail={() => dispatch({ type: 'BIOMETRIC_FAIL' })}
                        />
                    ) : (
                        <FingerprintOverlay
                            key="fingerprint"
                            isActive={true}
                            onSuccess={handleBiometricSuccess}
                            onFail={() => dispatch({ type: 'BIOMETRIC_FAIL' })}
                        />
                    )
                )}

                {(currentStep === 'VERIFY_PASSWORD' || currentStep === 'ONBOARD_BASIC') && (
                    <StepSecurity
                        key="security"
                        email={state.context.email || email}
                        isRegister={state.context.flowType === 'REGISTER'}
                        onBack={() => { setEmail(''); dispatch({ type: 'RESET' }); }}
                        onSubmit={handlePasswordSubmit}
                        onForgotPassword={() => router.push(`/forgot-password?email=${encodeURIComponent(state.context.email || email)}`)}
                        loading={loading}
                    />
                )}

                {currentStep === 'ONBOARD_MEDICAL_INTENT' && (
                    <StepMedicalIntent
                        key="intent"
                        onSubmit={handleMedicalIntentSubmit}
                        loading={loading}
                    />
                )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

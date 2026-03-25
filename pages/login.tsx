import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, Sparkles, Heart, Brain, Activity, Shield, Zap, Star, ScanFace, HeartPulse, Users, TrendingUp, CheckCircle, Calendar, Stethoscope, Award, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

// Google Icon Component
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// Apple Icon Component
const AppleIcon = () => (
    <svg viewBox="0 0 384 512" className="w-5 h-5">
        <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

// Facebook Icon Component 
const FacebookIcon = () => (
    <svg viewBox="0 0 512 512" className="w-5 h-5">
        <path fill="#1877F2" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
    </svg>
);

// Password strength calculator
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 1) return { score: 1, label: 'ضعيفة', color: 'text-red-400' };
    if (score <= 2) return { score: 2, label: 'متوسطة', color: 'text-amber-500' };
    if (score <= 3) return { score: 3, label: 'جيدة', color: 'text-teal-500' };
    return { score: 4, label: 'قوية جداً ✓', color: 'text-emerald-500' };
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [migrationError, setMigrationError] = useState('');
    const { signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithApple, authProvider, isFirebaseAvailable, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);
        }
    }, [authLoading, isAuthenticated, router]);

    React.useEffect(() => {
        const checkBiometricAvailability = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const result = await NativeBiometric.isAvailable();
                    setBiometricAvailable(result.isAvailable);
                } catch (error) {
                    console.error("Biometric not available:", error);
                }
            }
        };
        checkBiometricAvailability();
    }, []);

    // Load remembered email
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('tibrah_remembered_email');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        }
    }, []);

    const handleBiometricLogin = async () => {
        setBiometricLoading(true);
        try {
            await NativeBiometric.verifyIdentity({
                reason: "قم بتسجيل الدخول إلى طِبرَا باستخدام البصمة",
                title: "تسجيل الدخول",
                subtitle: "استخدم بصمة الوجه أو الإصبع",
                description: "الوصول الآمن إلى ملفك الطبي",
            });

            const credentials = await NativeBiometric.getCredentials({
                server: "tibrah.com",
            });

            await signInWithEmail(credentials.username, credentials.password);
            toast.success('تم تسجيل الدخول بالبصمة بنجاح! 🎉');
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);

        } catch (error: any) {
            console.error("Biometric Login Error:", error);
            if (error?.code !== 'user_cancelled' && error?.message !== 'User cancelled') {
                if (error?.message?.includes('Item not found')) {
                    toast.info('الرجاء تسجيل الدخول بكلمة المرور أولاً لحفظ البصمة');
                } else {
                    toast.error('لم نتمكن من تسجيل الدخول بالبصمة');
                }
            }
        } finally {
            setBiometricLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setLoading(true);
        setMigrationError('');
        try {
            await signInWithEmail(email, password);

            // Remember email if checkbox is on
            if (rememberMe) {
                localStorage.setItem('tibrah_remembered_email', email);
            } else {
                localStorage.removeItem('tibrah_remembered_email');
            }

            // On successful manual login, save credentials for future biometric use
            if (Capacitor.isNativePlatform() && biometricAvailable) {
                try {
                    await NativeBiometric.setCredentials({
                        username: email,
                        password: password,
                        server: "tibrah.com",
                    });
                } catch (e) {
                    console.error("Failed to save credentials for biometrics:", e);
                }
            }

            toast.success('تم تسجيل الدخول بنجاح! 🎉');
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };

            switch (authError.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    toast.error('كلمة المرور غير صحيحة');
                    break;
                case 'auth/user-not-found':
                    toast.error('لا يوجد حساب بهذا البريد الإلكتروني');
                    break;
                case 'auth/invalid-email':
                    toast.error('البريد الإلكتروني غير صحيح');
                    break;
                case 'auth/invalid-argument':
                case 'auth/invalid-api-key':
                    toast.error('خطأ في إعدادات النظام. يرجى التواصل مع الدعم');
                    break;
                case 'auth/unavailable':
                    toast.error(authError.message || 'تسجيل الدخول غير متاح حالياً');
                    break;
                case 'auth/migration-required':
                    setMigrationError(authError.message || 'يرجى ترقية حسابك');
                    break;
                case 'auth/too-many-requests':
                    toast.error('محاولات كثيرة. حاول لاحقاً');
                    break;
                default:
                    toast.error(authError.message || 'خطأ في تسجيل الدخول');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('تم تسجيل الدخول بحساب جوجل بنجاح! 🎉');
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                if (authError.code === 'auth/unauthorized-domain') {
                    toast.error('هذا النطاق غير مصرح لجوجل. سيتم استخدام تسجيل الدخول المحلي');
                } else {
                    toast.error(authError.message || 'خطأ في تسجيل الدخول بجوجل');
                }
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setFacebookLoading(true);
        try {
            await signInWithFacebook();
            toast.success('تم تسجيل الدخول بحساب فيسبوك بنجاح! 🎉');
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                toast.error(authError.message || 'خطأ في تسجيل الدخول بفيسبوك');
            }
        } finally {
            setFacebookLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setAppleLoading(true);
        try {
            await signInWithApple();
            toast.success('تم تسجيل الدخول بحساب Apple بنجاح! 🎉');
            const returnUrl = (router.query.redirect as string) || '/';
            router.push(returnUrl);
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                toast.error(authError.message || 'خطأ في تسجيل الدخول بـ Apple');
            }
        } finally {
            setAppleLoading(false);
        }
    };

    const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null;

    // Show loading skeleton during initial auth check
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-teal-600/20 animate-pulse" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}>
                        <span className="text-white font-black text-2xl">ط</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">جاري التحقق...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left Side — Premium Brand Panel */}
            <div className="hidden lg:flex lg:w-[46%] relative items-center justify-center p-16" style={{ background: 'linear-gradient(160deg, #042f2e 0%, #0d4744 30%, #0f766e 70%, #14b8a6 100%)' }}>
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

                {/* Refined circular accents */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/[0.06]" />
                    <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full border border-white/[0.04]" />
                    <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-emerald-400/[0.06] blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-teal-300/[0.05] blur-3xl" />
                </div>

                {/* Floating medical icons — refined */}
                <div className="absolute top-[18%] left-[18%] animate-float">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/10">
                        <Heart className="w-5 h-5 text-emerald-200/80" />
                    </div>
                </div>
                <div className="absolute bottom-[22%] right-[15%] animate-float" style={{ animationDelay: '1.2s' }}>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/10">
                        <Brain className="w-5 h-5 text-teal-200/80" />
                    </div>
                </div>
                <div className="absolute top-[38%] right-[22%] animate-float" style={{ animationDelay: '2.4s' }}>
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white/60" />
                    </div>
                </div>

                {/* Brand Content — glass card */}
                <div className="relative z-10 w-full max-w-sm">
                    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-10 shadow-2xl shadow-black/20">
                        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <span className="text-4xl font-black text-white/90">ط</span>
                        </div>
                        <h1 className="text-3xl font-black text-white text-center mb-3 tracking-tight">مرحباً بك في طِبرَا</h1>
                        <p className="text-white/60 text-[15px] leading-relaxed text-center mb-10">
                            عيادتك الرقمية للطب الوظيفي والتكاملي
                        </p>

                        {/* Trust features — minimal */}
                        <div className="space-y-4">
                            {[
                                { icon: Shield, text: 'حماية كاملة لبياناتك الصحية' },
                                { icon: Zap, text: 'متابعة ذكية لوضعك الصحي' },
                                { icon: Star, text: 'استشارات طبية متخصصة' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-3.5 h-3.5 text-emerald-300/80" />
                                    </div>
                                    <span className="text-[13px] text-white/70 font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust badge */}
                    <div className="flex items-center justify-center gap-1.5 mt-8">
                        <Shield className="w-3 h-3 text-emerald-400/50" />
                        <span className="text-[10px] text-white/30 font-medium tracking-wide">نحرص على حماية بياناتك</span>
                    </div>

                    {/* Animated journey steps */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {[
                            { icon: Brain, label: 'تقييم' },
                            { icon: Calendar, label: 'حجز' },
                            { icon: Stethoscope, label: 'استشارة' },
                            { icon: CheckCircle, label: 'علاج' },
                        ].map((step, i) => (
                            <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                                        <step.icon className="w-3 h-3 text-emerald-300/60" />
                                    </div>
                                    <span className="text-[8px] font-bold text-white/25">{step.label}</span>
                                </div>
                                {i < 3 && <div className="w-3 h-px bg-white/10 mt-[-8px]" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side — Clean Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-gradient-to-br from-slate-50 via-white to-teal-50/20 overflow-y-auto h-screen relative">
                {/* Subtle background washes */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-50/30 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-full max-w-[400px] relative z-10">
                    {/* Mobile Logo — Premium animated header */}
                    <div className="text-center mb-10 lg:hidden">
                        <div className="relative inline-block mb-5">
                            {/* Animated glow behind logo */}
                            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl blur-xl opacity-30" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }} />
                            <div className="relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/20" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}>
                                <span className="text-white font-black text-2xl">ط</span>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                </span>
                            </div>
                        </div>
                        <h1 className="text-[22px] font-black text-slate-800">مرحباً بك في طِبرَا</h1>
                        <p className="text-sm text-slate-400 mt-1.5 font-medium">عيادتك الرقمية للطب الوظيفي والتكاملي</p>
                        
                        {/* Mobile trust pills */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {[
                                { icon: Shield, label: 'آمن', color: 'text-teal-500', bg: 'bg-teal-50' },
                                { icon: Brain, label: 'ذكي', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                { icon: HeartPulse, label: 'متخصص', color: 'text-rose-500', bg: 'bg-rose-50' },
                            ].map(pill => (
                                <div key={pill.label} className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${pill.bg} border border-slate-100`}>
                                    <pill.icon className={`w-3 h-3 ${pill.color}`} />
                                    <span className="text-[10px] font-bold text-slate-500">{pill.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-[28px] font-black text-slate-800 mb-1.5 tracking-tight">تسجيل الدخول</h2>
                        <p className="text-[15px] text-slate-400 font-medium">أدخل بياناتك للوصول لحسابك</p>
                        <div className="flex items-center gap-3 mt-4">
                            {[
                                { icon: Users, value: '+٣٠٠', label: 'مريض' },
                                { icon: TrendingUp, value: '٨٧%', label: 'تحسن' },
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <stat.icon className="w-3.5 h-3.5 text-teal-500" />
                                    <span className="text-[12px] font-bold text-slate-700">{stat.value}</span>
                                    <span className="text-[10px] text-slate-400">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Firebase unavailable notice */}
                    {!isFirebaseAvailable && (
                        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                            <Shield className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                            يتم حالياً ترقية نظام المصادقة. تسجيل الدخول بجوجل وإنشاء حسابات جديدة غير متاح مؤقتاً.
                        </div>
                    )}

                    {/* Migration Notice */}
                    {migrationError && (
                        <div className="mb-6 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="w-6 h-6 text-red-600 shrink-0" />
                                <h3 className="font-bold text-red-900 text-base">مطلوب تحديث الحساب</h3>
                            </div>
                            <p className="text-sm leading-relaxed mb-4">{migrationError}</p>
                            <Link href="/register" className="inline-flex w-full justify-center text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
                                إنشاء الحساب الجديد
                            </Link>
                        </div>
                    )}

                    {/* Biometric Sign In Button */}
                    {biometricAvailable && (
                        <Button
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={biometricLoading || googleLoading}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-white font-bold mb-4 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02]"
                        >
                            {biometricLoading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    جاري التحقق...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <ScanFace className="w-5 h-5 text-emerald-400" />
                                    المتابعة السريعة بالبصمة (FaceID/TouchID)
                                </span>
                            )}
                        </Button>
                    )}

                    {/* Social Logins */}
                    <div className="space-y-3 mb-6">
                        {/* Google Sign In Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || facebookLoading || appleLoading || biometricLoading || !isFirebaseAvailable}
                            className="w-full h-[52px] rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 font-semibold text-[14px] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {googleLoading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <GoogleIcon />
                                    تسجيل الدخول بحساب Google
                                </span>
                            )}
                        </Button>

                        {/* Facebook Sign In Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleFacebookLogin}
                            disabled={googleLoading || facebookLoading || appleLoading || biometricLoading || !isFirebaseAvailable}
                            className="w-full h-[52px] rounded-xl border border-slate-200 hover:border-[#1877f2]/20 hover:bg-[#1877f2]/5 text-slate-700 font-semibold text-[14px] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {facebookLoading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-spin text-[#1877f2]" />
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <FacebookIcon />
                                    تسجيل الدخول بحساب Facebook
                                </span>
                            )}
                        </Button>

                        {/* Apple Sign In Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAppleLogin}
                            disabled={googleLoading || facebookLoading || appleLoading || biometricLoading || !isFirebaseAvailable}
                            className="w-full h-[52px] rounded-xl border border-slate-200 hover:border-black/20 hover:bg-black/5 text-slate-700 font-semibold text-[14px] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {appleLoading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-spin text-black" />
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <AppleIcon />
                                    تسجيل الدخول بحساب Apple
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 font-medium">أو بالبريد الإلكتروني</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-100/80 border border-slate-100 space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 text-[15px] transition-colors"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pr-12 pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 text-[15px] transition-colors"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {/* Password strength indicator */}
                                {passwordStrength && (
                                    <div className="mt-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(level => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                        passwordStrength.score >= level
                                                            ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-amber-400' : level <= 3 ? 'bg-teal-400' : 'bg-emerald-500'
                                                            : 'bg-slate-100'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold mt-1 ${passwordStrength.color}`}>
                                            {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-xs font-medium text-slate-500">تذكرني</span>
                                </label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[52px] rounded-xl text-white font-bold text-[15px] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-teal-600/20"
                            style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 animate-spin" />
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <LogIn className="w-6 h-6" />
                                    تسجيل الدخول
                                    <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Register / Create Account section */}
                    <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-3">
                        {/* Social proof */}
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="flex -space-x-2">
                                {['💊', '🩺', '❤️'].map((emoji, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-teal-50 border-2 border-white flex items-center justify-center text-[10px]">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">+٣٠٠ مريض سجّلوا في طِبرَا</span>
                        </div>

                        <p className="text-center text-sm text-slate-400 font-medium">
                            مستخدم جديد؟
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/register')}
                            className="w-full h-[48px] rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50/50 hover:border-teal-300 font-semibold text-sm transition-all"
                        >
                            <Sparkles className="w-4 h-4 ml-2" />
                            إنشاء حساب جديد
                        </Button>
                    </div>

                    {/* Mobile trust footer */}
                    <div className="flex items-center justify-center gap-1.5 mt-8 lg:hidden">
                        <Shield className="w-3 h-3 text-teal-400" />
                        <span className="text-[10px] text-slate-400 font-medium">طِبرَا — نحرص على حماية خصوصيتك</span>
                    </div>



                </div>
            </div >
        </div >
    );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, UserPlus, Sparkles, Heart, Brain, Activity, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

// Try to import Firebase for email verification
let firebaseAuth: typeof import('firebase/auth') | null = null;
let firebaseAuthInstance: import('firebase/auth').Auth | null = null;

try {
    const firebase = require('../lib/firebase');
    firebaseAuthInstance = firebase.auth;
    firebaseAuth = require('firebase/auth');
} catch (e) {
    console.log('Firebase not configured for email verification');
}

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
function getPasswordStrength(password: string): { score: number; label: string; color: string; tips: string[] } {
    let score = 0;
    const tips: string[] = [];

    if (password.length >= 6) score++;
    else tips.push('6 أحرف على الأقل');

    if (password.length >= 8) score++;

    if (/[A-Z]/.test(password)) score++;
    else tips.push('حرف كبير واحد');

    if (/[0-9]/.test(password)) score++;
    else tips.push('رقم واحد');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else tips.push('رمز خاص (!@#$)');

    if (password.length >= 12) score++;

    if (score <= 1) return { score: 1, label: 'ضعيفة', color: 'text-red-400', tips };
    if (score <= 2) return { score: 2, label: 'متوسطة', color: 'text-amber-500', tips };
    if (score <= 3) return { score: 3, label: 'جيدة', color: 'text-teal-500', tips };
    return { score: 4, label: 'قوية جداً ✓', color: 'text-emerald-500', tips: [] };
}

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [medicalConsent, setMedicalConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const { signUp, signInWithGoogle, signInWithFacebook, signInWithApple, authProvider, isFirebaseAvailable, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        if (!medicalConsent) {
            toast.error('يجب الموافقة على الشروط والأحكام الطبية للاستمرار');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        if (password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);

            // Send email verification
            if (firebaseAuth && firebaseAuthInstance && firebaseAuthInstance.currentUser) {
                try {
                    await firebaseAuth.sendEmailVerification(firebaseAuthInstance.currentUser);
                    setVerificationSent(true);
                } catch (verifyError) {
                    console.error('Failed to send verification email:', verifyError);
                }
            }

            // On successful registration, save credentials for future biometric login
            if (Capacitor.isNativePlatform()) {
                try {
                    const status = await NativeBiometric.isAvailable();
                    if (status.isAvailable) {
                        await NativeBiometric.setCredentials({
                            username: email,
                            password: password,
                            server: "tibrah.com",
                        });
                    }
                } catch (e) {
                    console.error("Failed to save credentials for biometrics:", e);
                }
            }

            if (!verificationSent) {
                toast.success('تم إنشاء الحساب بنجاح! 🎉');
                router.push('/');
            }
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };

            switch (authError.code) {
                case 'auth/email-already-in-use':
                    toast.error('البريد الإلكتروني مستخدم بالفعل');
                    break;
                case 'auth/weak-password':
                    toast.error('كلمة المرور ضعيفة جداً');
                    break;
                case 'auth/invalid-email':
                    toast.error('البريد الإلكتروني غير صحيح');
                    break;
                case 'auth/unavailable':
                    toast.error(authError.message || 'التسجيل غير متاح حالياً');
                    break;
                default:
                    toast.error(authError.message || 'خطأ في إنشاء الحساب');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('تم إنشاء الحساب بجوجل بنجاح! 🎉');
            router.push('/');
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                toast.error(authError.message || 'خطأ في التسجيل بجوجل');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleFacebookSignup = async () => {
        setFacebookLoading(true);
        try {
            await signInWithFacebook();
            toast.success('تم إنشاء الحساب بفيسبوك بنجاح! 🎉');
            router.push('/');
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                toast.error(authError.message || 'خطأ في التسجيل الدخول بفيسبوك');
            }
        } finally {
            setFacebookLoading(false);
        }
    };

    const handleAppleSignup = async () => {
        setAppleLoading(true);
        try {
            await signInWithApple();
            toast.success('تم إنشاء الحساب عبر Apple بنجاح! 🎉');
            router.push('/');
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            if (authError.code !== 'auth/popup-closed-by-user') {
                toast.error(authError.message || 'خطأ في التسجيل الدخول عبر Apple');
            }
        } finally {
            setAppleLoading(false);
        }
    };

    const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null;
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

    // Email verification success state
    if (verificationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
                <div className="w-full max-w-md text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">تم إنشاء حسابك بنجاح! 🎉</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-2">
                        أرسلنا رابط تفعيل إلى <strong className="text-slate-700">{email}</strong>
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-8">
                        يرجى الضغط على الرابط في بريدك لتفعيل حسابك. يمكنك استخدام التطبيق الآن والتفعيل لاحقاً.
                    </p>
                    
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 text-amber-800 text-sm mb-6">
                        <p className="font-bold mb-1">💡 لم تصلك الرسالة؟</p>
                        <ul className="text-xs space-y-1 text-amber-700">
                            <li>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</li>
                            <li>• تأكد من صحة البريد الإلكتروني</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                // Resend verification email
                                if (firebaseAuth && firebaseAuthInstance && firebaseAuthInstance.currentUser) {
                                    firebaseAuth.sendEmailVerification(firebaseAuthInstance.currentUser)
                                        .then(() => toast.success('تم إعادة إرسال رابط التفعيل! 📧'))
                                        .catch(() => toast.error('حدث خطأ. حاول لاحقاً'));
                                }
                            }}
                            variant="outline"
                            className="w-full h-[48px] rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm"
                        >
                            <Mail className="w-4 h-4 ml-2" />
                            إعادة إرسال رابط التفعيل
                        </Button>
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full h-[52px] rounded-xl text-white font-bold text-[15px] shadow-lg shadow-teal-600/20"
                            style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                        >
                            متابعة إلى التطبيق →
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12" style={{ background: 'linear-gradient(145deg, #064e3b 0%, #047857 50%, #059669 100%)' }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute bottom-40 right-20 w-60 h-60 border border-white rounded-full" />
                </div>

                {/* Floating Icons */}
                <div className="absolute top-1/4 left-1/4 animate-float">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="absolute top-1/3 right-1/3 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-white text-center max-w-md">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 shadow-2xl">
                        <span className="text-4xl font-bold">ط</span>
                    </div>
                    <h1 className="text-4xl font-black mb-4">انضم إلى طِبرَا</h1>
                    <p className="text-white/80 text-lg leading-relaxed">
                        ابدأ رحلتك نحو صحة أفضل مع الطب الوظيفي والتكاملي
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-y-auto h-screen">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Firebase unavailable notice */}
                    {!isFirebaseAvailable && (
                        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                            <Shield className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                            يتم حالياً ترقية نظام المصادقة. إنشاء حسابات جديدة وتسجيل الدخول بجوجل غير متاح مؤقتاً.
                        </div>
                    )}
                    {/* Mobile Logo */}
                    <div className="text-center mb-6 lg:hidden">
                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 8px 24px rgba(13,148,136,0.3)' }}>
                            <span className="text-white font-black text-2xl">ط</span>
                        </div>
                        <h1 className="text-[22px] font-black text-slate-800">انضم إلى طِبرَا</h1>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block text-center mb-6">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">إنشاء حساب جديد</h2>
                        <p className="text-slate-500">سجل الآن واستمتع بخدماتنا</p>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-3 mb-6">
                        {/* Google Sign Up Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignup}
                            disabled={googleLoading || facebookLoading || appleLoading || !isFirebaseAvailable}
                            className="w-full h-12 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    جاري التسجيل...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <GoogleIcon />
                                    التسجيل بحساب Google
                                </span>
                            )}
                        </Button>

                        <div className="flex gap-3">
                            {/* Facebook Sign Up Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleFacebookSignup}
                                disabled={googleLoading || facebookLoading || appleLoading || !isFirebaseAvailable}
                                className="w-full h-12 rounded-xl border border-slate-200 hover:border-[#1877f2]/20 hover:bg-[#1877f2]/5 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 px-0"
                            >
                                {facebookLoading ? (
                                    <Sparkles className="w-5 h-5 animate-spin text-[#1877f2]" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <FacebookIcon />
                                        Facebook
                                    </span>
                                )}
                            </Button>

                            {/* Apple Sign Up Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAppleSignup}
                                disabled={googleLoading || facebookLoading || appleLoading || !isFirebaseAvailable}
                                className="w-full h-12 rounded-xl border border-slate-200 hover:border-black/20 hover:bg-black/5 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 px-0"
                            >
                                {appleLoading ? (
                                    <Sparkles className="w-5 h-5 animate-spin text-black" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <AppleIcon />
                                        Apple
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-400">أو بالبريد الإلكتروني</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="أحمد محمد"
                                        className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="6 أحرف على الأقل"
                                        className="pr-12 pl-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
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
                                        <div className="flex items-center justify-between mt-1">
                                            <p className={`text-[10px] font-bold ${passwordStrength.color}`}>
                                                {passwordStrength.label}
                                            </p>
                                            {passwordStrength.tips.length > 0 && (
                                                <p className="text-[9px] text-slate-400">
                                                    ينقص: {passwordStrength.tips.slice(0, 2).join('، ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور"
                                        className={`pr-12 pl-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white ${
                                            passwordsMismatch ? 'border-red-300 focus:border-red-400' : ''
                                        } ${passwordsMatch ? 'border-emerald-300 focus:border-emerald-400' : ''}`}
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {passwordsMismatch && (
                                    <p className="text-[10px] font-bold text-red-400 mt-1">كلمات المرور غير متطابقة</p>
                                )}
                                {passwordsMatch && (
                                    <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        كلمات المرور متطابقة ✓
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Medical Disclaimer & Consent */}
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 flex items-start gap-3 mt-4">
                            <input
                                type="checkbox"
                                id="medical-consent"
                                checked={medicalConsent}
                                onChange={(e) => setMedicalConsent(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="flex-1">
                                <label htmlFor="medical-consent" className="text-sm font-bold text-amber-900 cursor-pointer block mb-1">
                                    موافقة وإخلاء مسؤولية طبي
                                </label>
                                <p className="text-xs text-amber-800/80 leading-relaxed">
                                    أوافق على{' '}
                                    <Link href="/privacy" target="_blank" className="text-amber-900 underline font-bold hover:text-teal-700">
                                        سياسة الخصوصية
                                    </Link>
                                    {' '}و{' '}
                                    <Link href="/terms" target="_blank" className="text-amber-900 underline font-bold hover:text-teal-700">
                                        الشروط والأحكام
                                    </Link>
                                    ، وأقر بأن تطبيق طِبرَا هو أداة مساعدة للوعي الصحي وليس بديلاً عن الاستشارة الطبية المباشرة أو الطوارئ.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl text-white font-black text-lg"
                            style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 8px 24px rgba(13,148,136,0.3)' }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 animate-spin" />
                                    جاري إنشاء الحساب...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <UserPlus className="w-6 h-6" />
                                    إنشاء الحساب
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4 mb-6">
                        <p className="text-center text-slate-600 font-semibold">
                            لديك حساب بالفعل؟
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/login')}
                            className="w-full h-14 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-bold transition-all"
                        >
                            تسجيل الدخول
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

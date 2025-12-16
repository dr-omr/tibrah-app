import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, UserPlus, Sparkles, Heart, Brain, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Google Icon Component
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signUpWithEmail, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error('يرجى ملء جميع الحقول');
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
            await signUpWithEmail(email, password, name);
            toast.success('تم إنشاء الحساب بنجاح!');
            router.push('/');
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/email-already-in-use') {
                toast.error('البريد الإلكتروني مستخدم بالفعل');
            } else if (firebaseError.code === 'auth/weak-password') {
                toast.error('كلمة المرور ضعيفة جداً');
            } else {
                toast.error('خطأ في إنشاء الحساب');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('تم إنشاء الحساب بنجاح!');
            router.push('/');
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            if (firebaseError.code !== 'auth/popup-closed-by-user') {
                toast.error('خطأ في التسجيل بجوجل');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
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
                    <h1 className="text-4xl font-bold mb-4">انضم إلى طِبرَا</h1>
                    <p className="text-white/80 text-lg leading-relaxed">
                        ابدأ رحلتك نحو صحة أفضل مع الطب الوظيفي والتكاملي
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="text-center mb-6 lg:hidden">
                        <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
                            <span className="text-white font-bold text-2xl">ط</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">انضم إلى طِبرَا</h1>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">إنشاء حساب جديد</h2>
                        <p className="text-slate-500">سجل الآن واستمتع بخدماتنا</p>
                    </div>

                    {/* Google Sign Up Button */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignup}
                        disabled={googleLoading}
                        className="w-full h-14 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium mb-6"
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

                    {/* Divider */}
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
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="6 أحرف على الأقل"
                                        className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور"
                                        className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl gradient-primary text-white font-bold text-lg shadow-xl shadow-primary/30"
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
                    <p className="text-center text-slate-500 mt-6">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

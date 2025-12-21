// components/common/ErrorBoundary.tsx
// مكون لالتقاط الأخطاء وعرض واجهة بديلة

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // يمكن إرسال الخطأ لخدمة تتبع مثل Sentry
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // إعادة تحميل الصفحة
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            // إذا تم تمرير fallback مخصص
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // واجهة الخطأ الافتراضية
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Background decorations */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-20 right-20 w-64 h-64 bg-red-100/50 rounded-full blur-3xl" />
                            <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10">
                            {/* Error Icon */}
                            <div className="mb-8">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                                    <div className="absolute inset-2 bg-white rounded-full shadow-lg flex items-center justify-center">
                                        <AlertTriangle className="w-10 h-10 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            <h1 className="text-2xl font-bold text-slate-800 mb-3">
                                عذراً، حدث خطأ غير متوقع
                            </h1>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                نأسف لهذا الخطأ التقني. فريقنا يعمل على حل المشكلة.
                                يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    className="gradient-primary text-white rounded-xl px-6 py-6 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <RefreshCw className="w-5 h-5 ml-2" />
                                    حاول مرة أخرى
                                </Button>

                                <Link href="/">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-6 py-6 border-2 hover:bg-slate-50 w-full"
                                    >
                                        <Home className="w-5 h-5 ml-2" />
                                        الصفحة الرئيسية
                                    </Button>
                                </Link>
                            </div>

                            {/* WhatsApp Support */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-400 mb-3">
                                    هل تحتاج مساعدة؟
                                </p>
                                <a
                                    href="https://wa.me/967771447111?text=مرحباً، واجهت مشكلة تقنية في التطبيق"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    تواصل معنا عبر واتساب
                                </a>
                            </div>

                            {/* Error details (development only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-8 text-left bg-slate-100 rounded-xl p-4 text-sm">
                                    <summary className="cursor-pointer text-slate-600 font-medium mb-2">
                                        تفاصيل الخطأ (للمطورين)
                                    </summary>
                                    <pre className="text-red-600 overflow-auto text-xs whitespace-pre-wrap">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import React from 'react';
import { Sparkles } from 'lucide-react';
import GoogleIcon from '../icons/GoogleIcon';

interface GoogleSignInButtonProps {
    onClick: () => void;
    loading: boolean;
    disabled?: boolean;
    label?: string;
    loadingLabel?: string;
    className?: string;
}

export default function GoogleSignInButton({
    onClick,
    loading,
    disabled = false,
    label = 'تسجيل الدخول بحساب Google',
    loadingLabel = 'جاري تسجيل الدخول...',
    className = '',
}: GoogleSignInButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className={`w-full h-14 auth-social-btn flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200 font-medium mb-6 ${className}`}
        >
            {loading ? (
                <>
                    <Sparkles className="w-5 h-5 animate-spin text-primary" />
                    <span className="opacity-80">{loadingLabel}</span>
                </>
            ) : (
                <>
                    <GoogleIcon className="w-5 h-5" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}

import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';

interface SubmitButtonProps {
    loading: boolean;
    disabled?: boolean;
    icon: LucideIcon;
    label: string;
    loadingLabel?: string;
    className?: string;
}

export default function SubmitButton({
    loading,
    disabled = false,
    icon: Icon,
    label,
    loadingLabel = 'جاري المعالجة...',
    className = '',
}: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className={`w-full h-14 rounded-2xl auth-cta-button text-white font-bold text-[17px] flex items-center justify-center gap-3 overflow-hidden ${className} ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
        >
            {loading ? (
                <>
                    <Sparkles className="w-6 h-6 animate-spin" />
                    <span className="tracking-wide">{loadingLabel}</span>
                </>
            ) : (
                <>
                    <Icon className="w-6 h-6" />
                    <span className="tracking-wide drop-shadow-sm">{label}</span>
                    <span className="group-hover:translate-x-[-4px] transition-transform opacity-80">←</span>
                </>
            )}
        </button>
    );
}

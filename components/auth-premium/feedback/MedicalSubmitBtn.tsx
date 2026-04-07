import React from 'react';
import { Loader2 } from 'lucide-react';

interface MedicalSubmitBtnProps {
    loading: boolean;
    disabled?: boolean;
    label: string;
    loadingLabel?: string;
    className?: string;
}

export default function MedicalSubmitBtn({
    loading,
    disabled = false,
    label,
    loadingLabel = 'جاري التحضير...',
    className = '',
}: MedicalSubmitBtnProps) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className={`w-full h-[56px] medical-cta font-bold text-[16px] tracking-wide flex items-center justify-center gap-2.5 overflow-hidden relative ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin opacity-80" />
                    <span className="opacity-90">{loadingLabel}</span>
                </>
            ) : (
                <span>{label}</span>
            )}
        </button>
    );
}

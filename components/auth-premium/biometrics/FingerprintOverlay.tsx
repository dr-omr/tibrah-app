import React, { useEffect, useState } from 'react';
import { BiometricsService } from '../services/biometricsService';
import { Fingerprint } from 'lucide-react';

interface FingerprintOverlayProps {
    onSuccess: () => void;
    onFail: () => void;
    isActive: boolean;
}

export default function FingerprintOverlay({ onSuccess, onFail, isActive }: FingerprintOverlayProps) {
    const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAIL'>('IDLE');

    useEffect(() => {
        if (isActive && scanState === 'IDLE') {
            triggerScan();
        }
    }, [isActive]);

    const triggerScan = async () => {
        setScanState('SCANNING');
        try {
            await BiometricsService.authenticate();
            setScanState('SUCCESS');
            setTimeout(onSuccess, 1500); 
        } catch (error) {
            setScanState('FAIL');
            setTimeout(() => {
                setScanState('IDLE');
                onFail();
            }, 2000);
        }
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-50 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-xl rounded-[32px] sm:rounded-none flex flex-col items-center justify-center border border-white/20">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-10 tracking-wide">
                {scanState === 'SCANNING' ? 'ضع إصبعك على المستشعر...' : scanState === 'SUCCESS' ? 'مرحباً بعودتك' : scanState === 'FAIL' ? 'فشل التعرف' : 'مستعد'}
            </h3>

            <div className="relative w-32 h-32 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 ${
                    scanState === 'SCANNING' ? 'border-medical-teal border-t-transparent animate-spin' : 
                    scanState === 'SUCCESS' ? 'border-emerald-500 scale-110 transition-transform duration-500' : 'border-slate-300 dark:border-slate-700'
                }`}></div>

                {scanState === 'SCANNING' && (
                    <div className="absolute inset-0 bg-medical-teal/20 rounded-full animate-ping"></div>
                )}

                <Fingerprint className={`w-16 h-16 transition-all duration-500 relative z-10 ${
                    scanState === 'SUCCESS' ? 'text-emerald-500' :
                    scanState === 'FAIL' ? 'text-red-500' :
                    'text-medical-teal'
                }`} strokeWidth={1} />
            </div>
            
            <p className="mt-12 text-sm font-mono tracking-widest text-slate-400">TOUCH_ID PROTOCOL</p>
        </div>
    );
}

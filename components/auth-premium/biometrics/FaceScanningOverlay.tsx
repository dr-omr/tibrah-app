import React, { useEffect, useState } from 'react';
import { BiometricsService, BiometricAvailability } from '../services/biometricsService';
import { ScanFace } from 'lucide-react';

interface FaceScanningOverlayProps {
    onSuccess: () => void;
    onFail: () => void;
    isActive: boolean;
}

export default function FaceScanningOverlay({ onSuccess, onFail, isActive }: FaceScanningOverlayProps) {
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
            setTimeout(onSuccess, 1500); // Allow success animation
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
        <div className="absolute inset-0 z-50 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-xl rounded-[32px] sm:rounded-none flex flex-col items-center justify-center border border-white/20 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-8 tracking-wide">
                {scanState === 'SCANNING' ? 'جاري مطابقة الهوية...' : scanState === 'SUCCESS' ? 'تم التحقق' : scanState === 'FAIL' ? 'فشل التحقق' : 'مستعد'}
            </h3>

            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Scanner Frame */}
                <div className="absolute inset-0 border-2 border-slate-300 dark:border-slate-700 rounded-3xl opacity-30"></div>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-medical-teal rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-medical-teal rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-medical-teal rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-medical-teal rounded-br-3xl"></div>

                <ScanFace className={`w-20 h-20 transition-all duration-500 ${
                    scanState === 'SUCCESS' ? 'text-emerald-500 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                    scanState === 'FAIL' ? 'text-red-500 scale-95' :
                    'text-medical-teal'
                }`} />

                {scanState === 'SCANNING' && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-medical-teal shadow-[0_0_8px_#358B7E] animate-[scan_2s_ease-in-out_infinite_alternate]" style={{
                        animation: 'scanLine 2s ease-in-out infinite alternate'
                    }}></div>
                )}
            </div>
            
            <p className="mt-8 text-sm font-mono tracking-widest text-slate-400">FACE_ID PROTOCOL</p>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scanLine {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(160px); }
                }
            `}} />
        </div>
    );
}

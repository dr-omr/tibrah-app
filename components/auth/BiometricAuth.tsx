import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScanFace } from 'lucide-react';

interface BiometricAuthProps {
    isAvailable: boolean;
    loading: boolean;
    onBiometricLogin: () => void;
}

export default function BiometricAuth({ isAvailable, loading, onBiometricLogin }: BiometricAuthProps) {
    if (!isAvailable) return null;

    return (
        <div className="relative group">
            {/* The Radar Sweep Animation */}
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl bg-emerald-500 blur-md pointer-events-none group-hover:bg-emerald-400 group-hover:blur-lg transition-all"
            />
            
            <Button
                type="button"
                onClick={onBiometricLogin}
                disabled={loading}
                variant="outline"
                className="relative z-10 w-[64px] h-[64px] rounded-2xl p-0 bg-black/40 backdrop-blur-md border border-white/10 hover:border-emerald-400/60 hover:bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
                title="المصادقة الحيوية"
            >
                {/* Glowing Specular */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                {loading ? (
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                ) : (
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ScanFace className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    </motion.div>
                )}
            </Button>
        </div>
    );
}

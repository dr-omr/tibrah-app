import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Watch, Heart, Footprints, Wind, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WearablesSync() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Simulated Live Data
    const [liveStats, setLiveStats] = useState({ hr: 0, steps: 0, spo2: 0 });

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate Apple Health / Google Fit connection delay
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
            toast.success('تم ربط ساعتك الذكية بنجاح!');
            startSyncing();
        }, 2500);
    };

    const startSyncing = () => {
        setIsSyncing(true);
        // Simulate pulling data sequentially
        setTimeout(() => setLiveStats(s => ({ ...s, hr: 72 })), 800);
        setTimeout(() => setLiveStats(s => ({ ...s, spo2: 98 })), 1600);
        setTimeout(() => setLiveStats(s => ({ ...s, steps: 6430 })), 2400);
        setTimeout(() => setIsSyncing(false), 3000);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            {/* Background glowing orb */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-colors duration-1000 ${isConnected ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`} />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <motion.div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isConnected ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30' : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'}`}
                        animate={{ scale: isConnecting || isSyncing ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: isConnecting || isSyncing ? Infinity : 0, duration: 1.5 }}
                    >
                        <Watch className={`w-8 h-8 ${isConnected ? 'text-white' : 'text-slate-400'}`} />
                    </motion.div>
                    
                    {/* Pulsing rings during sync */}
                    <AnimatePresence>
                        {(isConnecting || isSyncing) && (
                            <>
                                <motion.div 
                                    className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                                    initial={{ scale: 1, opacity: 1 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                />
                                <motion.div 
                                    className="absolute inset-0 rounded-2xl border-2 border-primary/30"
                                    initial={{ scale: 1, opacity: 1 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                />
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                    {isConnected ? 'Apple Watch متصلة' : 'الأجهزة القابلة للارتداء'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-[250px]">
                    {isConnected ? 'يتم جلب بياناتك الحيوية تلقائياً لدقة تشخيص أعلى' : 'اربط ساعتك الذكية لتتبع مؤشراتك الحيوية تلقائياً'}
                </p>

                {!isConnected ? (
                    <Button 
                        onClick={handleConnect} 
                        disabled={isConnecting}
                        className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold h-12 shadow-lg"
                    >
                        {isConnecting ? (
                            <>
                                <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                                جاري الاقتران...
                            </>
                        ) : (
                            <>
                                <Activity className="w-5 h-5 ml-2" />
                                ربط Apple Health / Google Fit
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="w-full space-y-3">
                        {/* Live Data Grid */}
                        <div className="grid grid-cols-3 gap-2 w-full">
                            <DataCard 
                                icon={<Heart className="w-4 h-4 text-rose-500" />} 
                                label="النبض" 
                                value={liveStats.hr} 
                                unit="bpm" 
                                isSyncing={isSyncing} 
                                delay={0}
                            />
                            <DataCard 
                                icon={<Footprints className="w-4 h-4 text-blue-500" />} 
                                label="الخطوات" 
                                value={liveStats.steps} 
                                unit="خطوة" 
                                isSyncing={isSyncing} 
                                delay={0.2}
                            />
                            <DataCard 
                                icon={<Wind className="w-4 h-4 text-cyan-500" />} 
                                label="الأكسجين" 
                                value={liveStats.spo2} 
                                unit="%" 
                                isSyncing={isSyncing} 
                                delay={0.4}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={startSyncing}
                            disabled={isSyncing}
                            className="w-full rounded-xl text-sm font-bold border-slate-200 dark:border-slate-700"
                        >
                            {isSyncing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin text-primary" /> : <RefreshCw className="w-4 h-4 ml-2 text-primary" />}
                            {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DataCard({ icon, label, value, unit, isSyncing, delay }: { icon: React.ReactNode, label: string, value: number, unit: string, isSyncing: boolean, delay: number }) {
    return (
        <motion.div 
            className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: value > 0 ? 1 : 0.5, y: 0 }}
            transition={{ duration: 0.4, delay: isSyncing && value === 0 ? delay : 0 }}
        >
            <div className="mb-1.5 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm">
                {icon}
            </div>
            {value === 0 ? (
                <div className="h-6 flex items-center justify-center">
                    <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                </div>
            ) : (
                <div className="text-base font-black text-slate-800 dark:text-white leading-none mb-0.5">
                    {value} <span className="text-[10px] font-medium text-slate-500">{unit}</span>
                </div>
            )}
            <div className="text-[10px] font-bold text-slate-400">{label}</div>
        </motion.div>
    );
}

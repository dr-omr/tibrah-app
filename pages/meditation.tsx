import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, Moon, Heart, Sparkles, Headphones } from 'lucide-react';
import { useRouter } from 'next/router';
import SEO from '@/components/common/SEO';
import { useAudio, Track } from '@/contexts/AudioContext';

const meditationTracks: Track[] = [
    {
        id: 'sleep-deep',
        title: 'نوم عميق وهادئ',
        description: 'ترددات الدلتا (4Hz) للمساعدة على الاسترخاء والدخول في نوم عميق بسرعة.',
        frequency_hz: 4, // 4Hz mapped as a tone for testing
        type: 'tone',
    },
    {
        id: 'anxiety-relief',
        title: 'تخفيف القلق والتوتر',
        description: 'ترددات ثيتا (432Hz) لتهدئة الجهاز العصبي واستعادة التوازن الداخلي.',
        frequency_hz: 432,
        type: 'tone',
    },
    {
        id: 'focus-boost',
        title: 'زيادة التركيز',
        description: 'ترددات بيتا (14Hz) لتنشيط الذهن خلال أوقات العمل والدراسة.',
        frequency_hz: 14,
        type: 'tone',
    },
    {
        id: 'solfeggio-528',
        title: 'تردد الشفاء 528Hz',
        description: 'تردد سولفيجيو المعروف بتردد الحب وإصلاح الـ DNA.',
        frequency_hz: 528,
        type: 'tone',
    }
];

export default function MeditationHub() {
    const router = useRouter();
    const { isPlaying, currentTrack, playTrack, togglePlay, setSleepTimer, sleepTimer } = useAudio();
    const [selectedCategory, setSelectedCategory] = useState<'sleep' | 'focus' | 'healing'>('sleep');

    // Determine if Sleep Mode UX should be active
    const isSleepMode = isPlaying && currentTrack?.id.includes('sleep');

    return (
        <div className="min-h-screen pb-32 transition-colors duration-1000" style={{ background: isSleepMode ? '#000000' : '#0f172a' }}>
            <SEO title="التأمل والتعافي — طِبرَا" description="منصتك الشاملة لجلسات التأمل والاسترخاء" />

            {/* Header */}
            <div className="sticky top-0 z-30 pt-4 pb-4 px-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-1000" style={{ background: isSleepMode ? 'rgba(0,0,0,0.8)' : 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <ChevronRight className={`w-5 h-5 ${isSleepMode ? 'text-white/30' : 'text-white/70'}`} />
                    </button>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isSleepMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.15)' }}>
                         <Headphones className={`w-5 h-5 ${isSleepMode ? 'text-indigo-900' : 'text-indigo-400'}`} />
                    </div>
                </div>
                
                <AnimatePresence mode="wait">
                    {!isSleepMode ? (
                        <motion.div key="normal-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h1 className="text-[22px] font-black tracking-tight text-white mb-1">التعافي الصوتي</h1>
                            <p className="text-[12px] text-white/50 font-bold">جلسات مصممة لتهدئة العقل وشفاء الجسد</p>
                        </motion.div>
                    ) : (
                        <motion.div key="sleep-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                             <h1 className="text-[16px] font-black tracking-widest text-[#1a1a1a] mb-1">وضع النوم العميق</h1>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-4 pt-6 space-y-6">
                
                {/* Visualizer (Shows only when Sleep Mode is active) */}
                <AnimatePresence>
                    {isSleepMode && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                             <motion.div 
                                 animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                 className="w-48 h-48 rounded-full bg-indigo-900/40 blur-3xl absolute"
                             />
                             <Moon className="w-16 h-16 text-[#1a1a1a] relative z-10" />
                             <p className="mt-8 text-xs font-bold text-[#333] tracking-[0.2em] relative z-10 uppercase">{currentTrack?.title}</p>
                             
                             {/* Minimal Sleep Controls embedded in page */}
                             <div className="mt-12 flex items-center gap-6 relative z-10">
                                 <button onClick={() => setSleepTimer(15)} className={`text-[10px] font-black tracking-widest px-4 py-2 rounded-full border ${sleepTimer === 15 ? 'border-indigo-900 text-indigo-900 bg-indigo-900/10' : 'border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#111]'}`}>15m</button>
                                 <button onClick={() => setSleepTimer(30)} className={`text-[10px] font-black tracking-widest px-4 py-2 rounded-full border ${sleepTimer === 30 ? 'border-indigo-900 text-indigo-900 bg-indigo-900/10' : 'border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#111]'}`}>30m</button>
                                 <button onClick={() => setSleepTimer(60)} className={`text-[10px] font-black tracking-widest px-4 py-2 rounded-full border ${sleepTimer === 60 ? 'border-indigo-900 text-indigo-900 bg-indigo-900/10' : 'border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#111]'}`}>60m</button>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tracks Library */}
                {!isSleepMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Categories List */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            <button onClick={()=>setSelectedCategory('sleep')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'sleep' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/50 border border-white/5'}`}>النوم العميق</button>
                            <button onClick={()=>setSelectedCategory('healing')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'healing' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50 border border-white/5'}`}>استشفاء</button>
                            <button onClick={()=>setSelectedCategory('focus')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'focus' ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/50 border border-white/5'}`}>التركيز والعمل</button>
                        </div>

                        {meditationTracks.filter(t => 
                            (selectedCategory === 'sleep' && t.id.includes('sleep')) || 
                            (selectedCategory === 'healing' && (t.id.includes('relief') || t.id.includes('528'))) ||
                            (selectedCategory === 'focus' && t.id.includes('focus'))
                        ).map((track, idx) => {
                            const isCurrent = currentTrack?.id === track.id;
                            return (
                                <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 rounded-[20px] relative overflow-hidden group"
                                    style={{ background: isCurrent ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: isCurrent ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    {isCurrent && <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                                    
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                                            className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                                            style={{ background: isCurrent ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)' }}
                                        >
                                            {isCurrent && isPlaying ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-white/70'} fill-current pl-0.5`} />}
                                        </button>
                                        
                                        <div className="flex-1 min-w-0" onClick={() => !isCurrent && playTrack(track)}>
                                            <h3 className={`text-sm font-black truncate mb-1 ${isCurrent ? 'text-indigo-100' : 'text-white'}`}>{track.title}</h3>
                                            <p className="text-[11px] font-semibold text-white/50 leading-relaxed max-w-[95%]">{track.description}</p>
                                        </div>
                                    </div>
                                    
                                    {isCurrent && isPlaying && (
                                        <div className="mt-4 flex items-center justify-between border-t border-indigo-500/20 pt-3">
                                            <div className="flex items-end gap-1 h-3">
                                                <motion.div animate={{ height: ['40%', '100%', '30%'] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 bg-indigo-400 rounded-full" />
                                                <motion.div animate={{ height: ['80%', '20%', '100%'] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }} className="w-1 bg-indigo-400 rounded-full" />
                                                <motion.div animate={{ height: ['30%', '90%', '50%'] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="w-1 bg-indigo-400 rounded-full" />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">جاري التشغيل</span>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

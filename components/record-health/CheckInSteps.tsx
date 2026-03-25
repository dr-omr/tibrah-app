import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Moon, Stethoscope, FileText } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

export const MoodStep = ({ mood, setMood, moods }: any) => (
    <motion.div
        key="mood"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
    >
        <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(139,92,246,0.15)' }}>
                <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">كيف مزاجك اليوم؟</h2>
            <p className="text-sm text-white/40 font-semibold">اختر الوجه الأقرب لحالتك</p>
        </div>

        <div className="flex justify-between gap-2 px-2">
            {moods.map((m: any, i: number) => (
                <motion.button
                    key={m.value}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { setMood(m.value); haptic.selection(); }}
                    className="flex flex-col items-center gap-2 py-4 px-1 rounded-2xl transition-all flex-1"
                    style={{
                        background: mood === m.value ? m.gradient : 'rgba(255,255,255,0.04)',
                        border: mood === m.value ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: mood === m.value ? `0 8px 24px ${m.color}40` : 'none',
                    }}
                >
                    <motion.span
                        className="text-3xl"
                        animate={mood === m.value ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {m.emoji}
                    </motion.span>
                    <span className={`text-[10px] font-black ${mood === m.value ? 'text-white' : 'text-white/40'}`}>
                        {m.label}
                    </span>
                </motion.button>
            ))}
        </div>
    </motion.div>
);

export const EnergyStep = ({ energy, setEnergy, energyLevels }: any) => (
    <motion.div
        key="energy"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
    >
        <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <Zap className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">ما مستوى طاقتك؟</h2>
            <p className="text-sm text-white/40 font-semibold">اختر المستوى المناسب</p>
        </div>

        <div className="space-y-2.5">
            {energyLevels.map((e: any, i: number) => (
                <motion.button
                    key={e.value}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setEnergy(e.value); haptic.selection(); }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all"
                    style={{
                        background: energy === e.value ? `${e.color}15` : 'rgba(255,255,255,0.03)',
                        border: energy === e.value ? `2px solid ${e.color}50` : '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    <span className="text-xl">{e.emoji}</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${e.pct}%` }}
                            transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: e.color }}
                        />
                    </div>
                    <span className={`text-xs font-black w-20 text-left ${energy === e.value ? 'text-white' : 'text-white/40'}`}>
                        {e.label}
                    </span>
                </motion.button>
            ))}
        </div>
    </motion.div>
);

export const SleepStep = ({ sleepQuality, setSleepQuality, sleepHours, setSleepHours, sleepQualities }: any) => (
    <motion.div
        key="sleep"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
    >
        <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Moon className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">كيف كان نومك؟</h2>
            <p className="text-sm text-white/40 font-semibold">جودة نومك الليلة الماضية</p>
        </div>

        <div className="flex justify-between gap-2 px-2 mb-8">
            {sleepQualities.map((s: any, i: number) => (
                <motion.button
                    key={s.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { setSleepQuality(s.value); haptic.selection(); }}
                    className="flex flex-col items-center gap-2 py-4 px-1 rounded-2xl transition-all flex-1"
                    style={{
                        background: sleepQuality === s.value ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                        border: sleepQuality === s.value ? `2px solid ${s.color}50` : '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className={`text-[10px] font-black ${sleepQuality === s.value ? 'text-white' : 'text-white/40'}`}>
                        {s.label}
                    </span>
                </motion.button>
            ))}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50 font-bold">عدد ساعات النوم</span>
                <span className="text-2xl font-black text-white">{sleepHours}<span className="text-sm text-white/40 mr-1">ساعة</span></span>
            </div>
            <input
                type="range"
                min="1"
                max="14"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to left, #6366f1 ${((sleepHours - 1) / 13) * 100}%, rgba(255,255,255,0.1) ${((sleepHours - 1) / 13) * 100}%)`,
                }}
            />
            <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/30 font-bold">1h</span>
                <span className="text-[10px] text-white/30 font-bold">14h</span>
            </div>
        </div>
    </motion.div>
);

export const SymptomsStep = ({ selectedSymptoms, toggleSymptom, commonSymptoms }: any) => (
    <motion.div
        key="symptoms"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
    >
        <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Stethoscope className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">هل تعاني من أعراض؟</h2>
            <p className="text-sm text-white/40 font-semibold">اختر الأعراض التي تشعر بها (اختياري)</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
            {commonSymptoms.map((symptom: any, i: number) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                    <motion.button
                        key={symptom.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleSymptom(symptom.id)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all"
                        style={{
                            background: isSelected ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '2px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <span className="text-lg">{symptom.emoji}</span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-red-300' : 'text-white/40'}`}>
                            {symptom.label}
                        </span>
                    </motion.button>
                );
            })}
        </div>

        {selectedSymptoms.length === 0 && (
            <p className="text-center text-[11px] text-white/25 font-semibold mt-4">
                لا توجد أعراض؟ ممتاز! اضغط التالي ←
            </p>
        )}
    </motion.div>
);

export const NotesStep = ({ notes, setNotes, gratitude, setGratitude }: any) => (
    <motion.div
        key="notes"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
    >
        <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(13,148,136,0.15)' }}>
                <FileText className="w-7 h-7 text-teal-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">ملاحظات اليوم</h2>
            <p className="text-sm text-white/40 font-semibold">أي شيء تريد تسجيله (اختياري)</p>
        </div>

        <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="text-[11px] text-white/40 font-bold mb-2 block">📝 كيف كان يومك؟</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب أي ملاحظة عن يومك..."
                    className="w-full bg-transparent text-white text-[14px] font-semibold placeholder-white/20 resize-none focus:outline-none"
                    rows={3}
                    dir="rtl"
                />
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="text-[11px] text-white/40 font-bold mb-2 block">🙏 ممتن اليوم لـ</label>
                <textarea
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="ما الشيء الذي تشكر الله عليه اليوم؟"
                    className="w-full bg-transparent text-white text-[14px] font-semibold placeholder-white/20 resize-none focus:outline-none"
                    rows={2}
                    dir="rtl"
                />
            </div>
        </div>
    </motion.div>
);

import React, { useState } from 'react';
import { Sun, Moon, Battery, Smile, Brain, Plus, Save, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function JournalView({ onSubmitLog, onSubmitSymptom }: { onSubmitLog: (data: any) => void; onSubmitSymptom: (data: any) => void }) {
    const [activeSection, setActiveSection] = useState('checkin'); // checkin or symptom

    // Check-in State
    const [checkInData, setCheckInData] = useState({
        mood: 3,
        energy_level: 3,
        sleep_quality: 3,
        stress_level: 3,
        notes: ''
    });

    // Symptom State
    const [symptomData, setSymptomData] = useState({
        symptom: '',
        severity: 5,
        body_area: 'general',
        notes: ''
    });

    const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
    const energyEmojis = ['🪫', '🔋', '⚡', '💪', '🚀'];

    const handleCheckInSubmit = (e) => {
        e.preventDefault();
        onSubmitLog({ ...checkInData, date: new Date().toISOString().split('T')[0] });
    };

    const handleSymptomSubmit = (e) => {
        e.preventDefault();
        onSubmitSymptom({ ...symptomData, recorded_at: new Date().toISOString() });
        setSymptomData({ symptom: '', severity: 5, body_area: 'general', notes: '' }); // Reset
    };

    const RatingRow = ({ label, value, onChange, emojis, icon: Icon }: { label: string; value: number; onChange: (v: number) => void; emojis?: string[]; icon: any }) => (
        <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => onChange(r)}
                        className={`flex-1 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${value === r
                            ? 'bg-primary/10 text-primary ring-2 ring-primary scale-110'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                    >
                        {emojis ? emojis[r - 1] : r}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Toggle Type */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mx-4">
                <button
                    onClick={() => setActiveSection('checkin')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'checkin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                        }`}
                >
                    تسجيل يومي ☀️
                </button>
                <button
                    onClick={() => setActiveSection('symptom')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'symptom' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'
                        }`}
                >
                    عرض مرضي 🤒
                </button>
            </div>

            {activeSection === 'checkin' ? (
                <form onSubmit={handleCheckInSubmit} className="space-y-4 px-1">
                    <RatingRow
                        label="كيف هو مزاجك؟"
                        icon={Smile}
                        value={checkInData.mood}
                        onChange={v => setCheckInData({ ...checkInData, mood: v })}
                        emojis={moodEmojis}
                    />
                    <RatingRow
                        label="مستوى طاقتك؟"
                        icon={Battery}
                        value={checkInData.energy_level}
                        onChange={v => setCheckInData({ ...checkInData, energy_level: v })}
                        emojis={energyEmojis}
                    />
                    <RatingRow
                        label="جودة نومك؟"
                        icon={Moon}
                        value={checkInData.sleep_quality}
                        onChange={v => setCheckInData({ ...checkInData, sleep_quality: v })}
                    />

                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات (اختياري)</label>
                        <Textarea
                            value={checkInData.notes}
                            onChange={e => setCheckInData({ ...checkInData, notes: e.target.value })}
                            className="bg-slate-50 border-0 resize-none h-32 rounded-xl"
                            placeholder="اكتب هنا..."
                        />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-[#1E7A66] text-white font-bold text-lg shadow-lg shadow-primary/20">
                        حفظ التسجيل اليومي
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleSymptomSubmit} className="space-y-4 px-1">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">ما هو العرض؟</label>
                        <Input
                            value={symptomData.symptom}
                            onChange={e => setSymptomData({ ...symptomData, symptom: e.target.value })}
                            placeholder="مثال: صداع، غثيان..."
                            className="h-12 bg-slate-50 border-0 rounded-xl"
                            required
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                            {['صداع', 'إرهاق', 'غثيان', 'ألم ظهر', 'أرق'].map(s => (
                                <Badge
                                    key={s}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary hover:text-white py-1.5 px-3"
                                    onClick={() => setSymptomData({ ...symptomData, symptom: s })}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">الشدة: {symptomData.severity}/10</label>
                        <input
                            type="range"
                            min="1" max="10"
                            value={symptomData.severity}
                            onChange={e => setSymptomData({ ...symptomData, severity: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>خفيف</span>
                            <span>متوسط</span>
                            <span>شديد</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-lg shadow-red-500/20">
                        حفظ العرض
                    </Button>
                </form>
            )}
        </div>
    );
}
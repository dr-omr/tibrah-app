import React, { useState } from 'react';
import { Sun, Moon, Battery, Brain, Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

export default function DailyCheckIn({ open, onOpenChange, onSubmit }) {
    const [formData, setFormData] = useState({
        mood: 3,
        energy_level: 3,
        sleep_quality: 3,
        stress_level: 3,
        notes: ''
    });

    const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];
    const energyEmojis = ['🔋', '🪫', '⚡', '💪', '🚀'];

    const RatingSelector = ({ label, icon: Icon, value, onChange, emojis }) => (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-[#2D9B83]" />
                <span className="font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange(rating)}
                        className={`flex-1 py-3 rounded-xl text-2xl transition-all ${value === rating
                                ? 'bg-[#2D9B83] shadow-md scale-110'
                                : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                    >
                        {emojis ? emojis[rating - 1] : rating}
                    </button>
                ))}
            </div>
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            date: new Date().toISOString().split('T')[0]
        });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-right text-xl flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        تسجيل يومي
                    </SheetTitle>
                    <p className="text-sm text-slate-500 text-right">كيف حالك اليوم؟</p>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-2 pb-6">
                    <RatingSelector
                        label="الحالة المزاجية"
                        icon={Smile}
                        value={formData.mood}
                        onChange={(v) => setFormData({ ...formData, mood: v })}
                        emojis={moodEmojis}
                    />

                    <RatingSelector
                        label="مستوى الطاقة"
                        icon={Battery}
                        value={formData.energy_level}
                        onChange={(v) => setFormData({ ...formData, energy_level: v })}
                        emojis={energyEmojis}
                    />

                    <RatingSelector
                        label="جودة النوم"
                        icon={Moon}
                        value={formData.sleep_quality}
                        onChange={(v) => setFormData({ ...formData, sleep_quality: v })}
                    />

                    <RatingSelector
                        label="مستوى التوتر"
                        icon={Brain}
                        value={formData.stress_level}
                        onChange={(v) => setFormData({ ...formData, stress_level: v })}
                    />

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات اليوم</label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="كيف كان يومك؟ أي شيء تريد تسجيله..."
                            className="rounded-xl"
                            rows={4}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-xl gradient-primary text-white text-lg font-bold mt-6"
                    >
                        حفظ التسجيل اليومي
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SymptomLogger({ open, onOpenChange, onSubmit }) {
    const [formData, setFormData] = useState({
        symptom: '',
        severity: 5,
        body_area: '',
        duration: '',
        triggers: [],
        notes: ''
    });

    const [triggerInput, setTriggerInput] = useState('');

    const bodyAreas = [
        { id: 'head', name: 'الرأس', icon: '🧠' },
        { id: 'chest', name: 'الصدر', icon: '🫁' },
        { id: 'stomach', name: 'البطن', icon: '🫃' },
        { id: 'back', name: 'الظهر', icon: '🔙' },
        { id: 'arms', name: 'الذراعين', icon: '💪' },
        { id: 'legs', name: 'الساقين', icon: '🦵' },
        { id: 'skin', name: 'الجلد', icon: '🖐️' },
        { id: 'general', name: 'عام', icon: '🧍' },
    ];

    const commonSymptoms = [
        'صداع', 'دوخة', 'غثيان', 'ألم بطن', 'إرهاق', 'أرق',
        'ألم مفاصل', 'حرقة معدة', 'ضيق تنفس', 'خفقان', 'حكة'
    ];

    const commonTriggers = [
        'طعام', 'توتر', 'قلة نوم', 'مجهود بدني', 'طقس', 'حساسية'
    ];

    const addTrigger = (trigger) => {
        if (trigger && !formData.triggers.includes(trigger)) {
            setFormData({ ...formData, triggers: [...formData.triggers, trigger] });
        }
        setTriggerInput('');
    };

    const removeTrigger = (trigger) => {
        setFormData({
            ...formData,
            triggers: formData.triggers.filter(t => t !== trigger)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            recorded_at: new Date().toISOString()
        });
        setFormData({ symptom: '', severity: 5, body_area: '', duration: '', triggers: [], notes: '' });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-[90vh] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-right text-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        تسجيل عرض جديد
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pb-6">
                    {/* Symptom */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">العرض</label>
                        <Input
                            value={formData.symptom}
                            onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                            placeholder="اكتب العرض..."
                            className="h-12 rounded-xl mb-2"
                            required
                        />
                        <div className="flex flex-wrap gap-2">
                            {commonSymptoms.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, symptom: s })}
                                    className={`px-3 py-1 rounded-full text-sm transition-all ${formData.symptom === s
                                            ? 'bg-[#2D9B83] text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            شدة العرض: <span className="text-[#2D9B83] font-bold">{formData.severity}/10</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2D9B83]"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>خفيف</span>
                            <span>متوسط</span>
                            <span>شديد</span>
                        </div>
                    </div>

                    {/* Body Area */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">منطقة الجسم</label>
                        <div className="grid grid-cols-4 gap-2">
                            {bodyAreas.map((area) => (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, body_area: area.id })}
                                    className={`p-3 rounded-xl text-center transition-all ${formData.body_area === area.id
                                            ? 'bg-[#2D9B83] text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span className="text-xl block mb-1">{area.icon}</span>
                                    <span className="text-xs">{area.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">مدة العرض</label>
                        <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="اختر المدة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minutes">دقائق</SelectItem>
                                <SelectItem value="hours">ساعات</SelectItem>
                                <SelectItem value="day">يوم كامل</SelectItem>
                                <SelectItem value="days">عدة أيام</SelectItem>
                                <SelectItem value="chronic">مزمن</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Triggers */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">المحفزات المحتملة</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.triggers.map((trigger) => (
                                <Badge
                                    key={trigger}
                                    className="bg-[#2D9B83] text-white cursor-pointer"
                                    onClick={() => removeTrigger(trigger)}
                                >
                                    {trigger} ✕
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {commonTriggers.filter(t => !formData.triggers.includes(t)).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => addTrigger(t)}
                                    className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200"
                                >
                                    + {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية</label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="أي تفاصيل إضافية..."
                            className="rounded-xl"
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-xl gradient-primary text-white text-lg font-bold"
                        disabled={!formData.symptom}
                    >
                        <Plus className="w-5 h-5 ml-2" />
                        حفظ العرض
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
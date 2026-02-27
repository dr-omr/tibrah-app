// components/meal-planner/HealthSettingsForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserHealthProfile, DailyGoals } from './types';

interface HealthSettingsFormProps {
    profile: UserHealthProfile;
    conditions: { id: string; nameAr: string }[];
    onSave: (profile: UserHealthProfile) => void;
}

export default function HealthSettingsForm({ profile, conditions, onSave }: HealthSettingsFormProps) {
    const [goals, setGoals] = useState(profile.goals);
    const [selectedConditions, setSelectedConditions] = useState<string[]>(profile.conditions);

    const toggleCondition = (id: string) => {
        setSelectedConditions(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="py-4 space-y-6">
            {/* Daily Goals */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">الأهداف اليومية</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'calories', label: 'السعرات', icon: Flame },
                        { key: 'protein', label: 'البروتين (غ)', icon: Beef },
                        { key: 'carbs', label: 'الكربو (غ)', icon: Wheat },
                        { key: 'fat', label: 'الدهون (غ)', icon: Droplets },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.key}>
                                <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                    <Icon className="w-3 h-3" />
                                    {item.label}
                                </label>
                                <Input
                                    type="number"
                                    value={goals[item.key as keyof DailyGoals]}
                                    onChange={(e) => setGoals({ ...goals, [item.key]: Number(e.target.value) })}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Health Conditions */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">الحالات الصحية</h3>
                <p className="text-sm text-slate-500 mb-3">سنقوم بتصفية الأطعمة غير المناسبة</p>
                <div className="space-y-2">
                    {conditions.map((condition) => (
                        <motion.button
                            key={condition.id}
                            className={`w-full flex items-center justify-between p-3 rounded-xl ${selectedConditions.includes(condition.id)
                                ? 'bg-emerald-100 border-2 border-emerald-500'
                                : 'bg-slate-50 border-2 border-transparent'
                                }`}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCondition(condition.id)}
                        >
                            <span className="font-medium">{condition.nameAr}</span>
                            {selectedConditions.includes(condition.id) && (
                                <Check className="w-5 h-5 text-emerald-600" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <motion.button
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl"
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave({ ...profile, goals, conditions: selectedConditions })}
            >
                حفظ الإعدادات
            </motion.button>
        </div>
    );
}

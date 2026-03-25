// components/booking/DateTimeSelectionStep.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface DateTimeSelectionStepProps {
    formData: any;
    setFormData: (data: any) => void;
    timeSlots: string[];
    onNext: () => void;
    onBack: () => void;
}

export default function DateTimeSelectionStep({ 
    formData, 
    setFormData, 
    timeSlots, 
    onNext, 
    onBack 
}: DateTimeSelectionStepProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">اختر الموعد</h2>
                <p className="text-slate-500 dark:text-slate-400">حدد التاريخ والوقت المناسب</p>
            </div>

            {/* Calendar */}
            <div className="glass rounded-2xl p-4">
                <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate < today ||
                            date.getDay() === 5 ||
                            date > addDays(new Date(), 14);
                    }}
                    className="mx-auto"
                />
            </div>

            {/* Time Slots */}
            {formData.date && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-3">الأوقات المتاحة</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setFormData({ ...formData, time_slot: slot })}
                                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-300 ${formData.time_slot === slot
                                    ? 'gradient-primary text-white shadow-md'
                                    : 'glass hover:bg-primary/10'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 h-14 rounded-2xl"
                >
                    السابق
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!formData.date || !formData.time_slot}
                    className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                >
                    التالي
                </Button>
            </div>
        </motion.div>
    );
}

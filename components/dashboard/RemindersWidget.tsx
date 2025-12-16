import React, { useState } from 'react';
import {
    Bell, Plus, Clock, Pill, Calendar, Droplets,
    Dumbbell, Check, X, ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function RemindersWidget({ reminders = [] }) {
    const [showSheet, setShowSheet] = useState(false);

    const sampleReminders = reminders.length > 0 ? reminders : [
        { id: 1, title: 'فيتامين د', type: 'supplement', time: '08:00', is_active: true },
        { id: 2, title: 'أوميغا ٣', type: 'supplement', time: '08:00', is_active: true },
        { id: 3, title: 'المغنيسيوم', type: 'supplement', time: '21:00', is_active: true },
        { id: 4, title: 'شرب ٨ أكواب ماء', type: 'water', time: '09:00', is_active: true },
        { id: 5, title: 'المشي الصباحي', type: 'exercise', time: '06:30', is_active: false },
        { id: 6, title: 'جلسة المتابعة', type: 'appointment', time: '16:00', is_active: true, notes: 'الأربعاء القادم' },
    ];

    const typeConfig = {
        supplement: { icon: Pill, color: 'bg-purple-500', label: 'مكمل' },
        medication: { icon: Pill, color: 'bg-red-500', label: 'دواء' },
        appointment: { icon: Calendar, color: 'bg-blue-500', label: 'موعد' },
        water: { icon: Droplets, color: 'bg-cyan-500', label: 'ماء' },
        exercise: { icon: Dumbbell, color: 'bg-orange-500', label: 'رياضة' },
        frequency: { icon: Bell, color: 'bg-violet-500', label: 'ترددات' },
        custom: { icon: Bell, color: 'bg-slate-500', label: 'مخصص' },
    };

    const upcomingReminders = sampleReminders
        .filter(r => r.is_active)
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3);

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const period = h >= 12 ? 'م' : 'ص';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${displayHour}:${minutes} ${period}`;
    };

    return (
        <div className="glass rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">التذكيرات</h3>
                        <p className="text-sm text-slate-500">
                            {sampleReminders.filter(r => r.is_active).length} تذكير نشط
                        </p>
                    </div>
                </div>

                <Sheet open={showSheet} onOpenChange={setShowSheet}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-[#2D9B83]">
                            إدارة
                            <ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle className="text-right">إدارة التذكيرات</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                            <Button className="w-full gradient-primary rounded-xl">
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة تذكير جديد
                            </Button>

                            <div className="space-y-3">
                                {sampleReminders.map((reminder) => {
                                    const config = typeConfig[reminder.type] || typeConfig.custom;
                                    const Icon = config.icon;

                                    return (
                                        <div
                                            key={reminder.id}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{reminder.title}</p>
                                                    <p className="text-sm text-slate-500">{formatTime(reminder.time)}</p>
                                                </div>
                                            </div>
                                            <Switch checked={reminder.is_active} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Upcoming Reminders */}
            <div className="space-y-3">
                {upcomingReminders.map((reminder) => {
                    const config = typeConfig[reminder.type] || typeConfig.custom;
                    const Icon = config.icon;

                    return (
                        <div
                            key={reminder.id}
                            className="flex items-center gap-3 bg-white/50 rounded-xl p-3 border border-slate-100"
                        >
                            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 truncate">{reminder.title}</p>
                                {reminder.notes && (
                                    <p className="text-xs text-slate-500 truncate">{reminder.notes}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{formatTime(reminder.time)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Action */}
            <Button
                variant="outline"
                className="w-full mt-4 rounded-xl border-dashed border-slate-300 text-slate-500 hover:border-[#2D9B83] hover:text-[#2D9B83]"
            >
                <Plus className="w-4 h-4 ml-2" />
                إضافة تذكير سريع
            </Button>
        </div>
    );
}
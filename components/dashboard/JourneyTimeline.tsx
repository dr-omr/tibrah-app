import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';

const defaultEvents = [
    { id: 1, date: '٢٠٢٤/١/١٥', title: 'بدء الرحلة', description: 'الجلسة التشخيصية الأولى', completed: true },
    { id: 2, date: '٢٠٢٤/١/٢٠', title: 'التحاليل', description: 'إجراء التحاليل الشاملة', completed: true },
    { id: 3, date: '٢٠٢٤/١/٢٥', title: 'بروتوكول الديتوكس', description: 'بدء برنامج التنظيف', completed: true },
    { id: 4, date: '٢٠٢٤/٢/١٠', title: 'المكملات', description: 'بدء المكملات الغذائية', completed: false, current: true },
    { id: 5, date: '٢٠٢٤/٣/١', title: 'إعادة التقييم', description: 'متابعة النتائج', completed: false },
];

export default function JourneyTimeline({ events = defaultEvents }) {
    return (
        <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">رحلتي العلاجية</h3>
                    <p className="text-sm text-slate-500">تتبع تقدمك</p>
                </div>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute right-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2D9B83] via-[#2D9B83]/50 to-slate-200" />

                <div className="space-y-6">
                    {events.map((event, index) => (
                        <div key={event.id || index} className="relative flex gap-4">
                            {/* Icon */}
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${event.completed
                                    ? 'gradient-primary'
                                    : event.current
                                        ? 'bg-white border-2 border-[#2D9B83] shadow-glow'
                                        : 'bg-slate-100'
                                }`}>
                                {event.completed ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <Circle className={`w-3 h-3 ${event.current ? 'text-[#2D9B83] fill-[#2D9B83]' : 'text-slate-300'}`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-2 ${event.current ? 'glass-dark rounded-xl p-3 -mt-1' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-semibold ${event.completed || event.current ? 'text-slate-800' : 'text-slate-400'
                                        }`}>
                                        {event.title}
                                    </h4>
                                    <span className="text-xs text-slate-400">{event.date}</span>
                                </div>
                                <p className={`text-sm ${event.completed || event.current ? 'text-slate-500' : 'text-slate-300'
                                    }`}>
                                    {event.description}
                                </p>
                                {event.current && (
                                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#2D9B83]/20 text-[#2D9B83]">
                                        جاري الآن
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
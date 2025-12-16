import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';

const defaultEvents = [
    { id: 1, title: 'بدء الرحلة', description: 'الجلسة التشخيصية الأولى', date: '١ يناير', completed: true },
    { id: 2, title: 'التحاليل', description: 'تحاليل شاملة للدم والهرمونات', date: '٥ يناير', completed: true },
    { id: 3, title: 'بدء الديتوكس', description: 'بروتوكول التخلص من السموم', date: '١٠ يناير', completed: true },
    { id: 4, title: 'متابعة أسبوعية', description: 'جلسة متابعة مع الطبيب', date: '١٧ يناير', completed: false, current: true },
    { id: 5, title: 'إعادة التقييم', description: 'تحاليل متابعة وتعديل البروتوكول', date: '٢٤ يناير', completed: false },
];

export default function HealthTimeline({ events = defaultEvents }) {
    return (
        <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">رحلتك العلاجية</h3>
                <span className="text-sm text-[#2D9B83] font-medium">٦٠٪ مكتمل</span>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2D9B83] via-[#3FB39A] to-slate-200" />

                <div className="space-y-6">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4">
                            {/* Icon */}
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${event.completed
                                    ? 'gradient-primary shadow-md'
                                    : event.current
                                        ? 'bg-[#D4AF37] shadow-md animate-pulse'
                                        : 'bg-slate-100'
                                }`}>
                                {event.completed ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : event.current ? (
                                    <Clock className="w-4 h-4 text-white" />
                                ) : (
                                    <Circle className="w-4 h-4 text-slate-300" />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-6 ${index === events.length - 1 ? 'pb-0' : ''}`}>
                                <div className={`p-4 rounded-2xl transition-all duration-300 ${event.current
                                        ? 'glass-dark shadow-glow'
                                        : event.completed
                                            ? 'bg-slate-50'
                                            : 'bg-slate-50/50'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className={`font-semibold ${event.current ? 'text-[#2D9B83]' : 'text-slate-700'
                                                }`}>
                                                {event.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                                        </div>
                                        <span className={`text-xs ${event.current ? 'text-[#D4AF37]' : 'text-slate-400'
                                            }`}>
                                            {event.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
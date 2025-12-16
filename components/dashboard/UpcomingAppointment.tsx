import React from 'react';
import { Calendar, Clock, Video, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function UpcomingAppointments({ appointments = [] }) {
    const defaultAppointment = {
        id: 1,
        type: 'followup',
        title: 'جلسة متابعة',
        date: '١٧ يناير ٢٠٢٥',
        time: '٤:٠٠ م',
        doctor: 'د. عمر العماد',
    };

    const displayAppointments = appointments.length > 0 ? appointments : [defaultAppointment];

    return (
        <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">المواعيد القادمة</h3>
                <Button variant="ghost" size="sm" className="text-[#2D9B83] text-sm">
                    عرض الكل
                    <ArrowLeft className="w-4 h-4 mr-1" />
                </Button>
            </div>

            <div className="space-y-4">
                {displayAppointments.map((appointment) => (
                    <div
                        key={appointment.id}
                        className="glass-dark rounded-2xl p-4 hover:shadow-glow transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                                <Video className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-800">{appointment.title}</h4>
                                <p className="text-sm text-slate-500">{appointment.doctor}</p>

                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4 text-[#2D9B83]" />
                                        <span>{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1 gradient-primary text-white rounded-xl">
                                <Video className="w-4 h-4 ml-2" />
                                انضم للجلسة
                            </Button>
                            <Button variant="outline" className="glass border-0 rounded-xl">
                                <MessageCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
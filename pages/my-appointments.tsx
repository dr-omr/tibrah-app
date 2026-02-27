import React from 'react';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Calendar, Clock, User, Phone,
    Mail, FileText, Check, X, Loader2, Plus,
    MessageCircle, Video
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sessionTypeLabels: Record<string, string> = {
    'diagnostic': 'جلسة تشخيصية',
    'followup': 'جلسة متابعة',
    'consultation': 'استشارة سريعة',
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    'pending': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'بانتظار التأكيد' },
    'confirmed': { bg: 'bg-green-100', text: 'text-green-700', label: 'مؤكد' },
    'completed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'مكتمل' },
    'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'ملغي' },
};

export default function MyAppointments() {
    const { data: appointments = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['my-appointments'],
        queryFn: () => db.entities.Appointment.list('-created_date'),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#2D9B83] animate-spin" />
                    <p className="text-slate-500">جاري تحميل المواعيد...</p>
                </div>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter(
        (apt: any) => apt.status === 'pending' || apt.status === 'confirmed'
    );
    const pastAppointments = appointments.filter(
        (apt: any) => apt.status === 'completed' || apt.status === 'cancelled'
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link href={createPageUrl('Profile')}>
                        <Button size="icon" variant="ghost">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">مواعيدي</h1>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                        <div className="text-2xl font-bold text-[#2D9B83]">{upcomingAppointments.length}</div>
                        <div className="text-xs text-slate-500 mt-1">قادمة</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                        <div className="text-2xl font-bold text-blue-500">
                            {pastAppointments.filter((a: any) => a.status === 'completed').length}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">مكتملة</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                        <div className="text-2xl font-bold text-slate-400">{appointments.length}</div>
                        <div className="text-xs text-slate-500 mt-1">الإجمالي</div>
                    </div>
                </div>

                {/* Book New Appointment Button */}
                <Link href={createPageUrl('BookAppointment')}>
                    <Button className="w-full h-14 gradient-primary rounded-2xl text-lg font-bold">
                        <Plus className="w-5 h-5 ml-2" />
                        حجز موعد جديد
                    </Button>
                </Link>

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-white mb-3">المواعيد القادمة</h2>
                        <div className="space-y-3">
                            {upcomingAppointments.map((apt: any) => (
                                <AppointmentCard key={apt.id} appointment={apt} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-white mb-3">المواعيد السابقة</h2>
                        <div className="space-y-3">
                            {pastAppointments.map((apt: any) => (
                                <AppointmentCard key={apt.id} appointment={apt} isPast />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {appointments.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 mb-2">لا توجد مواعيد</h3>
                        <p className="text-slate-500 mb-6">لم تقم بحجز أي مواعيد بعد</p>
                        <Link href={createPageUrl('BookAppointment')}>
                            <Button className="gradient-primary rounded-xl px-8">
                                احجز موعدك الأول
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function AppointmentCard({ appointment, isPast = false }: { appointment: any; isPast?: boolean }) {
    const status = statusStyles[appointment.status] || statusStyles['pending'];
    const sessionLabel = sessionTypeLabels[appointment.session_type] || appointment.session_type;

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${isPast ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPast ? 'bg-slate-100' : 'bg-gradient-to-br from-[#2D9B83] to-[#3FB39A]'
                        }`}>
                        <Video className={`w-6 h-6 ${isPast ? 'text-slate-400' : 'text-white'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{sessionLabel}</h3>
                        <p className="text-sm text-slate-500">د. عمر العماد</p>
                    </div>
                </div>
                <Badge className={`${status.bg} ${status.text} border-0`}>
                    {status.label}
                </Badge>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{appointment.time_slot}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{appointment.patient_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span dir="ltr">{appointment.patient_phone}</span>
                </div>
            </div>

            {/* Health Concern */}
            {appointment.health_concern && (
                <div className="p-3 bg-slate-50 rounded-xl mb-4">
                    <p className="text-xs text-slate-400 mb-1">الشكوى الصحية</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{appointment.health_concern}</p>
                </div>
            )}

            {/* Actions */}
            {!isPast && appointment.status === 'confirmed' && (
                <a
                    href={`https://wa.me/967771447111?text=مرحباً، لدي موعد بتاريخ ${appointment.date}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <MessageCircle className="w-4 h-4 ml-2" />
                        تواصل عبر واتساب
                    </Button>
                </a>
            )}
        </div>
    );
}

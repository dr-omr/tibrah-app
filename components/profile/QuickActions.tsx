import React from 'react';
import { Bell, Calendar, Plus, MessageSquare, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

interface QuickActionsProps {
    notifications?: Array<{
        id: string;
        title: string;
        time: string;
        type: 'reminder' | 'message' | 'alert';
    }>;
    upcomingAppointment?: {
        date: string;
        time: string;
        doctor: string;
    } | null;
}

export default function QuickActions({ notifications = [], upcomingAppointment }: QuickActionsProps) {
    // Default notifications for demo
    const defaultNotifications = [
        { id: '1', title: 'تذكير: شرب الماء', time: 'قبل ساعة', type: 'reminder' as const },
        { id: '2', title: 'موعد قادم غداً', time: 'قبل ٣ ساعات', type: 'alert' as const },
        { id: '3', title: 'رسالة من الدكتور', time: 'أمس', type: 'message' as const },
    ];

    const displayNotifications = notifications.length > 0 ? notifications : defaultNotifications;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Bell className="w-4 h-4 text-blue-500" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
            case 'alert': return <Calendar className="w-4 h-4 text-amber-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 mb-4">إجراءات سريعة</h3>
                <div className="grid grid-cols-2 gap-2">
                    <Link href={createPageUrl('BookAppointment')}>
                        <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1 hover:bg-[#2D9B83]/5 hover:border-[#2D9B83]/20">
                            <Calendar className="w-5 h-5 text-[#2D9B83]" />
                            <span className="text-xs text-slate-600">حجز موعد</span>
                        </Button>
                    </Link>
                    <Link href={createPageUrl('HealthTracker')}>
                        <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1 hover:bg-[#2D9B83]/5 hover:border-[#2D9B83]/20">
                            <Plus className="w-5 h-5 text-[#2D9B83]" />
                            <span className="text-xs text-slate-600">تسجيل قياس</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Upcoming Appointment */}
            {upcomingAppointment && (
                <div className="bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">موعدك القادم</h3>
                        <Calendar className="w-5 h-5 text-white/70" />
                    </div>
                    <p className="text-white/90 font-medium">{upcomingAppointment.doctor}</p>
                    <p className="text-white/70 text-sm mt-1">
                        {upcomingAppointment.date} - {upcomingAppointment.time}
                    </p>
                    <Link href="/my-appointments">
                        <Button className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0">
                            تفاصيل الموعد
                        </Button>
                    </Link>
                </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">الإشعارات</h3>
                    <Badge variant="secondary" className="bg-[#2D9B83]/10 text-[#2D9B83]">
                        {displayNotifications.length}
                    </Badge>
                </div>
                <div className="space-y-3">
                    {displayNotifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{notification.title}</p>
                                <p className="text-xs text-slate-400">{notification.time}</p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        </div>
                    ))}
                </div>
                <Button variant="ghost" className="w-full mt-3 text-[#2D9B83] hover:bg-[#2D9B83]/5">
                    عرض الكل
                </Button>
            </div>

            {/* Program Progress Mini */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="font-bold text-slate-800 mb-3">برنامج ٢١ يوم</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">التقدم</span>
                    <span className="font-bold text-[#2D9B83]">اليوم ١٤</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] rounded-full transition-all duration-500" style={{ width: '66%' }} />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">٧ أيام متبقية</p>
            </div>
        </div>
    );
}

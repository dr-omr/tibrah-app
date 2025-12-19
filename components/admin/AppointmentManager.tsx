import React, { useState } from 'react';
import { Calendar, Clock, Check, X, Search, Filter, Phone, User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Appointment {
    id: string;
    patient_name: string;
    patient_phone?: string;
    date: string;
    time_slot?: string;
    status: string;
    session_type?: string;
    health_concern?: string;
    [key: string]: unknown;
}

interface AppointmentManagerProps {
    appointments: Appointment[];
    onUpdateStatus: (id: string, status: string) => void;
}

export default function AppointmentManager({ appointments, onUpdateStatus }: AppointmentManagerProps) {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAppointments = appointments.filter(apt => {
        const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
        const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.patient_phone?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="بحث باسم المريض أو الجوال..."
                        className="pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 ml-2" />
                            <SelectValue placeholder="تصفية حسب الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="pending">بانتظار التأكيد</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>لا توجد مواعيد مطابقة</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Date Box */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-20 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <span className="text-xs text-slate-500 font-medium">{apt.date?.split('-')[0]}</span>
                                    <span className="text-xl font-bold text-slate-800">{apt.date?.split('-')[2]}</span>
                                    <span className="text-xs text-slate-500">{apt.time_slot}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                {apt.patient_name}
                                                {apt.status === 'pending' && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {apt.patient_phone || '---'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <UserIcon className="w-3 h-3" /> {apt.session_type === 'diagnostic' ? 'جلسة تشخيصية' : apt.session_type}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={`
                                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                apt.status === 'pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                                    apt.status === 'completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                        'bg-red-100 text-red-700 hover:bg-red-200'}
                                        `}>
                                            {apt.status === 'pending' ? 'بانتظار التأكيد' :
                                                apt.status === 'confirmed' ? 'مؤكد' :
                                                    apt.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                        </Badge>
                                    </div>

                                    {apt.health_concern && (
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100">
                                            <span className="font-bold text-slate-900 block mb-1">الشكوى:</span>
                                            {apt.health_concern}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                        {apt.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => onUpdateStatus(apt.id, 'confirmed')} className="bg-green-600 hover:bg-green-700">
                                                    <Check className="w-4 h-4 ml-2" />
                                                    قبول وتأكيد
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => onUpdateStatus(apt.id, 'cancelled')} className="text-red-600 border-red-200 hover:bg-red-50">
                                                    <X className="w-4 h-4 ml-2" />
                                                    رفض
                                                </Button>
                                            </>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <Button size="sm" onClick={() => onUpdateStatus(apt.id, 'completed')} className="bg-blue-600 hover:bg-blue-700">
                                                <Check className="w-4 h-4 ml-2" />
                                                إكمال الجلسة
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => window.open(`https://wa.me/${apt.patient_phone}`, '_blank')}>
                                            <Phone className="w-4 h-4 ml-2" />
                                            مراسلة واتساب
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

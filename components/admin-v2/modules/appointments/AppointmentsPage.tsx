// components/admin-v2/modules/appointments/AppointmentsPage.tsx
// Interactive Appointment Calendar Dashboard

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, LayoutList, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useAdminAppointments, useAppointmentStatusMutation } from '../../hooks/useAdminData';
import useAuditLog from '../../hooks/useAuditLog';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminStatCard from '../../primitives/AdminStatCard';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import { StatusBadgeAuto } from '../../primitives/AdminStatusBadge';
import { StatGridSkeleton, TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import { Button } from '@/components/ui/button';

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading } = useAdminAppointments();
  const statusMutation = useAppointmentStatusMutation();
  const audit = useAuditLog();
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Computed Stats
  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'pending').length,
    confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
    completed: appointments.filter((a: any) => a.status === 'completed').length,
  }), [appointments]);

  const filters = [
    { id: 'all', label: 'الكل', count: appointments.length },
    { id: 'pending', label: 'قيد الانتظار', count: stats.pending },
    { id: 'confirmed', label: 'مؤكد', count: stats.confirmed },
    { id: 'completed', label: 'مكتمل', count: stats.completed },
    { id: 'cancelled', label: 'ملغي', count: appointments.filter((a: any) => a.status === 'cancelled').length },
  ];

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((a: any) => ((a.patient_name || '').toLowerCase().includes(s) || (a.phone || '').includes(s)));
    }
    if (statusFilter !== 'all') result = result.filter((a: any) => a.status === statusFilter);
    return result;
  }, [appointments, search, statusFilter]);

  const handleStatus = async (id: string, newStatus: string, oldStatus: string) => {
    await statusMutation.mutateAsync({ id, status: newStatus });
    audit.logStatusChange('appointments', 'appointment', id, `موعد #${id}`, oldStatus, newStatus);
  };

  // --- List View Setup ---
  const columns: Column<any>[] = [
    {
      key: 'patient_name', label: 'المريض', sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{row.patient_name || 'مريض'}</p>
            <p className="text-[10px] text-slate-400">{row.phone || ''}</p>
          </div>
        </div>
      ),
    },
    { key: 'date', label: 'التاريخ', sortable: true, render: (row) => <span className="text-xs text-slate-600 font-medium">{row.date}</span> },
    { key: 'time', label: 'الوقت', render: (row) => <span className="text-xs text-slate-500">{row.time}</span> },
    { key: 'type', label: 'النوع', render: (row) => <span className="text-xs text-slate-500">{row.type || 'استشارة'}</span> },
    { key: 'status', label: 'الحالة', render: (row) => <StatusBadgeAuto status={row.status || 'pending'} /> },
    {
      key: 'actions', label: 'إجراءات',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50 text-[10px]" onClick={() => handleStatus(row.id, 'confirmed', row.status)} disabled={statusMutation.isPending}>
                <CheckCircle className="w-3 h-3 ml-1" /> تأكيد
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-rose-500 hover:bg-rose-50 text-[10px]" onClick={() => handleStatus(row.id, 'cancelled', row.status)} disabled={statusMutation.isPending}>
                <XCircle className="w-3 h-3 ml-1" /> إلغاء
              </Button>
            </>
          )}
          {row.status === 'confirmed' && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600 hover:bg-blue-50 text-[10px]" onClick={() => handleStatus(row.id, 'completed', row.status)} disabled={statusMutation.isPending}>
              <CheckCircle className="w-3 h-3 ml-1" /> إتمام
            </Button>
          )}
        </div>
      ),
    },
  ];

  // --- Calendar Logic ---
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const getDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    let startDay = startDayOfMonth(year, month);
    
    // Adjust for RTL/Arabic (optional, but typical if Sunday is first day vs Monday)
    // Assuming Sunday is 0 and is the first column.
    
    const calendarDays = [];
    for (let i = 0; i < startDay; i++) calendarDays.push(null);
    for (let i = 1; i <= days; i++) calendarDays.push(new Date(year, month, i));
    
    return calendarDays;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Helper to format date to match standard representation for comparison
  const normalizeDateString = (d: Date | null) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredAppointments.forEach(app => {
      // Assuming app.date is parsable or in YYYY-MM-DD
      let rawDateStr = app.date;
      if (!rawDateStr && app.createdAt) rawDateStr = new Date(app.createdAt).toISOString().split('T')[0];
      
      try {
        const d = new Date(rawDateStr);
        if (!isNaN(d.getTime())) {
          const key = normalizeDateString(d);
          if (!map[key]) map[key] = [];
          map[key].push(app);
        }
      } catch (e) { }
    });
    return map;
  }, [filteredAppointments]);

  // Selected Day Appointments
  const selectedDayApps = useMemo(() => {
    if (!selectedDay) return [];
    return appointmentsByDate[normalizeDateString(selectedDay)] || [];
  }, [selectedDay, appointmentsByDate]);


  if (isLoading) {
    return <div className="space-y-6"><AdminPageHeader title="المواعيد" /><StatGridSkeleton count={4} /><TableSkeleton /></div>;
  }

  return (
    <div className="space-y-6 relative pb-10">
      <AdminPageHeader 
        title="إدارة المواعيد" 
        description="التحكم الكامل بجدولة المرضى وتتبع الأوقات بكفاءة" 
        icon={<CalendarIcon className="w-5 h-5 text-indigo-500" />} 
        action={
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> التقويم
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutList className="w-4 h-4" /> القائمة
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard title="كافة المواعيد" value={stats.total} icon={<CalendarIcon className="w-5 h-5" />} accentColor="#6366f1" />
        <AdminStatCard title="بانتظار التأكيد" value={stats.pending} icon={<Clock className="w-5 h-5" />} accentColor="#f59e0b" />
        <AdminStatCard title="مؤكدة (لم تتم)" value={stats.confirmed} icon={<CheckCircle className="w-5 h-5" />} accentColor="#3b82f6" />
        <AdminStatCard title="مكتملة بالكامل" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} accentColor="#10b981" />
      </div>

      <AdminFilterBar 
        searchValue={search} 
        onSearchChange={setSearch} 
        searchPlaceholder="بحث عن مريض..." 
        filters={filters} 
        activeFilter={statusFilter} 
        onFilterChange={setStatusFilter} 
      />

      {/* --- RENDER LIST OR CALENDAR --- */}
      {viewMode === 'list' ? (
        <AdminDataTable columns={columns} data={filteredAppointments} emptyIcon={<LayoutList className="w-6 h-6" />} emptyTitle="لا توجد مواعيد بهذا الفلتر" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800">
              {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"><ChevronRight className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {/* Weekdays Header */}
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
              <div key={day} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-500 border-b border-slate-100">{day}</div>
            ))}

            {/* Days */}
            {getDaysArray().map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="bg-white/50 min-h-[100px]" />;
              
              const dateStr = normalizeDateString(date);
              const dayApps = appointmentsByDate[dateStr] || [];
              const isToday = normalizeDateString(new Date()) === dateStr;
              
              return (
                <div 
                  key={dateStr}
                  onClick={() => setSelectedDay(date)}
                  className={`bg-white min-h-[100px] p-2 hover:bg-indigo-50/30 cursor-pointer transition-colors relative group border-b border-l border-slate-50
                    ${isToday ? 'ring-2 ring-inset ring-indigo-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                      ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 group-hover:bg-indigo-100'}`}>
                      {date.getDate()}
                    </span>
                    {dayApps.length > 0 && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                        {dayApps.length}
                      </span>
                    )}
                  </div>

                  {/* Tiny Event Badges */}
                  <div className="space-y-1">
                    {dayApps.slice(0, 3).map((app, i) => {
                      let color = 'bg-slate-500';
                      if (app.status === 'confirmed') color = 'bg-emerald-500';
                      if (app.status === 'pending') color = 'bg-amber-500';
                      if (app.status === 'cancelled') color = 'bg-rose-500';

                      return (
                        <div key={i} className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                          <span className="truncate text-slate-600 font-semibold" style={{ maxWidth: '100%' }}>
                            {app.patient_name || 'مريض'}
                          </span>
                        </div>
                      );
                    })}
                    {dayApps.length > 3 && (
                      <div className="text-[10px] font-bold text-slate-400 px-1">
                        + {dayApps.length - 3} المزيد
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SIDE DRAWER FOR DAY DETAILS --- */}
      {selectedDay && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedDay(null)} />
          <div className="fixed inset-y-0 left-0 w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-r border-slate-200 flex flex-col dir-rtl overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">مواعيد اليوم</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">{selectedDay.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedDayApps.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <CalendarIcon className="w-16 h-16 text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">لا توجد مواعيد في هذا اليوم</p>
                </div>
              ) : (
                selectedDayApps.map((app, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-500" /> {app.patient_name || 'مريض غير مسجل'}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-1 pr-6">{app.phone || 'لا يوجد هاتف'}</p>
                      </div>
                      <StatusBadgeAuto status={app.status || 'pending'} />
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex  items-center gap-4 text-xs font-semibold text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {app.time || 'يحدد لاحقاً'}</div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{app.type || 'استشارة'}</div>
                    </div>

                    {/* Quick Actions within panel */}
                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-bold" onClick={() => handleStatus(app.id, 'confirmed', app.status)}>تأكيد الموعد</Button>
                          <Button size="sm" variant="ghost" className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold" onClick={() => handleStatus(app.id, 'cancelled', app.status)}>إلغاء</Button>
                        </>
                      )}
                      {app.status === 'confirmed' && (
                        <Button size="sm" variant="ghost" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 text-xs font-bold" onClick={() => handleStatus(app.id, 'completed', app.status)}>تحديد كمكتمل</Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </>
      )}

    </div>
  );
}

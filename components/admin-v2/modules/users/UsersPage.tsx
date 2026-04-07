// components/admin-v2/modules/users/UsersPage.tsx
// Full user management with Advanced Patient Medical Files

import React, { useState, useMemo } from 'react';
import { Users, Mail, Phone, Shield, UserCheck, HeartPulse, Calendar, Activity, AlertCircle, Clock } from 'lucide-react';
import { useAdminUsers, useAdminAppointments, useAdminSymptomLogs } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminDetailDrawer from '../../primitives/AdminDetailDrawer';
import { StatusBadgeAuto } from '../../primitives/AdminStatusBadge';
import { StatGridSkeleton, TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import AdminStatCard from '../../primitives/AdminStatCard';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: appointments = [], isLoading: appsLoading } = useAdminAppointments();
  const { data: symptomLogs = [], isLoading: symptomsLoading } = useAdminSymptomLogs();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'appointments'>('info');

  const isLoading = usersLoading || appsLoading || symptomsLoading;

  // Stats
  const stats = useMemo(() => {
    const admins = users.filter((u: any) => u.role === 'admin');
    const verified = users.filter((u: any) => u.isVerified);
    return { total: users.length, admins: admins.length, verified: verified.length };
  }, [users]);

  // Filters
  const filters = [
    { id: 'all', label: 'الكل', count: users.length },
    { id: 'admin', label: 'مديرين', count: stats.admins },
    { id: 'user', label: 'مستخدمين', count: users.length - stats.admins },
  ];

  // Filtered data
  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((u: any) =>
        (u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.phone || '').includes(s)
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter((u: any) => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  // Specific User Clinical Data
  const userClinicalData = useMemo(() => {
    if (!selectedUser) return { apps: [], symptoms: [] };
    const id = selectedUser.id;
    return {
      apps: appointments.filter((a: any) => a.patient_id === id || a.user_id === id).sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      symptoms: symptomLogs.filter((s: any) => s.user_id === id).sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    };
  }, [selectedUser, appointments, symptomLogs]);

  // Columns for main table
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'المستخدم',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {(row.name || row.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{row.name || row.displayName || 'بدون اسم'}</p>
            <p className="text-[10px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'الهاتف',
      render: (row) => (
        <span className="text-sm text-slate-600 font-mono">{row.phone || '—'}</span>
      ),
    },
    {
      key: 'role',
      label: 'الدور',
      sortable: true,
      render: (row) => (
        <StatusBadgeAuto status={row.role === 'admin' ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ التسجيل',
      sortable: true,
      render: (row) => {
        try {
          const d = new Date(row.created_at || row.createdAt);
          return <span className="text-xs text-slate-500">{d.toLocaleDateString('ar-SA')}</span>;
        } catch { return <span className="text-xs text-slate-400">—</span>; }
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="إدارة المستخدمين" description="سجل المرضى والملفات الطبية الشاملة" />
        <StatGridSkeleton count={3} />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الملفات الطبية والمرضى"
        description="سجل شامل للمرضى وصلاحيات النظام والمؤشرات החيوية"
        icon={<HeartPulse className="w-5 h-5 text-rose-500" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard title="إجمالي الملفات" value={stats.total} icon={<Users className="w-5 h-5" />} accentColor="#3b82f6" />
        <AdminStatCard title="كادر الإدارة" value={stats.admins} icon={<Shield className="w-5 h-5" />} accentColor="#8b5cf6" />
        <AdminStatCard title="الحسابات המوثقة" value={stats.verified} icon={<UserCheck className="w-5 h-5" />} accentColor="#10b981" />
      </div>

      {/* Filters */}
      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث بالاسم أو البريد أو الهاتف للحصول في السجل..."
        filters={filters}
        activeFilter={roleFilter}
        onFilterChange={setRoleFilter}
      />

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          onRowClick={(row) => {
            setSelectedUser(row);
            setActiveTab('info');
          }}
          emptyTitle="لا يوجد سجلات"
          emptyDescription="لم يتم العثور على مستخدمين أو ملفات تطابق بحثك"
          emptyIcon={<Users className="w-6 h-6" />}
        />
      </div>

      {/* Advanced Clinical Detail Drawer */}
      <AdminDetailDrawer
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || selectedUser?.displayName || 'ملف المريض'}
        subtitle={`رقم السجل: ${selectedUser?.id?.substring(0, 8) || '---'}`}
      >
        {selectedUser && (
          <div className="flex flex-col h-full bg-slate-50/50 -mx-6 -mt-6">
            
            {/* Header Profile */}
            <div className="bg-white p-6 border-b border-slate-100 flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-indigo-200 mb-3">
                  {(selectedUser.name || selectedUser.email || '?').charAt(0).toUpperCase()}
                </div>
                {selectedUser.role === 'admin' && (
                  <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="مدير نظام">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{selectedUser.name || selectedUser.displayName || 'بدون اسم'}</h3>
              <p className="text-sm font-medium text-slate-400 font-mono">{selectedUser.email}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 bg-white border-b border-slate-100">
              <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<Users className="w-4 h-4" />} label="معلومات" />
              <TabButton active={activeTab === 'medical'} onClick={() => setActiveTab('medical')} icon={<Activity className="w-4 h-4" />} label="المؤشرات" badge={userClinicalData.symptoms.length} />
              <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar className="w-4 h-4" />} label="المواعيد" badge={userClinicalData.apps.length} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* TAB: Info */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">البيانات الأساسية</h4>
                  <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                    <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="البريد الإلكتروني" value={selectedUser.email} />
                    <InfoRow icon={<Phone className="w-4 h-4 text-green-500" />} label="رقم الهاتف" value={selectedUser.phone || 'غير مسجل'} />
                    <InfoRow icon={<Clock className="w-4 h-4 text-slate-400" />} label="تاريخ الانضمام" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('ar-SA') : 'غير متوفر'} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 mt-6">عناصر التحكم الإداري</h4>
                  <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm flex flex-col gap-3">
                    <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                      <Shield className="w-4 h-4 ml-2" /> ترقية المريض كمسؤول نظام
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700">
                      <AlertCircle className="w-4 h-4 ml-2" /> قييد/حظر الحساب
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB: Medical Records */}
              {activeTab === 'medical' && (
                <div className="space-y-4">
                  {userClinicalData.symptoms.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">لا يوجد سجلات أو مؤشرات طبية لهذا المريض</p>
                    </div>
                  ) : (
                    userClinicalData.symptoms.map((log: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">سجل أعراض</span>
                          <span className="text-[10px] font-semibold text-slate-400 font-mono">
                            {new Date(log.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {log.symptoms?.join('، ') || log.description || 'تم تسجيل حدث في هذا اليوم'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: Appointments */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {userClinicalData.apps.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">لم يقم المريض بحجز أي مواعيد مسبقاً</p>
                    </div>
                  ) : (
                    userClinicalData.apps.map((app: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-1">{app.type || 'استشارة طبية'}</p>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Calendar className="w-3 h-3" /> {app.date}
                            <Clock className="w-3 h-3 ml-1" /> {app.time}
                          </div>
                        </div>
                        <StatusBadgeAuto status={app.status || 'pending'} />
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </AdminDetailDrawer>
    </div>
  );
}

// Subcomponents
function TabButton({ active, onClick, icon, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-xs font-bold transition-all border-b-2 rounded-t-lg
        ${active ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'}`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

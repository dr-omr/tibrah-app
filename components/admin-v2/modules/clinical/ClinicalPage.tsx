// components/admin-v2/modules/clinical/ClinicalPage.tsx
// Clinical Intelligence Center — patient risk analysis and triage

import React, { useState, useMemo } from 'react';
import { Stethoscope, AlertTriangle, Activity, HeartPulse, TrendingUp, User } from 'lucide-react';
import { useAdminDailyLogs, useAdminUsers } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminStatCard from '../../primitives/AdminStatCard';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminDetailDrawer from '../../primitives/AdminDetailDrawer';
import AdminStatusBadge from '../../primitives/AdminStatusBadge';
import { StatGridSkeleton, TableSkeleton } from '../../primitives/AdminLoadingSkeleton';

// Risk computation engine (extracted)
function computeRiskScore(logs: any[]): { score: number; level: string; factors: string[] } {
  if (!logs || logs.length === 0) return { score: 0, level: 'low', factors: [] };

  const factors: string[] = [];
  let score = 0;

  // Low sleep
  const avgSleep = logs.reduce((s, l) => s + (l.sleep_hours || 7), 0) / logs.length;
  if (avgSleep < 5) { score += 30; factors.push('قلة النوم (أقل من 5 ساعات)'); }
  else if (avgSleep < 6) { score += 15; factors.push('نوم غير كافٍ'); }

  // Low mood
  const avgMood = logs.reduce((s, l) => s + (l.mood || 5), 0) / logs.length;
  if (avgMood < 3) { score += 25; factors.push('مزاج منخفض جداً'); }
  else if (avgMood < 4) { score += 12; factors.push('مزاج منخفض'); }

  // High stress
  const avgStress = logs.reduce((s, l) => s + (l.stress_level || 3), 0) / logs.length;
  if (avgStress > 7) { score += 25; factors.push('مستوى توتر مرتفع'); }
  else if (avgStress > 5) { score += 10; factors.push('توتر متوسط'); }

  // Low water
  const avgWater = logs.reduce((s, l) => s + (l.water_glasses || 4), 0) / logs.length;
  if (avgWater < 3) { score += 10; factors.push('ترطيب منخفض'); }

  // Symptoms
  const hasSymptoms = logs.some(l => l.symptoms && l.symptoms.length > 0);
  if (hasSymptoms) { score += 15; factors.push('أعراض مُبلّغ عنها'); }

  const level = score >= 60 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'moderate' : 'low';
  return { score: Math.min(score, 100), level, factors };
}

export default function ClinicalPage() {
  const { data: dailyLogs = [], isLoading: logsLoading } = useAdminDailyLogs();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const isLoading = logsLoading || usersLoading;

  // Group logs by user and compute risk
  const patientRisks = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    dailyLogs.forEach((log: any) => {
      const uid = log.user_id || 'anonymous';
      if (!grouped[uid]) grouped[uid] = [];
      grouped[uid].push(log);
    });

    return Object.entries(grouped).map(([userId, logs]) => {
      const user = users.find((u: any) => u.id === userId);
      const risk = computeRiskScore(logs.slice(0, 14)); // Last 14 entries
      const lastLog = logs[0];
      return {
        userId,
        name: user?.name || user?.displayName || 'مستخدم',
        email: user?.email || '',
        logsCount: logs.length,
        lastLogDate: lastLog?.date || lastLog?.created_at,
        lastMood: lastLog?.mood,
        lastSleep: lastLog?.sleep_hours,
        lastStress: lastLog?.stress_level,
        ...risk,
      };
    }).sort((a, b) => b.score - a.score);
  }, [dailyLogs, users]);

  // Stats
  const stats = useMemo(() => ({
    totalPatients: patientRisks.length,
    critical: patientRisks.filter(p => p.level === 'critical').length,
    high: patientRisks.filter(p => p.level === 'high').length,
    moderate: patientRisks.filter(p => p.level === 'moderate').length,
  }), [patientRisks]);

  const filters = [
    { id: 'all', label: 'الكل', count: patientRisks.length },
    { id: 'critical', label: '🔴 حرج', count: stats.critical },
    { id: 'high', label: '🟠 مرتفع', count: stats.high },
    { id: 'moderate', label: '🟡 متوسط', count: stats.moderate },
    { id: 'low', label: '🟢 مستقر', count: patientRisks.filter(p => p.level === 'low').length },
  ];

  const filteredPatients = useMemo(() => {
    let result = [...patientRisks];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s));
    }
    if (riskFilter !== 'all') result = result.filter(p => p.level === riskFilter);
    return result;
  }, [patientRisks, search, riskFilter]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'المريض',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
            row.level === 'critical' ? 'bg-red-500' :
            row.level === 'high' ? 'bg-orange-500' :
            row.level === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
          }`}>
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{row.name}</p>
            <p className="text-[10px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'درجة الخطورة',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.level === 'critical' ? 'bg-red-500' :
                row.level === 'high' ? 'bg-orange-500' :
                row.level === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${row.score}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600">{row.score}</span>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'المستوى',
      render: (row) => <AdminStatusBadge label={row.level === 'critical' ? 'حرج' : row.level === 'high' ? 'مرتفع' : row.level === 'moderate' ? 'متوسط' : 'مستقر'} variant={row.level === 'critical' || row.level === 'high' ? 'danger' : row.level === 'moderate' ? 'warning' : 'success'} />,
    },
    {
      key: 'logsCount',
      label: 'السجلات',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-500">{row.logsCount} سجل</span>,
    },
    {
      key: 'lastMood',
      label: 'آخر مزاج',
      render: (row) => <span className="text-sm">{row.lastMood ? '😊'.repeat(Math.min(row.lastMood, 5)) : '—'}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="الذكاء السريري" />
        <StatGridSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الذكاء السريري"
        description="تحليل المخاطر الصحية ومراقبة حالة المرضى"
        icon={<Stethoscope className="w-5 h-5 text-teal-600" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard title="إجمالي المرضى" value={stats.totalPatients} icon={<User className="w-5 h-5" />} accentColor="#2d9b83" />
        <AdminStatCard title="حالات حرجة" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} accentColor="#ef4444" />
        <AdminStatCard title="مخاطر مرتفعة" value={stats.high} icon={<TrendingUp className="w-5 h-5" />} accentColor="#f97316" />
        <AdminStatCard title="مخاطر متوسطة" value={stats.moderate} icon={<Activity className="w-5 h-5" />} accentColor="#f59e0b" />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث بالاسم أو البريد..."
        filters={filters}
        activeFilter={riskFilter}
        onFilterChange={setRiskFilter}
      />

      <AdminDataTable
        columns={columns}
        data={filteredPatients}
        onRowClick={(row) => setSelectedPatient(row)}
        emptyIcon={<HeartPulse className="w-6 h-6" />}
        emptyTitle="لا توجد بيانات سريرية"
        emptyDescription="لم يتم العثور على سجلات صحية"
      />

      {/* Patient Detail Drawer */}
      <AdminDetailDrawer
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient?.name || 'تفاصيل المريض'}
        subtitle={`درجة الخطورة: ${selectedPatient?.score || 0}/100`}
      >
        {selectedPatient && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 ${
                selectedPatient.level === 'critical' ? 'bg-red-500' :
                selectedPatient.level === 'high' ? 'bg-orange-500' :
                selectedPatient.level === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
              }`}>
                {selectedPatient.score}
              </div>
              <AdminStatusBadge
                label={selectedPatient.level === 'critical' ? 'حرج' : selectedPatient.level === 'high' ? 'مرتفع' : selectedPatient.level === 'moderate' ? 'متوسط' : 'مستقر'}
                variant={selectedPatient.level === 'critical' || selectedPatient.level === 'high' ? 'danger' : selectedPatient.level === 'moderate' ? 'warning' : 'success'}
              />
            </div>

            {/* Latest Vitals */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-2">آخر القراءات</h4>
              <div className="grid grid-cols-3 gap-2">
                <VitalBox label="المزاج" value={selectedPatient.lastMood || '—'} emoji="😊" />
                <VitalBox label="النوم" value={selectedPatient.lastSleep ? `${selectedPatient.lastSleep}h` : '—'} emoji="🌙" />
                <VitalBox label="التوتر" value={selectedPatient.lastStress || '—'} emoji="😰" />
              </div>
            </div>

            {/* Risk Factors */}
            {selectedPatient.factors?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-2">عوامل الخطر</h4>
                <div className="space-y-1.5">
                  {selectedPatient.factors.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-red-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDetailDrawer>
    </div>
  );
}

function VitalBox({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-xl">
      <span className="text-lg block mb-0.5">{emoji}</span>
      <p className="text-base font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
    </div>
  );
}

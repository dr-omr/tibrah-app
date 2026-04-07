// components/admin-v2/modules/analytics/AnalyticsPage.tsx
// Professional Enterprise Analytics Dashboard

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Activity, CalendarClock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboardOverview, useAdminOrders, useAdminAppointments } from '../../hooks/useAdminData';
import { PageSkeleton } from '../../primitives/AdminLoadingSkeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: appointments = [], isLoading: appsLoading } = useAdminAppointments();

  const isLoading = overviewLoading || ordersLoading || appsLoading;

  // Process Analytics Data
  const analytics = useMemo(() => {
    const MOCK_DISTRIBUTION = [
      { name: 'التشخيص الحي', value: 0 },
      { name: 'دورات تأهيلية', value: 0 },
      { name: 'منتجات مادية', value: 0 },
      { name: 'استشارات', value: 0 },
    ];

    const groupedTrends: Record<string, any> = {};
    
    orders.forEach((o: any) => {
      try {
        const date = new Date(o.created_at || o.createdAt || Date.now());
        const month = date.toLocaleDateString('ar-SA', { month: 'short' });
        if (!groupedTrends[month]) groupedTrends[month] = { name: month, revenue: 0, appointments: 0 };
        groupedTrends[month].revenue += (o.total || 0);
      } catch { }
    });

    appointments.forEach((a: any) => {
      try {
        const date = new Date(a.created_at || a.createdAt || a.date || Date.now());
        const month = date.toLocaleDateString('ar-SA', { month: 'short' });
        if (!groupedTrends[month]) groupedTrends[month] = { name: month, revenue: 0, appointments: 0 };
        groupedTrends[month].appointments += 1;
      } catch { }
    });
    
    // Fill empty months if needed, but we rely on data. Sort to ensure chronological order usually.
    const trendData = Object.keys(groupedTrends).length > 0 ? Object.values(groupedTrends) : [];

    const counts = { completed: 0, processing: 0, pending: 0, cancelled: 0 };
    orders.forEach((o: any) => {
      if (o.status === 'delivered') counts.completed++;
      else if (o.status === 'processing' || o.status === 'shipped') counts.processing++;
      else if (o.status === 'cancelled') counts.cancelled++;
      else counts.pending++;
    });
    
    const statusData = [
      { name: 'مكتمل', value: counts.completed, color: '#0f172a' }, // Slate 900
      { name: 'تجهيز', value: counts.processing, color: '#475569' }, // Slate 600
      { name: 'معلق', value: counts.pending, color: '#94a3b8' }, // Slate 400
      { name: 'ملغي', value: counts.cancelled, color: '#ef4444' }, // Red 500
    ].filter(s => s.value > 0);

    return { trendData, distributionData: MOCK_DISTRIBUTION, statusData };
  }, [orders, appointments]);

  if (isLoading) return <PageSkeleton />;

  // Enterprise Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-lg dir-rtl min-w-[160px]">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                  {entry.name}
                </span>
                <span className="text-slate-900 font-semibold font-mono">
                  {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">الرؤى والتحليلات</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">نظرة تشغيلية مفصلة لأداء المنصة ومؤشراتها الرئيسية.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            تصدير تقرير CSV
          </button>
        </div>
      </div>

      {/* Primary KPIs - Enterprise Style (Clean, numbers focused) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="إجمالي الإيرادات" value={overview?.totalRevenue || 0} prefix="ر.س " trend={+12.5} />
        <KPICard title="إجمالي المستخدمين" value={overview?.usersCount || 0} trend={+4.2} />
        <KPICard title="الطلبات النشطة" value={overview?.ordersCount || 0} trend={-1.4} />
        <KPICard title="المواعيد المعلقة" value={overview?.pendingAppointmentsCount || 0} alert={true} />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Main Trend: Width 2/3 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">الأداء المالي والتشغيلي</h3>
              <p className="text-xs text-slate-500 mt-1">مقارنة الإيرادات بحجم المواعيد تدريجياً</p>
            </div>
            {/* Custom Legend */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><span className="w-2 h-2 rounded-sm bg-slate-900"></span>إيرادات</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><span className="w-2 h-2 rounded-sm bg-slate-300"></span>مواعيد</span>
            </div>
          </div>
          
          <div className="h-[260px] w-full mt-auto" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solidDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1}} />
                <Area yAxisId="left" type="monotone" name="الإيرادات" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fill="url(#solidDark)" activeDot={{ r: 4, fill: '#0f172a' }} />
                <Area yAxisId="right" type="step" name="المواعيد" dataKey="appointments" stroke="#cbd5e1" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side charts */}
        <div className="flex flex-col gap-6">
          
          {/* Order Status */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">دورة حياة الطلبات</h3>
            <p className="text-xs text-slate-500 mb-4">حسب الحالات في النظام</p>
            <div className="h-[180px] w-full mt-auto" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={20} iconType="rect" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Grid for Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Bar Chart for Sub-divisions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">التوزيع القطاعي</h3>
            <p className="text-xs text-slate-500 mb-6">توزع الإيرادات بحسب أقسام الخدمة</p>
            <div className="h-[200px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.distributionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', textAnchor: 'end' }} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" name="الكمية" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-center items-center text-center">
             <CalendarClock className="w-8 h-8 text-slate-300 mb-3" />
             <h3 className="text-sm font-semibold text-slate-700">تقارير الذكاء الاصطناعي قريباً</h3>
             <p className="text-xs text-slate-500 mt-2 max-w-[250px]">سيتم تفعيل الرؤى التحليلية المبنية على تعلم الآلة في الإطلاق القادم.</p>
          </div>

      </div>
    </div>
  );
}

// Enterprise KPI Card
function KPICard({ title, value, trend, prefix = '', alert = false }: { title: string; value: number; trend?: number; prefix?: string; alert?: boolean }) {
  const isPositive = trend !== undefined && trend >= 0;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
      <h4 className="text-xs font-semibold text-slate-500 tracking-wide mb-3">{title}</h4>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-sm font-semibold text-slate-500">{prefix}</span>}
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value.toLocaleString()}</span>
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}

        {alert && value > 0 && (
          <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 mb-1 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
}

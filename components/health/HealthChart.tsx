import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface HealthData {
  date: string; // ISO string 'YYYY-MM-DD'
  mood?: number;
  energy_level?: number;
  sleep_hours?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="rounded-xl p-3 border border-white/10 shadow-2xl backdrop-blur-md"
        style={{ background: 'rgba(15, 23, 42, 0.85)' }}
      >
        <p className="text-white/80 text-[11px] font-bold mb-2">
           {label && format(parseISO(label), 'EEEE, d MMM', { locale: ar })}
        </p>
        <div className="space-y-1.5">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[12px] font-semibold text-white/90">
                        {entry.name}: <span className="font-black">{entry.value}</span>
                    </span>
                </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function HealthChart({ data }: { data: HealthData[] }) {
    
    // Sort and format data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return [...data]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-14); // Last 14 days
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center rounded-2xl border border-white/5 bg-white/5">
                <p className="text-xs text-white/40 font-bold">لا توجد بيانات كافية للرسم البياني</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-56 rounded-3xl p-4 relative overflow-hidden"
            style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
            }}
        >
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-black text-white">تحليل الـ 14 يوماً الماضية</h3>
               <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                       <span className="text-[10px] font-bold text-white/50">المزاج</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                       <span className="text-[10px] font-bold text-white/50">الطاقة</span>
                   </div>
               </div>
            </div>

            <div className="h-36 w-full absolute bottom-2 left-0 right-0 px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(val) => format(parseISO(val), 'd', { locale: ar })}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 5]} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="mood" 
                            name="المزاج"
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorMood)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6', style: { filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.8))'} }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="energy_level" 
                            name="الطاقة"
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorEnergy)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))'} }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

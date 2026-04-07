// components/admin-v2/primitives/AdminStatCard.tsx
// Premium KPI metric card (Apple/Fluent Design inspired)

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change?: number;
  icon: React.ReactNode;
  accentColor?: string;
  loading?: boolean;
  alert?: boolean;
}

function AnimatedValue({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) { setCount(target); return; }
    started.current = true;
    const duration = 1200;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {prefix && <span className="text-sm font-semibold text-slate-400 mr-1">{prefix}</span>}
      {count.toLocaleString('ar-SA')}
      {suffix && <span className="text-sm text-slate-400 font-semibold ml-1">{suffix}</span>}
    </>
  );
}

export default function AdminStatCard({
  title,
  value,
  suffix,
  prefix,
  change,
  icon,
  accentColor = '#3b82f6',
  loading = false,
  alert = false,
}: AdminStatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 animate-pulse min-h-[140px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-slate-100" />
          <div className="w-16 h-6 rounded-full bg-slate-50" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="h-8 w-24 bg-slate-100 rounded-md" />
          <div className="h-4 w-32 bg-slate-50 rounded-md" />
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative overflow-hidden">
      
      {/* Top section: Icon and Trend */}
      <div className="flex justify-between items-start mb-4">
        {/* Soft, Apple-style Icon Container */}
        <div 
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm relative z-10 transition-transform group-hover:scale-110 duration-300"
          style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
        >
          {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
        </div>

        {/* Change Indicator aligned top left */}
        <div className="flex flex-col items-end gap-1">
          {alert && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
          )}
          {change !== undefined && (
          <div 
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span dir="ltr">{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
        </div>
      </div>

      {/* Bottom section: Number and Title */}
      <div className="relative z-10 mt-3 sm:mt-0">
        <h3 className="text-xl sm:text-[28px] font-black text-slate-800 tracking-tight leading-none mb-1 sm:mb-1.5 flex items-baseline gap-1">
          <AnimatedValue target={value} prefix={prefix} suffix={suffix} />
        </h3>
        <p className="text-[11px] sm:text-sm font-semibold text-slate-500 line-clamp-1">{title}</p>
      </div>
      
      {/* Subtle ambient glow in background inspired by modern OS */}
      <div 
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}

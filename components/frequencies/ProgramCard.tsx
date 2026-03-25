import React from 'react';
import { Play, ChevronLeft } from 'lucide-react';
import { TherapeuticProgram } from '@/types/therapeuticSessionTypes';

interface ProgramCardProps {
  program: TherapeuticProgram;
  completedSessions?: number;
  onClick: () => void;
}

export default function ProgramCard({ program, completedSessions = 0, onClick }: ProgramCardProps) {
  const totalSessions = program.sessions.length;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const isStarted = completedSessions > 0;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group text-right"
    >
      {/* Gradient Header */}
      <div className={`bg-gradient-to-br ${program.color_from} ${program.color_to} p-4 pb-6 relative`}>
        <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
        <span className="text-3xl block mb-2">{program.icon}</span>
        <h3 className="text-base font-bold text-white leading-tight line-clamp-2">{program.title_ar}</h3>
        <p className="text-[11px] text-white/70 mt-1">{program.title_en}</p>
      </div>

      {/* Body */}
      <div className="bg-white dark:bg-slate-800 p-4 -mt-3 rounded-t-2xl relative">
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span>{program.duration_days} أيام</span>
          <span>{totalSessions} جلسات</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full bg-gradient-to-r ${program.color_from} ${program.color_to} transition-all duration-500 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isStarted ? `${completedSessions}/${totalSessions} مكتملة` : 'جديد'}
          </span>
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${program.color_from} ${program.color_to}`}>
            {isStarted ? 'متابعة' : 'ابدأ'}
            <ChevronLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

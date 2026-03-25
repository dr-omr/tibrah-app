import React from 'react';
import { AlertTriangle, Headphones, Car, Brain, Heart, ShieldAlert } from 'lucide-react';
import { TherapeuticSession } from '@/types/therapeuticSessionTypes';

interface SafetyNoticeProps {
  session: TherapeuticSession;
  compact?: boolean;
}

export default function SafetyNotice({ session, compact = false }: SafetyNoticeProps) {
  const warnings: { icon: React.ReactNode; text: string }[] = [];

  if (session.headphone_required) {
    warnings.push({ icon: <Headphones className="w-4 h-4" />, text: 'يُنصح باستخدام سماعات الرأس' });
  }
  if (session.session_end_grounding) {
    warnings.push({ icon: <Brain className="w-4 h-4" />, text: 'يتضمن إعادة توجيه في نهاية الجلسة' });
  }
  if (session.safety_level === 'caution_advised' || session.safety_level === 'restricted') {
    warnings.push({ icon: <ShieldAlert className="w-4 h-4" />, text: 'غير مناسب لبعض الحالات الصحية' });
  }

  // Always include these universal safety notes
  const universalNotes = [
    { icon: <Car className="w-4 h-4" />, text: 'لا تستخدم أثناء القيادة' },
    { icon: <Heart className="w-4 h-4" />, text: 'ليس بديلاً عن العلاج الطبي أو الطوارئ' },
  ];

  if (compact) {
    // Show only icons inline
    const allIcons = [...warnings, ...universalNotes];
    return (
      <div className="flex items-center gap-1.5">
        {session.headphone_required && (
          <span className="text-blue-500" title="يُنصح بسماعات الرأس">
            <Headphones className="w-3.5 h-3.5" />
          </span>
        )}
        {session.safety_level !== 'safe_general' && (
          <span className="text-amber-500" title="تحذيرات خاصة">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Session-specific warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">ملاحظات الأمان</span>
          </div>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                <span className="text-amber-500">{w.icon}</span>
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contraindications */}
      {session.contraindications_ar && session.contraindications_ar.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">موانع الاستخدام:</p>
          <ul className="space-y-1">
            {session.contraindications_ar.map((c, i) => (
              <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <span>•</span><span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Universal disclaimer */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
        <ul className="space-y-1.5">
          {universalNotes.map((n, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">{n.icon}</span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

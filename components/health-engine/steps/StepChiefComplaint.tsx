'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { ChiefComplaintAnswers } from '../types';
import { BottomCTA } from '../ui/BottomCTA';
import { COMPLAINT_SYSTEMS } from '@/components/health-engine/assessment/clinical-intake-data';

const C = {
  bg: 'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 52%,#FFFFFF 100%)',
  glass: 'rgba(255,255,255,0.68)',
  border: 'rgba(255,255,255,0.90)',
  ink: '#073B52',
  sub: '#0F6F8F',
  muted: '#639CAF',
  teal: '#0787A5',
};

const POPULAR = new Set(['fatigue', 'abdominal_pain', 'bloating_gas', 'short_breath', 'chest_pain', 'headache', 'back_pain', 'anxiety', 'insomnia', 'not_sure']);

function ComplaintCard({
  label,
  examples,
  icon,
  selected,
  onClick,
}: {
  label: string;
  examples?: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-[18px] p-3 text-right min-h-[76px] relative overflow-hidden"
      style={{
        background: selected ? 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(8,145,178,0.12))' : 'rgba(255,255,255,0.62)',
        border: `1.5px solid ${selected ? 'rgba(8,145,178,0.34)' : 'rgba(255,255,255,0.88)'}`,
        boxShadow: selected ? '0 10px 24px rgba(8,145,178,0.13), inset 0 1px 0 rgba(255,255,255,0.9)' : 'inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-2">
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span className="flex-1">
          <span style={{ display: 'block', fontSize: 13.3, fontWeight: 950, color: C.ink, lineHeight: 1.4 }}>{label}</span>
          {examples && <span style={{ display: 'block', fontSize: 10.8, color: C.muted, lineHeight: 1.55, marginTop: 3, fontWeight: 650 }}>{examples}</span>}
        </span>
        {selected && <Check style={{ width: 15, height: 15, color: C.teal }} />}
      </div>
    </motion.button>
  );
}

export function StepChiefComplaint({
  value,
  onChange,
  onNext,
}: {
  value?: ChiefComplaintAnswers;
  onChange: (value: ChiefComplaintAnswers, pathwayId: string) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState('');
  const [openSystem, setOpenSystem] = useState<string>('popular');
  const normalized = query.trim();
  const popularItems = COMPLAINT_SYSTEMS.flatMap(system =>
    system.complaints
      .filter(complaint => POPULAR.has(complaint.id))
      .map(complaint => ({ system, complaint }))
  );

  const visibleSystems = useMemo(() => {
    if (!normalized) return COMPLAINT_SYSTEMS;
    return COMPLAINT_SYSTEMS.map(system => ({
      ...system,
      complaints: system.complaints.filter(complaint =>
        [system.label, complaint.label, complaint.examples ?? ''].some(text => text.includes(normalized))
      ),
    })).filter(system => system.complaints.length > 0);
  }, [normalized]);

  const chooseMain = (systemId: string, complaintId: string) => {
    const system = COMPLAINT_SYSTEMS.find(item => item.id === systemId);
    const complaint = system?.complaints.find(item => item.id === complaintId);
    if (!system || !complaint) return;
    onChange({
      system: system.id,
      systemLabel: system.label,
      complaint: complaint.id,
      complaintLabel: complaint.label,
      secondaryComplaints: value?.secondaryComplaints ?? [],
    }, complaint.pathwayId);
  };

  const toggleSecondary = (complaintId: string) => {
    if (!value) return;
    const list = value.secondaryComplaints.includes(complaintId)
      ? value.secondaryComplaints.filter(item => item !== complaintId)
      : [...value.secondaryComplaints, complaintId];
    onChange({ ...value, secondaryComplaints: list }, COMPLAINT_SYSTEMS.flatMap(s => s.complaints).find(c => c.id === value.complaint)?.pathwayId ?? 'general_uncertain');
  };

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: -90, right: -80, width: 370, height: 330, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 64%)', filter: 'blur(54px)' }} />
      </div>
      <div className="relative z-10 px-4 pt-4 pb-44">
        <div className="mb-5">
          <p className="inline-flex rounded-full px-3.5 py-2 mb-3" style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)', color: C.teal, fontSize: 11, fontWeight: 900 }}>الشكوى الرئيسية</p>
          <h2 style={{ fontSize: 28, lineHeight: 1.22, fontWeight: 950, color: C.ink, marginBottom: 8 }}>إيش أكثر شيء يضايقك الآن؟</h2>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: C.sub, fontWeight: 650 }}>اختر أقرب جهاز أو منطقة، وبعدها نحدد العرض بدقة.</p>
        </div>

        <label className="relative block mb-4">
          <Search style={{ position: 'absolute', right: 14, top: 13, width: 17, height: 17, color: C.muted }} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="ابحث عن العرض"
            className="w-full rounded-[20px] py-3.5 pr-11 pl-4 text-right focus:outline-none focus-visible:ring-2"
            style={{ background: C.glass, border: `1.5px solid ${C.border}`, color: C.ink, fontWeight: 750, ['--tw-ring-color' as string]: C.teal }}
          />
        </label>

        {!normalized && (
          <section className="mb-4 rounded-[24px] p-3" style={{ background: C.glass, border: `1.5px solid ${C.border}`, backdropFilter: 'blur(22px)' }}>
            <button type="button" onClick={() => setOpenSystem(openSystem === 'popular' ? '' : 'popular')} className="w-full flex items-center justify-between px-1 py-1 text-right">
              <span style={{ fontSize: 14, fontWeight: 950, color: C.ink }}>الأكثر شيوعًا</span>
              <ChevronDown style={{ width: 17, height: 17, color: C.teal, transform: openSystem === 'popular' ? 'rotate(180deg)' : undefined }} />
            </button>
            <AnimatePresence initial={false}>
              {openSystem === 'popular' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {popularItems.map(({ system, complaint }) => (
                      <ComplaintCard
                        key={`${system.id}-${complaint.id}`}
                        label={complaint.label}
                        examples={complaint.examples}
                        icon={system.icon}
                        selected={value?.complaint === complaint.id}
                        onClick={() => chooseMain(system.id, complaint.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        <div className="space-y-3">
          {visibleSystems.map(system => (
            <section key={system.id} className="rounded-[24px] p-3" style={{ background: C.glass, border: `1.5px solid ${C.border}`, backdropFilter: 'blur(22px)' }}>
              <button type="button" onClick={() => setOpenSystem(openSystem === system.id ? '' : system.id)} className="w-full flex items-center justify-between px-1 py-1 text-right">
                <span className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{system.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 950, color: C.ink }}>{system.label}</span>
                </span>
                <ChevronDown style={{ width: 17, height: 17, color: C.teal, transform: openSystem === system.id || normalized ? 'rotate(180deg)' : undefined }} />
              </button>
              <AnimatePresence initial={false}>
                {(openSystem === system.id || normalized) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {system.complaints.map(complaint => (
                        <ComplaintCard
                          key={complaint.id}
                          label={complaint.label}
                          examples={complaint.examples}
                          icon={system.icon}
                          selected={value?.complaint === complaint.id}
                          onClick={() => chooseMain(system.id, complaint.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          ))}
        </div>

        {value && (
          <div className="mt-4 rounded-[22px] p-4" style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.16)' }}>
            <p style={{ fontSize: 12, fontWeight: 950, color: C.teal, marginBottom: 7 }}>اخترت: {value.complaintLabel}</p>
            <p style={{ fontSize: 11.5, lineHeight: 1.7, color: C.sub, fontWeight: 650, marginBottom: 9 }}>تقدر تضيف أعراض ثانية لو موجودة.</p>
            <div className="flex flex-wrap gap-2">
              {COMPLAINT_SYSTEMS.find(system => system.id === value.system)?.complaints.filter(c => c.id !== value.complaint).slice(0, 6).map(complaint => (
                <button
                  type="button"
                  key={complaint.id}
                  onClick={() => toggleSecondary(complaint.id)}
                  className="rounded-full px-3 py-1.5"
                  style={{ background: value.secondaryComplaints.includes(complaint.id) ? 'rgba(8,145,178,0.16)' : 'rgba(255,255,255,0.62)', border: '1px solid rgba(8,145,178,0.16)', color: C.ink, fontSize: 11, fontWeight: 820 }}
                >
                  {complaint.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomCTA label="التالي" onPress={onNext} disabled={!value?.complaint} variant="teal" sublabel={value ? `الشكوى الرئيسية: ${value.complaintLabel}` : 'اختر أكثر شيء يضايقك الآن'} />
    </div>
  );
}

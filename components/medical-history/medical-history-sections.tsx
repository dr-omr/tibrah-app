// components/medical-history/medical-history-sections.tsx
// ════════════════════════════════════════════════════════
// 8 Section Renderers for Medical History (SOCRATES-based)
// ════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, MapPin, Clock, Activity, HeartPulse, Zap, Thermometer,
  FileText, Stethoscope, Pill, Users, Utensils, Moon, Dumbbell,
  Brain, Cigarette, Shield, Eye, Wind, Bone, Heart, CheckCircle,
  Sparkles, AlertTriangle, Plus, X, ChevronRight,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { MedicalHistory } from './medical-history-types';
import { Chip, SectionCard, FieldLabel, TextInput, SelectRow } from './medical-history-ui';

type SectionProps = { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void };

/* ── 1. Personal ─────────────────────────────── */
export function PersonalSection({ data, update }: SectionProps) {
  return (
    <div className="space-y-0">
      <SectionCard title="المعلومات الأساسية" icon={User} color="#0d9488">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <FieldLabel>سنة الميلاد</FieldLabel>
            <TextInput value={data.birthYear} onChange={v => update('birthYear', v)} placeholder="مثال: 1990" />
          </div>
          <SelectRow value={data.gender} onChange={v => update('gender', v)}
            options={['ذكر', 'أنثى']} label="الجنس" />
        </div>
        <SelectRow value={data.maritalStatus} onChange={v => update('maritalStatus', v)}
          options={['أعزب/عزباء', 'متزوج/ة', 'مطلق/ة', 'أرمل/ة']} label="الحالة الاجتماعية" />
        <div className="mb-4">
          <FieldLabel>المهنة</FieldLabel>
          <TextInput value={data.occupation} onChange={v => update('occupation', v)} placeholder="ما هو عملك؟" />
        </div>
        <SelectRow value={data.children} onChange={v => update('children', v)}
          options={['لا أطفال', '١-٢', '٣-٤', '٥+']} label="الأطفال" />
      </SectionCard>
    </div>
  );
}

/* ── 2. Complaint (SOCRATES) ────────────────── */
export function ComplaintSection({ data, update }: SectionProps) {
  const toggle = (field: 'character' | 'associatedSymptoms' | 'exacerbating' | 'relieving', val: string) => {
    const arr: string[] = data[field] as string[];
    update(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };
  return (
    <div>
      <SectionCard title="S — موقع الأعراض" icon={MapPin} color="#6366f1">
        <FieldLabel>أين تشعر بالألم أو الانزعاج بالضبط؟</FieldLabel>
        <TextInput value={data.site} onChange={v => update('site', v)} placeholder="مثال: أسفل البطن اليمين، الصدر..." />
      </SectionCard>
      <SectionCard title="O — بداية الأعراض" icon={Clock} color="#6366f1">
        <SelectRow value={data.onset} onChange={v => update('onset', v)}
          options={['فجأة', 'تدريجياً', 'بعد حدث معين']} label="كيف بدأت الأعراض؟" />
        <FieldLabel>متى بدأت (تقريباً)؟</FieldLabel>
        <input type="date" value={data.onsetDate} onChange={e => update('onsetDate', e.target.value)}
          className="w-full text-[13px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-indigo-300" />
      </SectionCard>
      <SectionCard title="C — طبيعة الألم / الانزعاج" icon={Activity} color="#6366f1">
        <FieldLabel>كيف تصف الألم؟ (اختر كل ما ينطبق)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['حارق', 'طاعن', 'ثقيل', 'ضاغط', 'نابض', 'مستمر', 'متقطع', 'خدر', 'وخز', 'شد عضلي'].map(c => (
            <Chip key={c} label={c} selected={data.character.includes(c)} color="#6366f1" onToggle={() => toggle('character', c)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="R — الانتشار" icon={ChevronRight} color="#6366f1">
        <FieldLabel>هل ينتشر الألم لمكان آخر؟</FieldLabel>
        <TextInput value={data.radiation} onChange={v => update('radiation', v)} placeholder="مثال: ينتشر للظهر / لا ينتشر" />
      </SectionCard>
      <SectionCard title="A — أعراض مصاحبة" icon={HeartPulse} color="#6366f1">
        <FieldLabel>هل يصاحب ذلك أي من التالي؟</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['غثيان', 'قيء', 'إسهال', 'إمساك', 'حمى', 'تعرق', 'ضيق نفس', 'دوخة', 'خفقان', 'فقدان وزن', 'تعب', 'صداع'].map(s => (
            <Chip key={s} label={s} selected={data.associatedSymptoms.includes(s)} color="#6366f1" onToggle={() => toggle('associatedSymptoms', s)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="T — التوقيت والنمط" icon={Clock} color="#6366f1">
        <SelectRow value={data.timing} onChange={v => update('timing', v)}
          options={['صباحي', 'مسائي', 'ليلي', 'بعد الأكل', 'أثناء الحركة', 'في الراحة', 'طوال اليوم']}
          label="متى تكون الأعراض أشد؟" />
      </SectionCard>
      <SectionCard title="E — المحرضات والمخففات" icon={Zap} color="#6366f1">
        <FieldLabel>ما الذي يزيد الأعراض سوءاً؟</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          {['الحركة', 'الضغط', 'الطعام', 'الإجهاد', 'البرد', 'الحرارة', 'الوقوف الطويل', 'الجلوس الطويل'].map(e => (
            <Chip key={e} label={e} selected={data.exacerbating.includes(e)} color="#ef4444" onToggle={() => toggle('exacerbating', e)} />
          ))}
        </div>
        <FieldLabel>ما الذي يخفف الأعراض؟</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['الراحة', 'الدواء', 'الحرارة', 'البرد', 'الأكل', 'الصيام', 'النوم', 'المشي'].map(r => (
            <Chip key={r} label={r} selected={data.relieving.includes(r)} color="#10b981" onToggle={() => toggle('relieving', r)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="S — درجة الحدة" icon={Thermometer} color="#6366f1">
        <FieldLabel>كيف تقيّم شدة الألم من ١ إلى ١٠؟</FieldLabel>
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4,5,6,7,8,9,10].map(n => {
            const col = n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : n <= 8 ? '#f97316' : '#ef4444';
            return (
              <motion.button key={n} whileTap={{ scale: 0.85 }}
                onClick={() => { haptic.selection(); update('severity', n); }}
                className="flex-1 py-2.5 rounded-lg text-[11px] font-black transition-all"
                style={data.severity === n ? { backgroundColor: col, color: '#fff' } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                {n}
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-slate-400 font-medium">
          {data.severity <= 3 ? '🟢 خفيف' : data.severity <= 6 ? '🟡 متوسط' : data.severity <= 8 ? '🟠 شديد' : '🔴 حرج'}
        </p>
      </SectionCard>
    </div>
  );
}

/* ── 3. PMH ──────────────────────────────────── */
export function PMHSection({ data, update }: SectionProps) {
  const DISEASES = ['السكري','ضغط الدم','أمراض القلب','الغدة الدرقية','الربو','الحساسية','القولون','الصرع','الاكتئاب','السرطان','الروماتيزم','هشاشة العظام'];
  const toggle = (d: string) => {
    const arr = data.chronicDiseases;
    update('chronicDiseases', arr.includes(d) ? arr.filter(x => x !== d) : [...arr, d]);
  };
  return (
    <div>
      <SectionCard title="الأمراض المزمنة" icon={Activity} color="#f59e0b">
        <FieldLabel>هل تعاني أو عانيت سابقاً من؟ (اختر كل ما ينطبق)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map(d => (
            <Chip key={d} label={d} selected={data.chronicDiseases.includes(d)} color="#f59e0b" onToggle={() => toggle(d)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="العمليات الجراحية" icon={FileText} color="#f59e0b">
        <TextInput value={data.previousSurgeries} onChange={v => update('previousSurgeries', v)}
          placeholder="اذكر العمليات التي أجريتها مع التاريخ التقريبي..." multiline />
      </SectionCard>
      <SectionCard title="الدخولات المستشفى" icon={Stethoscope} color="#f59e0b">
        <TextInput value={data.hospitalizations} onChange={v => update('hospitalizations', v)}
          placeholder="آخر مرة دخلت فيها المستشفى وسبب الدخول..." multiline />
      </SectionCard>
    </div>
  );
}

/* ── 4. Medications ──────────────────────────── */
export function MedicationsSection({ data, update }: SectionProps) {
  const [newMed, setNewMed] = useState({ name: '', dose: '', since: '' });
  const ALLERGIES_LIST = ['البنسيلين','السلفا','الأسبرين','الإيبوبروفين','اللاتكس','المكسرات','المأكولات البحرية','الغلوتين'];
  const toggleAllergy = (a: string) => {
    const arr = data.allergies;
    update('allergies', arr.includes(a) ? arr.filter(x => x !== a) : [...arr, a]);
  };
  const addMed = () => {
    if (!newMed.name) return;
    update('currentMeds', [...data.currentMeds, { ...newMed }]);
    setNewMed({ name: '', dose: '', since: '' });
  };
  return (
    <div>
      <SectionCard title="الأدوية الحالية" icon={Pill} color="#ef4444">
        {data.currentMeds.map((m, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 mb-2">
            <div className="flex-1">
              <p className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200">{m.name}</p>
              <p className="text-[10.5px] text-slate-400">{m.dose} • منذ {m.since}</p>
            </div>
            <button onClick={() => update('currentMeds', data.currentMeds.filter((_, j) => j !== i))}
              className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
              <X className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))}
            placeholder="اسم الدواء" className="col-span-3 text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-red-300" />
          <input value={newMed.dose} onChange={e => setNewMed(p => ({ ...p, dose: e.target.value }))}
            placeholder="الجرعة" className="text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none" />
          <input value={newMed.since} onChange={e => setNewMed(p => ({ ...p, since: e.target.value }))}
            placeholder="منذ" className="text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none" />
          <motion.button whileTap={{ scale: 0.93 }} onClick={addMed}
            className="flex items-center justify-center gap-1 rounded-xl text-[12px] font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}>
            <Plus className="w-3.5 h-3.5" /> إضافة
          </motion.button>
        </div>
        <div className="mt-4">
          <FieldLabel>مكملات غذائية / أعشاب / فيتامينات</FieldLabel>
          <TextInput value={data.supplements} onChange={v => update('supplements', v)} placeholder="مثال: أوميغا 3، فيتامين D..." />
        </div>
      </SectionCard>
      <SectionCard title="الحساسية (Allergies)" icon={AlertTriangle} color="#ef4444">
        <FieldLabel>هل لديك حساسية لأي من التالي؟</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALLERGIES_LIST.map(a => (
            <Chip key={a} label={a} selected={data.allergies.includes(a)} color="#ef4444" onToggle={() => toggleAllergy(a)} />
          ))}
        </div>
        <FieldLabel>تفاصيل الحساسية وردود الفعل</FieldLabel>
        <TextInput value={data.allergyDetails} onChange={v => update('allergyDetails', v)}
          placeholder="صف ردة فعل الحساسية..." multiline />
      </SectionCard>
    </div>
  );
}

/* ── 5. Family ───────────────────────────────── */
export function FamilySection({ data, update }: SectionProps) {
  const FAMILY_DISEASES = ['السكري','القلب','السرطان','ضغط الدم','الغدة الدرقية','الاكتئاب','الزهايمر','الجلطة','الروماتيزم'];
  const toggleFamily = (member: string, disease: string) => {
    const current = data.familyDiseases[member] || [];
    const next = current.includes(disease) ? current.filter(x => x !== disease) : [...current, disease];
    update('familyDiseases', { ...data.familyDiseases, [member]: next });
  };
  const COLOR = '#8b5cf6';
  return (
    <div>
      {Object.keys(data.familyDiseases).map(member => (
        <SectionCard key={member} title={`أمراض ال${member}`} icon={Users} color={COLOR}>
          <div className="flex flex-wrap gap-2">
            {FAMILY_DISEASES.map(d => (
              <Chip key={d} label={d} color={COLOR}
                selected={(data.familyDiseases[member] || []).includes(d)}
                onToggle={() => toggleFamily(member, d)} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

/* ── 6. Lifestyle ────────────────────────────── */
export function LifestyleSection({ data, update }: SectionProps) {
  const COLOR = '#10b981';
  return (
    <div>
      <SectionCard title="النظام الغذائي" icon={Utensils} color={COLOR}>
        <SelectRow value={data.diet} onChange={v => update('diet', v)}
          options={['متنوع', 'نباتي', 'كيتو', 'بحر متوسط', 'متقطع', 'بدون قيود']} label="نوع النظام الغذائي" />
        <SelectRow value={data.mealsPerDay} onChange={v => update('mealsPerDay', v)}
          options={['وجبة واحدة', 'وجبتان', '٣ وجبات', '٤ أو أكثر', 'غير منتظم']} label="عدد الوجبات يومياً" />
        <SelectRow value={data.water} onChange={v => update('water', v)}
          options={['أقل من لتر', '١-١.٥ لتر', '١.٥-٢ لتر', 'أكثر من ٢ لتر']} label="شرب الماء يومياً" />
      </SectionCard>
      <SectionCard title="النوم والراحة" icon={Moon} color={COLOR}>
        <SelectRow value={data.sleepHours} onChange={v => update('sleepHours', v)}
          options={['أقل من ٥ ساعات', '٥-٦', '٦-٧', '٧-٨', 'أكثر من ٨']} label="ساعات النوم" />
        <SelectRow value={data.sleepQuality} onChange={v => update('sleepQuality', v)}
          options={['سيئة', 'متقطعة', 'مقبولة', 'جيدة', 'ممتازة']} label="جودة النوم" />
      </SectionCard>
      <SectionCard title="النشاط البدني" icon={Dumbbell} color={COLOR}>
        <SelectRow value={data.exercise} onChange={v => update('exercise', v)}
          options={['لا أمارس', 'مرة أسبوعياً', '٢-٣ مرات', 'يومياً', 'رياضي محترف']} label="التمرين الرياضي" />
      </SectionCard>
      <SectionCard title="مستوى الإجهاد النفسي" icon={Brain} color={COLOR}>
        <FieldLabel>كيف تقيّم مستوى ضغوطك اليومية؟</FieldLabel>
        <div className="flex gap-1 mb-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => {
            const col = n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : '#ef4444';
            return (
              <motion.button key={n} whileTap={{ scale: 0.85 }}
                onClick={() => { haptic.selection(); update('stressLevel', n); }}
                className="flex-1 py-2 rounded-lg text-[11px] font-black transition-all"
                style={data.stressLevel === n ? { backgroundColor: col, color: '#fff' } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                {n}
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-slate-400">
          {data.stressLevel <= 3 ? '🟢 منخفض' : data.stressLevel <= 6 ? '🟡 متوسط' : '🔴 مرتفع'}
        </p>
      </SectionCard>
      <SectionCard title="العادات" icon={Cigarette} color={COLOR}>
        <SelectRow value={data.smoking} onChange={v => update('smoking', v)}
          options={['لا أدخن', 'سابقاً', 'أدخن', 'أرجيلة', 'إلكتروني']} label="التدخين" />
        <SelectRow value={data.alcohol} onChange={v => update('alcohol', v)}
          options={['لا', 'نادراً', 'أحياناً', 'منتظم']} label="الكحول" />
        <SelectRow value={data.caffeine} onChange={v => update('caffeine', v)}
          options={['لا', 'كوب واحد', '٢-٣ أكواب', 'أكثر من ٣']} label="الكافيين يومياً (قهوة/شاي)" />
      </SectionCard>
    </div>
  );
}

/* ── 7. ROS ───────────────────────────────────── */
export function ROSSection({ data, update }: SectionProps) {
  const SYSTEMS = [
    { id: 'general',     label: 'عام',               icon: Activity,   color: '#0d9488', symptoms: ['تعب مزمن','فقدان وزن','كسب وزن','حمى','تعرق ليلي','شهية سيئة'] },
    { id: 'cardiac',     label: 'القلب والأوعية',    icon: Heart,      color: '#ef4444', symptoms: ['خفقان','ضيق نفس عند الجهد','ألم صدر','تورم أطراف','دوخة عند الوقوف'] },
    { id: 'respiratory', label: 'الجهاز التنفسي',   icon: Wind,       color: '#0ea5e9', symptoms: ['سعال مزمن','ضيق تنفس','صفير صدري','ألم عند التنفس','كثرة البلغم'] },
    { id: 'gi',          label: 'الجهاز الهضمي',    icon: Activity,   color: '#f59e0b', symptoms: ['حرقة معدة','غثيان','قيء','إسهال','إمساك','انتفاخ','ألم بطن','دم في البراز'] },
    { id: 'neuro',       label: 'الجهاز العصبي',    icon: Brain,      color: '#8b5cf6', symptoms: ['صداع مزمن','شقيقة','دوار','تنميل','ضعف عضلي','مشاكل ذاكرة','نوبات'] },
    { id: 'msk',         label: 'العظام والمفاصل',  icon: Bone,       color: '#6366f1', symptoms: ['آلام مفاصل','تيبس صباحي','آلام عضلية','ضعف عضلي','ألم ظهر','ألم رقبة'] },
    { id: 'endo',        label: 'الغدد الصماء',     icon: Zap,        color: '#ec4899', symptoms: ['عطش زائد','تبول متكرر','تغيرات وزن','تعب شديد','تغيرات مزاج','برودة/حرارة زائدة'] },
    { id: 'skin',        label: 'الجلد',             icon: Shield,     color: '#10b981', symptoms: ['طفح جلدي','حكة','تغير لون الجلد','تساقط شعر','هشاشة أظافر','جفاف'] },
    { id: 'eyes',        label: 'العيون',            icon: Eye,        color: '#14b8a6', symptoms: ['ضعف نظر','ازدواج رؤية','احمرار','ألم عيون','جفاف'] },
    { id: 'psych',       label: 'الصحة النفسية',    icon: Brain,      color: '#a855f7', symptoms: ['اكتئاب','قلق','اضطراب نوم','وسواس','عزلة اجتماعية','توتر مزمن'] },
  ];

  const toggleROS = (systemId: string, symptom: string) => {
    const current = data.rosPositive[systemId] || [];
    const next = current.includes(symptom) ? current.filter(x => x !== symptom) : [...current, symptom];
    update('rosPositive', { ...data.rosPositive, [systemId]: next });
  };

  return (
    <div>
      {SYSTEMS.map(sys => {
        const selected = data.rosPositive[sys.id] || [];
        const count = selected.length;
        return (
          <SectionCard key={sys.id} title={sys.label} icon={sys.icon} color={sys.color}>
            {count > 0 && (
              <div className="flex items-center gap-1.5 mb-2 p-2 rounded-xl" style={{ backgroundColor: `${sys.color}10` }}>
                <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: sys.color }}>
                  {count} أعراض محددة
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {sys.symptoms.map(s => (
                <Chip key={s} label={s} selected={selected.includes(s)} color={sys.color}
                  onToggle={() => toggleROS(sys.id, s)} />
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

/* ── 8. Goals ────────────────────────────────── */
export function GoalsSection({ data, update }: SectionProps) {
  const COLOR = '#ec4899';
  const GOAL_OPTIONS = ['إدارة الألم','تحسين الطاقة','إنقاص الوزن','تحسين النوم','توازن الهرمونات','تحسين الهضم','تقليل الدواء','الوقاية','التعافي من مرض مزمن'];
  const toggle = (g: string) => {
    const arr = data.specificGoals;
    update('specificGoals', arr.includes(g) ? arr.filter(x => x !== g) : [...arr, g]);
  };
  return (
    <div>
      <SectionCard title="هدفك الرئيسي" icon={Sparkles} color={COLOR}>
        <FieldLabel>في جملة واحدة — ما الذي تريده أكثر شيء؟</FieldLabel>
        <TextInput value={data.mainGoal} onChange={v => update('mainGoal', v)}
          placeholder="مثال: أريد أن أعود لحياتي الطبيعية دون آلام..." multiline />
      </SectionCard>
      <SectionCard title="الأهداف المحددة" icon={CheckCircle} color={COLOR}>
        <FieldLabel>اختر الأهداف التي تريد تحقيقها</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map(g => (
            <Chip key={g} label={g} selected={data.specificGoals.includes(g)} color={COLOR} onToggle={() => toggle(g)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="الإطار الزمني" icon={Clock} color={COLOR}>
        <SelectRow value={data.timeframe} onChange={v => update('timeframe', v)}
          options={['شهر واحد', '٣ أشهر', '٦ أشهر', 'سنة', 'بلا حدود']}
          label="في كم وقت تتوقع تحقيق هدفك؟" />
      </SectionCard>
      <SectionCard title="ملاحظات إضافية" icon={FileText} color={COLOR}>
        <FieldLabel>أي معلومات أخرى تود مشاركتها مع الطبيب</FieldLabel>
        <TextInput value={data.additionalNotes} onChange={v => update('additionalNotes', v)}
          placeholder="مثال: لديّ تحاليل قديمة، أو مررت بتجربة علاجية سابقة..." multiline />
      </SectionCard>
    </div>
  );
}

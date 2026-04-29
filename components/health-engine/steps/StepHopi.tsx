'use client';

import { motion } from 'framer-motion';
import type { HopiAnswers, ChiefComplaintAnswers } from '../types';
import { BottomCTA } from '../ui/BottomCTA';
import { OptionCardGroup, type SmartOption } from '@/components/health-engine/assessment/questions/OptionCardGroup';
import { SeverityScaleCard } from '@/components/health-engine/assessment/questions/SeverityScaleCard';
import { SmartQuestionCard } from '@/components/health-engine/assessment/questions/SmartQuestionCard';

const C = {
  bg: 'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 52%,#FFFFFF 100%)',
  ink: '#073B52',
  sub: '#0F6F8F',
  teal: '#0787A5',
  green: '#059669',
};

const EMPTY_HOPI: HopiAnswers = {
  onset: '',
  course: '',
  severity: 5,
  location: '',
  character: '',
  radiation: '',
  aggravating: [],
  relieving: [],
  associated: [],
  functionalImpact: '',
};

const onsetOptions: SmartOption[] = [
  { value: 'hours', label: 'اليوم' },
  { value: 'days', label: 'من أيام' },
  { value: 'week', label: 'من أسبوع' },
  { value: 'weeks', label: 'من أسابيع' },
  { value: 'months', label: 'من أشهر' },
  { value: 'recur', label: 'يتكرر من زمان' },
  { value: 'unknown', label: 'لا أعرف' },
];

const courseOptions = ['يزيد', 'يقل', 'يروح ويجي', 'ثابت', 'مش واضح'].map(value => ({ value, label: value }));
const characterOptions = ['حارق', 'ضاغط', 'مغص', 'وخز', 'نابض', 'شد/تيبس', 'مش عارف أوصفه'].map(value => ({ value, label: value }));
const aggravatingOptions = ['الأكل', 'الحركة', 'النوم', 'الضغط', 'المجهود', 'البرد', 'الحرارة', 'الكافيين', 'لا أعرف'].map(value => ({ value, label: value }));
const relievingOptions = ['الراحة', 'شرب ماء', 'الأكل', 'دخول الحمام', 'مسكن', 'نوم', 'لا شيء', 'لا أعرف'].map(value => ({ value, label: value }));
const impactOptions = ['لا', 'قليل', 'متوسط', 'كثير'].map(value => ({ value, label: value }));

function toggle(list: string[], value: string) {
  if (value === 'لا أعرف' || value === 'لا شيء') return list.includes(value) ? [] : [value];
  const clean = list.filter(item => item !== 'لا أعرف' && item !== 'لا شيء');
  return clean.includes(value) ? clean.filter(item => item !== value) : [...clean, value];
}

function isPainComplaint(complaint?: ChiefComplaintAnswers) {
  const text = `${complaint?.complaintLabel ?? ''} ${complaint?.systemLabel ?? ''}`;
  return text.includes('ألم') || text.includes('مغص') || text.includes('صداع') || text.includes('حرقان') || text.includes('تيبس');
}

export function StepHopi({
  value,
  complaint,
  onChange,
  onNext,
}: {
  value?: HopiAnswers;
  complaint?: ChiefComplaintAnswers;
  onChange: (value: HopiAnswers) => void;
  onNext: () => void;
}) {
  const hopi = { ...EMPTY_HOPI, ...(value ?? {}) };
  const patch = (next: Partial<HopiAnswers>) => onChange({ ...hopi, ...next });
  const pain = isPainComplaint(complaint);

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.34, 0.58, 0.34] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', top: -90, right: -70, width: 360, height: 330, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 64%)', filter: 'blur(54px)' }} />
      </div>
      <div className="relative z-10 px-4 pt-4 pb-44">
        <div className="mb-5">
          <p className="inline-flex rounded-full px-3.5 py-2 mb-3" style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)', color: C.teal, fontSize: 11, fontWeight: 900 }}>تفاصيل العرض</p>
          <h2 style={{ fontSize: 27, lineHeight: 1.22, fontWeight: 950, color: C.ink, marginBottom: 8 }}>خلّينا نفهم العرض أكثر</h2>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: C.sub, fontWeight: 650 }}>كم سؤال عن بداية العرض، شدته، مدته، وإيش يزيده أو يخففه.</p>
        </div>

        <SmartQuestionCard title="متى بدأ؟" stageLabel="بداية العرض" whyWeAsk="البداية تساعدنا نعرف هل الموضوع جديد أو متكرر." impact="نحفظها كمدة العرض، وهذا يؤثر على وضوح النتيجة." accent={C.teal} selectedCount={hopi.onset ? 1 : 0} index={0}>
          <OptionCardGroup options={onsetOptions} value={hopi.onset} accent={C.teal} onChange={onset => patch({ onset })} />
        </SmartQuestionCard>

        <SmartQuestionCard title="كيف ماشي مع الوقت؟" stageLabel="تغير العرض" whyWeAsk="طريقة التغير توضّح هل الحالة تتحسن أو تحتاج متابعة أقرب." impact="إذا كان يزيد أو يتكرر، تظهر هذه النقطة في ملخص حالتك." accent={C.teal} selectedCount={hopi.course ? 1 : 0} index={1}>
          <OptionCardGroup options={courseOptions} value={hopi.course} accent={C.teal} onChange={course => patch({ course })} />
        </SmartQuestionCard>

        <SeverityScaleCard value={hopi.severity ?? 5} onChange={severity => patch({ severity })} index={2} />

        <SmartQuestionCard title="فين مكانه بالضبط؟" stageLabel="مكان العرض" whyWeAsk="المكان يساعدنا نربط العرض بالجهاز أو المنطقة الأقرب." impact="إذا كان المكان واضح، تكون القراءة أوضح." accent="#6366F1" selectedCount={hopi.location ? 1 : 0} index={3} compact>
          <input
            value={hopi.location ?? ''}
            onChange={event => patch({ location: event.target.value })}
            placeholder="مثلاً: أسفل البطن، يسار الصدر، الرقبة..."
            className="w-full rounded-[16px] px-3 py-3 text-right focus:outline-none focus-visible:ring-2"
            style={{ background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.9)', color: C.ink, fontSize: 13, fontWeight: 700, ['--tw-ring-color' as string]: '#6366F1' }}
          />
        </SmartQuestionCard>

        {pain && (
          <>
            <SmartQuestionCard title="كيف نوع الألم؟" stageLabel="وصف الألم" whyWeAsk="نوع الألم يساعدنا نفهم النمط بدون ما نفترض تشخيص." impact="الوصف يغيّر طريقة ترتيب الاحتمالات." accent="#D97706" selectedCount={hopi.character ? 1 : 0} index={4}>
              <OptionCardGroup options={characterOptions} value={hopi.character} accent="#D97706" onChange={character => patch({ character })} />
            </SmartQuestionCard>

            <SmartQuestionCard title="هل ينتقل لمكان ثاني؟" stageLabel="انتقال الألم" whyWeAsk="انتقال الألم أحيانًا يغيّر الأولوية." impact="إذا ينتقل، سنحفظه كإشارة مهمة في المراجعة." accent="#D97706" selectedCount={hopi.radiation ? 1 : 0} index={5}>
              <OptionCardGroup options={['لا', 'نعم', 'لا أعرف'].map(value => ({ value, label: value }))} value={hopi.radiation} accent="#D97706" onChange={radiation => patch({ radiation })} />
            </SmartQuestionCard>
          </>
        )}

        <SmartQuestionCard title="إيش يزيده؟" stageLabel="الأشياء اللي تزيده" whyWeAsk="نبحث عن أشياء تغيّر شدة العرض أو توقيته." impact="إذا ظهر الأكل أو النوم أو الضغط، ممكن تظهر أسئلة إضافية حسب الحاجة." accent={C.green} selectedCount={hopi.aggravating.length} index={6}>
          <OptionCardGroup options={aggravatingOptions} value={hopi.aggravating} multiple accent={C.green} onChange={item => patch({ aggravating: toggle(hopi.aggravating, item) })} />
        </SmartQuestionCard>

        <SmartQuestionCard title="إيش يخففه؟" stageLabel="الأشياء اللي تخففه" whyWeAsk="الشيء اللي يخفف العرض يساعدنا نفهم النمط بشكل عملي." impact="نستخدمها لاحقًا لاختيار خطوة بسيطة وآمنة." accent={C.green} selectedCount={hopi.relieving.length} index={7}>
          <OptionCardGroup options={relievingOptions} value={hopi.relieving} multiple accent={C.green} onChange={item => patch({ relieving: toggle(hopi.relieving, item) })} />
        </SmartQuestionCard>

        <SmartQuestionCard title="هل مأثر على يومك؟" stageLabel="تأثيره عليك" whyWeAsk="التأثير اليومي يوضح شدة الحالة من ناحية حياتك، مش الرقم فقط." impact="كلما زاد التأثير، زادت أهمية المتابعة." accent="#0EA5E9" selectedCount={hopi.functionalImpact ? 1 : 0} index={8}>
          <OptionCardGroup options={impactOptions} value={hopi.functionalImpact} accent="#0EA5E9" onChange={functionalImpact => patch({ functionalImpact })} />
        </SmartQuestionCard>
      </div>

      <BottomCTA label="التالي" onPress={onNext} variant="teal" sublabel="تقدر تترك أي سؤال مش واضح" />
    </div>
  );
}

'use client';

import { Coffee, Moon, Waves } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { OptionCardGroup } from '@/components/health-engine/assessment/questions/OptionCardGroup';
import { SmartQuestionCard } from '@/components/health-engine/assessment/questions/SmartQuestionCard';

const C = {
  bg: 'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 52%,#FFFFFF 100%)',
  ink: '#073B52',
  sub: '#0F6F8F',
  teal: '#0787A5',
  green: '#059669',
  amber: '#D97706',
};

export type LifestyleContextAnswers = Record<string, string | string[]>;

const sleepOptions = ['طبيعي غالباً', 'متقطع', 'متأخر', 'أصحى تعبان', 'لا أعرف'].map(value => ({ value, label: value }));
const stressOptions = ['لا يوجد واضح', 'ضغط وتوتر', 'قلق', 'تفكير كثير', 'إرهاق نفسي', 'لا أعرف'].map(value => ({ value, label: value }));
const foodOptions = ['لا علاقة واضحة', 'يزيد بعد الأكل', 'انتفاخ/حموضة', 'هبوط طاقة بعد الوجبة', 'رغبة سكر', 'لا أعرف'].map(value => ({ value, label: value }));
const caffeineOptions = ['قليل', 'متوسط', 'كثير', 'يزيد الأعراض', 'لا أعرف'].map(value => ({ value, label: value }));
const movementOptions = ['لا يؤثر', 'يزيد مع الحركة', 'يتحسن مع الحركة', 'يزيد مع المجهود', 'لا أعرف'].map(value => ({ value, label: value }));
const waterOptions = ['كافي', 'قليل', 'أنسى أشرب', 'يزيد مع الجفاف', 'لا أعرف'].map(value => ({ value, label: value }));

function patchAnswer(
  value: LifestyleContextAnswers,
  onChange: (value: LifestyleContextAnswers) => void,
  key: string,
  next: string,
) {
  onChange({ ...value, [key]: next });
}

export function StepLifestyleContext({
  value,
  onChange,
  onNext,
}: {
  value?: LifestyleContextAnswers;
  onChange: (value: LifestyleContextAnswers) => void;
  onNext: () => void;
}) {
  const context = value ?? {};

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: -90, right: -70, width: 360, height: 330, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 64%)', filter: 'blur(54px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-44">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 mb-3" style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)' }}>
            <Waves style={{ width: 13, height: 13, color: C.teal }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: C.teal }}>أشياء ممكن تزيد الحالة</span>
          </div>
          <h2 style={{ fontSize: 27, lineHeight: 1.22, fontWeight: 950, color: C.ink, marginBottom: 8 }}>نشوف الأكل والنوم والروتين</h2>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: C.sub, fontWeight: 650 }}>مش كل شيء سببه الروتين، بس أحياناً النوم أو الأكل أو الضغط يغيّر شدة العرض. جاوب باللي تعرفه.</p>
        </div>

        <SmartQuestionCard
          title="كيف نومك هذه الفترة؟"
          stageLabel="النوم"
          whyWeAsk="النوم يؤثر على الطاقة، الألم، التركيز، وتحمل الجسم للأعراض."
          impact="إذا كان النوم مضطرب، نضيفه كعامل ممكن يزيد الحالة."
          accent="#6366F1"
          selectedCount={context.sleep ? 1 : 0}
          index={0}
        >
          <OptionCardGroup options={sleepOptions} value={context.sleep as string | undefined} accent="#6366F1" onChange={next => patchAnswer(context, onChange, 'sleep', next)} />
        </SmartQuestionCard>

        <SmartQuestionCard
          title="هل الضغط أو التفكير يزيد الحالة؟"
          stageLabel="الضغط"
          whyWeAsk="هذا لا يعني أن الأعراض نفسية؛ بس يساعدنا نفهم الصورة كاملة."
          impact="إذا ظهر عامل ضغط، نذكره كعامل يزيد الشدة وليس كتفسير وحيد."
          accent="#7C3AED"
          selectedCount={context.stress ? 1 : 0}
          index={1}
        >
          <OptionCardGroup options={stressOptions} value={context.stress as string | undefined} accent="#7C3AED" onChange={next => patchAnswer(context, onChange, 'stress', next)} />
        </SmartQuestionCard>

        <SmartQuestionCard
          title="هل الأكل يغيّر الأعراض؟"
          stageLabel="الأكل"
          whyWeAsk="نبحث هل الأكل يغيّر شدة العرض أو توقيته."
          impact="إذا ظهرت علاقة واضحة، قد نعرض أسئلة الأكل والطيبات بشكل خفيف."
          accent={C.green}
          selectedCount={context.food ? 1 : 0}
          index={2}
        >
          <OptionCardGroup options={foodOptions} value={context.food as string | undefined} accent={C.green} onChange={next => patchAnswer(context, onChange, 'food', next)} />
        </SmartQuestionCard>

        <div className="grid gap-3">
          <div className="rounded-[24px] p-4" style={{ background: 'rgba(255,255,255,0.62)', border: '1.5px solid rgba(255,255,255,0.88)', backdropFilter: 'blur(22px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Coffee style={{ width: 14, height: 14, color: C.amber }} />
              <span style={{ fontSize: 12, fontWeight: 950, color: C.amber }}>الكافيين والماء والحركة</span>
            </div>
            <div className="grid gap-3">
              <OptionCardGroup options={caffeineOptions} value={context.caffeine as string | undefined} accent={C.amber} onChange={next => patchAnswer(context, onChange, 'caffeine', next)} />
              <OptionCardGroup options={waterOptions} value={context.water as string | undefined} accent={C.teal} onChange={next => patchAnswer(context, onChange, 'water', next)} />
              <OptionCardGroup options={movementOptions} value={context.movement as string | undefined} accent={C.green} onChange={next => patchAnswer(context, onChange, 'movement', next)} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[20px] p-3" style={{ background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.78)' }}>
          <Moon style={{ width: 14, height: 14, color: C.teal, flexShrink: 0 }} />
          <p style={{ fontSize: 11.5, lineHeight: 1.7, color: C.sub, fontWeight: 700 }}>تقدر تترك أي سؤال مش واضح. طِبرا يستخدم الموجود ويبقي النتيجة أولية إذا البيانات ناقصة.</p>
        </div>
      </div>

      <BottomCTA label="التالي" onPress={onNext} variant="teal" sublabel="هذه الطبقة تساعدنا نفهم اللي يزيد أو يخفف الحالة" />
    </div>
  );
}

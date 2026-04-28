// lib/clinical-engine/circadian-rules-morning.ts
// Circadian Rules — Morning & Daytime Patterns
import type { CircadianInsight } from './types';
import type { EngineAnswers } from '@/components/health-engine/types';
import { flattenAnswersToText, clampConfidence } from './types';

interface Rule {
    id: string; disruption: string; axis: string; time: string;
    fix: string; conf: number; sigs: string[]; pw: string[];
    science: string; dietFix: string; tracking: string;
}

export const MORNING_RULES: Rule[] = [
    { id: 'blunted_car',
      disruption: 'انخفاض كورتيزول صباحي (Blunted CAR)',
      axis: 'محور HPA — الكورتيزول يجب أن يرتفع ٥٠–٧٥٪ خلال أول ٣٠ دقيقة من الاستيقاظ',
      time: '٦–٩ صباحاً: ذروة الكورتيزول مفقودة — الجسم لا يتحوّل لـ "وضع اليقظة"',
      fix: 'ضوء شمس ١٠ دقائق فور الاستيقاظ (بدون نظارة) + بروتين ≥ ٢٥ جم أول ٣٠ دقيقة + لا كافيين قبل ٩:٣٠ + ماء دافئ مع ليمون + حركة خفيفة ٥ دقائق (squats أو مشي)',
      conf: 78,
      sigs: ['إرهاق صباحي','صعوبة استيقاظ','تعب صباح','كسل','ثقل صباحي','لا أقدر أصحى','بطء صباح','ذهن ضبابي صباح'],
      pw: ['fatigue','hormonal','sleep'],
      science: 'CAR (Cortisol Awakening Response) = ارتفاع تلقائي للكورتيزول أول ٣٠ دقيقة. غيابه مؤشر Stage 2 HPA Burnout. ضوء ١٠٠٠٠ Lux صباحاً يُعيد ضبط SCN خلال ٧–١٤ يوم',
      dietFix: 'فطور عالي البروتين (بيض + أفوكادو + زيت زيتون) يُثبّت سكر الدم ويدعم إنتاج الكورتيزول الصباحي. تجنب الفطور السكري (عصير، كرواسون)',
      tracking: 'سجّل مستوى الطاقة (١–١٠) فور الاستيقاظ وبعد ٣٠ دقيقة — ٧ أيام متتالية' },

    { id: 'postprandial_crash',
      disruption: 'هبوط طاقة ما بعد الظهر (Post-Prandial Somnolence)',
      axis: 'تنظيم الأنسولين + Orexin-A (هرمون اليقظة) + إيقاع الكورتيزول الظهري',
      time: '١–٣ ظهراً: انخفاض طبيعي لكن المبالغ فيه (> ٣٠ دقيقة) = خلل أيضي',
      fix: 'غداء: بروتين ≥ ٣٠ جم + دهون صحية + خضار متنوعة. صفر نشويات بيضاء. مشي ١٠–١٥ دقيقة مباشرة بعد الأكل. قيلولة ≤ ٢٠ دقيقة إذا لزم فقط',
      conf: 72,
      sigs: ['هبوط بعد الظهر','تعب بعد الغداء','نعاس ظهر','نعاس بعد الأكل','خمول ظهر','لا أقدر أكمل بعد الغداء','غيبوبة غداء'],
      pw: ['fatigue','hormonal','digestion'],
      science: 'الكربوهيدرات المكررة ترفع Tryptophan/LNAA ratio → تريبتوفان يعبر BBB → سيروتونين → ميلاتونين مبكر. البروتين يرفع Orexin-A (هرمون اليقظة). لذلك: غداء البروتين = يقظة، غداء النشويات = نوم',
      dietFix: 'سمك مشوي + سلطة خضراء كبيرة + زيت زيتون = أفضل غداء للطاقة. تجنب الأرز الأبيض والخبز وحده',
      tracking: 'سجّل ماذا أكلت ومستوى الطاقة بعد ٩٠ دقيقة — ٥ أيام. ستكتشف الأطعمة المسبّبة بنفسك' },

    { id: 'dsps',
      disruption: 'تأخر طور النوم (Delayed Sleep Phase Syndrome)',
      axis: 'تأخر DLMO (Dim Light Melatonin Onset) + خلل SCN المركزية + Chronotype Mismatch',
      time: 'تسهر رغماً عنك حتى ١–٣ صباحاً ← لا تستطيع الاستيقاظ قبل ١٠–١٢ ظهراً',
      fix: 'ضوء شمس ١٥ دقيقة ٧ صباحاً (حتى لو متعب جداً) + ميلاتونين ٠.٥ مجم فقط الساعة ٧–٨ مساءً + تقديم النوم ١٥ دقيقة كل يومين + لا ضوء أبيض/أزرق بعد الغروب',
      conf: 70,
      sigs: ['سهر','لا أستيقظ','نوم متأخر','بومة ليلية','صعوبة صباح','نشاط ليلي','دماغي يُشتغل ليلاً'],
      pw: ['sleep'],
      science: 'SCN دورتها ٢٤.٢ ساعة — بدون Zeitgeber (ضوء الصباح) تتأخر يومياً. ضوء الصباح هو المُعيد الأقوى. ميلاتونين ٠.٥ مجم (جرعة منخفضة) أثبت Phase Advance في RCTs',
      dietFix: 'تريبتوفان في العشاء (ديك رومي، لبن دافئ، موز) يدعم إنتاج الميلاتونين الليلي. لا كافيين بعد ١٢ ظهراً أبداً',
      tracking: 'Sleep Diary ١٤ يوم: وقت النوم الفعلي + وقت الاستيقاظ الفعلي (ليس المخطط) — هذا ما يستخدمه الأطباء' },
];

export function detectMorningDisruptions(answers: EngineAnswers): CircadianInsight[] {
    const text = flattenAnswersToText(answers);
    const insights: CircadianInsight[] = [];
    for (const r of MORNING_RULES) {
        if (r.pw.length > 0 && !r.pw.includes(answers.pathwayId)) continue;
        const matched = r.sigs.filter(s => text.includes(s));
        if (matched.length >= 1) {
            let c = r.conf;
            if (answers.severity >= 7) c += 10;
            if (answers.duration === 'months' || answers.duration === 'years') c += 8;
            if (matched.length >= 3) c += 5;
            insights.push({ disruption: r.disruption, hormonalAxis: r.axis,
                timePattern: r.time, correction: r.fix, confidence: clampConfidence(c) });
        }
    }
    return insights.sort((a, b) => b.confidence - a.confidence);
}

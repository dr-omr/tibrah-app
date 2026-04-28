// lib/clinical-engine/circadian-rules-night.ts
// Circadian Rules — Evening & Night Patterns
import type { CircadianInsight } from './types';
import type { EngineAnswers } from '@/components/health-engine/types';
import { flattenAnswersToText, clampConfidence } from './types';

interface Rule {
    id: string; disruption: string; axis: string; time: string;
    fix: string; conf: number; sigs: string[]; pw: string[];
    science: string; dietFix: string; tracking: string;
}

export const NIGHT_RULES: Rule[] = [
    { id: 'wired_tired',
      disruption: 'ارتفاع كورتيزول مسائي (Wired but Tired Syndrome)',
      axis: 'انعكاس منحنى الكورتيزول + تثبيط DLMO بالضوء الأزرق',
      time: '٩–١٢ ليلاً: الكورتيزول يجب أن ينخفض لأدنى مستوى لكنه مرتفع عندك',
      fix: 'لا شاشات بعد ٩ مساءً + نظارات حجب أزرق (Blue Light Blockers) من ٧ مساءً + حلبة/ينسون ساخن + مغنيسيوم Glycinate ٤٠٠ مجم + تنفس ٤-٧-٨ × ٤ دورات + Brain Dump (كتابة مخاوف على ورقة قبل النوم)',
      conf: 75,
      sigs: ['قلق مساء','نشاط ليلي','سهر','عقل نشط','صعوبة نوم','أفكار ليلية','شاشات','لا أتوقف عن التفكير','إرهاق لكن لا أقدر أنام'],
      pw: ['sleep','anxiety'],
      science: 'الضوء الأزرق (٤٦٠ نانومتر) يُثبط الميلاتونين عبر ipRGC → SCN → Pineal Gland. الكورتيزول المسائي المرتفع يُنافس الميلاتونين مباشرة. Brain Dump يُفرغ Working Memory → يُريح Prefrontal Cortex',
      dietFix: 'لا كافيين بعد ١ ظهراً. وجبة عشاء خفيفة (بروتين + خضار) قبل النوم بـ ٣ ساعات. كيوي ٢ حبة قبل النوم (RCT: تحسين Sleep Onset بـ ٣٥٪)',
      tracking: 'سجّل وقت آخر شاشة ومتى شعرت بالنعاس فعلاً (ليس متى ذهبت للسرير) — ٧ أيام' },

    { id: 'nocturnal_hypoglycemia',
      disruption: 'استيقاظ ٣–٤ صباحاً (Nocturnal Hypoglycemia + Cortisol Mini-Surge)',
      axis: 'هبوط سكر ليلي → أدرينالين تعويضي + كورتيزول Pre-Dawn Surge مفاجئ',
      time: '٣–٤ صباحاً: مخازن Glycogen الكبدية تنفد → الكبد يُطلق أدرينالين لإطلاق الجلوكوز → يوقظك',
      fix: 'وجبة خفيفة قبل النوم بـ ٣٠ دقيقة: ملعقة زبدة لوز + تمرة + ملعقة عسل. لا سكر أبيض أو معجنات مساءً. Glycine ٣ جم مسحوق في ماء. تأكد من تهوية الغرفة ١٨°–٢٠°',
      conf: 80,
      sigs: ['استيقاظ ليلي','٣ صباح','٤ صباح','فجر','استيقاظ مفاجئ','خفقان ليلي','عرق ليلي','قلب سريع ليل','قلق بعد استيقاظ'],
      pw: ['sleep','fatigue','anxiety'],
      science: 'Pre-Dawn Cortisol Surge طبيعي (تدريجي من ٤–٦ صباح). في HPA Burnout: يصبح مفاجئاً. في Insulin Resistance: سكر الدم الليلي غير مستقر → أدرينالين ليلي. Glycine يُثبّت سكر الدم الليلي عبر Gluconeogenesis Inhibition',
      dietFix: 'عشاء متوازن: بروتين + دهون صحية + خضار. الدهون تُبطئ امتصاص الجلوكوز = يكفي الليل كله. تجنب الكحول — يُسبب Reactive Hypoglycemia في الساعة ٣ صباحاً',
      tracking: 'سجّل وقت الاستيقاظ + هل معه خفقان أو جوع أو قلق — ٧ ليالٍ. ثم سجّل ماذا أكلت في العشاء' },

    { id: 'flat_cortisol',
      disruption: 'خط كورتيزول مسطح (Flat Cortisol — Stage 3 Burnout)',
      axis: 'استنزاف HPA المتقدم — الكظرية لم تعد تستجيب لـ ACTH بشكل كافٍ',
      time: 'كورتيزول منخفض ثابت طوال اليوم — لا ذروة صباحية ولا انخفاض مسائي',
      fix: 'راحة قسرية ١٤–٢١ يوم (لا رياضة شاقة) + أشواغاندا KSM-66 ٣٠٠ مجم ×٢ + فيتامين C ١٠٠٠ مجم + B5 (Pantothenic Acid) ٥٠٠ مجم + نوم ٩–١٠ ساعات + Rhodiola rosea ٢٠٠ مجم صباحاً',
      conf: 65,
      sigs: ['إرهاق طوال اليوم','لا طاقة أبداً','منهك','مستنزف','انهيار','لا أقدر أكمل','كل شي صعب','خلاص','أحتاج أتوقف'],
      pw: ['fatigue'],
      science: 'Flat Cortisol = Stage 3 في Hans Selye Stress Model. الكظرية استنزفت Pregnenolone (Mother Hormone). أشواغاندا أثبتت تحسين الكورتيزول ٢٨٪ في RCT (JACM 2019). Rhodiola تُحفّز Mitochondria بدون تنشيط مفرط للجهاز العصبي',
      dietFix: 'أطعمة غنية بفيتامين C (فلفل أحمر، كيوي، بروكلي) + ملح بحري كافٍ (الكظرية المستنزفة تفقد الصوديوم) + أطعمة غنية بالكوليسترول الصحي (بيض، أفوكادو) لدعم إنتاج Pregnenolone',
      tracking: 'قِس الطاقة ٤ مرات يومياً (صباح، ظهر، عصر، مساء) على مقياس ١–١٠ — هذا يرسم "منحنى الطاقة الشخصي" ويُحدد أسوأ الأوقات' },
];

export function detectNightDisruptions(answers: EngineAnswers): CircadianInsight[] {
    const text = flattenAnswersToText(answers);
    const insights: CircadianInsight[] = [];
    for (const r of NIGHT_RULES) {
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

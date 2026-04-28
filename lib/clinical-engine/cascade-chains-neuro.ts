// lib/clinical-engine/cascade-chains-neuro.ts
// Cascade Chains — Neurological & Stress Systems
import type { CascadeChain } from './types';
import type { EngineAnswers } from '@/components/health-engine/types';
import { flattenAnswersToText, computeConfidence, clampConfidence } from './types';

interface CDef {
    id: string; nameAr: string; chain: string[];
    root: string; fix: string; mechanism: string;
    recoveryTimeline: string; confirmingLabs: string[];
    sigs: string[]; min: number; pw: string[]; w: number;
}

export const NEURO_CASCADES: CDef[] = [
    { id: 'gut_serotonin', nameAr: 'سلسلة الأمعاء → السيروتونين → المزاج',
      chain: [
          'خلل ميكروبيوم الأمعاء (Dysbiosis) ← نقص Lactobacillus وBifidobacterium',
          'تحويل التريبتوفان لمسار Kynurenine الالتهابي بدلاً من السيروتونين',
          'انخفاض السيروتونين المحيطي والمركزي',
          'قلق و/أو اكتئاب — السيروتونين = ٩٠٪ من مزاجنا',
          'اضطراب نوم (الميلاتونين يُصنع من السيروتونين)',
          'حلقة مفرغة: قلة النوم ← التهاب ← مزيد خلل الأمعاء',
      ],
      root: 'الأمعاء — ٩٠٪ من السيروتونين يُنتج في خلايا Enterochromaffin',
      fix: 'نظام الطيبات (إزالة الالتهابيات) + بروبيوتيك Lactobacillus rhamnosus ١٠ مليار + ألياف بريبيوتيك ١٥ جم/يوم + L-Tryptophan مساءً',
      mechanism: 'البكتيريا النافعة تُحوّل Tryptophan → 5-HTP → Serotonin. Dysbiosis يُحوّله لـ Kynurenic Acid (التهابي). إصلاح الأمعاء = رفع السيروتونين طبيعياً',
      recoveryTimeline: '٢–٤ أسابيع لتحسن الهضم، ٦–٨ أسابيع لتحسن المزاج والنوم',
      confirmingLabs: ['Comprehensive Stool Analysis (GI-MAP)', 'Organic Acids (5-HIAA)', 'Tryptophan/Kynurenine Ratio'],
      sigs: ['انتفاخ','قلق','نوم','مزاج','هضم','غازات','إمساك','إسهال','اكتئاب','حزن','غثيان'],
      min: 3, pw: ['digestion','anxiety','sleep'], w: 1.3 },

    { id: 'vagus_shutdown', nameAr: 'سلسلة خمول العصب المبهم → التهاب شامل',
      chain: [
          'إجهاد مزمن / صدمة ← تثبيط Vagal Tone (HRV ينخفض)',
          'فقدان Cholinergic Anti-inflammatory Pathway (الفرملة الالتهابية)',
          'ارتفاع TNF-α و IL-6 بلا رادع ← التهاب صامت شامل',
          'اضطراب حركة الأمعاء ← انتفاخ وإمساك (المبهم يُنظّم ٧٥٪ من التعصيب المعوي)',
          'ارتفاع معدل القلب أثناء الراحة (> ٨٠) ← قلق جسدي مستمر',
          'ضعف المناعة ← نزلات متكررة وبطء شفاء',
      ],
      root: 'العصب المبهم — أطول عصب قحفي، يربط الدماغ بالقلب والرئتين والأمعاء',
      fix: 'تنشيط ٣×/يوم: تنفس ٤-٧-٨ × ٤ دورات + غرغرة ماء بارد ٣٠ ثانية + همهمة ٢ دقيقة + ماء بارد على الوجه ١٥ ثانية',
      mechanism: 'المبهم يُطلق Acetylcholine ← يُثبط Macrophages عبر α7-nAChR ← يُوقف إنتاج TNF-α. HRV هو مؤشر Vagal Tone الأدق',
      recoveryTimeline: 'تحسن فوري بعد كل تمرين. تحسن مستدام HRV بعد ٢–٣ أسابيع يومية',
      confirmingLabs: ['HRV Analysis (Wearable 7-day average)', 'hs-CRP', 'Resting Heart Rate Trend'],
      sigs: ['قلق','هضم','خفقان','توتر','التهاب','مناعة','تنفس','ضغط','بطن','حموضة'],
      min: 3, pw: ['anxiety','digestion','immune'], w: 1.2 },

    { id: 'sleep_hormone', nameAr: 'سلسلة النوم → الهرمونات → كل شيء',
      chain: [
          'قلة Stage 3/4 NREM ← نقص GH Pulses الليلية',
          'ضعف إصلاح الأنسجة ← ألم عضلي + شيخوخة مبكرة + بطء شفاء',
          'ارتفاع Ghrelin + انخفاض Leptin ← جوع مفرط + مقاومة أنسولين',
          'انخفاض Testosterone/Estradiol ← ضعف طاقة وليبيدو',
          'اشتهاء كافيين/سكر ← تأخير النوم التالي ← حلقة مفرغة',
          'ارتفاع Cortisol الليلي ← تلف Hippocampus تدريجي (ذاكرة)',
      ],
      root: 'النوم العميق — المصنع الهرموني والإصلاحي الليلي لـ ٣٧ تريليون خلية',
      fix: 'بروتوكول نوم ٢١ يوم: غرفة ١٨°–٢٠° + ظلام ١٠٠٪ + لا شاشات ٩٠ دقيقة + مغنيسيوم ٤٠٠ مجم + Glycine ٣ جم مسحوق',
      mechanism: 'GH يُفرز في ٨٠٪ من الليل خلال SWS. بدونه: لا إصلاح عضلي. Leptin يُفرز ليلاً — نقصه = جوع لا يُشبع رغم الأكل',
      recoveryTimeline: '٣–٥ ليالٍ لتحسن الطاقة. ٢–٣ أسابيع لضبط الهرمونات. ٨ أسابيع للهيكل الهرموني الكامل',
      confirmingLabs: ['Sleep Study PSG', 'GH/IGF-1', 'Testosterone/Estradiol AM', 'Leptin/Ghrelin'],
      sigs: ['نوم','إرهاق صباحي','كافيين','سكر','تعب','أرق','استيقاظ','شاشات','جوع','جيد ليل سيء صباح'],
      min: 3, pw: ['sleep','fatigue','hormonal'], w: 1.4 },
];

export function detectNeuroCascades(answers: EngineAnswers): CascadeChain[] {
    const text = flattenAnswersToText(answers);
    const results: CascadeChain[] = [];
    for (const d of NEURO_CASCADES) {
        if (!d.pw.includes(answers.pathwayId)) continue;
        const matched = d.sigs.filter(s => text.includes(s));
        if (matched.length >= d.min) {
            let conf = computeConfidence(matched.length / d.sigs.length, answers.severity, answers.duration);
            const hasStress = answers.emotionalContext?.some(e => ['burnout','work_stress','trauma'].includes(e));
            if (hasStress) conf += 8;
            conf = clampConfidence(Math.round(conf * d.w));
            results.push({ id: d.id, nameAr: d.nameAr, chain: d.chain,
                rootCause: d.root, breakpoint: d.fix, confidence: conf });
        }
    }
    return results.sort((a, b) => b.confidence - a.confidence);
}

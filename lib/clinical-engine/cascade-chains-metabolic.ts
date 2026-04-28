// lib/clinical-engine/cascade-chains-metabolic.ts
// Cascade Chains — Metabolic & Hormonal Systems
import type { CascadeChain } from './types';
import type { EngineAnswers } from '@/components/health-engine/types';
import { flattenAnswersToText, computeConfidence, clampConfidence } from './types';

interface CDef {
    id: string; nameAr: string; chain: string[];
    root: string; fix: string; mechanism: string;
    recoveryTimeline: string; confirmingLabs: string[];
    sigs: string[]; min: number; pw: string[]; w: number;
}

export const METABOLIC_CASCADES: CDef[] = [
    { id: 'cortisol_insulin', nameAr: 'سلسلة الكورتيزول → الأنسولين → الطاقة',
      chain: [
          'إجهاد مزمن ← ارتفاع كورتيزول مستمر (Hypercortisolemia)',
          'الكورتيزول يُنشّط Gluconeogenesis الكبدي ← ارتفاع سكر الدم',
          'البنكرياس يُفرط في أنسولين ← Hyperinsulinemia تعويضية',
          'Insulin Receptor Downregulation ← مقاومة أنسولين',
          'تخزين دهون البطن (Visceral Fat) ← يُفرز مزيداً من السيتوكينات',
          'تذبذب سكر الدم ← هبوط طاقة + ضبابية + اشتهاء سكر مفرط',
      ],
      root: 'الإجهاد المزمن يُحوّل الجسم لـ "وضع البقاء" — يرفع الكورتيزول ويُربك الأنسولين',
      fix: 'عصب مبهم ٣×/يوم + وجبات كل ٤ ساعات مع بروتين ≥ ٢٥ جم + حذف السكر الأبيض + مشي ١٥ دقيقة بعد كل وجبة',
      mechanism: 'Cortisol → Gluconeogenesis → Hyperglycemia → Insulin ↑↑ → Receptor Downregulation → IR. Visceral fat يُفرز IL-6 و TNF-α ← يُزيد IR',
      recoveryTimeline: '٧–١٠ أيام لاستقرار سكر الدم. ٣–٦ أشهر لعكس مقاومة الأنسولين',
      confirmingLabs: ['HOMA-IR', 'Fasting Insulin', 'Cortisol AM/PM', 'HbA1c', 'TG/HDL ratio'],
      sigs: ['إرهاق','سكر','وزن','ضغط','قلق','ضبابية','هبوط طاقة','كافيين','بطن','جوع','نعاس بعد أكل'],
      min: 3, pw: ['fatigue','hormonal','anxiety'], w: 1.4 },

    { id: 'thyroid_cascade', nameAr: 'سلسلة الدرقية → كل الأنظمة',
      chain: [
          'التهاب مناعي ذاتي (هاشيموتو) ← تدمير تدريجي لخلايا الدرقية',
          'نقص T3 الحر (الهرمون النشط) ← بطء أيض في كل خلية',
          'إرهاق + زيادة وزن + برودة + إمساك (أيض بطيء)',
          'انخفاض تحويل Tryptophan ← اكتئاب + ضبابية (نقص سيروتونين ثانوي)',
          'ضعف NK Cells و T-Cells ← نزلات متكررة + بطء شفاء',
          'احتباس سوائل + انتفاخ وجه ← بطء الليمفاوي',
      ],
      root: 'الغدة الدرقية — الثرموستات المركزي لـ ٣٧ تريليون خلية في الجسم',
      fix: 'TSH + Free T4 + Free T3 + Anti-TPO → ليفوثيروكسين إذا لزم + سيلينيوم ٢٠٠ مكغ + زنك ٣٠ مجم + حذف الجلوتين (Molecular Mimicry مع TPO)',
      mechanism: 'Anti-TPO يُشبه TPO بنيوياً → Molecular Mimicry → مهاجمة الغدة. الجلوتين يُحفز إنتاج Anti-TPO عند MTHFR variants',
      recoveryTimeline: '٤–٦ أسابيع بعد بدء العلاج لتحسن الطاقة. ٣–٦ أشهر لحل الأعراض الكاملة',
      confirmingLabs: ['TSH', 'Free T4', 'Free T3', 'Anti-TPO', 'Anti-Thyroglobulin', 'Thyroid Ultrasound'],
      sigs: ['تعب','وزن','برودة','إمساك','جفاف','اكتئاب','تساقط شعر','بطء','انتفاخ وجه','بحة','دورة غزيرة'],
      min: 3, pw: ['fatigue','hormonal'], w: 1.5 },

    { id: 'inflammation_pain', nameAr: 'سلسلة الالتهاب الصامت → الألم → الإرهاق',
      chain: [
          'غذاء التهابي (زيوت مهدرجة + سكر + قمح مكرر + ألبان مصنّعة)',
          'Omega-6/Omega-3 ratio > 15:1 ← إنتاج Prostaglandins الالتهابية',
          'NF-κB مُنشَّط ← ارتفاع IL-6 + TNF-α + CRP',
          'ألم مفاصل وعضلات ← تقييد حركة ← ضمور عضلي',
          'Mitochondrial Dysfunction ← إرهاق خلوي عميق',
          'Sickness Behavior (IL-6 → مخ): اكتئاب + انسحاب + فقدان شهية',
      ],
      root: 'الالتهاب الصامت المزمن — كل وجبة إما دواء أو سُم',
      fix: 'نظام الطيبات (يحذف ٩٠٪ من المسببات تلقائياً) + أوميغا ٣ ≥ ٢٠٠٠ مجم + كركمين + بيبيرين ١٠٠٠ مجم + فيتامين D + فيتامين C',
      mechanism: 'EPA يُثبط COX-2 وLOX ← ↓ Prostaglandins. Curcumin يُثبط NF-κB مباشرة. Resolvins تُنهي الالتهاب بشكل فعّال',
      recoveryTimeline: '٧–١٤ يوم لتحسن الألم. ٤–٨ أسابيع لانخفاض CRP لمستويات طبيعية',
      confirmingLabs: ['hs-CRP', 'ESR', 'IL-6', 'Omega-6/3 Index', 'Ferritin (acute phase marker)'],
      sigs: ['ألم','تعب','التهاب','تيبس','مفاصل','عضلات','حساسية','جلد','تورم','ثقل'],
      min: 3, pw: ['pain','fatigue','immune'], w: 1.3 },
];

export function detectMetabolicCascades(answers: EngineAnswers): CascadeChain[] {
    const text = flattenAnswersToText(answers);
    const results: CascadeChain[] = [];
    for (const d of METABOLIC_CASCADES) {
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

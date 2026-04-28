// lib/tayyibat/protocols.ts — بروتوكولات الطيبات المخصصة
import type { TayyibatProtocol } from './types';

export const TAYYIBAT_PROTOCOLS: TayyibatProtocol[] = [
    {
        id:'core_21', name:'بروتوكول الطيبات الأساسي — ٢١ يوم',
        targetPathways:['fatigue','hormonal','immune'],
        durationDays:21,
        successMetrics:['طاقة أكثر في الصباح','هضم أفضل','نوم أعمق','وزن أكثر استقراراً'],
        contraindicatedFor:['حمل (يحتاج تعديل)','سكري نوع ١ (يحتاج إشراف)'],
        phases:[
            { phaseNumber:1, name:'تنظيف الجهاز — ٧ أيام', durationDays:7,
              allowedExtra:[], eliminateNow:['السكر الأبيض','الدقيق الأبيض','الزيوت النباتية المكررة','العصائر المصنعة'],
              dailyFocus:'احذف كل المُلوّثات من مطبخك. افعلها الآن وليس تدريجياً.',
              expectedOutcome:'٧٢–٩٦ ساعة: صداع خفيف (Detox) ثم طاقة أفضل وبطن أخف' },
            { phaseNumber:2, name:'بناء الأساس — ٧ أيام', durationDays:7,
              allowedExtra:['بروتين في كل وجبة','خضار متنوعة','ثوم وكركم يومياً'],
              eliminateNow:['أي بقايا من المرحلة ١'],
              dailyFocus:'بنِ عادة البروتين + الخضار في كل وجبة رئيسية',
              expectedOutcome:'تحسن ملحوظ في الطاقة المستدامة. بداية تحسن المزاج والنوم.' },
            { phaseNumber:3, name:'الترسيخ والضبط الدقيق — ٧ أيام', durationDays:7,
              allowedExtra:['أوميغا ٣ يومياً (سمك أو مكمل)','بريبيوتيك (ثوم + موز أخضر + شوفان)'],
              eliminateNow:['أي انتهاك يومي'],
              dailyFocus:'أضف تنوعاً نباتياً: الهدف ٣٠ نوع نباتي مختلف هذا الأسبوع',
              expectedOutcome:'استقرار الطاقة طوال اليوم. جهاز هضمي محسّن. نوم أعمق مستدام.' }
        ]
    },
    {
        id:'anti_inflammation', name:'بروتوكول مكافحة الالتهاب — ٤٥ يوم',
        targetPathways:['pain','immune','fatigue'],
        durationDays:45,
        successMetrics:['انخفاض hs-CRP عند الفحص','تحسن ألم المفاصل','طاقة أفضل'],
        contraindicatedFor:['مرضى مميعات الدم (أوميغا ٣ يحتاج احتياط)'],
        phases:[
            { phaseNumber:1, name:'حذف الملتهبات — ١٤ يوم', durationDays:14,
              allowedExtra:[], eliminateNow:['جميع الزيوت النباتية المكررة','السكر بكل أشكاله','اللحوم المصنعة','الغلوتين (اختياري لكن مفيد)'],
              dailyFocus:'أوميغا ٣ ≥ ٢٠٠٠ مجم يومياً (سمك ×٣ أسبوع أو مكمل). كركم + فلفل أسود في كل وجبة.',
              expectedOutcome:'انخفاض ألم خلال ١٠–١٤ يوم. CRP بدأ الانخفاض.' },
            { phaseNumber:2, name:'تحميل المضادات — ١٤ يوم', durationDays:14,
              allowedExtra:['بروكلي يومياً (سولفورافين)','توت أزرق (أنثوسيانين)','شاي أخضر','زنجبيل'],
              eliminateNow:['بقايا الانتهاكات'],
              dailyFocus:'تنوع ألوان الطعام: أحمر (طماطم) + برتقالي (جزر) + أخضر (سبانخ) + بنفسجي (توت) يومياً',
              expectedOutcome:'الطاقة تستقر. الجهاز المناعي يُعاد برمجته.' },
            { phaseNumber:3, name:'صيانة الحالة — ١٧ يوم', durationDays:17,
              allowedExtra:['بروبيوتيك عالي الجودة','فيتامين د + مغنيسيوم'],
              eliminateNow:[],
              dailyFocus:'فحص CRP في نهاية الـ ٤٥ يوم لقياس النتيجة العلمية الفعلية',
              expectedOutcome:'CRP ↓ ٣٠–٤٧٪. ألم مفاصل ↓ ٣٥٪. طاقة مستدامة.' }
        ]
    },
    {
        id:'gut_reset', name:'بروتوكول إعادة ضبط الأمعاء — ٣٠ يوم',
        targetPathways:['digestion','immune','anxiety'],
        durationDays:30,
        successMetrics:['هضم بدون انتفاخ','انتظام حركة الأمعاء','مزاج أفضل'],
        contraindicatedFor:['SIBO نشط (يحتاج علاجاً أولاً)'],
        phases:[
            { phaseNumber:1, name:'إزالة المؤذيات — ١٠ أيام', durationDays:10,
              allowedExtra:[], eliminateNow:['الغلوتين','الألبان المصنعة','السكر','الكحول','المقلي'],
              dailyFocus:'اشرب مرق العظام ٢ كوب/يوم — Collagen وGlycine يُرمّمان جدار الأمعاء',
              expectedOutcome:'انخفاض انتفاخ ملحوظ في ٣–٥ أيام' },
            { phaseNumber:2, name:'إعادة الزرع — ١٠ أيام', durationDays:10,
              allowedExtra:['بروبيوتيك ١٠ مليار CFU','كيمشي أو خل تفاح أو زبادي ماعز','موز أخضر (بريبيوتيك)'],
              eliminateNow:[],
              dailyFocus:'خضار متخمرة يومياً + ألياف متنوعة (ليس نوع واحد فقط)',
              expectedOutcome:'تنوع ميكروبيوم يبدأ التحسن. مزاج وطاقة أفضل.' },
            { phaseNumber:3, name:'تغذية وصيانة — ١٠ أيام', durationDays:10,
              allowedExtra:['بريبيوتيك قوي: ثوم + بصل + هليون + خرشوف','L-Glutamine ٥ جم/يوم'],
              eliminateNow:[],
              dailyFocus:'L-Glutamine يُغذّي خلايا الظهارة المعوية مباشرة — يُغلق Tight Junctions',
              expectedOutcome:'أمعاء صحية مستدامة. مناعة قوية. Leaky Gut يبدأ الإغلاق.' }
        ]
    },
];

export function getProtocolById(id: string): TayyibatProtocol | undefined {
    return TAYYIBAT_PROTOCOLS.find(p => p.id === id);
}

export function getProtocolsForPathway(pathway: string): TayyibatProtocol[] {
    return TAYYIBAT_PROTOCOLS.filter(p =>
        p.targetPathways.includes(pathway as TayyibatProtocol['targetPathways'][number])
    );
}

export function getBestProtocolForScore(score: number): TayyibatProtocol {
    if (score >= 70) return TAYYIBAT_PROTOCOLS.find(p => p.id === 'anti_inflammation')!;
    if (score >= 40) return TAYYIBAT_PROTOCOLS.find(p => p.id === 'core_21')!;
    return TAYYIBAT_PROTOCOLS.find(p => p.id === 'gut_reset')!;
}

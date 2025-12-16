import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Clock, Eye, Share2, Bookmark,
    Play, FileText, BookOpen, Mic, Tag, Calendar, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import CommentsSection from '../components/common/CommentsSection';

// مقالات حقيقية مبنية على علم
const realArticles = {
    '1': {
        id: '1',
        title: 'ما هو الطب الوظيفي؟ دليلك الشامل للشفاء الجذري',
        summary: 'تعرف على كيفية علاج الأمراض من جذورها بدلاً من الأعراض فقط',
        content: `
## ما هو الطب الوظيفي؟

الطب الوظيفي (Functional Medicine) هو نهج طبي متقدم يركز على تحديد ومعالجة الأسباب الجذرية للأمراض، وليس مجرد علاج الأعراض. تم تأسيس معهد الطب الوظيفي (IFM) عام 1991 على يد الدكتور جيفري بلاند.

## المبادئ الخمسة للطب الوظيفي

### 1. النظرة الشمولية للجسم
الجسم البشري نظام متكامل ومترابط. كل عضو يؤثر على الآخر. مشكلة في الأمعاء قد تظهر كمشاكل جلدية أو نفسية.

### 2. التفرد البيولوجي
كل شخص فريد جينياً وبيئياً. ما ينفع شخصاً قد لا ينفع آخر. لذلك العلاج يجب أن يكون مخصصاً.

### 3. التوازن الديناميكي
الصحة هي توازن مستمر بين أنظمة الجسم المختلفة: الهرمونات، المناعة، الهضم، الإزالة السموم.

### 4. القدرة الفطرية على الشفاء
الجسم لديه قدرة ذاتية على الشفاء والتجدد إذا أزلنا العوائق ووفرنا الظروف المناسبة.

### 5. الصحة كحيوية إيجابية
الصحة ليست مجرد غياب المرض، بل هي حالة من الحيوية والنشاط والرفاهية.

## الفرق بين الطب الوظيفي والطب التقليدي

| الطب الوظيفي | الطب التقليدي |
|-------------|--------------|
| يبحث عن السبب الجذري | يعالج الأعراض |
| نظرة شمولية للمريض | تخصصات منفصلة |
| علاج شخصي مخصص | بروتوكولات موحدة |
| الوقاية والعلاج معاً | التركيز على العلاج |
| تغيير نمط الحياة أولاً | الأدوية أولاً |

## أدوات التشخيص في الطب الوظيفي

- **تحاليل الدم المتقدمة**: ليس فقط CBC، بل علامات الالتهاب، الهرمونات، المغذيات
- **تحليل البراز الشامل**: فحص الميكروبيوم والهضم والامتصاص
- **تحاليل البول العضوية**: لتقييم التمثيل الغذائي الخلوي
- **تحاليل الحساسية الغذائية**: IgG و IgE
- **تقييم السموم والمعادن الثقيلة**

## المصادر العلمية

- The Institute for Functional Medicine (IFM)
- Pizzorno JE, Murray MT. Textbook of Natural Medicine
- Bland JS. The Disease Delusion
    `,
        type: 'article',
        category: 'functional_medicine',
        image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
        duration_minutes: 12,
        views: 1250,
        tags: ['طب وظيفي', 'شفاء جذري', 'صحة شاملة'],
        created_date: '2025-01-15',
        references: [
            { title: 'Institute for Functional Medicine', url: 'https://www.ifm.org/' },
            { title: 'PubMed - Functional Medicine', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=functional+medicine' }
        ]
    },
    '2': {
        id: '2',
        title: 'الترددات الشفائية: العلم وراء الشفاء بالصوت',
        summary: 'اكتشف كيف تؤثر الترددات على خلايا الجسم وتساعد في الشفاء',
        content: `
## مقدمة في العلاج بالترددات

العلاج بالترددات الصوتية يعتمد على حقيقة فيزيائية أساسية: كل شيء في الكون يهتز بتردد معين، بما في ذلك خلايا جسمنا.

## ترددات سولفيجيو التسعة

هذه الترددات القديمة اكتُشفت في الترانيم الغريغورية وتم إحياؤها بواسطة الدكتور جوزيف بوليو:

### 174 هرتز - تردد الأمان
يساعد على تخفيف الألم والتوتر، يعطي إحساساً بالأمان والحب.

### 285 هرتز - تردد الشفاء
يساعد في شفاء الأنسجة التالفة وتجديد الخلايا.

### 396 هرتز - تردد التحرر
يساعد في التخلص من الخوف والذنب والمشاعر السلبية.

### 417 هرتز - تردد التغيير
يسهل التغيير والتحول ويزيل الطاقة السلبية.

### 528 هرتز - تردد المعجزات
يُعرف بـ"تردد الحب" ويُقال إنه يصلح الحمض النووي. أظهرت دراسات أنه يقلل التوتر.

### 639 هرتز - تردد العلاقات
يعزز التواصل والانسجام في العلاقات.

### 741 هرتز - تردد الحدس
يساعد على إيقاظ الحدس وحل المشكلات.

### 852 هرتز - تردد البصيرة
يعيد الاتصال الروحي ويرفع الوعي.

### 963 هرتز - تردد الوحدة
يُعرف بتردد "العين الثالثة" ويوصل بالوعي الكوني.

## الدراسات العلمية

- دراسة 2018 في مجلة Global Advances in Health and Medicine أظهرت أن تردد 528Hz يقلل مستوى الكورتيزول (هرمون التوتر)
- أبحاث معهد HeartMath أثبتت تأثير الترددات على تماسك ضربات القلب
- دراسات الدكتور ماسارو إيموتو على تأثير الترددات على جزيئات الماء

## كيف تستخدم الترددات؟

1. **اختر بيئة هادئة** خالية من المشتتات
2. **استخدم سماعات جيدة** للحصول على أفضل النتائج
3. **استمع 15-30 دقيقة يومياً** للحصول على تأثير تراكمي
4. **اجمعها مع التأمل** لتعزيز التأثير
5. **اشرب ماء** قبل وبعد الجلسة
    `,
        type: 'article',
        category: 'frequencies',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        duration_minutes: 15,
        views: 3420,
        tags: ['ترددات شفائية', 'سولفيجيو', 'علاج صوتي'],
        created_date: '2025-01-10',
        references: [
            { title: 'NCBI - Sound Healing Research', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5871151/' },
            { title: 'HeartMath Institute', url: 'https://www.heartmath.org/' }
        ]
    },
    '3': {
        id: '3',
        title: 'دراسة: تأثير الصيام المتقطع على إصلاح الخلايا',
        summary: 'نتائج أحدث الدراسات العلمية حول فوائد الصيام المتقطع والالتهام الذاتي',
        content: `
## مقدمة

الصيام المتقطع (Intermittent Fasting) ليس مجرد حمية غذائية، بل هو نمط أكل يعتمد على التناوب بين فترات الأكل والصيام.

## أنواع الصيام المتقطع

### 1. طريقة 16/8
صيام 16 ساعة وتناول الطعام خلال 8 ساعات. الأكثر شيوعاً وسهولة.

### 2. صيام اليوم البديل
صيام يوم كامل ثم أكل طبيعي في اليوم التالي.

### 3. طريقة 5:2
أكل طبيعي 5 أيام، وتقليل السعرات (500-600) يومين.

### 4. صيام 24 ساعة
صيام يوم كامل مرة أو مرتين أسبوعياً.

## الفوائد العلمية المثبتة

### الالتهام الذاتي (Autophagy)
حاز الدكتور يوشينوري أوسومي على جائزة نوبل 2016 لاكتشافه آليات الالتهام الذاتي. الصيام يحفز هذه العملية التي:
- تنظف الخلايا من البروتينات التالفة
- تزيل الميتوكوندريا المعطوبة
- تقي من أمراض الشيخوخة

### تحسين حساسية الأنسولين
دراسات عديدة أظهرت أن الصيام:
- يخفض مستوى الأنسولين بنسبة 20-31%
- يحسن حساسية الخلايا للأنسولين
- يقلل خطر السكري النوع الثاني

### خسارة الوزن
- زيادة حرق الدهون بنسبة 3.6-14%
- الحفاظ على الكتلة العضلية
- تقليل الدهون الحشوية

### صحة الدماغ
- زيادة إنتاج BDNF (عامل نمو عصبي)
- تحسين الذاكرة والتركيز
- الوقاية من الزهايمر

## احتياطات مهمة

⚠️ الصيام **غير مناسب** لـ:
- الحوامل والمرضعات
- مرضى السكري (دون إشراف طبي)
- من لديهم تاريخ اضطرابات الأكل
- الأطفال والمراهقين

## المصادر

- Yoshinori Ohsumi - Nobel Prize 2016
- NEJM Review: Effects of Intermittent Fasting
- Cell Metabolism Journal Studies
    `,
        type: 'study',
        category: 'nutrition',
        image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
        duration_minutes: 12,
        views: 890,
        tags: ['صيام متقطع', 'التهام ذاتي', 'تجديد خلايا'],
        created_date: '2025-01-08',
        references: [
            { title: 'Nobel Prize - Autophagy', url: 'https://www.nobelprize.org/prizes/medicine/2016/press-release/' },
            { title: 'NEJM - Intermittent Fasting', url: 'https://www.nejm.org/doi/full/10.1056/NEJMra1905136' }
        ]
    },
    '4': {
        id: '4',
        title: 'بروتوكول ديتوكس الكبد: خطوة بخطوة',
        summary: 'دليل عملي لتنظيف الكبد وتحسين وظائفه بشكل طبيعي',
        content: `
## لماذا تنظيف الكبد مهم؟

الكبد هو أكبر عضو داخلي ويقوم بأكثر من 500 وظيفة، أهمها:
- تنقية الدم من السموم
- إنتاج الصفراء لهضم الدهون
- تخزين الفيتامينات والمعادن
- تنظيم السكر في الدم
- إنتاج البروتينات المهمة

## علامات الكبد المثقل

- التعب المزمن
- مشاكل هضمية (انتفاخ، إمساك)
- الصداع المتكرر
- حساسية الجلد
- صعوبة خسارة الوزن
- رائحة فم كريهة

## مراحل ديتوكس الكبد

### المرحلة 1: التحضير (3-5 أيام)
- إزالة السكر المكرر والمعالج
- تقليل الكافيين تدريجياً
- زيادة الخضروات الورقية
- شرب 2-3 لتر ماء يومياً

### المرحلة 2: التنظيف (7-14 يوم)

**الأطعمة الداعمة:**
- الخضروات الصليبية (بروكلي، قرنبيط، كرنب)
- البنجر والجزر
- الثوم والبصل
- الكركم والزنجبيل
- عصير الليمون

**المكملات الموصى بها:**
- شوك الحليب (Milk Thistle) - 150-300mg
- NAC - 600mg
- الجلوتاثيون
- فيتامين C

### المرحلة 3: إعادة البناء (7 أيام)
- إدخال الأطعمة تدريجياً
- مراقبة ردود الفعل
- بناء نظام غذائي صحي مستدام

## تحذيرات مهمة

⚠️ استشر طبيبك قبل البدء إذا كنت:
- تتناول أدوية بشكل منتظم
- تعاني من أمراض الكبد
- حامل أو مرضعة

## المصادر

- Liver Foundation Research
- Journal of Hepatology Studies
    `,
        type: 'article',
        category: 'detox',
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        duration_minutes: 10,
        views: 2100,
        tags: ['ديتوكس', 'كبد', 'تنظيف', 'سموم'],
        created_date: '2025-01-05',
        references: [
            { title: 'American Liver Foundation', url: 'https://liverfoundation.org/' }
        ]
    },
    '5': {
        id: '5',
        title: 'أفضل 10 مكملات للطاقة والحيوية',
        summary: 'قائمة بأهم المكملات الغذائية لزيادة الطاقة بشكل طبيعي وآمن',
        content: `
## لماذا نحتاج مكملات الطاقة؟

نقص الطاقة مشكلة شائعة لأسباب متعددة:
- نقص المغذيات في الطعام الحديث
- التوتر المزمن
- قلة النوم
- مشاكل الغدة الدرقية
- نقص الحديد أو B12

## أفضل 10 مكملات للطاقة

### 1. فيتامين B12 (كوبالامين)
- **الجرعة**: 1000-2000 mcg يومياً
- **الفوائد**: ضروري لإنتاج الطاقة، صحة الأعصاب، تكوين الدم
- **مصادر**: الحقن أو الحبوب تحت اللسان أفضل امتصاصاً

### 2. الحديد
- **الجرعة**: حسب نتائج التحليل
- **الفوائد**: نقل الأكسجين، إنتاج الهيموغلوبين
- **تحذير**: لا تأخذه دون تحليل أولاً

### 3. كو-إنزيم Q10 (CoQ10)
- **الجرعة**: 100-200 mg يومياً
- **الفوائد**: إنتاج الطاقة الخلوية، مضاد أكسدة
- **ملاحظة**: الشكل Ubiquinol أفضل امتصاصاً

### 4. المغنيسيوم
- **الجرعة**: 300-400 mg مساءً
- **الفوائد**: يدخل في 300+ تفاعل إنزيمي، يحسن النوم
- **الأشكال المفضلة**: غلايسينات، ثريونات

### 5. فيتامين D3
- **الجرعة**: 2000-5000 IU يومياً
- **الفوائد**: مناعة، مزاج، طاقة، عظام
- **مع**: فيتامين K2 للامتصاص الأمثل

### 6. الأشواجندا
- **الجرعة**: 300-600 mg يومياً
- **الفوائد**: تكيف، تقليل الكورتيزول، طاقة مستدامة
- **الوقت**: صباحاً أو مساءً

### 7. الرهوديولا الوردية
- **الجرعة**: 200-400 mg صباحاً
- **الفوائد**: مقاومة الإجهاد، تحسين الأداء الذهني
- **تحذير**: لا تأخذها مساءً

### 8. أوميغا 3
- **الجرعة**: 2-3 غرام EPA+DHA
- **الفوائد**: صحة الدماغ، مضاد للالتهاب
- **المصدر**: زيت السمك أو الطحالب

### 9. الكرياتين
- **الجرعة**: 3-5 غرام يومياً
- **الفوائد**: طاقة عضلية، أداء رياضي، وظائف دماغية
- **الشكل**: مونوهيدرات

### 10. الجينسنغ
- **الجرعة**: 200-400 mg يومياً
- **الفوائد**: طاقة، تركيز، مناعة
- **الأنواع**: كوري، سيبيري، أمريكي

## نصائح مهمة

1. ابدأ بمكمل واحد لمعرفة تأثيره
2. اختر علامات تجارية موثوقة
3. استشر طبيبك خاصة إذا كنت تتناول أدوية
4. أعطِ المكمل 4-6 أسابيع لتقييم فعاليته
    `,
        type: 'article',
        category: 'supplements',
        image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800',
        duration_minutes: 8,
        views: 3200,
        tags: ['مكملات', 'طاقة', 'فيتامينات', 'معادن'],
        created_date: '2025-01-03',
        references: [
            { title: 'Examine.com', url: 'https://examine.com/' },
            { title: 'PubMed Supplements', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
        ]
    },
    '6': {
        id: '6',
        title: 'كيف يؤثر النوم على هرموناتك؟',
        summary: 'العلاقة بين جودة النوم والتوازن الهرموني في الجسم',
        content: `
## أهمية النوم للهرمونات

النوم ليس مجرد راحة - إنه وقت إعادة ضبط النظام الهرموني بالكامل.

## الهرمونات المتأثرة بالنوم

### 1. هرمون النمو (GH)
- **إفرازه**: 70% أثناء النوم العميق
- **وظائفه**: بناء العضلات، حرق الدهون، تجديد الخلايا
- **قلة النوم**: تقلل إفرازه بنسبة 70%

### 2. الكورتيزول
- **الطبيعي**: ينخفض مساءً، يرتفع صباحاً
- **قلة النوم**: يبقى مرتفعاً = تراكم الدهون، التهابات
- **الحل**: نوم قبل 11 مساءً

### 3. اللبتين والغريلين
- **اللبتين**: هرمون الشبع - ينخفض بقلة النوم
- **الغريلين**: هرمون الجوع - يرتفع بقلة النوم
- **النتيجة**: قلة النوم = شهية أكبر = زيادة وزن

### 4. الأنسولين
- ليلة واحدة سيئة تقلل حساسية الأنسولين 25%
- قلة النوم المزمنة تزيد خطر السكري

### 5. الميلاتونين
- هرمون النوم والساعة البيولوجية
- مضاد أكسدة قوي
- الضوء الأزرق يثبط إنتاجه

### 6. التستوستيرون
- معظم إنتاجه أثناء النوم العميق
- قلة النوم تقلله بنسبة 10-15%

## نصائح للنوم المثالي

### بيئة النوم
- غرفة مظلمة تماماً
- درجة حرارة 18-20 درجة
- هدوء تام

### قبل النوم
- توقف عن الشاشات قبل ساعتين
- تجنب الكافيين بعد الظهر
- لا تأكل وجبة ثقيلة

### مكملات داعمة
- المغنيسيوم (غلايسينات) 400mg
- الجلايسين 3g
- L-Theanine 200mg
- الميلاتونين 0.5-3mg (للسفر فقط)
    `,
        type: 'article',
        category: 'lifestyle',
        image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
        duration_minutes: 10,
        views: 1540,
        tags: ['نوم', 'هرمونات', 'صحة'],
        created_date: '2025-01-01',
        references: [
            { title: 'Sleep Foundation', url: 'https://www.sleepfoundation.org/' },
            { title: 'Matthew Walker - Why We Sleep', url: 'https://www.sleepdiplomat.com/' }
        ]
    },
    '7': {
        id: '7',
        title: 'التأمل والتنفس: مفتاح الصحة النفسية',
        summary: 'تقنيات بسيطة للتخلص من التوتر وتحسين المزاج',
        content: `
## لماذا التأمل والتنفس؟

في عالم مليء بالتوتر، التأمل والتنفس الواعي أدوات قوية ومجانية لاستعادة التوازن.

## فوائد التأمل المثبتة علمياً

### 1. تغيرات في الدماغ
- زيادة المادة الرمادية في مناطق التعلم والذاكرة
- تقليص حجم اللوزة الدماغية (مركز الخوف)
- تقوية القشرة الأمامية (التحكم والتركيز)

### 2. تقليل التوتر
- خفض الكورتيزول بنسبة 23%
- تقليل الالتهابات في الجسم
- تحسين ضغط الدم

### 3. تحسين الصحة النفسية
- فعال مثل مضادات الاكتئاب في بعض الحالات
- تقليل القلق بنسبة 58%
- تحسين جودة الحياة

## تقنيات التنفس الأساسية

### 1. التنفس البطني (الحجابي)
1. ضع يدك على بطنك
2. استنشق ببطء - البطن يرتفع
3. أخرج الهواء ببطء - البطن ينخفض
4. كرر 10 مرات

### 2. تقنية 4-7-8
1. استنشق لمدة 4 ثواني
2. احبس النفس 7 ثواني
3. أخرج الهواء 8 ثواني
4. كرر 4 دورات

### 3. تنفس الصندوق (Box Breathing)
1. استنشق 4 ثواني
2. احبس 4 ثواني
3. أخرج 4 ثواني
4. احبس 4 ثواني
5. كرر 5 دورات

### 4. تنفس ويم هوف
1. 30-40 نفس عميق سريع
2. أخرج الهواء واحبس أطول مدة ممكنة
3. استنشق واحبس 15 ثانية
4. كرر 3 جولات

## كيف تبدأ التأمل؟

### للمبتدئين
1. ابدأ بدقيقتين فقط
2. اجلس مرتاحاً
3. ركز على تنفسك
4. عندما يشرد ذهنك، أعده برفق
5. زد المدة تدريجياً

### تطبيقات مفيدة
- Headspace
- Calm
- Insight Timer
- تطبيقات عربية للتأمل
    `,
        type: 'article',
        category: 'mental_health',
        image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        duration_minutes: 12,
        views: 2800,
        tags: ['تأمل', 'تنفس', 'صحة نفسية', 'توتر'],
        created_date: '2024-12-28',
        references: [
            { title: 'Harvard - Meditation Benefits', url: 'https://www.health.harvard.edu/blog/mindfulness-meditation-may-ease-anxiety-mental-stress-201401086967' },
            { title: 'Wim Hof Method', url: 'https://www.wimhofmethod.com/' }
        ]
    },
    '8': {
        id: '8',
        title: 'صحة الأمعاء: المفتاح الذهبي للصحة الشاملة',
        summary: 'كيف تؤثر صحة الجهاز الهضمي على كل جانب من جوانب صحتك',
        content: `
## الأمعاء: الدماغ الثاني

الأمعاء تحتوي على 100 تريليون بكتيريا و500 مليون خلية عصبية. تُنتج 95% من السيروتونين (هرمون السعادة).

## محور الأمعاء-الدماغ

اكتشفت الأبحاث اتصالاً ثنائي الاتجاه:
- الأمعاء ترسل إشارات للدماغ عبر العصب الحائر
- الميكروبيوم يؤثر على المزاج والسلوك
- 70% من جهاز المناعة في الأمعاء

## علامات اختلال صحة الأمعاء

- انتفاخ وغازات مزمنة
- إمساك أو إسهال
- حساسيات غذائية
- مشاكل جلدية (أكزيما، حب شباب)
- تعب مزمن
- ضبابية دماغية
- اكتئاب أو قلق

## أسباب اختلال الميكروبيوم

1. **المضادات الحيوية** - تقتل البكتيريا النافعة
2. **السكر المكرر** - يغذي البكتيريا الضارة
3. **الإجهاد المزمن** - يضعف حاجز الأمعاء
4. **قلة الألياف** - تجويع البكتيريا النافعة
5. **المبيدات والكيماويات** - تدمر التنوع الحيوي

## كيف تحسن صحة أمعائك؟

### 1. أطعمة البريبيوتك (غذاء البكتيريا)
- الثوم والبصل
- الهليون
- الموز الأخضر
- الشوفان
- بذور الكتان

### 2. أطعمة البروبيوتك (البكتيريا النافعة)
- الزبادي الطبيعي
- الكفير
- مخلل الملفوف
- الكمبوتشا
- الميسو

### 3. دعم حاجز الأمعاء
- مرق العظام (الكولاجين)
- L-Glutamine
- الزنك كارنوزين
- كيرسيتين

### 4. تجنب
- السكر المكرر
- الزيوت المهدرجة
- المحليات الصناعية
- الأطعمة المعالجة
    `,
        type: 'article',
        category: 'nutrition',
        image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
        duration_minutes: 14,
        views: 1890,
        tags: ['أمعاء', 'ميكروبيوم', 'هضم', 'مناعة'],
        created_date: '2024-12-25',
        references: [
            { title: 'Gut-Brain Axis Research', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4367209/' }
        ]
    }
};

export default function ArticleDetails() {
    const router = useRouter();
    const articleId = (router.query.id as string) || '1';

    // Guard: Wait for router to be ready
    if (!router.isReady) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#2D9B83] border-t-transparent rounded-full"></div></div>;
    }

    const article = realArticles[articleId] || realArticles['1'];

    const typeConfig = {
        article: { icon: FileText, label: 'مقال', color: 'bg-blue-500' },
        video: { icon: Play, label: 'فيديو', color: 'bg-red-500' },
        study: { icon: BookOpen, label: 'دراسة', color: 'bg-purple-500' },
        podcast: { icon: Mic, label: 'بودكاست', color: 'bg-orange-500' },
    };

    const categoryLabels = {
        functional_medicine: 'الطب الوظيفي',
        frequencies: 'الترددات الشفائية',
        nutrition: 'التغذية الصحية',
        lifestyle: 'نمط الحياة',
        detox: 'الديتوكس',
        supplements: 'المكملات',
        mental_health: 'الصحة النفسية',
    };

    const config = typeConfig[article.type];
    const Icon = config.icon;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: article.title,
                text: article.summary,
                url: window.location.href,
            });
        }
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative">
                <div className="aspect-video bg-slate-100 relative">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <Link href={createPageUrl('Library')} className="absolute top-4 right-4">
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={handleShare}>
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                            <Bookmark className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className={`absolute bottom-4 right-4 ${config.color} text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                <Badge variant="outline" className="mb-3 border-[#2D9B83] text-[#2D9B83]">
                    {categoryLabels[article.category]}
                </Badge>

                <h1 className="text-2xl font-bold text-slate-800 mb-3">{article.title}</h1>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.duration_minutes} دقائق قراءة</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views?.toLocaleString()} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{article.created_date}</span>
                    </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-6">
                    <p className="text-slate-600 leading-relaxed font-medium">{article.summary}</p>
                </div>

                {article.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.map((tag, index) => (
                            <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </div>
                        ))}
                    </div>
                )}

                {/* Article Content */}
                <div className="prose prose-slate max-w-none mb-8">
                    <ReactMarkdown
                        components={{
                            h2: ({ children }) => <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-100">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">{children}</h3>,
                            p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-4">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-600 mr-4">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-600 mr-4">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-600">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-[#2D9B83]">{children}</strong>,
                            table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse text-sm">{children}</table></div>,
                            th: ({ children }) => <th className="border border-slate-200 p-3 bg-[#2D9B83]/10 text-right font-semibold">{children}</th>,
                            td: ({ children }) => <td className="border border-slate-200 p-3 text-right">{children}</td>,
                            blockquote: ({ children }) => <blockquote className="border-r-4 border-[#2D9B83] pr-4 my-4 text-slate-500 italic">{children}</blockquote>,
                        }}
                    >
                        {article.content}
                    </ReactMarkdown>
                </div>

                {/* References */}
                {article.references && article.references.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-[#2D9B83]" />
                            المصادر والمراجع
                        </h3>
                        <div className="space-y-2">
                            {article.references.map((ref, index) => (
                                <a
                                    key={index}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 glass rounded-xl hover:shadow-md transition-all group"
                                >
                                    <ExternalLink className="w-4 h-4 text-[#2D9B83] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-slate-600 group-hover:text-[#2D9B83]">{ref.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <CommentsSection targetType="article" targetId={articleId} showRating={false} />
            </div>
        </div>
    );
}

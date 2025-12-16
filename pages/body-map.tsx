import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Search, Heart, Brain, Activity, Sparkles,
    BookOpen, Radio, ShoppingBag, GraduationCap, MessageCircle,
    Info, ChevronDown, ChevronUp, Star, Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// قاعدة بيانات الطب الشعوري - العلاقة بين الأعضاء والمشاعر
// مبني على أبحاث: د. أحمد الدملاوي (الطب التصنيفي)، د. جيرد هامر (الطب الجرماني الجديد)، لويز هاي
const emotionalMedicineData = {
    // منطقة الرأس
    head: {
        name: 'الرأس والدماغ',
        icon: '🧠',
        color: '#8B5CF6',
        areas: [
            {
                name: 'الصداع المتكرر',
                emotion: 'الضغط والتحكم الزائد',
                description: 'الصداع يعكس محاولة السيطرة على كل شيء والتفكير الزائد',
                deeperCause: 'الخوف من فقدان السيطرة، عدم الثقة في تدفق الحياة',
                treatment: [
                    'تقبل أن بعض الأمور خارج سيطرتك',
                    'مارس الاسترخاء والتأمل يومياً',
                    'أطلق الحاجة للكمال',
                    'ثق أن الحياة تدعمك'
                ],
                affirmation: 'أنا أثق في تدفق الحياة وأطلق الحاجة للسيطرة. أنا في سلام.'
            },
            {
                name: 'الدوخة وعدم التوازن',
                emotion: 'التشتت وعدم التركيز',
                description: 'تعكس عدم التواصل مع الأرض والواقع',
                deeperCause: 'الهروب من الواقع، عدم الرغبة في مواجهة المواقف',
                treatment: [
                    'تواصل مع جسدك من خلال المشي حافياً',
                    'واجه ما تتجنبه بهدوء',
                    'عد إلى اللحظة الحالية',
                    'مارس تمارين التنفس العميق'
                ],
                affirmation: 'أنا متصل بالأرض وبالحياة. أنا حاضر وواعٍ في كل لحظة.'
            },
            {
                name: 'مشاكل الذاكرة والتركيز',
                emotion: 'الرغبة في نسيان الماضي المؤلم',
                description: 'النسيان آلية دفاعية لحماية النفس من ذكريات مؤلمة',
                deeperCause: 'صدمات غير معالجة، خوف من المستقبل',
                treatment: [
                    'اعترف بمشاعرك تجاه الماضي',
                    'اكتب مشاعرك في دفتر يومي',
                    'تقبل ما حدث كجزء من رحلتك',
                    'سامح نفسك والآخرين'
                ],
                affirmation: 'ذاكرتي قوية وواضحة. أتقبل ماضيي وأستقبل مستقبلي بفرح.'
            }
        ]
    },

    // العيون
    eyes: {
        name: 'العيون',
        icon: '👁️',
        color: '#3B82F6',
        areas: [
            {
                name: 'ضعف النظر',
                emotion: 'عدم الرغبة في رؤية الحقيقة',
                description: 'العيون ترفض رؤية ما يؤلم النفس أو يثير الخوف',
                deeperCause: 'خوف مما ستراه، إنكار الواقع',
                treatment: [
                    'اسأل نفسك: ما الذي لا أريد رؤيته؟',
                    'تقبل الحقيقة كما هي',
                    'انظر للمستقبل بتفاؤل',
                    'مارس تمارين الاسترخاء للعين'
                ],
                affirmation: 'أرى بوضوح وأتقبل ما أراه. العالم آمن ومليء بالجمال.'
            },
            {
                name: 'جفاف العين',
                emotion: 'كبت البكاء والمشاعر',
                description: 'رفض إظهار الضعف أو الحزن',
                deeperCause: 'الاعتقاد بأن البكاء ضعف',
                treatment: [
                    'اسمح لنفسك بالبكاء والتعبير',
                    'اعترف بحزنك دون خجل',
                    'شارك مشاعرك مع شخص تثق به',
                    'الدموع تنظف الروح'
                ],
                affirmation: 'من الآمن أن أعبر عن مشاعري. دموعي تشفيني وتنقيني.'
            }
        ]
    },

    // الحلق والغدة الدرقية
    throat: {
        name: 'الحلق والغدة الدرقية',
        icon: '🗣️',
        color: '#06B6D4',
        areas: [
            {
                name: 'التهاب الحلق المتكرر',
                emotion: 'كبت التعبير عن النفس',
                description: 'الحلق هو مركز التعبير - كبت الكلام يسبب التهاباً',
                deeperCause: 'الخوف من التحدث، الشعور بعدم الأهمية',
                treatment: [
                    'عبّر عن رأيك بوضوح',
                    'تحدث عن مشاعرك بصدق',
                    'لا تبتلع غضبك',
                    'صوتك مهم وجدير بالسماع'
                ],
                affirmation: 'أعبر عن نفسي بحرية وثقة. صوتي مسموع ومهم.'
            },
            {
                name: 'مشاكل الغدة الدرقية',
                emotion: 'الإحباط من عدم القدرة على فعل ما تريد',
                description: 'تعكس الشعور بأن الحياة تمر دون تحقيق الرغبات',
                deeperCause: 'الشعور بالعجز، متى سيأتي دوري؟',
                treatment: [
                    'حدد ما تريده حقاً في الحياة',
                    'اتخذ خطوات صغيرة نحو أحلامك',
                    'توقف عن انتظار الإذن من الآخرين',
                    'أنت تستحق ما تريده'
                ],
                affirmation: 'أتحرك نحو أحلامي الآن. الحياة تدعم رغباتي وأهدافي.'
            }
        ]
    },

    // الصدر والقلب
    chest: {
        name: 'الصدر والقلب',
        icon: '❤️',
        color: '#EF4444',
        areas: [
            {
                name: 'ضيق الصدر والتنفس',
                emotion: 'الخوف من الحياة وعدم الشعور بالأمان',
                description: 'التنفس = الحياة. ضيق التنفس = خوف من الحياة',
                deeperCause: 'صدمة، خسارة، خوف عميق',
                treatment: [
                    'تمارين التنفس العميق يومياً',
                    'اشعر بالامتنان لنعمة الحياة',
                    'أنت آمن في هذه اللحظة',
                    'افتح قلبك للحياة تدريجياً'
                ],
                affirmation: 'أتنفس بعمق وسهولة. الحياة آمنة وأنا محمي.'
            },
            {
                name: 'مشاكل القلب',
                emotion: 'إغلاق القلب وعدم السماح بالحب',
                description: 'القلب يتأثر بجروح الحب والخذلان',
                deeperCause: 'خوف من الجرح مرة أخرى، خيبات عاطفية',
                treatment: [
                    'سامح من جرحك (لأجلك أنت)',
                    'افتح قلبك للحب تدريجياً',
                    'أحب نفسك أولاً',
                    'الحب موجود ويستحق المخاطرة'
                ],
                affirmation: 'قلبي مفتوح للحب. أنا أحب وأُحَب بسهولة وأمان.'
            },
            {
                name: 'ارتفاع ضغط الدم',
                emotion: 'الغضب المكبوت لفترة طويلة',
                description: 'الضغط العاطفي يتحول لضغط فسيولوجي',
                deeperCause: 'مشاكل عالقة لم تُحل، ظلم متراكم',
                treatment: [
                    'عبّر عن غضبك بطريقة صحية',
                    'مارس الرياضة لتفريغ الطاقة',
                    'تعلم قول "لا" بوضوح',
                    'حل المشاكل العالقة'
                ],
                affirmation: 'أطلق الغضب بسلام. أنا هادئ ومتزن وأتحكم في مشاعري.'
            }
        ]
    },

    // المعدة والجهاز الهضمي
    stomach: {
        name: 'المعدة والجهاز الهضمي',
        icon: '🔥',
        color: '#F59E0B',
        areas: [
            {
                name: 'حموضة المعدة',
                emotion: 'الخوف والقلق المستمر',
                description: 'القلق يحفز إفراز الأحماض الزائدة',
                deeperCause: 'عدم الثقة في المستقبل، توقع الأسوأ دائماً',
                treatment: [
                    'تعلم الاسترخاء والتسليم',
                    'ثق أن الأمور ستكون بخير',
                    'عش اللحظة الحالية',
                    'قلل من التفكير في الأسوأ'
                ],
                affirmation: 'أثق في الحياة وأتقبل تجاربي بسهولة. كل شيء يعمل لصالحي.'
            },
            {
                name: 'قرحة المعدة',
                emotion: 'الشعور بالنقص وعدم الكفاية',
                description: 'المعدة تأكل نفسها كما يأكل الشخص نفسه بالنقد',
                deeperCause: 'نقد ذاتي شديد، عدم الرضا عن النفس',
                treatment: [
                    'توقف عن نقد نفسك',
                    'أنت كافٍ كما أنت',
                    'احتفل بنجاحاتك الصغيرة',
                    'تعامل مع نفسك بلطف'
                ],
                affirmation: 'أنا كافٍ تماماً. أحب وأتقبل نفسي كما أنا.'
            },
            {
                name: 'الإمساك',
                emotion: 'التمسك بالماضي ورفض التخلي',
                description: 'الجسم يحتفظ بما يجب إطلاقه',
                deeperCause: 'الخوف من الخسارة، عدم الثقة في المستقبل',
                treatment: [
                    'تخلص من الأشياء القديمة',
                    'سامح واترك الماضي يذهب',
                    'ثق أن الجديد أفضل',
                    'مارس التخلي يومياً'
                ],
                affirmation: 'أطلق ما لم يعد يخدمني. أنا منفتح على الجديد والأفضل.'
            },
            {
                name: 'القولون العصبي',
                emotion: 'القلق المزمن والتوتر اليومي',
                description: 'الأمعاء حساسة جداً للمشاعر السلبية',
                deeperCause: 'عدم الشعور بالأمان، خوف من المواقف',
                treatment: [
                    'حدد مصادر التوتر وعالجها',
                    'مارس التأمل والاسترخاء',
                    'أنشئ روتيناً يومياً مريحاً',
                    'قلل من الالتزامات المرهقة'
                ],
                affirmation: 'أنا هادئ ومطمئن. جسدي يعمل بتناغم وسلام.'
            }
        ]
    },

    // الكبد
    liver: {
        name: 'الكبد',
        icon: '🫀',
        color: '#B45309',
        areas: [
            {
                name: 'مشاكل الكبد',
                emotion: 'الغضب المزمن والاستياء',
                description: 'الكبد يخزن الغضب القديم والمرارة',
                deeperCause: 'ظلم لم يُنصف، حقوق ضائعة',
                treatment: [
                    'اكتب رسالة غضب ثم أحرقها',
                    'سامح لأجل راحتك أنت',
                    'عبّر عن غضبك بطريقة صحية',
                    'اترك الماضي وانطلق'
                ],
                affirmation: 'أطلق كل الغضب والمرارة. سلامي الداخلي أهم من أي ظلم.'
            }
        ]
    },

    // الكلى
    kidneys: {
        name: 'الكلى',
        icon: '💧',
        color: '#DC2626',
        areas: [
            {
                name: 'مشاكل الكلى',
                emotion: 'الخوف العميق والصدمة',
                description: 'الكلى تتأثر بمشاعر الخوف والرعب',
                deeperCause: 'صدمة حياتية، خوف من البقاء',
                treatment: [
                    'واجه مخاوفك تدريجياً',
                    'أنت أقوى مما تظن',
                    'الخوف وهم يمكن تجاوزه',
                    'اطلب الدعم عند الحاجة'
                ],
                affirmation: 'أنا آمن وقوي. أواجه الحياة بشجاعة وثقة.'
            },
            {
                name: 'التهابات المسالك البولية',
                emotion: 'الغضب من الشريك أو العلاقات',
                description: 'غالباً مرتبط بمشاكل في العلاقات الحميمية',
                deeperCause: 'إحباط عاطفي، شعور بالإهمال',
                treatment: [
                    'تحدث بصراحة مع شريكك',
                    'عبّر عن احتياجاتك العاطفية',
                    'ضع حدوداً صحية',
                    'احترم جسدك ومشاعرك'
                ],
                affirmation: 'أعبر عن مشاعري بصدق. علاقاتي صحية ومتوازنة.'
            }
        ]
    },

    // الظهر
    back: {
        name: 'الظهر',
        icon: '🦴',
        color: '#6366F1',
        areas: [
            {
                name: 'آلام أعلى الظهر',
                emotion: 'حمل أعباء الآخرين العاطفية',
                description: 'تحمل مسؤوليات ليست لك',
                deeperCause: 'الشعور بالذنب إذا لم تساعد',
                treatment: [
                    'ضع حدوداً واضحة',
                    'لست مسؤولاً عن سعادة الآخرين',
                    'اهتم بنفسك أولاً',
                    'قول "لا" ليس أنانية'
                ],
                affirmation: 'أحمل فقط ما يخصني. أنا حر من أعباء الآخرين.'
            },
            {
                name: 'آلام أسفل الظهر',
                emotion: 'الخوف المالي وانعدام الأمان',
                description: 'القلق على المستقبل المادي والبقاء',
                deeperCause: 'عدم الثقة في قدرتك على توفير احتياجاتك',
                treatment: [
                    'ثق في قدراتك وإمكانياتك',
                    'الرزق مكفول',
                    'ركز على الوفرة لا الندرة',
                    'اتخذ خطوات عملية صغيرة'
                ],
                affirmation: 'أنا مدعوم مالياً وعاطفياً. الكون يوفر لي كل ما أحتاج.'
            },
            {
                name: 'آلام منتصف الظهر',
                emotion: 'الشعور بالذنب وجلد الذات',
                description: 'لوم النفس على أخطاء الماضي',
                deeperCause: 'عدم مسامحة النفس',
                treatment: [
                    'سامح نفسك على أخطائك',
                    'تعلم من الماضي ثم اتركه',
                    'أنت تستحق المغفرة',
                    'كل خطأ درس للنمو'
                ],
                affirmation: 'أسامح نفسي بالكامل. أنا إنسان يتعلم وينمو.'
            }
        ]
    },

    // المفاصل
    joints: {
        name: 'المفاصل',
        icon: '🦿',
        color: '#8B5CF6',
        areas: [
            {
                name: 'آلام الركبة',
                emotion: 'العناد والكبرياء الزائد',
                description: 'الركبة تعكس المرونة في الحياة',
                deeperCause: 'رفض الانحناء أو التنازل',
                treatment: [
                    'كن أكثر مرونة',
                    'التواضع قوة وليس ضعفاً',
                    'تقبل وجهات النظر المختلفة',
                    'التنازل أحياناً حكمة'
                ],
                affirmation: 'أنا مرن ومتفهم. أتقبل الحياة بسهولة وتواضع.'
            },
            {
                name: 'آلام الكتف',
                emotion: 'حمل أعباء ثقيلة',
                description: 'الشعور بأنك تحمل العالم على كتفيك',
                deeperCause: 'المسؤولية الزائدة، عدم طلب المساعدة',
                treatment: [
                    'اطلب المساعدة',
                    'وزع الأعباء',
                    'لست مضطراً لفعل كل شيء وحدك',
                    'من حقك الاستراحة'
                ],
                affirmation: 'أشارك أعبائي مع الآخرين. الحياة سهلة وخفيفة.'
            }
        ]
    },

    // الجلد
    skin: {
        name: 'الجلد',
        icon: '✨',
        color: '#EC4899',
        areas: [
            {
                name: 'الأكزيما والحساسية',
                emotion: 'الانفصال عن الآخرين',
                description: 'الجلد حدّ بينك وبين العالم - مشاكله تعكس مشاكل في الحدود',
                deeperCause: 'الشعور بالتهديد، عدم الأمان في العلاقات',
                treatment: [
                    'راجع حدودك مع الآخرين',
                    'تعلم قول "لا"',
                    'احمِ مساحتك الشخصية',
                    'أنت آمن في علاقاتك'
                ],
                affirmation: 'حدودي واضحة وصحية. أنا آمن في تواصلي مع العالم.'
            },
            {
                name: 'حب الشباب',
                emotion: 'عدم تقبل الذات',
                description: 'رفض النفس والخجل منها',
                deeperCause: 'عدم الرضا عن المظهر أو الهوية',
                treatment: [
                    'تقبل نفسك كما أنت',
                    'جمالك فريد ومميز',
                    'الكمال وهم',
                    'أحب نفسك بعيوبها'
                ],
                affirmation: 'أنا جميل كما أنا. أتقبل وأحب نفسي بالكامل.'
            }
        ]
    }
};

// رواد الطب الشعوري
const pioneers = [
    {
        name: 'د. أحمد الدملاوي',
        title: 'مؤسس الطب التصنيفي الشعوري',
        origin: 'مصر',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
        contribution: 'وضع أسس الطب التصنيفي الذي يربط كل نسيج في الجسم بمعنى شعوري محدد. طور نظرية "التماهي التشريحي" التي تشرح كيف تتحول المشاعر المضطربة إلى أمراض.',
        principle: 'كل عضو في الجسم له معنى شعوري - عندما نفهم هذا المعنى، نفهم سبب المرض وطريقة الشفاء.'
    },
    {
        name: 'د. ريكه جيرد هامر',
        title: 'مؤسس الطب الجرماني الجديد',
        origin: 'ألمانيا',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
        contribution: 'اكتشف أن كل مرض يبدأ بصدمة نفسية مفاجئة تظهر في الدماغ والعضو المقابل في نفس الوقت. وضع القوانين البيولوجية الخمسة للأمراض.',
        principle: 'المرض ليس خطأ في الجسم، بل برنامج بيولوجي هادف استجابة لصدمة نفسية.'
    },
    {
        name: 'لويز هاي',
        title: 'رائدة العلاج بالتأكيدات',
        origin: 'أمريكا',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
        contribution: 'ربطت كل مرض بنمط تفكير سلبي محدد ووضعت تأكيدات إيجابية لعلاجه. كتابها "اشفِ جسدك" من أكثر الكتب تأثيراً في هذا المجال.',
        principle: 'كل فكرة تخلق مستقبلك. غيّر أفكارك تتغير حياتك وصحتك.'
    }
];

// أقسام الطب الشمولي
const holisticSections = [
    {
        name: 'الترددات الشفائية',
        description: 'استخدام الترددات الصوتية لإعادة التوازن للجسم والعقل',
        icon: Radio,
        page: 'Frequencies',
        color: 'from-purple-500 to-indigo-500'
    },
    {
        name: 'التغذية العلاجية',
        description: 'الغذاء كدواء - تعلم كيف يؤثر طعامك على صحتك',
        icon: Heart,
        page: 'Library',
        color: 'from-green-500 to-emerald-500'
    },
    {
        name: 'الديتوكس والتنظيف',
        description: 'تنظيف الجسم من السموم لتحفيز الشفاء الذاتي',
        icon: Activity,
        page: 'Shop',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        name: 'دورات التثقيف الصحي',
        description: 'تعلم كيف يعمل جسمك وكيف تشفيه',
        icon: GraduationCap,
        page: 'Courses',
        color: 'from-amber-500 to-orange-500'
    }
];

export default function BodyMap() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState(null);
    const [activeTab, setActiveTab] = useState('map');

    // البحث في جميع المناطق
    const searchResults = searchQuery.length > 1 ?
        Object.values(emotionalMedicineData).flatMap(category =>
            category.areas.filter(area =>
                area.name.includes(searchQuery) ||
                area.emotion.includes(searchQuery) ||
                area.description.includes(searchQuery)
            ).map(area => ({ ...area, categoryName: category.name, categoryIcon: category.icon, categoryColor: category.color }))
        ) : [];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] px-6 py-8">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

                <div className="relative">
                    <Link
                        href={createPageUrl('Home')}
                        className="inline-flex items-center gap-2 text-white/80 mb-4 hover:text-white"
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span>الرئيسية</span>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">الطب الشعوري</h1>
                            <p className="text-white/80 text-sm">اكتشف السبب الشعوري لمرضك</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="ابحث عن عرض أو مرض..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/90 border-0 rounded-2xl pr-12 h-14 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {searchQuery.length > 1 && (
                <div className="px-6 py-4">
                    <p className="text-sm text-slate-500 mb-3">{searchResults.length} نتيجة</p>
                    {searchResults.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedArea(result);
                                        setSearchQuery('');
                                    }}
                                    className="w-full glass rounded-2xl p-4 text-right hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{result.categoryIcon}</span>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">{result.name}</h4>
                                            <p className="text-sm text-slate-500">{result.categoryName}</p>
                                        </div>
                                        <Badge style={{ backgroundColor: `${result.categoryColor}20`, color: result.categoryColor }}>
                                            {result.emotion.split(' ').slice(0, 2).join(' ')}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">لم نجد نتائج - جرب كلمات أخرى</p>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            {searchQuery.length <= 1 && (
                <div className="px-6 py-6">
                    {/* Intro Card */}
                    <div className="glass rounded-3xl p-5 mb-6 border border-[#2D9B83]/20">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 mb-1">كل مرض له سبب شعوري</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    الجسم مرآة للمشاعر - عندما نكبت مشاعرنا أو نتجاهلها، تظهر على شكل أعراض جسدية.
                                    اختر المنطقة التي تؤلمك لتعرف السبب الشعوري وطريقة العلاج.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="grid grid-cols-2 bg-slate-100 rounded-xl p-1">
                            <TabsTrigger value="map" className="rounded-lg">خريطة الجسم</TabsTrigger>
                            <TabsTrigger value="pioneers" className="rounded-lg">رواد الطب الشعوري</TabsTrigger>
                        </TabsList>

                        <TabsContent value="map" className="mt-6">
                            {/* Body Areas */}
                            <div className="space-y-4">
                                {Object.entries(emotionalMedicineData).map(([key, category]) => (
                                    <Accordion key={key} type="single" collapsible>
                                        <AccordionItem value={key} className="glass rounded-2xl border-0 overflow-hidden">
                                            <AccordionTrigger className="px-4 py-4 hover:no-underline">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                        style={{ backgroundColor: `${category.color}15` }}
                                                    >
                                                        {category.icon}
                                                    </div>
                                                    <div className="text-right">
                                                        <h3 className="font-bold text-slate-800">{category.name}</h3>
                                                        <p className="text-sm text-slate-500">{category.areas.length} أعراض</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-2">
                                                    {category.areas.map((area, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedArea({ ...area, categoryName: category.name, categoryIcon: category.icon, categoryColor: category.color })}
                                                            className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-right tap-feedback">
                                                            <div className="flex items-center justify-between">
                                                                <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                                                                <div className="flex-1 mr-3">
                                                                    <h4 className="font-medium text-slate-700">{area.name}</h4>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{area.emotion}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pioneers" className="mt-6 space-y-4">
                            {pioneers.map((pioneer, idx) => (
                                <div key={idx} className="glass rounded-2xl p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#2D9B83] to-[#3FB39A]">
                                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                                {pioneer.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-800">{pioneer.name}</h3>
                                                <Badge variant="outline" className="text-xs">{pioneer.origin}</Badge>
                                            </div>
                                            <p className="text-sm text-[#2D9B83] font-medium mb-2">{pioneer.title}</p>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-3">{pioneer.contribution}</p>
                                            <div className="bg-[#2D9B83]/10 rounded-xl p-3">
                                                <p className="text-sm text-[#2D9B83] italic">"{pioneer.principle}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>

                    {/* Holistic Health Sections */}
                    <div className="mt-8">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#D4AF37]" />
                            أركان الصحة الشاملة
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {holisticSections.map((section, idx) => {
                                const Icon = section.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={createPageUrl(section.page)}
                                        className="glass rounded-2xl p-4 hover:shadow-lg transition-all"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{section.name}</h4>
                                        <p className="text-xs text-slate-500">{section.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-8 bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-3xl p-6 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">هل تحتاج مساعدة متخصصة؟</h3>
                        <p className="text-white/80 text-sm mb-4">
                            احجز جلسة تشخيصية مع د. عمر العماد لفهم أعمق لحالتك
                        </p>
                        <a
                            href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20جلسة%20تشخيصية%20للطب%20الشعوري"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="bg-white text-[#2D9B83] hover:bg-white/90 rounded-xl px-6 h-12 font-bold">
                                <MessageCircle className="w-5 h-5 ml-2" />
                                احجز جلستك الآن
                            </Button>
                        </a>
                    </div>
                </div>
            )}

            {/* Area Detail Sheet */}
            <Sheet open={!!selectedArea} onOpenChange={() => setSelectedArea(null)}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    {selectedArea && (
                        <>
                            <SheetHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${selectedArea.categoryColor}15` }}
                                    >
                                        {selectedArea.categoryIcon}
                                    </div>
                                    <div className="text-right">
                                        <SheetTitle className="text-xl">{selectedArea.name}</SheetTitle>
                                        <p className="text-sm text-slate-500">{selectedArea.categoryName}</p>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="space-y-6 pb-8">
                                {/* Emotion */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        السبب الشعوري
                                    </h4>
                                    <p className="text-lg font-semibold text-red-600 mb-2">{selectedArea.emotion}</p>
                                    <p className="text-slate-600 text-sm">{selectedArea.description}</p>
                                </div>

                                {/* Deeper Cause */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">السبب العميق</h4>
                                    <p className="text-slate-600 leading-relaxed">{selectedArea.deeperCause}</p>
                                </div>

                                {/* Treatment Steps */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-[#2D9B83]" />
                                        خطوات العلاج الشعوري
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedArea.treatment.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-[#2D9B83] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 text-sm">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Affirmation */}
                                <div className="bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-2xl p-5">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-[#D4AF37]" />
                                        التأكيد الشفائي
                                    </h4>
                                    <p className="text-[#2D9B83] text-lg font-medium leading-relaxed italic">
                                        "{selectedArea.affirmation}"
                                    </p>
                                    <p className="text-sm text-slate-500 mt-3">
                                        ردد هذا التأكيد 3 مرات يومياً أمام المرآة بإيمان وثقة
                                    </p>
                                </div>

                                {/* CTA */}
                                <a
                                    href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أعاني%20من%20${encodeURIComponent(selectedArea.name)}%20وأريد%20استشارة`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full gradient-primary text-white rounded-xl h-14 text-lg">
                                        <MessageCircle className="w-5 h-5 ml-2" />
                                        استشر د. عمر عن حالتك
                                    </Button>
                                </a>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

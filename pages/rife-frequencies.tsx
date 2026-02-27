import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Search, Waves, AlertTriangle, Shield, Heart,
    Activity, Bug, Sparkles, Zap, Info
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdvancedRifePlayer from '../components/frequencies/AdvancedRifePlayer';

// TypeScript interface
interface RifeFrequency {
    id: string;
    name: string;
    name_en: string;
    frequencies: number[];
    category: string;
    target_condition: string;
    duration_minutes: number;
    research_source: string;
    description: string;
    precautions?: string[];
}

const categories = [
    { id: 'all', label: 'الكل', icon: Sparkles, color: 'from-slate-500 to-slate-600' },
    { id: 'pathogen_bacteria', label: 'البكتيريا', icon: Bug, color: 'from-green-500 to-emerald-500' },
    { id: 'pathogen_virus', label: 'الفيروسات', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { id: 'pathogen_fungi', label: 'الفطريات', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { id: 'pathogen_parasite', label: 'الطفيليات', icon: Bug, color: 'from-red-500 to-rose-500' },
    { id: 'disease_support', label: 'دعم الأمراض', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { id: 'organ_regeneration', label: 'تجديد الأعضاء', icon: Heart, color: 'from-rose-500 to-red-500' },
];

// ترددات رايف الحقيقية المبنية على أبحاث د. رويال رايف ود. هولدا كلارك
const defaultRifeFrequencies = [
    // === البكتيريا (Bacteria) ===
    {
        id: '1',
        name: 'إيكولاي',
        name_en: 'E. coli',
        frequencies: [802, 804, 1550, 880, 832, 787, 727, 20],
        category: 'pathogen_bacteria',
        target_condition: 'عدوى بكتيرية معوية - إسهال وتسمم غذائي',
        duration_minutes: 20,
        research_source: 'Dr. Royal Rife - 1930s Research',
        description: 'تردد مخصص للقضاء على بكتيريا الإيكولاي المسببة للتسمم الغذائي'
    },
    {
        id: '2',
        name: 'المكورات العنقودية',
        name_en: 'Staphylococcus aureus',
        frequencies: [8697, 7270, 1050, 999, 727, 786, 880, 453],
        category: 'pathogen_bacteria',
        target_condition: 'التهابات الجلد والجروح الملوثة',
        duration_minutes: 25,
        research_source: 'CAFL Database',
        description: 'يستهدف بكتيريا الستاف المقاومة للمضادات الحيوية'
    },
    {
        id: '3',
        name: 'المكورات السبحية',
        name_en: 'Streptococcus',
        frequencies: [880, 787, 727, 1266, 900, 8450],
        category: 'pathogen_bacteria',
        target_condition: 'التهاب الحلق واللوزتين',
        duration_minutes: 20,
        research_source: 'Dr. Royal Rife',
        description: 'للتخلص من التهابات الحلق البكتيرية'
    },
    {
        id: '4',
        name: 'هيليكوباكتر بيلوري',
        name_en: 'H. pylori',
        frequencies: [352, 676, 727, 787, 880, 1550, 2167],
        category: 'pathogen_bacteria',
        target_condition: 'قرحة المعدة وجرثومة المعدة',
        duration_minutes: 30,
        research_source: 'CAFL Research Database',
        precautions: ['استمر على علاجك الطبي'],
        description: 'تردد متخصص لبكتيريا المعدة المسببة للقرحة'
    },
    {
        id: '5',
        name: 'بكتيريا لايم',
        name_en: 'Borrelia (Lyme)',
        frequencies: [864, 790, 690, 610, 484, 432, 380, 338, 254],
        category: 'pathogen_bacteria',
        target_condition: 'مرض لايم الناقل عن طريق القراد',
        duration_minutes: 45,
        research_source: 'Doug McLean Research',
        precautions: ['علاج تكميلي فقط', 'استشر طبيب متخصص'],
        description: 'برنامج شامل لمرض لايم'
    },

    // === الفيروسات (Viruses) ===
    {
        id: '6',
        name: 'نزلات البرد والإنفلونزا',
        name_en: 'Cold & Flu',
        frequencies: [7760, 7766, 7344, 3672, 2489, 1800, 880, 787, 727, 20],
        category: 'pathogen_virus',
        target_condition: 'أعراض البرد والإنفلونزا الموسمية',
        duration_minutes: 30,
        research_source: 'Consolidated Annotated Frequency List',
        description: 'برنامج شامل لتخفيف أعراض البرد'
    },
    {
        id: '7',
        name: 'فيروس الهربس',
        name_en: 'Herpes Simplex',
        frequencies: [2950, 1900, 1577, 1550, 1489, 629, 464, 450, 383],
        category: 'pathogen_virus',
        target_condition: 'قروح البرد والهربس التناسلي',
        duration_minutes: 25,
        research_source: 'Dr. Royal Rife Original',
        precautions: ['قد يسبب تفاعل تنظيف أولي'],
        description: 'يستهدف فيروس الهربس البسيط'
    },
    {
        id: '8',
        name: 'فيروس إبشتاين بار',
        name_en: 'Epstein-Barr (EBV)',
        frequencies: [8768, 6618, 1920, 1032, 880, 787, 727, 663, 380, 253],
        category: 'pathogen_virus',
        target_condition: 'متلازمة التعب المزمن - داء كثرة الوحيدات',
        duration_minutes: 40,
        research_source: 'CAFL Database',
        description: 'للتعب المزمن المرتبط بـ EBV'
    },
    {
        id: '9',
        name: 'فيروس الورم الحليمي',
        name_en: 'HPV',
        frequencies: [907, 874, 845, 797, 767, 727, 690, 666, 488, 465],
        category: 'pathogen_virus',
        target_condition: 'الثآليل وفيروس الورم الحليمي البشري',
        duration_minutes: 30,
        research_source: 'Rife Research Database',
        precautions: ['للدعم فقط - راجع طبيبك'],
        description: 'يستهدف أنواع متعددة من HPV'
    },

    // === الفطريات (Fungi) ===
    {
        id: '10',
        name: 'كانديدا البيضاء',
        name_en: 'Candida albicans',
        frequencies: [1403, 1151, 880, 787, 727, 465, 464, 450, 414, 381],
        category: 'pathogen_fungi',
        target_condition: 'فرط نمو الخميرة - القلاع الفموي والمهبلي',
        duration_minutes: 35,
        research_source: 'Dr. Hulda Clark Frequencies',
        precautions: ['قد تشعر بأعراض تنظيف', 'اشرب ماء كثير'],
        description: 'برنامج شامل للكانديدا'
    },
    {
        id: '11',
        name: 'فطريات الأظافر',
        name_en: 'Nail Fungus',
        frequencies: [1550, 880, 787, 727, 465, 381, 254],
        category: 'pathogen_fungi',
        target_condition: 'فطريات أظافر القدم واليد',
        duration_minutes: 25,
        research_source: 'CAFL Database',
        description: 'لعلاج فطريات الأظافر العنيدة'
    },
    {
        id: '12',
        name: 'أسبرجيلس',
        name_en: 'Aspergillus',
        frequencies: [1823, 758, 697, 524, 374, 344, 295],
        category: 'pathogen_fungi',
        target_condition: 'العدوى الفطرية الرئوية والجيوب',
        duration_minutes: 30,
        research_source: 'Rife Institute',
        precautions: ['للحالات المزمنة استشر طبيبك'],
        description: 'للعدوى الفطرية في الجهاز التنفسي'
    },

    // === الطفيليات (Parasites) ===
    {
        id: '13',
        name: 'الديدان المعوية',
        name_en: 'Intestinal Worms',
        frequencies: [4412, 4152, 3212, 2720, 2008, 1864, 524, 465, 440, 125, 95, 72, 20],
        category: 'pathogen_parasite',
        target_condition: 'الديدان الشريطية والدبوسية والخطافية',
        duration_minutes: 40,
        research_source: 'Dr. Hulda Clark Protocol',
        precautions: ['اتبع بروتوكول تنظيف الطفيليات الكامل'],
        description: 'برنامج شامل للديدان المعوية'
    },
    {
        id: '14',
        name: 'الجيارديا',
        name_en: 'Giardia',
        frequencies: [2018, 1442, 829, 812, 721, 407, 334, 254],
        category: 'pathogen_parasite',
        target_condition: 'طفيليات معوية - إسهال وانتفاخ',
        duration_minutes: 25,
        research_source: 'Dr. Hulda Clark',
        description: 'لطفيلي الجيارديا المعوي'
    },
    {
        id: '15',
        name: 'توكسوبلازما',
        name_en: 'Toxoplasma gondii',
        frequencies: [434, 432, 424, 395, 380, 334, 312, 174, 128],
        category: 'pathogen_parasite',
        target_condition: 'داء المقوسات',
        duration_minutes: 30,
        research_source: 'Rife Institute Research',
        precautions: ['⛔ ممنوع للحوامل تماماً'],
        description: 'طفيلي التوكسوبلازما'
    },

    // === دعم الأمراض المزمنة (Disease Support) ===
    {
        id: '16',
        name: 'دعم مرضى السكري',
        name_en: 'Diabetes Support',
        frequencies: [35, 48, 125, 302, 465, 787, 880, 10000],
        category: 'disease_support',
        target_condition: 'تنظيم سكر الدم ودعم البنكرياس',
        duration_minutes: 30,
        research_source: 'Rife Research Database',
        precautions: ['⚠️ لا تتوقف عن أدويتك', 'راقب سكرك بانتظام'],
        description: 'دعم تنظيم السكر - ليس بديلاً للعلاج'
    },
    {
        id: '17',
        name: 'ارتفاع ضغط الدم',
        name_en: 'Hypertension Support',
        frequencies: [9.19, 10, 15, 20, 95, 304, 324],
        category: 'disease_support',
        target_condition: 'المساعدة في تنظيم ضغط الدم',
        duration_minutes: 25,
        research_source: 'Frequency Healing Research',
        precautions: ['استمر على أدويتك', 'راقب ضغطك'],
        description: 'دعم استرخاء الأوعية الدموية'
    },
    {
        id: '18',
        name: 'التهاب المفاصل',
        name_en: 'Arthritis Relief',
        frequencies: [10000, 3000, 1550, 880, 787, 727, 650, 625, 600, 28],
        category: 'disease_support',
        target_condition: 'تخفيف آلام المفاصل والالتهاب',
        duration_minutes: 35,
        research_source: 'Dr. Royal Rife Original',
        description: 'تخفيف الألم والالتهاب المفصلي'
    },
    {
        id: '19',
        name: 'الصداع النصفي',
        name_en: 'Migraine Relief',
        frequencies: [10, 40, 160, 520, 727, 787, 880, 4334],
        category: 'disease_support',
        target_condition: 'تخفيف الصداع النصفي والتوتري',
        duration_minutes: 20,
        research_source: 'CAFL Database',
        description: 'تخفيف سريع للصداع'
    },
    {
        id: '20',
        name: 'الحساسية والجيوب',
        name_en: 'Allergy & Sinus',
        frequencies: [10, 48, 330, 440, 727, 880, 1550, 5000],
        category: 'disease_support',
        target_condition: 'تخفيف أعراض الحساسية وانسداد الجيوب',
        duration_minutes: 25,
        research_source: 'Consolidated Frequency List',
        description: 'لتخفيف احتقان الجيوب الأنفية'
    },

    // === تجديد الأعضاء (Organ Regeneration) ===
    {
        id: '21',
        name: 'تجديد خلايا الكبد',
        name_en: 'Liver Regeneration',
        frequencies: [317, 316, 306, 252, 178, 146, 1552, 880],
        category: 'organ_regeneration',
        target_condition: 'دعم وتجديد خلايا الكبد بعد الديتوكس',
        duration_minutes: 30,
        research_source: 'Dr. Hulda Clark Protocol',
        description: 'تحفيز تجديد خلايا الكبد'
    },
    {
        id: '22',
        name: 'صحة الكلى',
        name_en: 'Kidney Support',
        frequencies: [319, 318, 8, 20, 40, 444, 727, 10000],
        category: 'organ_regeneration',
        target_condition: 'تعزيز وظائف الكلى والتصريف',
        duration_minutes: 25,
        research_source: 'Rife Institute',
        description: 'دعم صحة الكلى والتخلص من السموم'
    },
    {
        id: '23',
        name: 'تقوية القلب',
        name_en: 'Heart Strengthening',
        frequencies: [20, 80, 160, 324, 432, 727, 880, 10000],
        category: 'organ_regeneration',
        target_condition: 'دعم صحة القلب وتحسين الدورة الدموية',
        duration_minutes: 30,
        research_source: 'Rife Research',
        precautions: ['لا يغني عن المتابعة القلبية'],
        description: 'تعزيز صحة القلب والأوعية'
    },
    {
        id: '24',
        name: 'صحة الرئتين',
        name_en: 'Lung Health',
        frequencies: [220, 440, 660, 727, 787, 880, 1550, 2127],
        category: 'organ_regeneration',
        target_condition: 'تعزيز صحة الجهاز التنفسي',
        duration_minutes: 25,
        research_source: 'CAFL Database',
        description: 'دعم صحة الرئتين والتنفس'
    },
    {
        id: '25',
        name: 'صحة الغدة الدرقية',
        name_en: 'Thyroid Balance',
        frequencies: [16, 160, 500, 512, 600, 650, 727, 880, 10000],
        category: 'organ_regeneration',
        target_condition: 'موازنة الغدة الدرقية',
        duration_minutes: 30,
        research_source: 'Frequency Healing Research',
        precautions: ['راقب مستوى هرموناتك'],
        description: 'دعم توازن الغدة الدرقية'
    },
];

import { useRouter } from 'next/router';

// ... (previous imports)

export default function RifeFrequencies() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedFrequency, setSelectedFrequency] = useState<RifeFrequency | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const rifeFrequencies = defaultRifeFrequencies;

    // Auto-open frequency from URL
    React.useEffect(() => {
        if (router.query.id && rifeFrequencies.length > 0) {
            const freqId = router.query.id as string;
            const targetFreq = rifeFrequencies.find(f => f.id === freqId);
            if (targetFreq) {
                setSelectedFrequency(targetFreq);
                // Clean URL
                router.replace('/rife-frequencies', undefined, { shallow: true });
            }
        }
    }, [router.query.id, rifeFrequencies]);

    const filteredFrequencies = rifeFrequencies.filter((freq: RifeFrequency) => {
        const matchesSearch = freq.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            freq.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            freq.target_condition?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || freq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryInfo = (catId: string) => categories.find(c => c.id === catId) || categories[0];

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 px-6 py-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <div className="relative">
                    {/* Back Button */}
                    <Link
                        href={createPageUrl('frequencies')}
                        className="inline-flex items-center gap-2 text-white/80 mb-4 hover:text-white transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span>العودة للترددات</span>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                            <Waves className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">ترددات رايف العلاجية</h1>
                            <p className="text-sm text-white/80">Rife Frequencies</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="ابحث عن تردد أو حالة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/90 border-0 rounded-xl pr-12 h-12"
                        />
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            {showDisclaimer && (
                <div className="px-6 py-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-amber-800 mb-1">تنبيه هام</p>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    ترددات رايف هي علاج تكميلي وليست بديلاً عن الرعاية الطبية. استشر طبيبك دائماً قبل استخدام أي علاج بديل.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="text-amber-400 hover:text-amber-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="px-6 py-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${activeCategory === cat.id
                                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                                    : 'glass text-slate-600 hover:bg-purple-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Info Banner */}
            <div className="px-6 py-2">
                <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
                    <Info className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <p className="text-xs text-purple-700">
                        مبني على أبحاث د. رويال رايف و د. هولدا كلارك
                    </p>
                </div>
            </div>

            {/* Frequency List */}
            <div className="px-6 py-4 space-y-3">
                {filteredFrequencies.length === 0 ? (
                    <div className="text-center py-12">
                        <Waves className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">لا توجد ترددات</h3>
                        <p className="text-slate-400 text-sm">جرب تغيير معايير البحث</p>
                    </div>
                ) : (
                    filteredFrequencies.map((freq) => {
                        const catInfo = getCategoryInfo(freq.category);
                        const Icon = catInfo.icon;

                        return (
                            <button
                                key={freq.id}
                                onClick={() => setSelectedFrequency(freq)}
                                className="w-full glass rounded-2xl p-4 text-right hover:shadow-glow transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catInfo.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 dark:text-white">{freq.name}</h3>
                                            <span className="text-xs text-slate-400">{freq.name_en}</span>
                                        </div>

                                        <p className="text-sm text-slate-500 mb-2">{freq.target_condition}</p>

                                        <div className="flex flex-wrap gap-1">
                                            {freq.frequencies.slice(0, 3).map((f, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs bg-white">
                                                    {f} Hz
                                                </Badge>
                                            ))}
                                            {freq.frequencies.length > 3 && (
                                                <Badge variant="outline" className="text-xs bg-white">
                                                    +{freq.frequencies.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {freq.precautions?.length > 0 && (
                                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Player */}
            <AdvancedRifePlayer
                rifeFrequency={selectedFrequency}
                isOpen={!!selectedFrequency}
                onClose={() => setSelectedFrequency(null)}
            />
        </div>
    );
}

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { Radio, Search, Sparkles, Waves, ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import FrequencyCard from '../components/frequencies/FrequencyCard';
import FrequencyPlayer from '../components/frequencies/FrequencyPlayer';
import { ListSkeleton } from '../components/common/Skeletons';
import ErrorState from '../components/common/ErrorState';

const categories = [
    { id: 'all', label: 'الكل', icon: '✨' },
    { id: 'solfeggio', label: 'سولفيجيو', icon: '🎵' },
    { id: 'brainwave', label: 'موجات الدماغ', icon: '🧠' },
    { id: 'chakra', label: 'الشاكرات', icon: '🌈' },
    { id: 'organ', label: 'الأعضاء', icon: '❤️' },
    { id: 'angel_numbers', label: 'أرقام الملائكة', icon: '👼' },
    { id: 'planetary', label: 'الكواكب', icon: '🪐' },
    { id: 'rife', label: 'ترددات رايف', icon: '🔬', isLink: true },
];

// Default frequencies data
const defaultFrequencies = [
    // Solfeggio
    { id: '1', name: 'تردد التحرر', frequency_hz: 174, category: 'solfeggio', description: 'يساعد على تخفيف الألم والتوتر', benefits: ['تخفيف الألم', 'الاسترخاء', 'الأمان'] },
    { id: '2', name: 'تردد الشفاء', frequency_hz: 285, category: 'solfeggio', description: 'يعزز شفاء الأنسجة', benefits: ['تجديد الخلايا', 'الشفاء', 'الطاقة'] },
    { id: '3', name: 'تردد التحول', frequency_hz: 396, category: 'solfeggio', description: 'التحرر من الخوف والذنب', benefits: ['تحرير المشاعر', 'الشجاعة', 'القوة'] },
    { id: '4', name: 'تردد المعجزات', frequency_hz: 528, category: 'solfeggio', description: 'تردد الحب والمعجزات', benefits: ['الحب', 'إصلاح DNA', 'التحول'] },
    { id: '5', name: 'تردد الوعي', frequency_hz: 639, category: 'solfeggio', description: 'تعزيز العلاقات والتواصل', benefits: ['الانسجام', 'التواصل', 'الحب'] },
    { id: '6', name: 'تردد الحدس', frequency_hz: 852, category: 'solfeggio', description: 'تنشيط العين الثالثة', benefits: ['الحدس', 'البصيرة', 'الوعي'] },
    { id: '7', name: 'تردد الكون', frequency_hz: 963, category: 'solfeggio', description: 'الاتصال بالوعي الكوني', benefits: ['الوحدة', 'النور', 'اليقظة'] },
    // Brainwaves
    { id: '8', name: 'دلتا - النوم العميق', frequency_hz: 2, category: 'brainwave', description: 'للنوم العميق والتجدد', benefits: ['نوم عميق', 'الشفاء', 'التجدد'] },
    { id: '9', name: 'ثيتا - التأمل', frequency_hz: 6, category: 'brainwave', description: 'للتأمل العميق والإبداع', benefits: ['التأمل', 'الإبداع', 'الحدس'] },
    { id: '10', name: 'ألفا - الاسترخاء', frequency_hz: 10, category: 'brainwave', description: 'للاسترخاء والهدوء', benefits: ['الاسترخاء', 'الهدوء', 'التركيز'] },
    { id: '11', name: 'بيتا - التركيز', frequency_hz: 20, category: 'brainwave', description: 'للتركيز والنشاط الذهني', benefits: ['التركيز', 'الانتباه', 'الوضوح'] },
    { id: '12', name: 'غاما - الوعي', frequency_hz: 40, category: 'brainwave', description: 'لأعلى حالات الوعي', benefits: ['الوعي', 'الإدراك', 'الذكاء'] },
    // Chakras
    { id: '13', name: 'شاكرا الجذر', frequency_hz: 396, category: 'chakra', description: 'التأريض والأمان', benefits: ['الأمان', 'الاستقرار', 'القوة'], color: '#FF0000' },
    { id: '14', name: 'شاكرا العجز', frequency_hz: 417, category: 'chakra', description: 'الإبداع والعواطف', benefits: ['الإبداع', 'المتعة', 'التدفق'], color: '#FF7F00' },
    { id: '15', name: 'شاكرا الضفيرة', frequency_hz: 528, category: 'chakra', description: 'القوة الشخصية', benefits: ['الثقة', 'القوة', 'الإرادة'], color: '#FFFF00' },
    { id: '16', name: 'شاكرا القلب', frequency_hz: 639, category: 'chakra', description: 'الحب غير المشروط', benefits: ['الحب', 'الرحمة', 'الانسجام'], color: '#00FF00' },
    { id: '17', name: 'شاكرا الحلق', frequency_hz: 741, category: 'chakra', description: 'التعبير والصدق', benefits: ['التواصل', 'الصدق', 'التعبير'], color: '#0000FF' },
    { id: '18', name: 'شاكرا العين الثالثة', frequency_hz: 852, category: 'chakra', description: 'الحدس والبصيرة', benefits: ['الحدس', 'الحكمة', 'الرؤية'], color: '#4B0082' },
    { id: '19', name: 'شاكرا التاج', frequency_hz: 963, category: 'chakra', description: 'الاتصال الروحي', benefits: ['الوعي', 'الروحانية', 'النور'], color: '#8B00FF' },
    // Organs
    { id: '20', name: 'تردد المعدة', frequency_hz: 110, category: 'organ', description: 'دعم صحة الجهاز الهضمي', benefits: ['الهضم', 'الراحة', 'التوازن'] },
    { id: '21', name: 'تردد الكبد', frequency_hz: 317, category: 'organ', description: 'تنقية وتجديد الكبد', benefits: ['التنقية', 'الديتوكس', 'التجدد'] },
    { id: '22', name: 'تردد الكلى', frequency_hz: 319, category: 'organ', description: 'دعم وظائف الكلى', benefits: ['التنقية', 'التوازن', 'الطاقة'] },
    { id: '23', name: 'تردد القلب', frequency_hz: 639, category: 'organ', description: 'تقوية صحة القلب', benefits: ['القوة', 'الانسجام', 'الحب'] },
    { id: '24', name: 'تردد الرئتين', frequency_hz: 220, category: 'organ', description: 'تعزيز التنفس', benefits: ['التنفس', 'الأكسجين', 'الحيوية'] },
];

export default function Frequencies() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentFrequency, setCurrentFrequency] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState(null);

    const { data: frequencies = defaultFrequencies, isLoading, isError, refetch } = useQuery({
        queryKey: ['frequencies'],
        queryFn: async () => {
            const data = await base44.entities.Frequency.list();
            return data.length > 0 ? data : defaultFrequencies;
        },
    });

    if (isError) return <ErrorState onRetry={refetch} />;

    const filteredFrequencies = frequencies.filter(freq => {
        const matchesSearch = freq.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || freq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handlePlay = (frequency) => {
        if (currentFrequency?.id === frequency.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentFrequency(frequency);
            setIsPlaying(true);
        }
    };

    return (
        <div className="min-h-screen pb-40">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/5 px-6 py-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2D9B83]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <Radio className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">الترددات الشفائية</h1>
                            <p className="text-sm text-slate-500">صيدلية الشفاء الرقمية</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="ابحث عن تردد..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass border-0 rounded-xl pr-12 h-12"
                        />
                    </div>
                </div>
            </div>

            {/* Rife Banner */}
            <div className="px-6 py-4">
                <Link href={createPageUrl('RifeFrequencies')}>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 flex items-center justify-between group hover:shadow-glow transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">ترددات رايف العلاجية</h3>
                                <p className="text-white/80 text-sm">ترددات متخصصة للأمراض والأعضاء</p>
                            </div>
                        </div>
                        <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Categories */}
            <div className="px-6 py-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.filter(cat => !cat.isLink).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${activeCategory === cat.id
                                ? 'gradient-primary text-white shadow-md'
                                : 'glass text-slate-600 hover:bg-[#2D9B83]/10'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Frequency List */}
            <div className="px-6 space-y-4">
                {isLoading ? (
                    <ListSkeleton count={5} />
                ) : filteredFrequencies.length === 0 ? (
                    <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">لا توجد ترددات</h3>
                        <p className="text-slate-400 text-sm">جرب تغيير معايير البحث</p>
                    </div>
                ) : (
                    filteredFrequencies.map((frequency) => (
                        <FrequencyCard
                            key={frequency.id}
                            frequency={frequency}
                            isPlaying={isPlaying && currentFrequency?.id === frequency.id}
                            onPlay={() => handlePlay(frequency)}
                            onShowDetails={() => setSelectedFrequency(frequency)}
                        />
                    ))
                )}
            </div>

            {/* Player */}
            {currentFrequency && (
                <FrequencyPlayer
                    frequency={currentFrequency}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onClose={() => {
                        setIsPlaying(false);
                        setCurrentFrequency(null);
                    }}
                />
            )}

            {/* Frequency Details Sheet */}
            <Sheet open={!!selectedFrequency} onOpenChange={() => setSelectedFrequency(null)}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
                    {selectedFrequency && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="text-right text-xl">
                                    {selectedFrequency.name}
                                </SheetTitle>
                            </SheetHeader>

                            <div className="py-6 space-y-6">
                                <div className="text-center">
                                    <span className="text-5xl font-bold text-gradient">
                                        {selectedFrequency.frequency_hz}
                                    </span>
                                    <span className="text-2xl text-slate-500 mr-2">Hz</span>
                                </div>

                                <p className="text-slate-600 leading-relaxed">
                                    {selectedFrequency.description}
                                </p>

                                {selectedFrequency.benefits && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3">الفوائد العلاجية</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFrequency.benefits.map((benefit, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 rounded-full bg-[#2D9B83]/10 text-[#2D9B83] text-sm"
                                                >
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        onClick={() => {
                                            handlePlay(selectedFrequency);
                                            setSelectedFrequency(null);
                                        }}
                                        className="w-full py-4 gradient-primary text-white rounded-2xl font-bold text-lg shadow-lg"
                                    >
                                        {isPlaying && currentFrequency?.id === selectedFrequency.id ? 'إيقاف' : 'تشغيل الآن'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

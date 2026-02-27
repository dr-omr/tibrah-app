import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen,
    Users,
    Star,
    CheckCircle,
    Clock,
    Trophy,
    Award,
    Play,
    Filter,
    TrendingUp,
    GraduationCap,
    Search
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { ListSkeleton } from '@/components/common/Skeletons'; // Assuming this exists or I'll stub it if not

// Interfaces
interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    duration_hours: number;
    lessons_count: number;
    enrolled_count: number;
    rating: number;
    is_free: boolean;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    reviews_count: number;
    status: 'published' | 'draft';
}

const categories = [
    { id: 'all', label: 'الكل', icon: '🔹' },
    { id: 'functional_medicine', label: 'الطب الوظيفي', icon: '🌿' },
    { id: 'nutrition', label: 'التغذية العلاجية', icon: '🍎' },
    { id: 'lifestyle', label: 'نمط الحياة', icon: '🧘‍♂️' }
];

const levelLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
};

const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700'
};

const defaultCourses: Course[] = []; // Empty fallback or could add mock data

export default function Courses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');

    const { data: apiCourses, isLoading, isError, refetch } = useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: async (): Promise<Course[]> => {
            try {
                const data = await db.entities.Course.filter({ status: 'published' });
                return data as unknown as Course[];
            } catch {
                return [] as Course[];
            }
        },
    });
    // ...

    // Use API courses if available, otherwise fallback to default
    const courses: Course[] = apiCourses && apiCourses.length > 0 ? apiCourses : defaultCourses;

    // Error state with retry
    if (isError && defaultCourses.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">تعذر تحميل الدورات</h3>
                    <p className="text-slate-400 text-sm mb-4">حدث خطأ أثناء تحميل البيانات</p>
                    <Button onClick={() => refetch()} className="gradient-primary rounded-xl">
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        );
    }

    // Filter courses
    const filteredCourses = courses.filter((course: Course) => {
        const matchesSearch =
            course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
        const matchesPrice = priceFilter === 'all' ||
            (priceFilter === 'free' && course.is_free) ||
            (priceFilter === 'paid' && !course.is_free);
        const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
        return matchesSearch && matchesCategory && matchesPrice && matchesLevel;
    });

    // Calculate stats
    const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);
    const avgRating = courses.length > 0
        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
        : '0';
    const freeCourses = courses.filter(c => c.is_free).length;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 py-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <div className="relative px-4 sm:px-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">الدورات التعليمية</h1>
                            <p className="text-sm text-white/80">تعلم الطب الوظيفي من المصدر</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                        <Input
                            placeholder="ابحث عن دورة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl pr-12 shadow-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="-mt-6 relative z-10 px-4 sm:px-6">
                <div className="glass rounded-2xl p-4 shadow-lg">
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <BookOpen className="w-4 h-4 text-amber-500" />
                                <span className="text-xl font-bold text-slate-800 dark:text-white">{courses.length}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">دورة</div>
                        </div>
                        <div className="p-2 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-xl font-bold text-slate-800 dark:text-white">{totalStudents > 1000 ? `${(totalStudents / 1000).toFixed(1)}k` : totalStudents}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">طالب</div>
                        </div>
                        <div className="p-2 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-xl font-bold text-slate-800 dark:text-white">{avgRating}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">تقييم</div>
                        </div>
                        <div className="p-2 border-r border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xl font-bold text-slate-800 dark:text-white">{freeCourses}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">مجانية</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories - horizontal scroll with snap */}
            <div className="py-4 px-4 sm:px-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-x-mobile">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 tap-feedback ${activeCategory === cat.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950 hover:border-amber-200'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 px-4 sm:px-6 pb-4">
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-10">
                        <Filter className="w-4 h-4 ml-1 text-slate-400" />
                        <SelectValue placeholder="السعر" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="free">🎁 مجانية</SelectItem>
                        <SelectItem value="paid">💰 مدفوعة</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-10">
                        <TrendingUp className="w-4 h-4 ml-1 text-slate-400" />
                        <SelectValue placeholder="المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="beginner">🌱 مبتدئ</SelectItem>
                        <SelectItem value="intermediate">📈 متوسط</SelectItem>
                        <SelectItem value="advanced">🚀 متقدم</SelectItem>
                    </SelectContent>
                </Select>

                {(priceFilter !== 'all' || levelFilter !== 'all' || searchQuery) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setPriceFilter('all');
                            setLevelFilter('all');
                            setSearchQuery('');
                            setActiveCategory('all');
                        }}
                        className="text-slate-500 h-10"
                    >
                        مسح الكل
                    </Button>
                )}
            </div>

            {/* Results Count */}
            {filteredCourses.length !== courses.length && (
                <div className="px-4 sm:px-6 pb-3">
                    <p className="text-sm text-slate-500">
                        عرض {filteredCourses.length} من {courses.length} دورة
                    </p>
                </div>
            )}

            {/* Course List */}
            <div className="px-4 sm:px-6 space-y-4">
                {isLoading ? (
                    <ListSkeleton count={4} />
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">لا توجد نتائج</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">جرب تغيير معايير البحث أو الفلاتر</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                                setPriceFilter('all');
                                setLevelFilter('all');
                            }}
                            className="rounded-xl"
                        >
                            عرض جميع الدورات
                        </Button>
                    </div>
                ) : (
                    filteredCourses.map((course: Course) => (
                        <Link
                            key={course.id}
                            href={createPageUrl(`CourseDetails?id=${course.id}`)}
                            className="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-amber-200 transition-all card-clickable"
                        >
                            <div className="flex gap-4 p-4">
                                {/* Thumbnail */}
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {course.is_free && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-green-500 text-white border-0 text-[10px] shadow-sm">
                                                مجاني
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="w-5 h-5 text-amber-600 fill-amber-600 mr-[-2px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 text-base">{course.title}</h3>
                                    </div>

                                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 flex-grow">{course.description}</p>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {course.duration_hours}س
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            {course.lessons_count} درس
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {course.enrolled_count > 1000 ? `${(course.enrolled_count / 1000).toFixed(1)}k` : course.enrolled_count}
                                        </span>
                                        <Badge className={`text-[10px] px-2 py-0 ${levelColors[course.level] || 'bg-slate-100 text-slate-600'}`}>
                                            {levelLabels[course.level] || course.level}
                                        </Badge>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{course.rating}</span>
                                            <span className="text-xs text-slate-400">({course.reviews_count})</span>
                                        </div>

                                        {course.is_free ? (
                                            <Badge className="bg-green-100 text-green-700 border-0 font-bold">
                                                مجاناً
                                            </Badge>
                                        ) : (
                                            <div className="font-bold text-lg text-amber-600">{course.price} <span className="text-xs">ر.س</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Featured Banner */}
            <div className="px-4 sm:px-6 py-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-6">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">احصل على شهادة معتمدة</h3>
                            <p className="text-white/80 text-sm mb-4">أكمل أي دورة واحصل على شهادة إتمام موثقة</p>

                            <div className="flex flex-wrap gap-2">
                                <Link href={createPageUrl('BookAppointment')}>
                                    <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-xl font-bold shadow-lg">
                                        <Award className="w-4 h-4 ml-2" />
                                        ابدأ رحلتك
                                    </Button>
                                </Link>
                                <a
                                    href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاستفسار%20عن%20الدورات"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl">
                                        استفسر الآن
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

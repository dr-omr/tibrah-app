import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Play, Clock, Users, Star, BookOpen, CheckCircle, Lock,
    Download, Share2, Heart, Award, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const defaultCourse = {
    id: '1',
    title: 'أساسيات الطب الوظيفي',
    description: 'مقدمة شاملة لفهم جسمك وكيف يعمل بشكل متكامل. ستتعلم في هذه الدورة المبادئ الأساسية للطب الوظيفي وكيف تنظر لجسمك كنظام متكامل.',
    category: 'functional_medicine',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
    price: 0,
    is_free: true,
    duration_hours: 8,
    lessons_count: 16,
    rating: 4.9,
    reviews_count: 234,
    enrolled_count: 1520,
    level: 'beginner',
    instructor_name: 'د. عمر العماد',
    features: [
        'فهم أساسيات الطب الوظيفي',
        'تعلم قراءة إشارات جسمك',
        'معرفة العلاقة بين الأعضاء',
        'خطة عملية للبدء',
        'شهادة إتمام معتمدة'
    ],
    requirements: [
        'لا يتطلب خبرة سابقة',
        'الرغبة في التعلم والتطبيق'
    ]
};

const defaultLessons = [
    { id: '1', title: 'مقدمة في الطب الوظيفي', duration_minutes: 15, is_free_preview: true, order: 1 },
    { id: '2', title: 'الفرق بين الطب التقليدي والوظيفي', duration_minutes: 20, is_free_preview: true, order: 2 },
    { id: '3', title: 'فهم الجسم كنظام متكامل', duration_minutes: 25, is_free_preview: false, order: 3 },
    { id: '4', title: 'الجهاز الهضمي - المفتاح الأساسي', duration_minutes: 30, is_free_preview: false, order: 4 },
    { id: '5', title: 'السموم وتأثيرها على الصحة', duration_minutes: 25, is_free_preview: false, order: 5 },
    { id: '6', title: 'الالتهاب المزمن - العدو الخفي', duration_minutes: 30, is_free_preview: false, order: 6 },
    { id: '7', title: 'التغذية كدواء', duration_minutes: 35, is_free_preview: false, order: 7 },
    { id: '8', title: 'أهمية النوم والراحة', duration_minutes: 20, is_free_preview: false, order: 8 },
];

export default function CourseDetails() {
    const router = useRouter();
    const courseId = (router.query.id as string) || '1';

    // Guard: Wait for router to be ready
    if (!router.isReady) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#2D9B83] border-t-transparent rounded-full"></div></div>;
    }

    const queryClient = useQueryClient();

    const [expandedModules, setExpandedModules] = useState({ module1: true });
    const [isFavorite, setIsFavorite] = useState(false);

    const { data: course = defaultCourse } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const courses = await base44.entities.Course.filter({ id: courseId });
            return courses[0] || defaultCourse;
        },
    });

    const { data: lessons = defaultLessons } = useQuery({
        queryKey: ['lessons', courseId],
        queryFn: async () => {
            const data = await base44.entities.Lesson.filter({ course_id: courseId });
            return data.length > 0 ? data.sort((a, b) => a.order - b.order) : defaultLessons;
        },
    });

    const { data: enrollment } = useQuery({
        queryKey: ['enrollment', courseId],
        queryFn: async () => {
            const user = await base44.auth.me();
            const enrollments = await base44.entities.CourseEnrollment.filter({
                course_id: courseId,
                created_by: user.email
            });
            return enrollments[0];
        },
    });

    const enrollMutation = useMutation({
        mutationFn: async () => {
            return await base44.entities.CourseEnrollment.create({
                course_id: courseId,
                progress_percentage: 0,
                completed_lessons: [],
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['enrollment', courseId]);
            toast.success('تم التسجيل في الدورة بنجاح!');
        },
    });

    const levelLabels = {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم'
    };

    const handleEnroll = () => {
        if (course.is_free) {
            enrollMutation.mutate();
        } else {
            // فتح واتساب للتواصل حول الدورة المدفوعة
            window.open(`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاشتراك%20في%20دورة:%20${encodeURIComponent(course.title)}`, '_blank');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: course.title,
            text: course.description,
            url: window.location.href,
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('تم نسخ الرابط');
        }
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Header Image */}
            <div className="relative h-56">
                <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Back Button */}
                <Link
                    href={createPageUrl('Courses')}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                    <ArrowRight className="w-5 h-5 text-white" />
                </Link>

                {/* Actions */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Share2 className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Course Title */}
                <div className="absolute bottom-4 right-4 left-4">
                    <Badge className={`mb-2 ${course.is_free ? 'bg-green-500' : 'bg-amber-500'} text-white border-0`}>
                        {course.is_free ? 'مجاني' : `${course.price} ر.س`}
                    </Badge>
                    <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 -mt-4 relative z-10">
                <div className="glass rounded-2xl p-4 shadow-lg">
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                                <Star className="w-4 h-4 fill-amber-500" />
                                <span className="font-bold">{course.rating}</span>
                            </div>
                            <div className="text-xs text-slate-500">{course.reviews_count} تقييم</div>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 mb-1">{course.duration_hours}h</div>
                            <div className="text-xs text-slate-500">مدة الدورة</div>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 mb-1">{course.lessons_count}</div>
                            <div className="text-xs text-slate-500">درس</div>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 mb-1">{course.enrolled_count}</div>
                            <div className="text-xs text-slate-500">طالب</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
                {/* Instructor */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center">
                        <span className="text-white font-bold">د.ع</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{course.instructor_name}</p>
                        <p className="text-sm text-slate-500">استشاري الطب الوظيفي</p>
                    </div>
                    <Badge variant="outline" className="mr-auto">{levelLabels[course.level]}</Badge>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-2">عن الدورة</h3>
                    <p className="text-slate-600 leading-relaxed">{course.description}</p>
                </div>

                {/* Features */}
                {course.features && (
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3">ماذا ستتعلم</h3>
                        <div className="space-y-2">
                            {course.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress (if enrolled) */}
                {enrollment && (
                    <div className="glass rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-700">تقدمك في الدورة</span>
                            <span className="text-[#2D9B83] font-bold">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                    </div>
                )}

                {/* Lessons */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-3">محتوى الدورة</h3>

                    <div className="glass rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setExpandedModules(prev => ({ ...prev, module1: !prev.module1 }))}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-[#2D9B83]" />
                                <span className="font-medium">جميع الدروس</span>
                                <Badge variant="outline" className="text-xs">{lessons.length} درس</Badge>
                            </div>
                            {expandedModules.module1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        {expandedModules.module1 && (
                            <div className="border-t">
                                {lessons.map((lesson, index) => {
                                    const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                                    const isLocked = !course.is_free && !enrollment && !lesson.is_free_preview;

                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`flex items-center gap-3 p-4 border-b last:border-b-0 ${isLocked ? 'opacity-60' : 'hover:bg-slate-50 cursor-pointer'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' :
                                                isLocked ? 'bg-slate-100 text-slate-400' :
                                                    'bg-[#2D9B83]/10 text-[#2D9B83]'
                                                }`}>
                                                {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                                    isLocked ? <Lock className="w-4 h-4" /> :
                                                        <Play className="w-4 h-4" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-700 truncate">{lesson.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{lesson.duration_minutes} دقيقة</span>
                                                    {lesson.is_free_preview && (
                                                        <Badge className="bg-blue-100 text-blue-600 border-0 text-[10px]">معاينة مجانية</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Requirements */}
                {course.requirements && (
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3">المتطلبات</h3>
                        <div className="space-y-2">
                            {course.requirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t z-50">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        {course.is_free ? (
                            <span className="text-2xl font-bold text-green-500">مجاني</span>
                        ) : (
                            <>
                                <span className="text-2xl font-bold text-slate-800">{course.price}</span>
                                <span className="text-slate-500 mr-1">ر.س</span>
                            </>
                        )}
                    </div>

                    {enrollment ? (
                        <Button className="flex-1 gradient-primary text-white rounded-xl h-14 text-lg">
                            <Play className="w-5 h-5 ml-2" />
                            استكمال الدورة
                        </Button>
                    ) : (
                        <Button
                            onClick={handleEnroll}
                            disabled={enrollMutation.isPending}
                            className="flex-1 gradient-primary text-white rounded-xl h-14 text-lg"
                        >
                            {enrollMutation.isPending ? 'جاري التسجيل...' :
                                course.is_free ? 'ابدأ التعلم مجاناً' : 'اشترك الآن'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

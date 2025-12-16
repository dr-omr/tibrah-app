import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Users, ShoppingBag, BookOpen, Radio, Calendar,
    TrendingUp, Package, Edit, Trash2, Plus, Eye, Search,
    Settings, BarChart3, Bell, FileText, Download, Filter,
    ChevronLeft, Check, X, Loader2, RefreshCw, Newspaper, Image
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Admin Components
import UserManagement from '../components/admin/UserManagement';
import SystemConfig from '../components/admin/SystemConfig';
import ThemeSettings from '../components/admin/ThemeSettings';

// TypeScript interfaces
interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    [key: string]: unknown;
}

interface Product {
    id: string;
    name: string;
    price: number;
    category?: string;
    status?: string;
    image_url?: string;
    in_stock?: boolean;
    [key: string]: unknown;
}

interface Course {
    id: string;
    title: string;
    price?: number;
    is_free?: boolean;
    status?: string;
    category?: string;
    thumbnail_url?: string;
    enrolled_count?: number;
    lessons_count?: number;
    [key: string]: unknown;
}

interface Appointment {
    id: string;
    patient_name: string;
    patient_phone?: string;
    date: string;
    time_slot?: string;
    status: string;
    session_type?: string;
    health_concern?: string;
    [key: string]: unknown;
}

interface HealthProgram {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface KnowledgeArticle {
    id: string;
    title: string;
    status?: string;
    views?: number;
    created_date?: string;
    image_url?: string;
    type?: string;
    summary?: string;
    [key: string]: unknown;
}

interface UpdateMutationParams {
    id: string;
    data: Record<string, unknown>;
}

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
    const [editType, setEditType] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        base44.auth.me().then((u) => setUser(u as User)).catch(() => { });
    }, []);

    // Check admin access
    const isAdmin = user?.role === 'admin' || user?.email === 'dr.omar@tibrah.com';

    // Fetch all data
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: async (): Promise<User[]> => base44.entities.User.list() as unknown as User[],
        enabled: isAdmin,
    });

    const { data: products = [], refetch: refetchProducts } = useQuery<Product[]>({
        queryKey: ['admin-products'],
        queryFn: async (): Promise<Product[]> => base44.entities.Product.list() as unknown as Product[],
        enabled: isAdmin,
    });

    const { data: courses = [], refetch: refetchCourses } = useQuery<Course[]>({
        queryKey: ['admin-courses'],
        queryFn: async (): Promise<Course[]> => base44.entities.Course.list() as unknown as Course[],
        enabled: isAdmin,
    });

    const { data: appointments = [], refetch: refetchAppointments } = useQuery<Appointment[]>({
        queryKey: ['admin-appointments'],
        queryFn: async (): Promise<Appointment[]> => base44.entities.Appointment.list('-created_date') as unknown as Appointment[],
        enabled: isAdmin,
    });

    const { data: enrollments = [] } = useQuery<Record<string, unknown>[]>({
        queryKey: ['admin-enrollments'],
        queryFn: async (): Promise<Record<string, unknown>[]> => base44.entities.CourseEnrollment.list() as unknown as Record<string, unknown>[],
        enabled: isAdmin,
    });

    const { data: frequencies = [], refetch: refetchFrequencies } = useQuery<Record<string, unknown>[]>({
        queryKey: ['admin-frequencies'],
        queryFn: async (): Promise<Record<string, unknown>[]> => base44.entities.Frequency.list() as unknown as Record<string, unknown>[],
        enabled: isAdmin,
    });

    const { data: programs = [], refetch: refetchPrograms } = useQuery<HealthProgram[]>({
        queryKey: ['admin-programs'],
        queryFn: async (): Promise<HealthProgram[]> => base44.entities.HealthProgram.list() as unknown as HealthProgram[],
        enabled: isAdmin,
    });

    const { data: articles = [], refetch: refetchArticles } = useQuery<KnowledgeArticle[]>({
        queryKey: ['admin-articles'],
        queryFn: async (): Promise<KnowledgeArticle[]> => base44.entities.KnowledgeArticle.list('-created_date') as unknown as KnowledgeArticle[],
        enabled: isAdmin,
    });

    // Mutations
    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: UpdateMutationParams) => base44.entities.Product.update(id, data as Record<string, unknown>),
        onSuccess: () => {
            refetchProducts();
            toast.success('تم تحديث المنتج');
            setEditItem(null);
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => base44.entities.Product.delete(id),
        onSuccess: () => {
            refetchProducts();
            toast.success('تم حذف المنتج');
        },
    });

    const updateCourseMutation = useMutation({
        mutationFn: ({ id, data }: UpdateMutationParams) => base44.entities.Course.update(id, data as Record<string, unknown>),
        onSuccess: () => {
            refetchCourses();
            toast.success('تم تحديث الدورة');
            setEditItem(null);
        },
    });

    const updateAppointmentMutation = useMutation({
        mutationFn: ({ id, data }: UpdateMutationParams) => base44.entities.Appointment.update(id, data as Record<string, unknown>),
        onSuccess: () => {
            refetchAppointments();
            toast.success('تم تحديث الموعد');
        },
    });

    const createProductMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => base44.entities.Product.create(data),
        onSuccess: () => {
            refetchProducts();
            toast.success('تم إضافة المنتج');
            setEditItem(null);
        },
    });

    const createCourseMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => base44.entities.Course.create(data),
        onSuccess: () => {
            refetchCourses();
            toast.success('تم إضافة الدورة');
            setEditItem(null);
        },
    });

    const updateArticleMutation = useMutation({
        mutationFn: ({ id, data }: UpdateMutationParams) => base44.entities.KnowledgeArticle.update(id, data as Record<string, unknown>),
        onSuccess: () => {
            refetchArticles();
            toast.success('تم تحديث المقال');
            setEditItem(null);
        },
    });

    const createArticleMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => base44.entities.KnowledgeArticle.create(data),
        onSuccess: () => {
            refetchArticles();
            toast.success('تم إضافة المقال');
            setEditItem(null);
        },
    });

    const deleteArticleMutation = useMutation({
        mutationFn: (id: string) => base44.entities.KnowledgeArticle.delete(id),
        onSuccess: () => {
            refetchArticles();
            toast.success('تم حذف المقال');
        },
    });

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">غير مصرح</h1>
                    <p className="text-slate-500 mb-4">ليس لديك صلاحية للوصول لهذه الصفحة</p>
                    <Link href={createPageUrl('Home')}>
                        <Button className="gradient-primary text-white rounded-xl">
                            العودة للرئيسية
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'المستخدمين', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { label: 'المنتجات', value: products.length, icon: Package, color: 'from-green-500 to-emerald-500' },
        { label: 'الدورات', value: courses.length, icon: BookOpen, color: 'from-purple-500 to-pink-500' },
        { label: 'المقالات', value: articles.length, icon: Newspaper, color: 'from-indigo-500 to-violet-500' },
    ];

    const pendingAppointments = appointments.filter(a => a.status === 'pending');

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <Link href={createPageUrl('Home')} className="text-white/70 hover:text-white">
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
                    <Button variant="ghost" size="icon" className="text-white/70">
                        <Bell className="w-5 h-5" />
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pending Appointments Alert */}
            {pendingAppointments.length > 0 && (
                <div className="px-6 py-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                        <Bell className="w-6 h-6 text-amber-500" />
                        <div className="flex-1">
                            <p className="font-medium text-amber-800">{pendingAppointments.length} موعد بانتظار التأكيد</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('appointments')}>
                            عرض
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-white rounded-xl p-1 shadow-sm h-auto flex-wrap grid grid-cols-4 md:grid-cols-7 gap-1">
                        <TabsTrigger value="overview" className="rounded-lg py-2 text-xs">نظرة عامة</TabsTrigger>
                        <TabsTrigger value="users" className="rounded-lg py-2 text-xs">المستخدمين</TabsTrigger>
                        <TabsTrigger value="appointments" className="rounded-lg py-2 text-xs">المواعيد</TabsTrigger>
                        <TabsTrigger value="products" className="rounded-lg py-2 text-xs">المنتجات</TabsTrigger>
                        <TabsTrigger value="courses" className="rounded-lg py-2 text-xs">الدورات</TabsTrigger>
                        <TabsTrigger value="articles" className="rounded-lg py-2 text-xs">المقالات</TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-lg py-2 text-xs">الإعدادات</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Recent Appointments */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800">آخر المواعيد</h3>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab('appointments')}>
                                    عرض الكل
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {appointments.slice(0, 3).map((apt) => (
                                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                            apt.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 truncate">{apt.patient_name}</p>
                                            <p className="text-xs text-slate-500">{apt.date} - {apt.time_slot}</p>
                                        </div>
                                        <Badge variant={apt.status === 'confirmed' ? 'default' : 'outline'}>
                                            {apt.status === 'pending' ? 'بانتظار' : apt.status === 'confirmed' ? 'مؤكد' : apt.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">إجراءات سريعة</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    onClick={() => { setEditType('product'); setEditItem({}); }}
                                >
                                    <Plus className="w-5 h-5 text-green-500" />
                                    <span className="text-xs">إضافة منتج</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    onClick={() => { setEditType('course'); setEditItem({}); }}
                                >
                                    <Plus className="w-5 h-5 text-purple-500" />
                                    <span className="text-xs">إضافة دورة</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2"
                                    onClick={() => { setEditType('article'); setEditItem({}); }}
                                >
                                    <Plus className="w-5 h-5 text-indigo-500" />
                                    <span className="text-xs">إضافة مقال</span>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Appointments Tab */}
                    <TabsContent value="appointments" className="mt-4 space-y-3">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{apt.patient_name}</h4>
                                        <p className="text-sm text-slate-500">{apt.patient_phone}</p>
                                    </div>
                                    <Badge className={
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                    }>
                                        {apt.status === 'pending' ? 'بانتظار' :
                                            apt.status === 'confirmed' ? 'مؤكد' :
                                                apt.status === 'completed' ? 'مكتمل' : apt.status}
                                    </Badge>
                                </div>

                                <div className="text-sm text-slate-600 mb-3">
                                    <p>📅 {apt.date} - {apt.time_slot}</p>
                                    <p>📋 {apt.session_type === 'diagnostic' ? 'جلسة تشخيصية' : apt.session_type}</p>
                                    {apt.health_concern && <p className="mt-1">💬 {apt.health_concern}</p>}
                                </div>

                                <div className="flex gap-2">
                                    {apt.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-500 hover:bg-green-600"
                                                onClick={() => updateAppointmentMutation.mutate({ id: apt.id, data: { status: 'confirmed' } })}
                                            >
                                                <Check className="w-4 h-4 ml-1" />
                                                تأكيد
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-red-500 border-red-200"
                                                onClick={() => updateAppointmentMutation.mutate({ id: apt.id, data: { status: 'cancelled' } })}
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                رفض
                                            </Button>
                                        </>
                                    )}
                                    {apt.status === 'confirmed' && (
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => updateAppointmentMutation.mutate({ id: apt.id, data: { status: 'completed' } })}
                                        >
                                            تم الانتهاء
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products" className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">المنتجات ({products.length})</h3>
                            <Button size="sm" onClick={() => { setEditType('product'); setEditItem({}); }}>
                                <Plus className="w-4 h-4 ml-1" />
                                إضافة
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex gap-3">
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/60'}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                                            <p className="text-sm text-slate-500">{product.category}</p>
                                            <p className="font-bold text-[#2D9B83]">{product.price} ر.س</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => { setEditType('product'); setEditItem(product); }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => deleteProductMutation.mutate(product.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Courses Tab */}
                    <TabsContent value="courses" className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">الدورات ({courses.length})</h3>
                            <Button size="sm" onClick={() => { setEditType('course'); setEditItem({}); }}>
                                <Plus className="w-4 h-4 ml-1" />
                                إضافة
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex gap-3">
                                        <img
                                            src={course.thumbnail_url || 'https://via.placeholder.com/60'}
                                            alt={course.title}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate">{course.title}</h4>
                                            <div className="flex gap-2 text-xs text-slate-500">
                                                <span>{course.lessons_count} درس</span>
                                                <span>•</span>
                                                <span>{course.enrolled_count} مشترك</span>
                                            </div>
                                            <p className="font-bold text-[#2D9B83]">
                                                {course.is_free ? 'مجاني' : `${course.price} ر.س`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => { setEditType('course'); setEditItem(course); }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Articles Tab */}
                    <TabsContent value="articles" className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">المقالات ({articles.length})</h3>
                            <Button size="sm" onClick={() => { setEditType('article'); setEditItem({}); }}>
                                <Plus className="w-4 h-4 ml-1" />
                                إضافة
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {articles.map((article) => (
                                <div key={article.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            {article.image_url ? (
                                                <img
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate">{article.title}</h4>
                                            <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {article.type === 'article' ? 'مقال' : article.type === 'video' ? 'فيديو' : article.type === 'study' ? 'دراسة' : 'بودكاست'}
                                                </Badge>
                                                <span>{article.views || 0} مشاهدة</span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{article.summary}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => { setEditType('article'); setEditItem(article); }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => deleteArticleMutation.mutate(article.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {articles.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <Newspaper className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                    <p>لا توجد مقالات بعد</p>
                                    <Button
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => { setEditType('article'); setEditItem({}); }}
                                    >
                                        <Plus className="w-4 h-4 ml-1" />
                                        إضافة أول مقال
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="mt-4">
                        <UserManagement />
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="mt-4 space-y-6">
                        <ThemeSettings />
                        <SystemConfig />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editItem?.id ? 'تعديل' : 'إضافة'} {editType === 'product' ? 'منتج' : 'دورة'}
                        </DialogTitle>
                    </DialogHeader>

                    {editType === 'product' && editItem && (
                        <ProductForm
                            product={editItem}
                            onSave={(data) => {
                                if (editItem.id) {
                                    updateProductMutation.mutate({ id: String(editItem.id), data });
                                } else {
                                    createProductMutation.mutate(data);
                                }
                            }}
                            onCancel={() => setEditItem(null)}
                            isLoading={updateProductMutation.isPending || createProductMutation.isPending}
                        />
                    )}

                    {editType === 'course' && editItem && (
                        <CourseForm
                            course={editItem}
                            onSave={(data) => {
                                if (editItem.id) {
                                    updateCourseMutation.mutate({ id: String(editItem.id), data });
                                } else {
                                    createCourseMutation.mutate(data);
                                }
                            }}
                            onCancel={() => setEditItem(null)}
                            isLoading={updateCourseMutation.isPending || createCourseMutation.isPending}
                        />
                    )}

                    {editType === 'article' && editItem && (
                        <ArticleForm
                            article={editItem}
                            onSave={(data) => {
                                if (editItem.id) {
                                    updateArticleMutation.mutate({ id: String(editItem.id), data });
                                } else {
                                    createArticleMutation.mutate(data);
                                }
                            }}
                            onCancel={() => setEditItem(null)}
                            isLoading={updateArticleMutation.isPending || createArticleMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ProductForm({ product, onSave, onCancel, isLoading }) {
    const [form, setForm] = useState({
        name: product.name || '',
        name_en: product.name_en || '',
        description: product.description || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        category: product.category || 'supplements',
        image_url: product.image_url || '',
        in_stock: product.in_stock !== false,
        featured: product.featured || false,
    });

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">اسم المنتج</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">الاسم بالإنجليزية</label>
                <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">الوصف</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-700">السعر</label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">السعر الأصلي</label>
                    <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">الفئة</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vitamins">فيتامينات</SelectItem>
                        <SelectItem value="minerals">معادن</SelectItem>
                        <SelectItem value="supplements">مكملات</SelectItem>
                        <SelectItem value="dmso">DMSO</SelectItem>
                        <SelectItem value="personal_care">عناية شخصية</SelectItem>
                        <SelectItem value="detox">ديتوكس</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">رابط الصورة</label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={onCancel}>إلغاء</Button>
                <Button className="flex-1 gradient-primary" onClick={() => onSave(form)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                </Button>
            </div>
        </div>
    );
}

function CourseForm({ course, onSave, onCancel, isLoading }) {
    const [form, setForm] = useState({
        title: course.title || '',
        title_en: course.title_en || '',
        description: course.description || '',
        price: course.price || 0,
        is_free: course.is_free || false,
        category: course.category || 'functional_medicine',
        thumbnail_url: course.thumbnail_url || '',
        duration_hours: course.duration_hours || 0,
        lessons_count: course.lessons_count || 0,
        level: course.level || 'beginner',
        status: course.status || 'draft',
    });

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">عنوان الدورة</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">العنوان بالإنجليزية</label>
                <Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">الوصف</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-700">السعر</label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">المدة (ساعات)</label>
                    <Input type="number" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-700">الفئة</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="functional_medicine">الطب الوظيفي</SelectItem>
                            <SelectItem value="nutrition">التغذية</SelectItem>
                            <SelectItem value="detox">الديتوكس</SelectItem>
                            <SelectItem value="hormones">الهرمونات</SelectItem>
                            <SelectItem value="digestive">الهضمي</SelectItem>
                            <SelectItem value="lab_analysis">التحاليل</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">الحالة</label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">مسودة</SelectItem>
                            <SelectItem value="published">منشور</SelectItem>
                            <SelectItem value="archived">مؤرشف</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">رابط الصورة</label>
                <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={onCancel}>إلغاء</Button>
                <Button className="flex-1 gradient-primary" onClick={() => onSave(form)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                </Button>
            </div>
        </div>
    );
}

function ArticleForm({ article, onSave, onCancel, isLoading }) {
    const [form, setForm] = useState({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        type: article.type || 'article',
        category: article.category || 'functional_medicine',
        image_url: article.image_url || '',
        video_url: article.video_url || '',
        duration_minutes: article.duration_minutes || 5,
        tags: article.tags?.join(', ') || '',
        featured: article.featured || false,
    });

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">عنوان المقال *</label>
                <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="عنوان واضح وجذاب"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">الملخص</label>
                <Textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder="ملخص قصير يظهر في القوائم"
                    rows={2}
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">المحتوى الكامل</label>
                <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="اكتب المحتوى هنا... يدعم Markdown"
                    rows={6}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-700">النوع</label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="article">مقال</SelectItem>
                            <SelectItem value="video">فيديو</SelectItem>
                            <SelectItem value="study">دراسة علمية</SelectItem>
                            <SelectItem value="podcast">بودكاست</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">الفئة</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="functional_medicine">الطب الوظيفي</SelectItem>
                            <SelectItem value="frequencies">الترددات الشفائية</SelectItem>
                            <SelectItem value="nutrition">التغذية</SelectItem>
                            <SelectItem value="lifestyle">نمط الحياة</SelectItem>
                            <SelectItem value="detox">الديتوكس</SelectItem>
                            <SelectItem value="supplements">المكملات</SelectItem>
                            <SelectItem value="mental_health">الصحة النفسية</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">رابط صورة الغلاف</label>
                <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>

            {(form.type === 'video' || form.type === 'podcast') && (
                <div>
                    <label className="text-sm font-medium text-slate-700">رابط الفيديو/البودكاست</label>
                    <Input
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                        placeholder="رابط YouTube أو Spotify"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-slate-700">مدة القراءة (دقائق)</label>
                    <Input
                        type="number"
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    />
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            className="w-4 h-4 text-[#2D9B83] rounded"
                        />
                        <span className="text-sm text-slate-700">مقال مميز</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">الكلمات المفتاحية (مفصولة بفاصلة)</label>
                <Input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="طب وظيفي, تغذية, صحة"
                />
            </div>

            <div className="flex gap-4 pt-2">
                <Button variant="outline" className="flex-1" onClick={onCancel}>إلغاء</Button>
                <Button
                    className="flex-1 gradient-primary"
                    onClick={() => onSave({
                        ...form,
                        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
                    })}
                    disabled={isLoading || !form.title}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                </Button>
            </div>
        </div>
    );
}

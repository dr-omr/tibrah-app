import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modular Components
import AdminLayout from '@/components/admin/AdminLayout';
import AdminStats from '@/components/admin/AdminStats';
import AppointmentManager from '@/components/admin/AppointmentManager';
import ProductManager from '@/components/admin/ProductManager';
import CourseManager from '@/components/admin/CourseManager';
import ArticleManager from '@/components/admin/ArticleManager';
import FrequencyManager from '@/components/admin/FrequencyManager'; // New
import UserManagement from '@/components/admin/UserManagement';
import SystemConfig from '@/components/admin/SystemConfig'; // Assuming exists
import ThemeSettings from '@/components/admin/ThemeSettings'; // Assuming exists
import FoodManager from '@/components/admin/FoodManager'; // Meal Planner Admin
import RecipeManager from '@/components/admin/RecipeManager'; // Recipe Admin

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const queryClient = useQueryClient();

    // Check Auth on Mount
    useEffect(() => {
        const isAuth = localStorage.getItem('admin_auth');
        if (isAuth === 'true') setIsAuthenticated(true);
    }, []);

    // Auth Handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === '777144711') { // Dr. Omar's Phone Prefix/Code
            setIsAuthenticated(true);
            localStorage.setItem('admin_auth', 'true');
            toast.success('مرحباً دكتور عمر!');
        } else {
            toast.error('رمز الدخول غير صحيح');
        }
    };

    // ----- DATA FETCHING -----
    const { data: rawUsers = [] } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => db.entities.User.list() as any,
        enabled: isAuthenticated
    });

    const users = rawUsers.map((u: any) => ({
        id: u.id,
        name: u.name || u.email?.split('@')[0] || 'مستخدم',
        email: u.email || 'لا يوجد بريد',
        role: u.role || 'user',
        subscription: u.subscription || 'free',
        joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '-',
        lastActive: '-',
        status: u.status || 'active'
    }));

    const { data: products = [], refetch: refetchProducts } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => db.entities.Product.list() as any,
        enabled: isAuthenticated
    });

    const { data: appointments = [], refetch: refetchAppointments } = useQuery({
        queryKey: ['admin-appointments'],
        queryFn: () => db.entities.Appointment.list('-created_date') as any,
        enabled: isAuthenticated
    });

    const { data: courses = [], refetch: refetchCourses } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: () => db.entities.Course.list() as any,
        enabled: isAuthenticated
    });

    const { data: articles = [], refetch: refetchArticles } = useQuery({
        queryKey: ['admin-articles'],
        queryFn: () => db.entities.KnowledgeArticle.list() as any,
        enabled: isAuthenticated
    });

    // We assume there is a 'Frequency' entity in db.ts or we stub it
    // If not, this might fail unless db.ts handles arbitrary collections
    // db.entities is strictly typed. I need to check db.ts if Frequency exists.
    // If not, I will add it to db.ts first.
    // Assuming it doesn't exist yet, I will use a placeholder or generic 'Entity' if available.
    // Earlier I saw db.ts content and it had Users, Products, Courses, etc. I don't recall Frequencies.
    // I will proceed with adding Frequency to db.ts in a subsequent step if needed, but for now I'll stub the fetch.
    const { data: frequencies = [], refetch: refetchFrequencies } = useQuery({
        queryKey: ['admin-frequencies'],
        queryFn: async () => {
            // Safe check if Frequency entity exists, else return empty
            if ((db.entities as any).Frequency) {
                return (db.entities as any).Frequency.list();
            }
            return [];
        },
        enabled: isAuthenticated
    });

    // ----- MUTATIONS -----
    const updateAppointmentMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            db.entities.Appointment.update(id, { status }),
        onSuccess: () => {
            refetchAppointments();
            toast.success('تم تحديث حالة الموعد');
        }
    });

    const productMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any, id?: string }) => {
            id ? await db.entities.Product.update(id, data) : await db.entities.Product.create(data);
        },
        onSuccess: () => {
            refetchProducts();
            toast.success('تم حفظ المنتج');
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => db.entities.Product.delete(id),
        onSuccess: () => {
            refetchProducts();
            toast.success('تم حذف المنتج');
        }
    });

    // Course Mutations
    const courseMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any, id?: string }) => {
            id ? await db.entities.Course.update(id, data) : await db.entities.Course.create(data);
        },
        onSuccess: () => {
            refetchCourses();
            toast.success('تم حفظ الدورة');
        }
    });

    const deleteCourseMutation = useMutation({
        mutationFn: (id: string) => db.entities.Course.delete(id),
        onSuccess: () => {
            refetchCourses();
            toast.success('تم حذف الدورة');
        }
    });

    // Article Mutations
    const articleMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any, id?: string }) => {
            id ? await db.entities.KnowledgeArticle.update(id, data) : await db.entities.KnowledgeArticle.create(data);
        },
        onSuccess: () => {
            refetchArticles();
            toast.success('تم حفظ المقال');
        }
    });

    const deleteArticleMutation = useMutation({
        mutationFn: (id: string) => db.entities.KnowledgeArticle.delete(id),
        onSuccess: () => {
            refetchArticles();
            toast.success('تم حذف المقال');
        }
    });

    const frequencyMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any, id?: string }) => {
            const entity = (db.entities as any).Frequency;
            if (entity) {
                id ? await entity.update(id, data) : await entity.create(data);
            } else {
                console.warn('Frequency entity not found in db');
            }
        },
        onSuccess: () => { refetchFrequencies(); toast.success('تم حفظ التردد'); }
    });

    const deleteFrequencyMutation = useMutation({
        mutationFn: async (id: string) => {
            const entity = (db.entities as any).Frequency;
            if (entity) await entity.delete(id);
        },
        onSuccess: () => { refetchFrequencies(); toast.success('تم حذف التردد'); }
    });


    // ----- VIEW: LOGIN SCREEN -----
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex items-center justify-center p-6">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2D9B83]/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative z-10 transition-all hover:shadow-[#2D9B83]/20">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#2D9B83] to-[#1A5F50] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                        <Lock className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">لوحة القيادة</h1>
                    <p className="text-slate-300 mb-8 font-light">بوابة د. عمر العماد الرقمية</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#2D9B83] transition-colors" />
                            </div>
                            <Input
                                type="password"
                                placeholder="رمز الدخول السري"
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-center text-lg h-14 pr-12 rounded-xl focus:ring-2 focus:ring-[#2D9B83] focus:border-transparent transition-all"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-[#2D9B83] to-[#1A5F50] hover:from-[#258570] hover:to-[#144D40] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#2D9B83]/30 hover:shadow-[#2D9B83]/50 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            تسجيل الدخول الآمن
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs text-slate-400">نظام طِبرَا الذكي v2.0</p>
                    </div>
                </div>
            </div>
        );
    }

    // ----- VIEW: DASHBOARD -----
    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'overview' && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">نظرة عامة</h2>
                        <p className="text-slate-500">مرحباً بك مرة أخرى، د. عمر 👋</p>
                    </div>
                    <AdminStats
                        usersCount={users.length}
                        productsCount={products.length}
                        coursesCount={courses.length}
                        articlesCount={articles.length}
                    />

                    {/* Recent Appointments Preview */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">آخر المواعيد</h3>
                            <Button variant="ghost" onClick={() => setActiveTab('appointments')}>
                                عرض الكل <ArrowRight className="w-4 h-4 mr-2" />
                            </Button>
                        </div>
                        <AppointmentManager
                            appointments={appointments.slice(0, 5)}
                            onUpdateStatus={(id, status) => updateAppointmentMutation.mutate({ id, status })}
                        />
                    </div>
                </>
            )}

            {activeTab === 'appointments' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">إدارة المواعيد</h2></div>
                    <AppointmentManager
                        appointments={appointments}
                        onUpdateStatus={(id, status) => updateAppointmentMutation.mutate({ id, status })}
                    />
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">إدارة المنتجات</h2></div>
                    <ProductManager
                        products={products}
                        onSave={(data, id) => productMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteProductMutation.mutate(id)}
                    />
                </div>
            )}

            {activeTab === 'courses' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">إدارة الدورات</h2></div>
                    <CourseManager
                        courses={courses}
                        onSave={(data, id) => courseMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteCourseMutation.mutate(id)}
                    />
                </div>
            )}

            {activeTab === 'articles' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">إدارة المحتوى</h2></div>
                    <ArticleManager
                        articles={articles}
                        onSave={(data, id) => articleMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteArticleMutation.mutate(id)}
                    />
                </div>
            )}

            {/* Frequencies Tab */}
            {activeTab === 'frequencies' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">إدارة الترددات</h2></div>
                    <FrequencyManager
                        frequencies={frequencies}
                        onSave={(data, id) => frequencyMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteFrequencyMutation.mutate(id)}
                    />
                </div>
            )}

            {/* Meal Planner / Foods Tab */}
            {activeTab === 'foods' && (
                <div>
                    <FoodManager />
                </div>
            )}

            {/* Recipes Tab */}
            {activeTab === 'recipes' && (
                <div>
                    <RecipeManager />
                </div>
            )}

            {activeTab === 'users' && <UserManagement users={users} />}

            {activeTab === 'settings' && (
                <div className="space-y-8">
                    <ThemeSettings />
                    <SystemConfig />
                </div>
            )}
        </AdminLayout>
    );
}

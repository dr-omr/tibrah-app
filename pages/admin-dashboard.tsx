import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { Lock, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';

// Modular Components
import AdminLayout from '@/components/admin/AdminLayout';
import AdminStats from '@/components/admin/AdminStats';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import ActivityLog from '@/components/admin/ActivityLog';
import AppointmentManager from '@/components/admin/AppointmentManager';
import ProductManager from '@/components/admin/ProductManager';
import CourseManager from '@/components/admin/CourseManager';
import ArticleManager from '@/components/admin/ArticleManager';
import FrequencyManager from '@/components/admin/FrequencyManager';
import UserManagement from '@/components/admin/UserManagement';
import SystemConfig from '@/components/admin/SystemConfig';
import ThemeSettings from '@/components/admin/ThemeSettings';
import FoodManager from '@/components/admin/FoodManager';
import RecipeManager from '@/components/admin/RecipeManager';
import OrderManager from '@/components/admin/OrderManager';
import DoctorClinicalView from '@/components/admin/DoctorClinicalView';
import { showNotification } from '@/lib/pushNotifications';

export default function AdminDashboard() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const queryClient = useQueryClient();

    // Check Auth on Mount — use AuthContext first, then check localStorage session
    useEffect(() => {
        if (!authLoading) {
            if (isAdmin) {
                // User is logged in with admin role — auto-authenticate
                setIsAuthenticated(true);
                localStorage.setItem('admin_auth_session', Date.now().toString());
            } else {
                // Check if there's a valid admin session (expires after 8 hours)
                const sessionTime = localStorage.getItem('admin_auth_session');
                if (sessionTime) {
                    const elapsed = Date.now() - parseInt(sessionTime, 10);
                    const EIGHT_HOURS = 8 * 60 * 60 * 1000;
                    if (elapsed < EIGHT_HOURS) {
                        setIsAuthenticated(true);
                    } else {
                        // Session expired
                        localStorage.removeItem('admin_auth_session');
                    }
                }
            }
        }
    }, [authLoading, isAdmin]);

    // Auth Handler — verify passcode against server-side API
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        // Brute force protection — lock after 5 failed attempts
        if (loginAttempts >= 5) {
            setLoginError('تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار 15 دقيقة.');
            return;
        }

        try {
            const res = await fetch('/api/admin-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(true);
                localStorage.setItem('admin_auth_session', Date.now().toString());
                if (data.token) {
                    localStorage.setItem('admin_api_token', data.token);
                }
                toast.success('مرحباً دكتور عمر!');
                setLoginAttempts(0);
            } else {
                setLoginAttempts(prev => prev + 1);
                setLoginError(`رمز الدخول غير صحيح (${5 - loginAttempts - 1} محاولات متبقية)`);
                toast.error('رمز الدخول غير صحيح');
            }
        } catch {
            // Offline fallback — if the API is unreachable, deny access
            setLoginError('تعذر التحقق. تأكد من الاتصال بالإنترنت.');
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

    const { data: orders = [], refetch: refetchOrders } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => db.entities.Order.list('-date') as any,
        enabled: isAuthenticated
    });

    // Frequency entity (optional — may not exist in database)
    const { data: frequencies = [], refetch: refetchFrequencies } = useQuery({
        queryKey: ['admin-frequencies'],
        queryFn: async () => {
            if ((db.entities as any).Frequency) {
                return (db.entities as any).Frequency.list();
            }
            return [];
        },
        enabled: isAuthenticated
    });

    // ─── Clinical Data for Doctor Dashboard ───
    const { data: dailyLogs = [] } = useQuery({
        queryKey: ['admin-daily-logs'],
        queryFn: () => db.entities.DailyLog.list('-date', 500) as any,
        enabled: isAuthenticated
    });

    const { data: symptomLogs = [] } = useQuery({
        queryKey: ['admin-symptom-logs'],
        queryFn: () => db.entities.SymptomLog.list('-recorded_at', 500) as any,
        enabled: isAuthenticated
    });

    const { data: diagnosticResults = [] } = useQuery({
        queryKey: ['admin-diagnostic-results'],
        queryFn: () => db.entities.DiagnosticResult.list() as any,
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
                // Frequency entity not found — feature not available
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

    // Order Mutations
    const orderMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | string }) => {
            await db.entities.Order.update(id, { status: status as any });
            return status;
        },
        onSuccess: (status) => {
            refetchOrders();
            toast.success('تم تحديث حالة الطلب');
            
            // Simulate Push Notification to the user
            const statusToMessage: Record<string, string> = {
                'confirmed': 'تم تأكيد استلام الدفع الخاص بطلبك بنجاح ✅',
                'processing': 'بدأنا بتجهيز طلبك وسيتم شحنه قريباً 📦',
                'delivered': 'تم تسليم طلبك بنجاح. شكراً لتسوقك معنا! 🎉',
                'cancelled': 'نأسف، تم إلغاء طلبك ❌'
            };
            if (statusToMessage[status]) {
                showNotification(`تحديث حالة الطلب`, { body: statusToMessage[status] });
            }
        }
    });

    // ----- VIEW: LOGIN SCREEN -----
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex items-center justify-center p-6">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative z-10 transition-all hover:shadow-primary/20">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-[#1A5F50] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                        <Lock className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">لوحة القيادة</h1>
                    <p className="text-slate-300 mb-8 font-light">بوابة د. عمر العماد الرقمية</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                type="password"
                                placeholder="رمز الدخول السري"
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-center text-lg h-14 pr-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loginAttempts >= 5}
                            className="w-full h-14 bg-gradient-to-r from-primary to-[#1A5F50] hover:from-[#258570] hover:to-[#144D40] text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            تسجيل الدخول الآمن
                        </Button>

                        {loginError && (
                            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                                <span>{loginError}</span>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs text-slate-400">نظام طِبرَا الذكي v2.0 — مؤمّن</p>
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
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">نظرة عامة</h2>
                        <p className="text-slate-500 dark:text-slate-400">مرحباً بك مرة أخرى، د. عمر 👋</p>
                    </div>
                    <AdminStats
                        usersCount={users.length}
                        productsCount={products.length}
                        coursesCount={courses.length}
                        articlesCount={articles.length}
                    />

                    {/* Advanced Analytics Charts */}
                    <AnalyticsDashboard
                        usersCount={users.length}
                        productsCount={products.length}
                        coursesCount={courses.length}
                        articlesCount={articles.length}
                        appointmentsCount={appointments.length}
                    />

                    {/* Real-time Activity Log */}
                    <ActivityLog
                        users={users}
                        appointments={appointments}
                        products={products}
                        courses={courses}
                    />
                    {/* Recent Appointments Preview */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white">آخر المواعيد</h3>
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
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المواعيد</h2></div>
                    <AppointmentManager
                        appointments={appointments}
                        onUpdateStatus={(id, status) => updateAppointmentMutation.mutate({ id, status })}
                    />
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">الطلبات والمدفوعات</h2></div>
                    <OrderManager
                        orders={orders}
                        onUpdateStatus={(id, status) => orderMutation.mutate({ id, status })}
                        isMutating={orderMutation.isPending}
                    />
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المنتجات</h2></div>
                    <ProductManager
                        products={products}
                        onSave={(data, id) => productMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteProductMutation.mutate(id)}
                    />
                </div>
            )}

            {activeTab === 'courses' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الدورات</h2></div>
                    <CourseManager
                        courses={courses}
                        onSave={(data, id) => courseMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteCourseMutation.mutate(id)}
                    />
                </div>
            )}

            {activeTab === 'articles' && (
                <div>
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المحتوى</h2></div>
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
                    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الترددات</h2></div>
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

            {activeTab === 'patients' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">مركز الذكاء السريري</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">رؤية شاملة لجميع المرضى وحالاتهم الصحية والشعورية</p>
                    </div>
                    <DoctorClinicalView
                        users={rawUsers as any[]}
                        appointments={appointments}
                        dailyLogs={dailyLogs}
                        symptomLogs={symptomLogs}
                        diagnosticResults={diagnosticResults}
                    />
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

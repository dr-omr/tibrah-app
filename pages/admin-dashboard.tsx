import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
import UserManagement from '@/components/admin/UserManagement'; // Assuming exists
import SystemConfig from '@/components/admin/SystemConfig'; // Assuming exists
import ThemeSettings from '@/components/admin/ThemeSettings'; // Assuming exists

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
    const { data: users = [] } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => base44.entities.User.list() as any,
        enabled: isAuthenticated
    });

    const { data: products = [], refetch: refetchProducts } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => base44.entities.Product.list() as any,
        enabled: isAuthenticated
    });

    const { data: appointments = [], refetch: refetchAppointments } = useQuery({
        queryKey: ['admin-appointments'],
        queryFn: () => base44.entities.Appointment.list('-created_date') as any,
        enabled: isAuthenticated
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: () => base44.entities.Course.list() as any,
        enabled: isAuthenticated
    });

    const { data: articles = [] } = useQuery({
        queryKey: ['admin-articles'],
        queryFn: () => base44.entities.KnowledgeArticle.list() as any,
        enabled: isAuthenticated
    });

    // ----- MUTATIONS -----
    const updateAppointmentMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            base44.entities.Appointment.update(id, { status }),
        onSuccess: () => {
            refetchAppointments();
            toast.success('تم تحديث حالة الموعد');
        }
    });

    const productMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any, id?: string }) => {
            if (id) {
                await base44.entities.Product.update(id, data);
            } else {
                await base44.entities.Product.create(data);
            }
        },
        onSuccess: () => {
            refetchProducts();
            toast.success('تم حفظ المنتج بنجاح');
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => base44.entities.Product.delete(id),
        onSuccess: () => {
            refetchProducts();
            toast.success('تم حذف المنتج');
        }
    });


    // ----- VIEW: LOGIN SCREEN -----
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-slate-700" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">لوحة الإدارة 🔒</h1>
                    <p className="text-slate-500 mb-8">يرجى إدخال رمز الدخول الخاص بـ د. عمر</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="رمز الدخول"
                            className="bg-slate-50 text-center text-lg h-12"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                        />
                        <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl">
                            دخول
                        </Button>
                    </form>
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
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">إدارة المواعيد</h2>
                    </div>
                    <AppointmentManager
                        appointments={appointments}
                        onUpdateStatus={(id, status) => updateAppointmentMutation.mutate({ id, status })}
                    />
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">إدارة المنتجات</h2>
                    </div>
                    <ProductManager
                        products={products}
                        onSave={(data, id) => productMutation.mutateAsync({ data, id })}
                        onDelete={(id) => deleteProductMutation.mutate(id)}
                    />
                </div>
            )}

            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'settings' && (
                <div className="space-y-8">
                    <ThemeSettings />
                    <SystemConfig />
                </div>
            )}
            {/* Placeholders for other tabs */}
            {(activeTab === 'courses' || activeTab === 'articles') && (
                <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="text-center text-slate-400">
                        <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin" />
                        <p>جاري العمل على هذا القسم...</p>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

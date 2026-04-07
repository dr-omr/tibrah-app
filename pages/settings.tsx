import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/notification-engine';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    User, Bell, Scale, Palette, Database, ArrowRight, Moon, Sun, Check,
    Loader2, Download, Trash2, Shield, Globe, LogOut, Smartphone
} from 'lucide-react';
import PushNotificationButton from '@/components/dashboard/PushNotificationButton';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
// ... (imports)

export default function Settings() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user: authUser, updateProfile: updateAuthProfile, signOut } = useAuth();
    const [user, setUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [medicalPreferences, setMedicalPreferences] = useState('');
    const [signingOutAll, setSigningOutAll] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            appointments: true,
            // ... defaults
            medications: true, supplements: true, frequencies: true, water: true, dailyCheckIn: true, tips: true,
        },
        units: { weight: 'kg', temperature: 'celsius', bloodSugar: 'mg/dL', height: 'cm' },
        appearance: { theme: 'light', primaryColor: 'teal' }
    });
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authUser) return;

        const loadSettings = async () => {
            setFullName(authUser.displayName || authUser.name || '');

            // Load extended settings from DB
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser && (dbUser as any).settings) {
                const loadedSettings = (dbUser as any).settings;
                setSettings(prev => ({ ...prev, ...loadedSettings }));
                if (loadedSettings.medicalPreferences) {
                    setMedicalPreferences(loadedSettings.medicalPreferences);
                }
            }
        };
        loadSettings();
    }, [authUser]);

    const updateProfile = async () => {
        if (!authUser) return;
        try {
            // Update Auth Profile (Display Name)
            await updateAuthProfile({ displayName: fullName });

            // Update DB Settings
            const newSettings = {
                ...settings,
                medicalPreferences,
                displayName: fullName
            };

            // Check if user exists in DB, if not create stub
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser) {
                await db.entities.User.update(authUser.id, { settings: newSettings });
            } else {
                await db.entities.User.create({ id: authUser.id, settings: newSettings });
            }

            toast.success('تم تحديث الملف الشخصي');
        } catch (error) {
            toast.error('حدث خطأ في التحديث');
        }
    };

    const saveSettings = async (newSettings) => {
        setSettings(newSettings);
        if (!authUser) return;
        try {
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser) {
                await db.entities.User.update(authUser.id, { settings: newSettings });
            } else {
                await db.entities.User.create({ id: authUser.id, settings: newSettings });
            }
            toast.success('تم حفظ الإعدادات');
        } catch (error) {
            toast.error('حدث خطأ في الحفظ');
        }
    };

    const updateNotification = (key, value) => {
        const newSettings = {
            ...settings,
            notifications: { ...settings.notifications, [key]: value }
        };
        saveSettings(newSettings);
    };

    const updateUnit = (key, value) => {
        const newSettings = {
            ...settings,
            units: { ...settings.units, [key]: value }
        };
        saveSettings(newSettings);
    };

    const updateAppearance = (key, value) => {
        const newSettings = {
            ...settings,
            appearance: { ...settings.appearance, [key]: value }
        };
        saveSettings(newSettings);
    };

    const exportData = async () => {
        setExporting(true);
        try {
            const [metrics, symptoms, dailyLogs] = await Promise.all([
                db.entities.HealthMetric.listForUser(authUser?.id || ''),
                db.entities.SymptomLog.listForUser(authUser?.id || ''),
                db.entities.DailyLog.listForUser(authUser?.id || ''),
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                healthMetrics: metrics,
                symptoms: symptoms,
                dailyLogs: dailyLogs,
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tibrah-health-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('تم تصدير البيانات بنجاح');
        } catch (error) {
            toast.error('حدث خطأ في التصدير');
        } finally {
            setExporting(false);
        }
    };

    const deleteAllData = async () => {
        setDeleting(true);
        try {
            const [metrics, symptoms, dailyLogs] = await Promise.all([
                db.entities.HealthMetric.listForUser(authUser?.id || ''),
                db.entities.SymptomLog.listForUser(authUser?.id || ''),
                db.entities.DailyLog.listForUser(authUser?.id || ''),
            ]);

            await Promise.all([
                ...metrics.map(m => db.entities.HealthMetric.delete(m.id)),
                ...symptoms.map(s => db.entities.SymptomLog.delete(s.id)),
                ...dailyLogs.map(l => db.entities.DailyLog.delete(l.id)),
            ]);

            queryClient.invalidateQueries();
            toast.success('تم حذف جميع البيانات');
        } catch (error) {
            toast.error('حدث خطأ في الحذف');
        } finally {
            setDeleting(false);
        }
    };

    const signOutAllDevices = async () => {
        setSigningOutAll(true);
        try {
            // Need the ID token for the API call
            const authModule = await import('../lib/firebase');
            const firebaseAuth = await import('firebase/auth');
            
            if (authModule.auth?.currentUser) {
                const idToken = await authModule.auth.currentUser.getIdToken(true);
                
                // Call API to revoke all Firebase refresh tokens server-side
                const res = await fetch('/api/auth/revoke-all-sessions', { 
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                
                if (!res.ok) throw new Error('Failed to revoke sessions');
            }
            
            // Sign out locally as well
            await signOut();
            toast.success('تم تسجيل الخروج من جميع الأجهزة بنجاح ✅');
            router.replace('/login');
        } catch (error) {
            console.error('Sign out all devices error:', error);
            toast.error('حدث خطأ. يرجى المحاولة مجدداً');
        } finally {
            setSigningOutAll(false);
        }
    };

    const notificationItems = [
        { key: 'appointments', label: 'تذكيرات المواعيد', icon: '📅' },
        { key: 'medications', label: 'تذكيرات الأدوية', icon: '💊' },
        { key: 'supplements', label: 'تذكيرات المكملات', icon: '💉' },
        { key: 'frequencies', label: 'تذكيرات الترددات', icon: '🎵' },
        { key: 'water', label: 'تذكيرات شرب الماء', icon: '💧' },
        { key: 'dailyCheckIn', label: 'التسجيل اليومي', icon: '☀️' },
        { key: 'tips', label: 'نصائح صحية', icon: '💡' },
    ];

    const colorOptions = [
        { id: 'teal', name: 'أخضر مزرق', color: '#2D9B83' },
        { id: 'blue', name: 'أزرق', color: '#3B82F6' },
        { id: 'purple', name: 'بنفسجي', color: '#8B5CF6' },
        { id: 'rose', name: 'وردي', color: '#F43F5E' },
        { id: 'amber', name: 'ذهبي', color: '#F59E0B' },
    ];

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-light px-6 py-8">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

                <div className="relative flex items-center gap-4">
                    <Link href={createPageUrl('Profile')}>
                        <Button size="icon" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-white">الإعدادات</h1>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Personal Information Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2>
                    </div>

                    <div className="glass rounded-2xl p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">الاسم الكامل</label>
                            <div className="relative">
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary"
                                />
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">تفضيلات طبية</label>
                            <Textarea
                                value={medicalPreferences}
                                onChange={(e) => setMedicalPreferences(e.target.value)}
                                placeholder="مثلاً: أفضل العلاجات الطبيعية، لدي حساسية من..."
                                className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary h-24 resize-none"
                            />
                        </div>

                        <Button onClick={updateProfile} className="w-full bg-primary hover:bg-primary/90 text-white">
                            حفظ التغييرات
                        </Button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">الإشعارات والتذكيرات</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        {/* Push Notification Permission */}
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary-light/5 border-b border-primary/10">
                            <PushNotificationButton />
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                يجب تفعيل إشعارات المتصفح لاستلام التنبيهات
                            </p>
                        </div>

                        {notificationItems.map((item, idx) => (
                            <div
                                key={item.key}
                                className={`flex items-center gap-4 p-4 ${idx !== notificationItems.length - 1 ? 'border-b border-slate-100' : ''
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                <Switch
                                    checked={settings.notifications[item.key]}
                                    onCheckedChange={(v) => updateNotification(item.key, v)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Units Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Scale className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">وحدات القياس</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                            <span className="text-2xl">⚖️</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">الوزن</span>
                            <Select value={settings.units.weight} onValueChange={(v) => updateUnit('weight', v)}>
                                <SelectTrigger className="w-28 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">كجم</SelectItem>
                                    <SelectItem value="lb">رطل</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                            <span className="text-2xl">🌡️</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">الحرارة</span>
                            <Select value={settings.units.temperature} onValueChange={(v) => updateUnit('temperature', v)}>
                                <SelectTrigger className="w-28 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="celsius">مئوية °C</SelectItem>
                                    <SelectItem value="fahrenheit">فهرنهايت °F</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                            <span className="text-2xl">🩸</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">سكر الدم</span>
                            <Select value={settings.units.bloodSugar} onValueChange={(v) => updateUnit('bloodSugar', v)}>
                                <SelectTrigger className="w-28 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                                    <SelectItem value="mmol/L">mmol/L</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 p-4">
                            <span className="text-2xl">📏</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">الطول</span>
                            <Select value={settings.units.height} onValueChange={(v) => updateUnit('height', v)}>
                                <SelectTrigger className="w-28 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cm">سم</SelectItem>
                                    <SelectItem value="ft">قدم</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* Language Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">اللغة</h2>
                    </div>

                    <div className="glass rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">لغة التطبيق</p>
                                <p className="text-sm text-slate-400 mt-0.5">العربية أو الإنجليزية</p>
                            </div>
                            <LanguageToggle variant="switch" />
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">المظهر</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                {settings.appearance.theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-slate-600" />
                                ) : (
                                    <Sun className="w-5 h-5 text-amber-500" />
                                )}
                            </div>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">المظهر</span>
                            <Select value={settings.appearance.theme} onValueChange={(v) => updateAppearance('theme', v)}>
                                <SelectTrigger className="w-28 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">فاتح</SelectItem>
                                    <SelectItem value="dark">داكن</SelectItem>
                                    <SelectItem value="system">تلقائي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4">
                            <span className="font-medium text-slate-700 dark:text-slate-300 block mb-3">اللون الرئيسي</span>
                            <div className="flex gap-3">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateAppearance('primaryColor', color.id)}
                                        className={`w-10 h-10 rounded-full transition-all duration-300 ${settings.appearance.primaryColor === color.id
                                            ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                                            : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.color }}
                                    >
                                        {settings.appearance.primaryColor === color.id && (
                                            <Check className="w-5 h-5 text-white mx-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">إدارة البيانات</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <button
                            onClick={exportData}
                            disabled={exporting}
                            className="w-full flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                {exporting ? (
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                ) : (
                                    <Download className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                            <div className="flex-1 text-right">
                                <span className="font-medium text-slate-700 dark:text-slate-300 block">تصدير البيانات</span>
                                <span className="text-sm text-slate-400">تحميل جميع بياناتك الصحية</span>
                            </div>
                        </button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="font-medium text-red-600 block">حذف جميع البيانات</span>
                                        <span className="text-sm text-slate-400">لا يمكن التراجع عن هذا الإجراء</span>
                                    </div>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle>
                                    <AlertDialogDescription className="text-right">
                                        سيتم حذف جميع القياسات الصحية والأعراض والسجلات اليومية نهائياً.
                                        لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={deleteAllData}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={deleting}
                                    >
                                        {deleting ? 'جاري الحذف...' : 'حذف نهائياً'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-800 dark:text-white">الأمان</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <Smartphone className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="font-medium text-red-600 block">تسجيل الخروج من جميع الأجهزة</span>
                                        <span className="text-sm text-slate-400">ينهي جميع جلسات الدخول النشطة على كل الأجهزة</span>
                                    </div>
                                    <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-right">تسجيل الخروج من جميع الأجهزة</AlertDialogTitle>
                                    <AlertDialogDescription className="text-right">
                                        سيتم إنهاء جميع جلسات تسجيل الدخول على كل الأجهزة وستحتاج إلى تسجيل الدخول مجدداً.
                                        استخدم هذا إذا نسيت جهازك أو أبلغتك بوجود نشاط مشبوه.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={signOutAllDevices}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={signingOutAll}
                                    >
                                        {signingOutAll ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري تسجيل الخروج...
                                            </span>
                                        ) : 'تسجيل الخروج من كل الأجهزة'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </section>

                {/* Privacy Note */}
                <div className="glass rounded-2xl p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">خصوصيتك محمية</p>
                        <p className="text-sm text-slate-500">
                            جميع بياناتك مشفرة ومحفوظة بأمان. نحن لا نشارك بياناتك مع أي طرف ثالث.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
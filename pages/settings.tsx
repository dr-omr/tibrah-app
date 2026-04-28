import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/notification-engine';
import { ArrowRight } from 'lucide-react';

// Modular imports
import { DEFAULT_SETTINGS, type SettingsState } from '@/components/settings/settings-data';
import {
  PersonalInfoSection, NotificationsSection, UnitsSection,
  LanguageSection, AppearanceSection, DataManagementSection,
  SecuritySection, PrivacyNote,
} from '@/components/settings/settings-sections';

export default function Settings() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user: authUser, updateProfile: updateAuthProfile, signOut } = useAuth();
    const [fullName, setFullName] = useState('');
    const [medicalPreferences, setMedicalPreferences] = useState('');
    const [signingOutAll, setSigningOutAll] = useState(false);
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authUser) return;
        const loadSettings = async () => {
            setFullName(authUser.displayName || (authUser as any).name || '');
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser && (dbUser as any).settings) {
                const loaded = (dbUser as any).settings;
                setSettings(prev => ({ ...prev, ...loaded }));
                if (loaded.medicalPreferences) setMedicalPreferences(loaded.medicalPreferences);
            }
        };
        loadSettings();
    }, [authUser]);

    const saveSettings = async (newSettings: SettingsState) => {
        setSettings(newSettings);
        if (!authUser) return;
        try {
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser) await db.entities.User.update(authUser.id, { settings: newSettings as any });
            else await db.entities.User.create({ id: authUser.id, settings: newSettings as any });
            toast.success('تم حفظ الإعدادات');
        } catch { toast.error('حدث خطأ في الحفظ'); }
    };

    const updateProfile = async () => {
        if (!authUser) return;
        try {
            await updateAuthProfile({ displayName: fullName });
            const newSettings = { ...settings, medicalPreferences, displayName: fullName } as any;
            const dbUser = await db.entities.User.get(authUser.id);
            if (dbUser) await db.entities.User.update(authUser.id, { settings: newSettings });
            else await db.entities.User.create({ id: authUser.id, settings: newSettings });
            toast.success('تم تحديث الملف الشخصي');
        } catch { toast.error('حدث خطأ في التحديث'); }
    };

    const updateNotification = (key: string, value: boolean) => saveSettings({ ...settings, notifications: { ...settings.notifications, [key]: value } });
    const updateUnit = (key: string, value: string) => saveSettings({ ...settings, units: { ...settings.units, [key]: value } });
    const updateAppearance = (key: string, value: string) => saveSettings({ ...settings, appearance: { ...settings.appearance, [key]: value } });

    const exportData = async () => {
        setExporting(true);
        try {
            const [metrics, symptoms, dailyLogs] = await Promise.all([
                db.entities.HealthMetric.listForUser(authUser?.id || ''),
                db.entities.SymptomLog.listForUser(authUser?.id || ''),
                db.entities.DailyLog.listForUser(authUser?.id || ''),
            ]);
            const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), healthMetrics: metrics, symptoms, dailyLogs }, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `tibrah-health-data-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
            toast.success('تم تصدير البيانات بنجاح');
        } catch { toast.error('حدث خطأ في التصدير'); }
        finally { setExporting(false); }
    };

    const deleteAllData = async () => {
        setDeleting(true);
        try {
            const [metrics, symptoms, dailyLogs] = await Promise.all([
                db.entities.HealthMetric.listForUser(authUser?.id || ''),
                db.entities.SymptomLog.listForUser(authUser?.id || ''),
                db.entities.DailyLog.listForUser(authUser?.id || ''),
            ]);
            await Promise.all([...metrics.map(m => db.entities.HealthMetric.delete(m.id)), ...symptoms.map(s => db.entities.SymptomLog.delete(s.id)), ...dailyLogs.map(l => db.entities.DailyLog.delete(l.id))]);
            queryClient.invalidateQueries(); toast.success('تم حذف جميع البيانات');
        } catch { toast.error('حدث خطأ في الحذف'); }
        finally { setDeleting(false); }
    };

    const signOutAllDevices = async () => {
        setSigningOutAll(true);
        try {
            const authModule = await import('../lib/firebase');
            if (authModule.auth?.currentUser) {
                const idToken = await authModule.auth.currentUser.getIdToken(true);
                const res = await fetch('/api/auth/revoke-all-sessions', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } });
                if (!res.ok) throw new Error('Failed to revoke sessions');
            }
            await signOut(); toast.success('تم تسجيل الخروج من جميع الأجهزة بنجاح ✅'); router.replace('/login');
        } catch { toast.error('حدث خطأ. يرجى المحاولة مجدداً'); }
        finally { setSigningOutAll(false); }
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-light px-6 py-8">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex items-center gap-4">
                    <Link href={createPageUrl('Profile')}><Button size="icon" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10"><ArrowRight className="w-6 h-6" /></Button></Link>
                    <h1 className="text-xl font-bold text-white">الإعدادات</h1>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                <PersonalInfoSection fullName={fullName} setFullName={setFullName} medicalPreferences={medicalPreferences} setMedicalPreferences={setMedicalPreferences} onSave={updateProfile} />
                <NotificationsSection settings={settings} onUpdate={updateNotification} />
                <UnitsSection settings={settings} onUpdate={updateUnit} />
                <LanguageSection />
                <AppearanceSection settings={settings} onUpdate={updateAppearance} />
                <DataManagementSection exporting={exporting} deleting={deleting} onExport={exportData} onDelete={deleteAllData} />
                <SecuritySection signingOut={signingOutAll} onSignOutAll={signOutAllDevices} />
                <PrivacyNote />
            </div>
        </div>
    );
}
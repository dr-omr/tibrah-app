import React, { useState } from 'react';
import { Settings, Globe, Bell, Shield, Palette, Save, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    promotionalBanner: {
        enabled: boolean;
        text: string;
        link: string;
        backgroundColor: string;
    };
    features: {
        aiAssistant: boolean;
        bodyMap: boolean;
        rifeFrequencies: boolean;
        healthTracker: boolean;
        courses: boolean;
        shop: boolean;
    };
    notifications: {
        emailEnabled: boolean;
        pushEnabled: boolean;
        smsEnabled: boolean;
    };
}

interface SystemConfigProps {
    settings?: SystemSettings;
    onSave?: (settings: SystemSettings) => void;
}

const defaultSettings: SystemSettings = {
    siteName: 'طِبرَا - العيادة الرقمية',
    siteDescription: 'منصة صحية متكاملة للعلاج الطبيعي والرعاية الصحية',
    maintenanceMode: false,
    maintenanceMessage: 'الموقع تحت الصيانة، نعود قريباً...',
    promotionalBanner: {
        enabled: true,
        text: '🎉 عرض خاص: خصم 20% على برنامج 21 يوم!',
        link: '/courses',
        backgroundColor: '#2D9B83'
    },
    features: {
        aiAssistant: true,
        bodyMap: true,
        rifeFrequencies: true,
        healthTracker: true,
        courses: true,
        shop: true
    },
    notifications: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false
    }
};

export default function SystemConfig({ settings = defaultSettings, onSave }: SystemConfigProps) {
    const [config, setConfig] = useState<SystemSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            onSave?.(config);
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            toast.error('حدث خطأ في حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    const updateFeature = (key: keyof typeof config.features, value: boolean) => {
        setConfig(prev => ({
            ...prev,
            features: { ...prev.features, [key]: value }
        }));
    };

    const updateNotification = (key: keyof typeof config.notifications, value: boolean) => {
        setConfig(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value }
        }));
    };

    const updateBanner = (key: keyof typeof config.promotionalBanner, value: string | boolean) => {
        setConfig(prev => ({
            ...prev,
            promotionalBanner: { ...prev.promotionalBanner, [key]: value }
        }));
    };

    const featuresList = [
        { key: 'aiAssistant' as const, label: 'المساعد الذكي', description: 'مساعد طِبرَا الذكي بالذكاء الاصطناعي' },
        { key: 'bodyMap' as const, label: 'خريطة الجسم', description: 'استكشاف تفاعلي لأعضاء الجسم' },
        { key: 'rifeFrequencies' as const, label: 'ترددات رايف', description: 'مكتبة الترددات العلاجية' },
        { key: 'healthTracker' as const, label: 'تتبع الصحة', description: 'تسجيل ومتابعة القياسات الصحية' },
        { key: 'courses' as const, label: 'الدورات', description: 'البرامج والدورات التعليمية' },
        { key: 'shop' as const, label: 'المتجر', description: 'متجر المنتجات الطبيعية' },
    ];

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-800">الإعدادات العامة</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">اسم الموقع</label>
                        <Input
                            value={config.siteName}
                            onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">وصف الموقع</label>
                        <Textarea
                            value={config.siteDescription}
                            onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                            className="h-20 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-slate-800">وضع الصيانة</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <div>
                            <p className="font-medium text-slate-800">تفعيل وضع الصيانة</p>
                            <p className="text-sm text-slate-500">سيظهر للزوار رسالة أن الموقع تحت الصيانة</p>
                        </div>
                        <Switch
                            checked={config.maintenanceMode}
                            onCheckedChange={(v) => setConfig(prev => ({ ...prev, maintenanceMode: v }))}
                        />
                    </div>
                    {config.maintenanceMode && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">رسالة الصيانة</label>
                            <Textarea
                                value={config.maintenanceMessage}
                                onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                                className="h-20 resize-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Promotional Banner */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-800">البانر الترويجي</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">تفعيل البانر</p>
                            <p className="text-sm text-slate-500">يظهر في أعلى جميع الصفحات</p>
                        </div>
                        <Switch
                            checked={config.promotionalBanner.enabled}
                            onCheckedChange={(v) => updateBanner('enabled', v)}
                        />
                    </div>
                    {config.promotionalBanner.enabled && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">نص البانر</label>
                                <Input
                                    value={config.promotionalBanner.text}
                                    onChange={(e) => updateBanner('text', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">الرابط</label>
                                    <Input
                                        value={config.promotionalBanner.link}
                                        onChange={(e) => updateBanner('link', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">لون الخلفية</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={config.promotionalBanner.backgroundColor}
                                            onChange={(e) => updateBanner('backgroundColor', e.target.value)}
                                            className="w-14 h-10 p-1"
                                        />
                                        <Input
                                            value={config.promotionalBanner.backgroundColor}
                                            onChange={(e) => updateBanner('backgroundColor', e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Preview */}
                            <div
                                className="p-3 rounded-lg text-white text-center text-sm"
                                style={{ backgroundColor: config.promotionalBanner.backgroundColor }}
                            >
                                {config.promotionalBanner.text}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-800">الميزات</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {featuresList.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium text-slate-800">{feature.label}</p>
                                <p className="text-sm text-slate-500">{feature.description}</p>
                            </div>
                            <Switch
                                checked={config.features[feature.key]}
                                onCheckedChange={(v) => updateFeature(feature.key, v)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-800">الإشعارات</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <p className="font-medium text-slate-800">البريد الإلكتروني</p>
                            <p className="text-sm text-slate-500">إرسال إشعارات عبر البريد</p>
                        </div>
                        <Switch
                            checked={config.notifications.emailEnabled}
                            onCheckedChange={(v) => updateNotification('emailEnabled', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <p className="font-medium text-slate-800">الإشعارات الفورية</p>
                            <p className="text-sm text-slate-500">إشعارات المتصفح والتطبيق</p>
                        </div>
                        <Switch
                            checked={config.notifications.pushEnabled}
                            onCheckedChange={(v) => updateNotification('pushEnabled', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <p className="font-medium text-slate-800">الرسائل النصية SMS</p>
                            <p className="text-sm text-slate-500">إشعارات عبر الرسائل القصيرة</p>
                        </div>
                        <Switch
                            checked={config.notifications.smsEnabled}
                            onCheckedChange={(v) => updateNotification('smsEnabled', v)}
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#2D9B83] hover:bg-[#2D9B83]/90 text-white px-8"
                >
                    {isSaving ? (
                        <>جاري الحفظ...</>
                    ) : (
                        <>
                            <Save className="w-4 h-4 ml-2" />
                            حفظ الإعدادات
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

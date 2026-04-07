// components/admin-v2/modules/settings/SettingsPage.tsx
// Platform configuration & settings

import React, { useState } from 'react';
import { Settings, Globe, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import useAuditLog from '../../hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/notification-engine';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const sections: SettingSection[] = [
  { id: 'general', label: 'عام', icon: <Globe className="w-4 h-4" />, color: '#2d9b83' },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell className="w-4 h-4" />, color: '#f59e0b' },
  { id: 'security', label: 'الأمان', icon: <Shield className="w-4 h-4" />, color: '#ef4444' },
  { id: 'appearance', label: 'المظهر', icon: <Palette className="w-4 h-4" />, color: '#8b5cf6' },
];

export default function SettingsPage() {
  const audit = useAuditLog();
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'طِبرَا',
    siteDescription: 'منصة صحية متكاملة',
    contactEmail: '',
    contactPhone: '',
    enableNotifications: true,
    enableEmailNotifications: false,
    maintenanceMode: false,
    enableRegistration: true,
    requireVerification: false,
    primaryColor: '#2d9b83',
    enableDarkMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production: save to Firestore settings collection
      await new Promise(resolve => setTimeout(resolve, 800));
      audit.logUpdate('settings', 'config', 'platform', 'إعدادات المنصة');
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إعدادات المنصة" description="إدارة الإعدادات العامة والمظهر والأمان" icon={<Settings className="w-5 h-5 text-slate-500" />}>
        <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Save className="w-4 h-4 ml-1" />}
          حفظ التغييرات
        </Button>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section tabs */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                activeSection === section.id
                  ? 'bg-teal-50 border border-teal-200 text-teal-700'
                  : 'hover:bg-slate-50 text-slate-600 border border-transparent'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${section.color}10`, color: section.color }}>
                {section.icon}
              </div>
              <span className="text-sm font-semibold">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="admin-card">
            <div className="admin-card-body space-y-5">
              {activeSection === 'general' && (
                <>
                  <SettingField label="اسم المنصة" value={settings.siteName} onChange={(v) => setSettings(s => ({ ...s, siteName: v }))} />
                  <SettingField label="وصف المنصة" value={settings.siteDescription} onChange={(v) => setSettings(s => ({ ...s, siteDescription: v }))} />
                  <SettingField label="بريد التواصل" value={settings.contactEmail} onChange={(v) => setSettings(s => ({ ...s, contactEmail: v }))} placeholder="admin@tibrah.com" />
                  <SettingField label="هاتف التواصل" value={settings.contactPhone} onChange={(v) => setSettings(s => ({ ...s, contactPhone: v }))} placeholder="+966..." />
                </>
              )}

              {activeSection === 'notifications' && (
                <>
                  <SettingToggle label="تفعيل الإشعارات" description="إرسال إشعارات للمستخدمين" checked={settings.enableNotifications} onChange={(v) => setSettings(s => ({ ...s, enableNotifications: v }))} />
                  <SettingToggle label="إشعارات البريد" description="إرسال إشعارات عبر البريد الإلكتروني" checked={settings.enableEmailNotifications} onChange={(v) => setSettings(s => ({ ...s, enableEmailNotifications: v }))} />
                </>
              )}

              {activeSection === 'security' && (
                <>
                  <SettingToggle label="وضع الصيانة" description="تعطيل الموقع مؤقتاً للصيانة" checked={settings.maintenanceMode} onChange={(v) => setSettings(s => ({ ...s, maintenanceMode: v }))} />
                  <SettingToggle label="السماح بالتسجيل" description="تفعيل تسجيل مستخدمين جدد" checked={settings.enableRegistration} onChange={(v) => setSettings(s => ({ ...s, enableRegistration: v }))} />
                  <SettingToggle label="التحقق الإلزامي" description="مطالبة المستخدمين بتأكيد البريد" checked={settings.requireVerification} onChange={(v) => setSettings(s => ({ ...s, requireVerification: v }))} />
                </>
              )}

              {activeSection === 'appearance' && (
                <>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-700">اللون الأساسي</p>
                      <p className="text-xs text-slate-400 mt-0.5">لون واجهة المنصة الرئيسي</p>
                    </div>
                    <input type="color" value={settings.primaryColor} onChange={(e) => setSettings(s => ({ ...s, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  </div>
                  <SettingToggle label="الوضع الداكن" description="تفعيل الوضع الداكن للإدارة" checked={settings.enableDarkMode} onChange={(v) => setSettings(s => ({ ...s, enableDarkMode: v }))} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <label className="text-xs font-bold text-slate-600 block mb-2">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-white" />
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all flex items-center ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-0.5' : 'translate-x-5'}`} />
      </button>
    </div>
  );
}

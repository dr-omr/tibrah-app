// components/settings/settings-sections.tsx
// ════════════════════════════════════════════════════════
// Modular sections for Settings page
// ════════════════════════════════════════════════════════

import React from 'react';
import {
  User, Bell, Scale, Palette, Database, Moon, Sun, Check, Shield,
  Loader2, Download, Trash2, Globe, LogOut, Smartphone,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import PushNotificationButton from '@/components/dashboard/PushNotificationButton';
import LanguageToggle from '@/components/common/LanguageToggle';
import { NOTIFICATION_ITEMS, COLOR_OPTIONS, type SettingsState } from './settings-data';

/* ─── Personal Info ──────────────────────────── */
export function PersonalInfoSection({ fullName, setFullName, medicalPreferences, setMedicalPreferences, onSave }: {
  fullName: string; setFullName: (v: string) => void; medicalPreferences: string; setMedicalPreferences: (v: string) => void; onSave: () => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2></div>
      <div className="glass rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">الاسم الكامل</label>
          <div className="relative"><Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary" /><User className="w-4 h-4 text-slate-400 absolute left-3 top-3" /></div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">تفضيلات طبية</label>
          <Textarea value={medicalPreferences} onChange={e => setMedicalPreferences(e.target.value)} placeholder="مثلاً: أفضل العلاجات الطبيعية، لدي حساسية من..." className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary h-24 resize-none" />
        </div>
        <Button onClick={onSave} className="w-full bg-primary hover:bg-primary/90 text-white">حفظ التغييرات</Button>
      </div>
    </section>
  );
}

/* ─── Notifications ──────────────────────────── */
export function NotificationsSection({ settings, onUpdate }: { settings: SettingsState; onUpdate: (key: string, value: boolean) => void }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">الإشعارات والتذكيرات</h2></div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary-light/5 border-b border-primary/10">
          <PushNotificationButton /><p className="text-xs text-slate-500 mt-2 text-center">يجب تفعيل إشعارات المتصفح لاستلام التنبيهات</p>
        </div>
        {NOTIFICATION_ITEMS.map((item, idx) => (
          <div key={item.key} className={`flex items-center gap-4 p-4 ${idx !== NOTIFICATION_ITEMS.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <span className="text-2xl">{item.icon}</span>
            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
            <Switch checked={settings.notifications[item.key]} onCheckedChange={v => onUpdate(item.key, v)} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Units ──────────────────────────────────── */
export function UnitsSection({ settings, onUpdate }: { settings: SettingsState; onUpdate: (key: string, value: string) => void }) {
  const rows = [
    { emoji: '⚖️', label: 'الوزن', key: 'weight', options: [{ v: 'kg', l: 'كجم' }, { v: 'lb', l: 'رطل' }] },
    { emoji: '🌡️', label: 'الحرارة', key: 'temperature', options: [{ v: 'celsius', l: 'مئوية °C' }, { v: 'fahrenheit', l: 'فهرنهايت °F' }] },
    { emoji: '🩸', label: 'سكر الدم', key: 'bloodSugar', options: [{ v: 'mg/dL', l: 'mg/dL' }, { v: 'mmol/L', l: 'mmol/L' }] },
    { emoji: '📏', label: 'الطول', key: 'height', options: [{ v: 'cm', l: 'سم' }, { v: 'ft', l: 'قدم' }] },
  ];
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Scale className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">وحدات القياس</h2></div>
      <div className="glass rounded-2xl overflow-hidden">
        {rows.map((row, idx) => (
          <div key={row.key} className={`flex items-center gap-4 p-4 ${idx !== rows.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <span className="text-2xl">{row.emoji}</span>
            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{row.label}</span>
            <Select value={(settings.units as any)[row.key]} onValueChange={v => onUpdate(row.key, v)}>
              <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{row.options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Language ───────────────────────────────── */
export function LanguageSection() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">اللغة</h2></div>
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-slate-700 dark:text-slate-300">لغة التطبيق</p><p className="text-sm text-slate-400 mt-0.5">العربية أو الإنجليزية</p></div>
          <LanguageToggle variant="switch" />
        </div>
      </div>
    </section>
  );
}

/* ─── Appearance ─────────────────────────────── */
export function AppearanceSection({ settings, onUpdate }: { settings: SettingsState; onUpdate: (key: string, value: string) => void }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">المظهر</h2></div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            {settings.appearance.theme === 'dark' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </div>
          <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">المظهر</span>
          <Select value={settings.appearance.theme} onValueChange={v => onUpdate('theme', v)}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="light">فاتح</SelectItem><SelectItem value="dark">داكن</SelectItem><SelectItem value="system">تلقائي</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="p-4">
          <span className="font-medium text-slate-700 dark:text-slate-300 block mb-3">اللون الرئيسي</span>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map(c => (
              <button key={c.id} onClick={() => onUpdate('primaryColor', c.id)}
                className={`w-10 h-10 rounded-full transition-all duration-300 ${settings.appearance.primaryColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.color }}>
                {settings.appearance.primaryColor === c.id && <Check className="w-5 h-5 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Data Management ────────────────────────── */
export function DataManagementSection({ exporting, deleting, onExport, onDelete }: {
  exporting: boolean; deleting: boolean; onExport: () => void; onDelete: () => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">إدارة البيانات</h2></div>
      <div className="glass rounded-2xl overflow-hidden">
        <button onClick={onExport} disabled={exporting} className="w-full flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">{exporting ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : <Download className="w-5 h-5 text-blue-600" />}</div>
          <div className="flex-1 text-right"><span className="font-medium text-slate-700 dark:text-slate-300 block">تصدير البيانات</span><span className="text-sm text-slate-400">تحميل جميع بياناتك الصحية</span></div>
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <div className="flex-1 text-right"><span className="font-medium text-red-600 block">حذف جميع البيانات</span><span className="text-sm text-slate-400">لا يمكن التراجع عن هذا الإجراء</span></div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription className="text-right">سيتم حذف جميع القياسات الصحية والأعراض والسجلات اليومية نهائياً. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>{deleting ? 'جاري الحذف...' : 'حذف نهائياً'}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

/* ─── Security ───────────────────────────────── */
export function SecuritySection({ signingOut, onSignOutAll }: { signingOut: boolean; onSignOutAll: () => void }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-primary" /><h2 className="font-bold text-slate-800 dark:text-white">الأمان</h2></div>
      <div className="glass rounded-2xl overflow-hidden">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Smartphone className="w-5 h-5 text-red-600" /></div>
              <div className="flex-1 text-right"><span className="font-medium text-red-600 block">تسجيل الخروج من جميع الأجهزة</span><span className="text-sm text-slate-400">ينهي جميع جلسات الدخول النشطة على كل الأجهزة</span></div>
              <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle className="text-right">تسجيل الخروج من جميع الأجهزة</AlertDialogTitle><AlertDialogDescription className="text-right">سيتم إنهاء جميع جلسات تسجيل الدخول على كل الأجهزة وستحتاج إلى تسجيل الدخول مجدداً. استخدم هذا إذا نسيت جهازك أو أبلغتك بوجود نشاط مشبوه.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={onSignOutAll} className="bg-red-600 hover:bg-red-700" disabled={signingOut}>{signingOut ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />جاري تسجيل الخروج...</span> : 'تسجيل الخروج من كل الأجهزة'}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

/* ─── Privacy Note ───────────────────────────── */
export function PrivacyNote() {
  return (
    <div className="glass rounded-2xl p-4 flex items-start gap-3">
      <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div><p className="font-medium text-slate-700 dark:text-slate-300 mb-1">خصوصيتك محمية</p><p className="text-sm text-slate-500">جميع بياناتك مشفرة ومحفوظة بأمان. نحن لا نشارك بياناتك مع أي طرف ثالث.</p></div>
    </div>
  );
}

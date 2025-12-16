import React, { useState } from 'react';
import { Palette, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme, themePresets, ThemePreset } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function ThemeSettings() {
    const { theme, currentColors, setPreset, setCustomColor, presets } = useTheme();
    const [customColorInput, setCustomColorInput] = useState(theme.customPrimary || '#2D9B83');

    const handlePresetSelect = (preset: ThemePreset) => {
        setPreset(preset);
        toast.success(`تم تطبيق ثيم "${presets[preset].name}"`);
    };

    const handleCustomColor = () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(customColorInput)) {
            setCustomColor(customColorInput);
            toast.success('تم تطبيق اللون المخصص');
        } else {
            toast.error('صيغة اللون غير صحيحة (مثال: #2D9B83)');
        }
    };

    const resetToDefault = () => {
        setPreset('emerald');
        setCustomColorInput('#2D9B83');
        toast.success('تم إعادة الثيم للافتراضي');
    };

    return (
        <div className="space-y-6">
            {/* Current Theme Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        الثيم الحالي
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefault}
                        className="text-slate-500"
                    >
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة للافتراضي
                    </Button>
                </div>

                {/* Color Preview */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div
                        className="w-16 h-16 rounded-xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryLight} 100%)` }}
                    />
                    <div className="flex-1">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <p className="text-slate-400 text-xs">الرئيسي</p>
                                <p className="font-mono font-medium" style={{ color: currentColors.primary }}>
                                    {currentColors.primary}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">الفاتح</p>
                                <p className="font-mono font-medium" style={{ color: currentColors.primaryLight }}>
                                    {currentColors.primaryLight}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">الداكن</p>
                                <p className="font-mono font-medium" style={{ color: currentColors.primaryDark }}>
                                    {currentColors.primaryDark}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Presets */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">الثيمات الجاهزة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.keys(presets) as ThemePreset[]).map((key) => {
                        const preset = presets[key];
                        const isActive = !theme.useCustom && theme.preset === key;

                        return (
                            <button
                                key={key}
                                onClick={() => handlePresetSelect(key)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${isActive
                                        ? 'border-slate-800 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                <div
                                    className="w-full h-10 rounded-lg mb-2"
                                    style={{
                                        background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.primaryLight} 100%)`
                                    }}
                                />
                                <p className="text-sm font-medium text-slate-700">{preset.name}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Color */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">لون مخصص</h3>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Label className="text-slate-600 text-sm mb-2 block">كود اللون (HEX)</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={customColorInput}
                                    onChange={(e) => setCustomColorInput(e.target.value)}
                                    placeholder="#2D9B83"
                                    className="pl-12 font-mono"
                                    dir="ltr"
                                />
                                <input
                                    type="color"
                                    value={customColorInput}
                                    onChange={(e) => setCustomColorInput(e.target.value)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded cursor-pointer border-0"
                                />
                            </div>
                            <Button
                                onClick={handleCustomColor}
                                className="gradient-primary"
                            >
                                تطبيق
                            </Button>
                        </div>
                    </div>
                </div>

                {theme.useCustom && (
                    <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        يتم استخدام اللون المخصص حالياً
                    </p>
                )}
            </div>

            {/* Preview Elements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">معاينة العناصر</h3>
                <div className="space-y-4">
                    {/* Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button className="gradient-primary">زر أساسي</Button>
                        <Button variant="outline" className="border-2" style={{ borderColor: currentColors.primary, color: currentColors.primary }}>
                            زر ثانوي
                        </Button>
                        <Button variant="ghost" style={{ color: currentColors.primary }}>
                            زر شبحي
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <p className="text-sm text-slate-500 mb-2">شريط التقدم</p>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: '66%',
                                    background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.primaryLight} 100%)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="flex gap-2">
                        <span
                            className="px-3 py-1 rounded-full text-white text-sm"
                            style={{ backgroundColor: currentColors.primary }}
                        >
                            شارة
                        </span>
                        <span
                            className="px-3 py-1 rounded-full text-sm"
                            style={{
                                backgroundColor: `${currentColors.primary}20`,
                                color: currentColors.primary
                            }}
                        >
                            شارة فاتحة
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

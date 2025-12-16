import React from 'react';
import { FileText, Play, BookOpen, Mic, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function LibraryFilters({
    activeType,
    setActiveType,
    activeCategory,
    setActiveCategory
}) {
    const types = [
        { id: 'all', label: 'الكل', icon: null },
        { id: 'article', label: 'مقالات', icon: FileText },
        { id: 'video', label: 'فيديوهات', icon: Play },
        { id: 'study', label: 'دراسات', icon: BookOpen },
        { id: 'podcast', label: 'بودكاست', icon: Mic },
    ];

    const categories = [
        { id: 'all', label: 'جميع الفئات' },
        { id: 'functional_medicine', label: 'الطب الوظيفي' },
        { id: 'frequencies', label: 'الترددات الشفائية' },
        { id: 'nutrition', label: 'التغذية الصحية' },
        { id: 'lifestyle', label: 'نمط الحياة' },
        { id: 'detox', label: 'الديتوكس' },
        { id: 'supplements', label: 'المكملات' },
        { id: 'mental_health', label: 'الصحة النفسية' },
    ];

    return (
        <div className="space-y-4">
            {/* Type Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isActive = activeType === type.id;

                    return (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive
                                    ? 'gradient-primary text-white shadow-md'
                                    : 'glass text-slate-600 hover:bg-[#2D9B83]/10'
                                }`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="glass border-0 rounded-xl">
                        <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
import React from 'react';
import { Filter, SortAsc, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'vitamins', label: 'فيتامينات' },
    { value: 'minerals', label: 'معادن' },
    { value: 'supplements', label: 'مكملات' },
    { value: 'dmso', label: 'DMSO' },
    { value: 'personal_care', label: 'عناية شخصية' },
    { value: 'detox', label: 'ديتوكس' },
];

const sortOptions = [
    { value: 'featured', label: 'الأكثر مبيعاً' },
    { value: 'price_asc', label: 'السعر: الأقل' },
    { value: 'price_desc', label: 'السعر: الأعلى' },
    { value: 'name', label: 'الاسم' },
];

export default function ShopFilters({
    category,
    setCategory,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange
}: {
    category: string;
    setCategory: (v: string) => void;
    sortBy: string;
    setSortBy: (v: string) => void;
    priceRange: number[];
    setPriceRange: (v: number[]) => void;
}) {
    return (
        <div className="sticky top-0 z-20 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent pb-4">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${category === cat.value
                            ? 'gradient-primary text-white shadow-md'
                            : 'glass text-slate-600 dark:text-slate-300 hover:bg-[#2D9B83]/10'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Sort & Filter Row */}
            <div className="flex gap-3">
                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1 glass border-0 rounded-xl">
                        <div className="flex items-center gap-2">
                            <SortAsc className="w-4 h-4 text-[#2D9B83]" />
                            <SelectValue placeholder="ترتيب حسب" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filter Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="glass border-0 rounded-xl px-4">
                            <Filter className="w-4 h-4 ml-2 text-[#2D9B83]" />
                            فلترة
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-3xl">
                        <SheetHeader>
                            <SheetTitle className="text-right">خيارات الفلترة</SheetTitle>
                        </SheetHeader>

                        <div className="py-6 space-y-6">
                            {/* Price Range */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 block">
                                    نطاق السعر
                                </label>
                                <Slider
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    max={500}
                                    step={10}
                                    className="mt-4"
                                />
                                <div className="flex justify-between mt-2 text-sm text-slate-500">
                                    <span>{priceRange[0]} ر.س</span>
                                    <span>{priceRange[1]} ر.س</span>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(category !== 'all' || priceRange[0] > 0 || priceRange[1] < 500) && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                        الفلاتر النشطة
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {category !== 'all' && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-[#2D9B83]/10 text-[#2D9B83] cursor-pointer"
                                                onClick={() => setCategory('all')}
                                            >
                                                {categories.find(c => c.value === category)?.label} ✕
                                            </Badge>
                                        )}
                                        {(priceRange[0] > 0 || priceRange[1] < 500) && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-[#2D9B83]/10 text-[#2D9B83] cursor-pointer"
                                                onClick={() => setPriceRange([0, 500])}
                                            >
                                                {priceRange[0]}-{priceRange[1]} ر.س ✕
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
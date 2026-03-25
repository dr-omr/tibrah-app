import React from 'react';
import { Filter, TrendingUp, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Course } from './data';

interface CourseFiltersProps {
    priceFilter: string;
    setPriceFilter: (filter: string) => void;
    levelFilter: string;
    setLevelFilter: (filter: string) => void;
    hasActiveFilters: boolean;
    clearAllFilters: () => void;
    filteredCoursesCount: number;
    totalCoursesCount: number;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
    priceFilter,
    setPriceFilter,
    levelFilter,
    setLevelFilter,
    hasActiveFilters,
    clearAllFilters,
    filteredCoursesCount,
    totalCoursesCount
}) => {
    return (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-9 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-full text-xs font-semibold px-3 w-auto min-w-[90px]">
                    <Filter className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    <SelectValue placeholder="السعر" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="free">🎁 مجانية</SelectItem>
                    <SelectItem value="paid">💰 مدفوعة</SelectItem>
                </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-9 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-full text-xs font-semibold px-3 w-auto min-w-[90px]">
                    <TrendingUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="beginner">🌱 مبتدئ</SelectItem>
                    <SelectItem value="intermediate">📈 متوسط</SelectItem>
                    <SelectItem value="advanced">🚀 متقدم</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex-1" />

            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:bg-primary/5 px-2.5 py-1.5 rounded-full transition-colors"
                >
                    <X className="w-3 h-3" />
                    مسح
                </button>
            )}

            {/* Results count badge */}
            {filteredCoursesCount !== totalCoursesCount && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {filteredCoursesCount}/{totalCoursesCount}
                </span>
            )}
        </div>
    );
};

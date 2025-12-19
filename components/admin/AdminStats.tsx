import React from 'react';
import { Users, ShoppingBag, BookOpen, Newspaper, TrendingUp, DollarSign } from 'lucide-react';

interface Stat {
    label: string;
    value: number | string;
    icon: any;
    color: string;
    trend?: string;
}

interface AdminStatsProps {
    usersCount: number;
    productsCount: number;
    coursesCount: number;
    articlesCount: number;
}

export default function AdminStats({ usersCount, productsCount, coursesCount, articlesCount }: AdminStatsProps) {
    const stats: Stat[] = [
        {
            label: 'إجمالي المستخدمين',
            value: usersCount,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            trend: '+12% هذا الشهر'
        },
        {
            label: 'إجمالي المبيعات',
            value: '5,240 ر.س',
            icon: DollarSign,
            color: 'from-emerald-500 to-green-500',
            trend: '+8% هذا الشهر'
        },
        {
            label: 'المنتجات النشطة',
            value: productsCount,
            icon: ShoppingBag,
            color: 'from-orange-500 to-amber-500'
        },
        {
            label: 'المحتوى التعليمي',
            value: coursesCount + articlesCount,
            icon: BookOpen,
            color: 'from-purple-500 to-indigo-500'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            {stat.trend && (
                                <p className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {stat.trend}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

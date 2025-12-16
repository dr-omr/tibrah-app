import React from 'react';
import { BookOpen, Users, TrendingUp, Award } from 'lucide-react';

export default function CredentialsBar() {
    const stats = [
        { icon: BookOpen, value: '+2000', label: 'ساعة محتوى', color: 'from-blue-500 to-cyan-500' },
        { icon: Users, value: '+300', label: 'مريض ساعده', color: 'from-purple-500 to-pink-500' },
        { icon: TrendingUp, value: '87%', label: 'نسبة التحسن', color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <section className="px-6 -mt-8 relative z-10">
            <div className="glass rounded-3xl p-5 shadow-xl">
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
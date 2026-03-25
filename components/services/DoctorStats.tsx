import React from 'react';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { doctorInfo } from './data';

export const DoctorStats = () => {
    return (
        <div className="px-6 -mt-6 relative z-10">
            <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-2xl p-4 text-center shadow-lg">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.content_hours}</p>
                    <p className="text-xs text-slate-500">ساعة محتوى مجاني</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center shadow-lg">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.patients}</p>
                    <p className="text-xs text-slate-500">مريض ساعدهم</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center shadow-lg">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.success_rate}</p>
                    <p className="text-xs text-slate-500">نسبة التحسن</p>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { FileText, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function DiagnosticHistory({ results }) {
    if (!results || results.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">لا توجد نتائج تشخيصية سابقة</p>
            </div>
        );
    }

    const getSeverityColor = (level) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getSeverityLabel = (level) => {
        switch (level) {
            case 'critical': return 'حرج';
            case 'high': return 'مرتفع';
            case 'medium': return 'متوسط';
            default: return 'طبيعي';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-[#2D9B83]" />
                <h2 className="font-bold text-slate-800">سجل الفحوصات</h2>
            </div>

            <div className="space-y-3">
                {results.map((result) => (
                    <div key={result.id} className="glass rounded-2xl p-4 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSeverityColor(result.severity_level)}`}>
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{result.quiz_title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {format(new Date(result.created_date), 'PPP', { locale: ar })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${getSeverityColor(result.severity_level)}`}>
                                {getSeverityLabel(result.severity_level)}
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {result.result_summary}
                        </p>

                        {result.recommendations && result.recommendations.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-3 mb-3">
                                <p className="text-xs font-medium text-slate-500 mb-2">التوصيات:</p>
                                <ul className="space-y-1">
                                    {result.recommendations.slice(0, 2).map((rec, idx) => (
                                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-[#2D9B83] mt-1.5 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#2D9B83] hover:bg-[#2D9B83]/5 py-2 rounded-lg transition-colors">
                            عرض التفاصيل
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
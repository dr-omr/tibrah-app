import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  FileText, Download, Droplets, Moon, Smile, Zap,
  Timer, Flame, ChevronLeft, Star, Activity, Check
} from 'lucide-react';
import { collectReportData, generateHealthReport } from '@/lib/healthReport';
import { useAuth } from '@/contexts/AuthContext';
import { generateRecommendations, Recommendation } from '@/lib/recommendations';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';

export default function HealthReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const reportData = typeof window !== 'undefined' ? collectReportData(period) : null;

  useEffect(() => {
    if (user?.id) {
      setLoadingRecs(true);
      generateRecommendations(user.id)
        .then(recs => setRecommendations(recs))
        .catch(() => setRecommendations([]))
        .finally(() => setLoadingRecs(false));
    } else {
      setLoadingRecs(false);
    }
  }, [user?.id]);

  const handleGenerateReport = () => {
    haptic.impact();
    setIsGenerating(true);
    setTimeout(() => {
      generateHealthReport(reportData ?? undefined);
      setIsGenerating(false);
    }, 300);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-yellow-400';
    if (score >= 40) return 'from-orange-500 to-red-400';
    return 'from-red-600 to-rose-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'ممتاز 🟢';
    if (score >= 60) return 'جيد 🟡';
    if (score >= 40) return 'بحاجة لتحسين 🟠';
    return 'يحتاج اهتمام 🔴';
  };

  const recTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'product': return '🛍️';
      case 'frequency': return '🎵';
      case 'article': return '📖';
      case 'action': return '⚡';
      default: return '💡';
    }
  };

  // Calculate simple health score from collected data
  let healthScore = 50;
  if (reportData) {
    if (reportData.waterData && reportData.waterData.avgCups >= 8) healthScore += 10;
    if (reportData.sleepData && reportData.sleepData.avgHours >= 7) healthScore += 10;
    if (reportData.moodData && reportData.moodData.avgScore >= 7) healthScore += 10;
    if (reportData.streak && reportData.streak >= 3) healthScore += 10;
    if (reportData.challengesCompleted && reportData.challengesCompleted >= 3) healthScore += 10;
  }
  healthScore = Math.min(100, healthScore);

  return (
    <div className="min-h-screen pb-32" dir="rtl">
      <Head>
        <title>تقريري الصحي — طِبرَا</title>
        <meta name="description" content="تقرير صحي شامل مخصص لك مع توصيات ذكية" />
      </Head>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-6 pt-10 pb-12">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />

        <div className="relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 mb-4 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">رجوع</span>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">تقريري الصحي</h1>
              <p className="text-sm text-white/70">تحليل شامل + توصيات مخصصة</p>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex gap-2">
            {(['weekly', 'monthly'] as const).map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); haptic.selection(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  period === p
                    ? 'bg-white text-teal-700 shadow-md'
                    : 'bg-white/20 text-white/80'
                }`}
              >
                {p === 'weekly' ? 'أسبوعي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Score Card */}
      <div className="px-5 -mt-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl bg-gradient-to-br ${getScoreColor(healthScore)} p-6 shadow-xl shadow-teal-500/20 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm text-white/70 font-medium mb-1">نقاط الصحة الكلية</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-6xl font-black">{healthScore}</span>
              <span className="text-xl text-white/60 mb-2">/ 100</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-white/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <p className="text-sm font-bold">{getScoreLabel(healthScore)}</p>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      {reportData && (
        <div className="px-5 mb-6">
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">
            مؤشراتك خلال هذه الفترة
          </p>
          <div className="grid grid-cols-2 gap-3">
            {reportData.waterData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">الماء</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{reportData.waterData.avgCups}</p>
                <p className="text-xs text-slate-400 mt-0.5">كوب / يوم</p>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${Math.min(100, (reportData.waterData.avgCups / 8) * 100)}%` }}
                  />
                </div>
              </motion.div>
            )}

            {reportData.sleepData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">النوم</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{reportData.sleepData.avgHours}</p>
                <p className="text-xs text-slate-400 mt-0.5">ساعة / ليلة</p>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${Math.min(100, (reportData.sleepData.avgHours / 8) * 100)}%` }}
                  />
                </div>
              </motion.div>
            )}

            {reportData.moodData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Smile className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">المزاج</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{reportData.moodData.avgScore}<span className="text-sm text-slate-400">/10</span></p>
                <p className="text-xs text-slate-400 mt-0.5">{reportData.moodData.totalEntries} تسجيل</p>
              </motion.div>
            )}

            {reportData.streak !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">السلسلة</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{reportData.streak}</p>
                <p className="text-xs text-slate-400 mt-0.5">يوم متتالي</p>
              </motion.div>
            )}

            {/* If no data yet, show empty state cards */}
            {!reportData.waterData && !reportData.sleepData && !reportData.moodData && (
              <div className="col-span-2 bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">لا توجد بيانات كافية بعد</p>
                <p className="text-xs text-slate-400 mt-1">استخدم المتعقبات الصحية يومياً لتظهر بياناتك هنا</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-500" />
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
            توصيات ذكية مخصصة لك
          </p>
        </div>

        {loadingRecs ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-20" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <motion.a
                key={rec.id}
                href={rec.actionLink}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {recTypeIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{rec.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{rec.subtitle}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    {rec.reason}
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 text-center">
            <Zap className="w-8 h-8 mx-auto text-teal-400 mb-2" />
            <p className="text-sm font-bold text-teal-700">سجّل دخولك للحصول على توصيات مخصصة!</p>
            <p className="text-xs text-teal-500 mt-1">التوصيات تُبنى على بيانات متعقباتك الصحية اليومية</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="px-5 mb-6">
        <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">نصائح عامة</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {[
            'اشرب 8 أكواب ماء يومياً لتحسين التركيز والطاقة',
            'احرص على 7-9 ساعات نوم منتظمة كل ليلة',
            'خصص 5 دقائق يومياً لتمارين التنفس العميق',
            'وجبة واحدة متوازنة غنية بالخضروات يومياً تُحدث فرقاً',
            'سجل مزاجك يومياً لتتابع أنماطه وتتحكم فيها',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-teal-600" />
              </div>
              <p className="text-sm text-slate-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
        <motion.button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-base shadow-xl shadow-teal-500/30 flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              توليد التقرير PDF للطباعة
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

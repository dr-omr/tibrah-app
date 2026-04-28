// components/meal-planner/AiPlanSheet.tsx
// ════════════════════════════════════════════════════════
// AI-generated Therapeutic Meal Plan Sheet
// ════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface AiPlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiMealPlan: any;
}

export default function AiPlanSheet({ open, onOpenChange, aiMealPlan }: AiPlanSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-none p-0">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-5 pt-8">
          <SheetTitle className="text-right flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-emerald-500" /></div>
              <div><h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">الطباخ العلاجي الذكي</h2><p className="text-xs text-slate-500 font-medium">خطة مصممة كدواء خصيصاً لحالتك</p></div>
            </div>
          </SheetTitle>
        </div>

        {aiMealPlan && (
          <div className="p-5 pb-12 space-y-5">
            {/* Calories & Goal */}
            {aiMealPlan.daily_calories && (
              <motion.div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div><p className="text-emerald-100 text-xs font-bold mb-1">الهدف السعري العلاجي</p><p className="text-3xl font-black">{aiMealPlan.daily_calories} <span className="text-sm font-semibold opacity-80">سعرة</span></p></div>
                  <Target className="w-10 h-10 text-emerald-200/50" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/20"><p className="text-xs font-medium text-emerald-50 flex items-center gap-1.5"><Brain className="w-4 h-4" /> تم التصميم بناءً على ملفك الطبي الدقيق</p></div>
              </motion.div>
            )}

            {/* Grocery List */}
            {aiMealPlan.grocery_list && aiMealPlan.grocery_list.length > 0 && (
              <motion.div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center text-xs">🛒</span>قائمة التسوق العلاجية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiMealPlan.grocery_list.map((item: string, i: number) => (
                    <span key={i} className="text-xs font-bold bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600">{item}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Core Meals */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">الوجبات المطلوبة</h3>
              {aiMealPlan.meals?.map((meal: any, i: number) => (
                <motion.div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50 p-4 shadow-sm transition-colors"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm">
                        {meal.name.includes('فطور') ? '🌅' : meal.name.includes('غداء') ? '☀️' : '🌙'}
                      </div>
                      <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">{meal.name}</h4><span className="text-[10px] font-bold text-slate-400">{meal.time}</span></div>
                    </div>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">{meal.calories} سعرة</span>
                  </div>
                  <div className="space-y-2 mb-3 pl-10">
                    {meal.foods?.map((food: string, j: number) => (
                      <div key={j} className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />{food}
                      </div>
                    ))}
                  </div>
                  {meal.benefits && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100/50 dark:border-emerald-800/30">
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">⚕️</span>{meal.benefits}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {aiMealPlan.hydration_plan && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1">💧 الارتواء</p>
                  <p className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80 leading-relaxed">{aiMealPlan.hydration_plan}</p>
                </div>
              )}
              {aiMealPlan.supplements && aiMealPlan.supplements.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/30">
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1.5 flex items-center gap-1">💊 مكملات</p>
                  <ul className="space-y-1">{aiMealPlan.supplements.map((s: string, i: number) => (<li key={i} className="text-xs font-medium text-purple-600/80 dark:text-purple-300/80 leading-relaxed">• {s}</li>))}</ul>
                </div>
              )}
            </div>

            {aiMealPlan.tips?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-800/20 text-center">
                <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">{aiMealPlan.tips[0]}</p>
              </div>
            )}

            <Button className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold mt-4" onClick={() => onOpenChange(false)}>
              اعتماد هذه الخطة<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

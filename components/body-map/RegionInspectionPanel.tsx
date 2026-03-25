import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  Heart,
  Sparkles,
  Star,
  Brain,
  Loader2,
  BookOpen,
  ShoppingBag,
  Activity,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnatomicalSystem, AnatomicalTissue } from '@/data/anatomy/masterDictionary';

interface Props {
  region: AnatomicalSystem | null;
  onClose: () => void;
  // AI analysis
  aiInsight: any;
  aiLoading: boolean;
  onRunAiAnalysis: (targetName: string, targetEmotion: string) => void;
  // Related diseases
  relatedDiseases: any[];
  // Suggested products
  suggestedProducts: any[];
}

export default function RegionInspectionPanel({
  region,
  onClose,
  aiInsight,
  aiLoading,
  onRunAiAnalysis,
  relatedDiseases,
  suggestedProducts,
}: Props) {
  // State for drill-down selection (selecting a specific organ or tissue)
  const [selectedTissue, setSelectedTissue] = useState<AnatomicalTissue | null>(null);

  // Reset tissue selection when the main region changes
  useEffect(() => {
    setSelectedTissue(null);
  }, [region?.id]);

  if (!region) return null;

  // Determine what emotional data to show (either the macro overview, or the specific tissue)
  const displayEmotion = selectedTissue ? selectedTissue.emotion : region.overview_emotion;
  const displayDescription = selectedTissue ? selectedTissue.description : region.overview_description;
  const displayDeeperCause = selectedTissue ? selectedTissue.deeperCause : '';
  const displayTreatment = selectedTissue?.treatment || [];
  const displayAffirmation = selectedTissue?.affirmation || '';
  const displayMedical = selectedTissue ? selectedTissue.medical_context : region.overview_medical;
  const displayHooks = selectedTissue?.symptom_hooks || [];
  const targetName = selectedTissue ? selectedTissue.name : region.name;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto md:w-[420px] z-50 pointer-events-auto flex flex-col max-h-[85vh] bg-white/95 dark:bg-[#0A0F1C]/90 backdrop-blur-2xl border-t md:border border-slate-200 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-t-3xl md:rounded-[2rem] overflow-hidden"
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.98 }}
        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
      >
        {/* Luxury Glowing Top Accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: `linear-gradient(90deg, transparent, ${region.categoryColor || '#2D9B83'}, transparent)` }}
        />

        {/* Ambient Corner Glow Behind Content */}
        <div 
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: region.categoryColor || '#2D9B83' }}
        />

        {/* Pull handle for mobile */}
        <div className="md:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/5 shrink-0 relative z-10">
          <div className="flex gap-3 items-center w-full">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${region.categoryColor}12` }}
            >
              {region.categoryIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                {region.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase truncate">
                  {region.label_en}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                <span className="text-[10px] font-semibold flex-shrink-0 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {region.categoryName}
                </span>
              </div>
            </div>
            {selectedTissue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTissue(null)}
                className="text-xs text-slate-500 h-8 ml-2 flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 ml-1" /> رجوع للقسم
              </Button>
            )}
            {!selectedTissue && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="inspection-panel__scroll px-5 py-4 space-y-4">

          {/* LAYERED DRILL-DOWN SELECTOR */}
          {!selectedTissue && (region.organs?.length || region.tissues?.length) ? (
            <div className="mb-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                  حدد الجزء أو النسيج المصاب بدقة
                </h4>
              </div>

              {region.organs && region.organs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400">الأعضاء الداخلية والأنظمة</p>
                  <div className="grid grid-cols-2 gap-2">
                    {region.organs.map((organ) => (
                      <button
                        key={organ.id}
                        onClick={() => setSelectedTissue(organ)}
                        className="text-right px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: region.categoryColor || '#2D9B83' }} />
                        <div className="font-bold text-sm mb-0.5">{organ.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium font-sans uppercase tracking-wider">INTERNAL</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {region.tissues && region.tissues.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-[10px] font-bold text-slate-400">الأنسجة السطحية أو الهيكلية</p>
                  <div className="grid grid-cols-2 gap-2">
                    {region.tissues.map((tissue) => (
                      <button
                        key={tissue.id}
                        onClick={() => setSelectedTissue(tissue)}
                        className="text-right px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#12182B] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2138] transition-all group"
                      >
                        <div className="font-bold text-sm mb-0.5">{tissue.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium font-sans uppercase tracking-wider">SURFACE</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Clinical context */}
          <div className="panel-card bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                  {selectedTissue ? `السياق الطبي لـ ${selectedTissue.name}` : 'نظرة طبية عامة'}
                </h4>
              </div>
            </div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              {displayMedical}
            </p>
            {displayHooks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                {displayHooks.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Emotional diagnostic */}
          <motion.div
            key={selectedTissue ? selectedTissue.id : 'overview'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-6 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/5"
            style={{
              background: `linear-gradient(145deg, ${region.categoryColor}15, transparent)`,
            }}
          >
            <div className="absolute top-0 left-0 w-32 h-32 opacity-20 blur-2xl" style={{ background: region.categoryColor }} />
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Heart className="w-4 h-4" style={{ color: region.categoryColor }} />
              <h4 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: region.categoryColor }}>
                {selectedTissue ? 'التشخيص الشعوري الدقيق' : 'البُعد الشعوري المبدئي'}
              </h4>
            </div>

            <p className="text-base font-black text-slate-900 dark:text-white leading-relaxed mb-2 relative z-10">
              {displayEmotion}
            </p>
            <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
              {displayDescription}
            </p>

            {displayDeeperCause && (
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">السبب الجذري</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {displayDeeperCause}
                </p>
              </div>
            )}
          </motion.div>

          {/* Specific Data blocks (Only shown when a specific tissue is selected, OR if the region had no drilldowns) */}
          {(selectedTissue || (!region.organs?.length && !region.tissues?.length)) && (
            <>
              {/* Treatment steps */}
              {displayTreatment.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#2D9B83]" />
                    <h4 className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                      خطوات التشافي الشعوري
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {displayTreatment.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#2D9B83] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affirmation */}
              {displayAffirmation && (
                <div className="panel-card bg-gradient-to-br from-[#2D9B83]/6 to-[#3FB39A]/4 border-[#2D9B83]/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs font-bold text-[#2D9B83] tracking-wide uppercase">
                      التأكيد الشفائي المستهدف
                    </h4>
                  </div>
                  <p className="text-[#2D9B83] dark:text-[#3FB39A] text-[14px] font-black leading-relaxed italic bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                    "{displayAffirmation}"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-semibold text-center">
                    تأمل هذه العبارة 3 مرات مع تنفس عميق
                  </p>
                </div>
              )}
            </>
          )}

          {/* AI Deep Analysis Container - Cinematic Styling */}
          <div className="relative rounded-[1.5rem] p-[1px] shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.05) 50%, transparent 100%)' }}>
            <div className="absolute inset-0 bg-purple-900/5 blur-2xl" />
            <div className="relative bg-[#faf5ff]/90 dark:bg-[#100D1A]/95 backdrop-blur-xl rounded-[1.4rem] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700 dark:text-purple-300/80">تشخيص ذكاء اصطناعي</span>
                </div>
                <Button
                  onClick={() => onRunAiAnalysis(targetName, displayEmotion)}
                  disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 text-white dark:text-purple-300 dark:border dark:border-purple-500/30 rounded-full text-[10px] h-7 px-4 shadow-md dark:shadow-none transition-all"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : <><Sparkles className="w-3 h-3 ml-1.5" /> مسح مخصص</>}
                </Button>
              </div>

              {aiInsight && !aiLoading && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pt-1">
                  <p className="text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                    {aiInsight.emotional_connection}
                  </p>
                  
                  {aiInsight.healing_exercises?.length > 0 && (
                    <div className="px-1 pt-1">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400/80 uppercase tracking-widest mb-3 block">بروتوكول الشفاء المقترح</span>
                      <ul className="space-y-3">
                        {aiInsight.healing_exercises.map((ex: string, i: number) => (
                          <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <span className="leading-relaxed">{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiInsight.affirmations?.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-500/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-500/20 mt-3 text-center">
                       <span className="text-[9px] font-bold text-purple-600 dark:text-purple-300/70 uppercase tracking-widest block mb-2">التأكيد الإيجابي</span>
                       <p className="text-[13px] text-purple-800 dark:text-purple-200 font-bold italic leading-relaxed">"{aiInsight.affirmations[0] || aiInsight.affirmations}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* Sticky CTA footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shrink-0 space-y-3">
          <Button asChild className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl h-14 text-[14px] font-black shadow-lg hover:shadow-xl transition-all border-0">
            <a
              href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20بخصوص%20${encodeURIComponent(targetName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              استشارة متخصصة لحالة {targetName.split(' ')[0]}
            </a>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

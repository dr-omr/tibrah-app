import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { masterDictionary, AnatomicalSystem, AnatomicalTissue } from '@/data/anatomy/masterDictionary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubTissue: (systemId: string, tissueId: string) => void;
}

export default function AnatomySearchModal({ isOpen, onClose, onSelectSubTissue }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten the dictionary for search
  const allResults = Object.values(masterDictionary).flatMap(system => {
    const results = [];
    // Add the macro system itself
    results.push({
      systemId: system.id,
      tissueId: '', 
      title: system.name,
      subtitle: system.categoryName,
      type: 'Macro Region',
      icon: system.categoryIcon,
      color: system.categoryColor,
      matchedText: ''
    });

    // Add organs
    system.organs?.forEach(organ => {
      results.push({
        systemId: system.id,
        tissueId: organ.id,
        title: organ.name,
        subtitle: `عضو داخلي في ${system.name}`,
        type: 'Organ',
        icon: '🥣',
        color: system.categoryColor,
        matchedText: organ.emotion
      });
    });

    // Add tissues
    system.tissues?.forEach(tissue => {
      let icon = '🦴';
      if (tissue.type === 'muscle') icon = '💪';
      if (tissue.type === 'skin') icon = '🖐️';
      
      results.push({
        systemId: system.id,
        tissueId: tissue.id,
        title: tissue.name,
        subtitle: `نسيج في ${system.name}`,
        type: 'Tissue',
        icon,
        color: system.categoryColor,
        matchedText: tissue.emotion
      });
    });

    return results;
  });

  const filteredResults = allResults.filter(item => 
    item.title.includes(searchTerm) || 
    item.matchedText.includes(searchTerm) || 
    item.subtitle.includes(searchTerm)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header / Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" /> القاموس الشامل للأعضاء
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن عضو (مثال: المعدة، الكتف، مفاصل)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pr-12 pl-4 text-[15px] font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#2D9B83] focus:ring-4 focus:ring-[#2D9B83]/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 overscroll-contain bg-slate-50 dark:bg-[#0f172a]">
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                  <Search className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="text-sm font-bold text-slate-500">لا توجد نتائج مطابقة</p>
                </div>
              ) : (
                filteredResults.map((result, idx) => (
                  <button
                    key={`${result.systemId}-${result.tissueId}-${idx}`}
                    onClick={() => {
                      onSelectSubTissue(result.systemId, result.tissueId);
                      onClose();
                    }}
                    className="w-full text-right flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-[#2D9B83]/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-slate-800 dark:text-white truncate mb-0.5">{result.title}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">{result.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500">
                      {result.type}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

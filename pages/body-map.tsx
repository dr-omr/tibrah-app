import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Search, Heart, Activity, Sparkles, MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import InteractiveBody from '@/components/body-map/InteractiveBody';
import RegionInspectionPanel from '@/components/body-map/RegionInspectionPanel';
import AnatomySearchModal from '@/components/body-map/AnatomySearchModal';
import { useQuery } from '@tanstack/react-query';
import { emotionalDiseases, preloadEmotionalData } from '@/data/emotionalMedicineData';
import { aiClient } from '@/components/ai/aiClient';
import { masterDictionary, AnatomicalSystem } from '@/data/anatomy/masterDictionary';

const holisticSections = [
    { name: 'الطب الشعوري', description: 'افهم رسائل جسمك', page: 'emotional-medicine', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { name: 'تحليل الأعراض', description: 'شخص حالتك', page: 'symptom-analysis', icon: Activity, color: 'from-blue-500 to-cyan-500' }
];

export default function BodyMap() {
    const [selectedSystem, setSelectedSystem] = useState<AnatomicalSystem | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const [aiInsight, setAiInsight] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Preload emotional data from JSON
    useEffect(() => {
        preloadEmotionalData();
    }, []);

    // Fetch products to suggest (cached)
    const { data: allProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => db.entities.Product.list(),
        initialData: []
    });

    const getSuggestedProducts = (areaName: string) => {
        return allProducts?.slice(0, 3) || [];
    };

    const runAiBodyAnalysis = async (targetName: string, targetEmotion: string) => {
        setAiLoading(true);
        setAiInsight(null);
        try {
            const result = await aiClient.analyzeBodyMap(targetName, [targetEmotion]);
            setAiInsight(result);
        } catch (err) {
            console.error('Body map AI error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSelectPart = (id: string) => {
        if (!id) {
            setSelectedSystem(null);
            return;
        }
        // If clicking from visual SVG, map the ID to the Master Dictionary macro system
        let mappedId = id;
        
        // Manual mappings if the SVG ID doesn't exactly match the dictionary
        // The new dictionary uses: head, throat, chest, abdomen, back, upper_limb, lower_limb
        if (['head', 'face', 'brain', 'eyes', 'jaw'].includes(id)) mappedId = 'head';
        else if (['throat', 'neck', 'thyroid'].includes(id)) mappedId = 'throat';
        else if (['chest', 'heart', 'lungs'].includes(id)) mappedId = 'chest';
        else if (['abdomen', 'stomach', 'liver'].includes(id)) mappedId = 'abdomen';
        else if (['back', 'spine', 'lower_back', 'shoulders_back'].includes(id)) mappedId = 'back';
        else if (['upper_limb', 'arm', 'shoulder', 'hands'].includes(id)) mappedId = 'upper_limb';
        else if (['lower_limb', 'legs', 'foot', 'joints'].includes(id)) mappedId = 'lower_limb';

        const data = masterDictionary[mappedId];
        if (data) {
            setSelectedSystem(data);
        } else {
            console.warn(`No dictionary entry found for mapped ID: ${mappedId} (original: ${id})`);
        }
    };

    const handleSelectSubTissue = (systemId: string, tissueId: string) => {
        const system = masterDictionary[systemId];
        if (system) {
            setSelectedSystem(system);
            // The RegionInspectionPanel handles sub-tissue state internally via a prop or just by user clicking.
            // Since we want the search to directly open a specific tissue, we would normally pass it as a prop.
            // However, opening the parent system is sufficient for now, the user can click the tissue chip.
            // A more advanced version would pass `initialTissueId` to the panel.
        }
    };

    // Derived data for the inspection panel
    const relatedDiseases = selectedSystem ? (() => {
        const organKeywords = [selectedSystem.name.toLowerCase(), ...selectedSystem.tissues.map(t=>t.name), ...(selectedSystem.organs?.map(o=>o.name) || [])];
        return emotionalDiseases.filter(d =>
            organKeywords.some(kw => d.targetOrgan.includes(kw) || d.symptom.includes(kw))
        ).slice(0, 3);
    })() : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-24 font-sans relative">
            
            {/* Top Search Button overlaying the Map */}
            <div className="fixed top-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-700 rounded-full px-5 py-3 flex items-center gap-3 w-full max-w-sm hover:scale-[1.02] transition-transform"
                >
                    <Search className="w-5 h-5 text-[#2D9B83]" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">البحث الشامل في الأطلس...</span>
                </button>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 pt-20 pb-6 px-6 rounded-b-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.04)] mb-6 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-10 relative">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">الأطلس التشريحي الشامل</h1>
                <p className="text-[14px] font-semibold text-slate-500">اختر منطقة من المجسم، أو استخدم البحث لاكتشاف العضو والنسيج بدقة لمعرفة دلالاته الشعورية.</p>
            </div>

            <InteractiveBody
                onSelectPart={handleSelectPart}
                className="mb-8"
            />

            <div className={`transition-opacity duration-300 ${selectedSystem ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="px-6 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">أقسام الصحة الشمولية</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {holisticSections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <Link
                                    key={idx}
                                    href={createPageUrl(section.page)}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{section.name}</h4>
                                    <p className="text-xs text-slate-500">{section.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 mx-6 bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-3xl p-6 text-center shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-2">هل تحتاج مساعدة متخصصة؟</h3>
                    <p className="text-white/80 text-sm mb-4">
                        احجز جلسة تشخيصية مع د. عمر العماد لفهم أعمق لحالتك
                    </p>
                    <Button asChild className="bg-white text-[#2D9B83] hover:bg-slate-50 rounded-xl px-6 h-12 font-bold w-full mx-auto max-w-xs shadow-md border-0">
                        <a
                            href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20جلسة%20تشخيصية%20للطب%20الشعوري"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            احجز جلستك الآن
                        </a>
                    </Button>
                </div>
            </div>

            {/* Premium Floating Clinical Inspection Panel */}
            <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:w-[450px] z-40 pointer-events-none">
                <div className="pointer-events-auto">
                    <RegionInspectionPanel
                        region={selectedSystem as any}
                        onClose={() => setSelectedSystem(null)}
                        aiInsight={aiInsight}
                        aiLoading={aiLoading}
                        onRunAiAnalysis={runAiBodyAnalysis}
                        relatedDiseases={relatedDiseases}
                        suggestedProducts={selectedSystem ? getSuggestedProducts(selectedSystem.name) : []}
                    />
                </div>
            </div>

            {/* Search Modal */}
            <AnatomySearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                onSelectSubTissue={handleSelectSubTissue} 
            />
        </div>
    );
}

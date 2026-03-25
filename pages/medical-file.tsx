// pages/medical-file.tsx
// Premium Medical File — patient health record with strong hierarchy
// Refactored: Clean Architecture, Hook-based logic, component extraction

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SEO from '@/components/common/SEO';
import ProtectedRoute from '@/components/common/ProtectedRoute';

import { useMedicalFile } from '@/hooks/useMedicalFile';
import BiometricGate from '@/components/medical-file/BiometricGate';
import ProfileHeaderCard from '@/components/medical-file/ProfileHeaderCard';
import QuickInfoGrid from '@/components/medical-file/QuickInfoGrid';
import AiAnalysisStrip from '@/components/medical-file/AiAnalysisStrip';
import { ProfileEditForm, AddConditionForm, AddAllergyForm } from '@/components/medical-file/MedicalFileForms';

// Dynamic imports for code splitting
const ConditionsSection = dynamic(() => import('@/components/medical-file/ConditionsSection'), { ssr: false });
const AllergiesSection = dynamic(() => import('@/components/medical-file/AllergiesSection'), { ssr: false });
const MedicalFilesTab = dynamic(() => import('@/components/medical-file/MedicalFilesTab'), { ssr: false });
const CareTimelineSection = dynamic(() => import('@/components/medical-file/CareTimelineSection'), { ssr: false });

export default function MedicalFilePage() {
    const {
        isUnlocked,
        authenticate,
        profile,
        saveProfile,
        addChronicCondition,
        removeChronicCondition,
        addAllergy,
        removeAllergy,
        files,
        uploading,
        handleAddFile,
        deleteFile,
        aiAnalysis,
        aiLoading,
        runAiAnalysis,
    } = useMedicalFile();

    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showConditionSheet, setShowConditionSheet] = useState(false);
    const [showAllergySheet, setShowAllergySheet] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        conditions: true,
        allergies: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Completeness Calculation
    const filledFields = [profile.full_name, profile.blood_type, profile.weight, profile.height, profile.birth_date].filter(Boolean).length;
    const completeness = Math.round((filledFields / 5) * 100);

    return (
        <ProtectedRoute requireAuth={true}>
            {!isUnlocked ? (
                <BiometricGate onAuthenticate={authenticate} />
            ) : (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
                    <SEO title="ملفي الطبي — طِبرَا" description="سجلك الصحي الشامل في مكان واحد" />

                    {/* Premium Header Container */}
                    <ProfileHeaderCard 
                        profile={profile} 
                        completeness={completeness} 
                        onEditClick={() => setShowProfileSheet(true)} 
                    />

                    {/* Quick Info Grid */}
                    <QuickInfoGrid profile={profile} />

                    {/* AI MEDICAL ANALYSIS */}
                    <AiAnalysisStrip 
                        aiAnalysis={aiAnalysis} 
                        aiLoading={aiLoading} 
                        runAiAnalysis={runAiAnalysis} 
                    />

                    {/* Content Sections */}
                    <div className="px-4 space-y-4">
                        <CareTimelineSection />

                        <ConditionsSection
                            conditions={profile.chronic_conditions || []}
                            expanded={expandedSections.conditions}
                            onToggle={() => toggleSection('conditions')}
                            onRemove={removeChronicCondition}
                            onAdd={() => setShowConditionSheet(true)}
                        />

                        <AllergiesSection
                            allergies={profile.allergies || []}
                            expanded={expandedSections.allergies}
                            onToggle={() => toggleSection('allergies')}
                            onRemove={removeAllergy}
                            onAdd={() => setShowAllergySheet(true)}
                        />

                        <MedicalFilesTab
                            files={files}
                            uploading={uploading}
                            onAddFile={handleAddFile}
                            onDelete={deleteFile}
                        />
                    </div>

                    {/* Bottom Drawers (Sheets) */}
                    <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
                        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle className="text-right text-xl">البيانات الشخصية</SheetTitle>
                            </SheetHeader>
                            <ProfileEditForm profile={profile} onSave={(data) => { saveProfile(data); setShowProfileSheet(false); }} onClose={() => setShowProfileSheet(false)} />
                        </SheetContent>
                    </Sheet>

                    <Sheet open={showConditionSheet} onOpenChange={setShowConditionSheet}>
                        <SheetContent side="bottom" className="rounded-t-3xl">
                            <SheetHeader>
                                <SheetTitle className="text-right text-xl">إضافة حالة مزمنة</SheetTitle>
                            </SheetHeader>
                            <AddConditionForm onAdd={(data) => { addChronicCondition(data); setShowConditionSheet(false); }} />
                        </SheetContent>
                    </Sheet>

                    <Sheet open={showAllergySheet} onOpenChange={setShowAllergySheet}>
                        <SheetContent side="bottom" className="rounded-t-3xl">
                            <SheetHeader>
                                <SheetTitle className="text-right text-xl">إضافة حساسية</SheetTitle>
                            </SheetHeader>
                            <AddAllergyForm onAdd={(data) => { addAllergy(data); setShowAllergySheet(false); }} />
                        </SheetContent>
                    </Sheet>
                </div>
            )}
        </ProtectedRoute>
    );
}

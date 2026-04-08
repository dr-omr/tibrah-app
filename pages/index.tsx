import React from 'react';
import SEO, { pageSEO } from '../components/common/SEO';
import { HomeStructuredData } from '../components/common/StructuredData';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';
import HealthAura from '@/components/home/HealthAura';
import PatientHome from '@/components/home/PatientHome';
import VisitorHome from '@/components/home/VisitorHome';
import { SPRING_SMOOTH } from '@/lib/tibrah-motion';

/* ═══════════════════════════════════════════════
   HOME PAGE (TIBRAH 2.0)
   Entry point wrapper for Patient vs Visitor flows.
   Massively refactored to modular architecture.
   ═══════════════════════════════════════════════ */
export default function HomePage() {
    const { user } = useAuth();
    const dashboard = useHealthDashboard();

    return (
        <div className="relative min-h-screen bg-[#F0FAF8] dark:bg-[#080D13] overflow-hidden font-sans">

            {/* ── Health Aura Generative System ── */}
            <HealthAura 
                isPatient={!!user} 
                healthScore={user ? dashboard.healthScore : 100} 
            />

            {/* ── المحتوى الرئيسي ── */}
            <div className="relative z-10 w-full max-w-lg mx-auto">
                <SEO {...pageSEO.home} />
                <HomeStructuredData />

                {/* Animated page transition between user states */}
                <AnimatePresence mode="wait">
                    {user ? (
                        <motion.div
                            key="patient"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={SPRING_SMOOTH}
                        >
                            <PatientHome />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="visitor"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={SPRING_SMOOTH}
                        >
                            <VisitorHome />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

'use client';
/**
 * SubdomainRail.tsx — شريط المسارات الفرعية
 * ────────────────────────────────────────────
 * Horizontal scrollable rail showing subdomains for a domain.
 * Filter-first behavior: selecting a subdomain filters content in-page
 * rather than navigating away.
 *
 * Highlights the recommended subdomain if routing result exists.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { getSubdomains } from '@/lib/domain-routing-map';
import type { DomainId, SubdomainId } from '@/components/health-engine/types';

interface SubdomainRailProps {
    domainId: DomainId;
    color: string;
    colorAlt: string;
    /** Currently selected subdomain (filter) */
    activeSubdomain: SubdomainId | null;
    /** Subdomain recommended by routing engine */
    recommendedSubdomain?: SubdomainId | null;
    /** Callback when a subdomain pill is tapped */
    onSelect: (id: SubdomainId | null) => void;
}

export function SubdomainRail({
    domainId,
    color,
    colorAlt,
    activeSubdomain,
    recommendedSubdomain,
    onSelect,
}: SubdomainRailProps) {
    const subdomains = getSubdomains(domainId);

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between px-5 mb-2.5">
                <p className="text-[10px] font-black text-slate-500 tracking-tight">المسارات الفرعية</p>
                {activeSubdomain && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { onSelect(null); haptic.tap(); }}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${color}12`, color }}
                    >
                        عرض الكل ✕
                    </motion.button>
                )}
            </div>

            <div
                className="flex gap-2 overflow-x-auto px-4 pb-2"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {subdomains.map((sub, i) => {
                    const isActive = activeSubdomain === sub.id;
                    const isRecommended = recommendedSubdomain === sub.id && !activeSubdomain;

                    return (
                        <motion.button
                            key={sub.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28, delay: i * 0.03 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                                onSelect(isActive ? null : sub.id);
                                haptic.selection();
                            }}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[14px] relative"
                            style={{
                                background: isActive
                                    ? `linear-gradient(135deg, ${color}, ${colorAlt})`
                                    : isRecommended
                                        ? `${color}18`
                                        : 'rgba(255,255,255,0.8)',
                                border: isActive
                                    ? 'none'
                                    : isRecommended
                                        ? `1.5px solid ${color}35`
                                        : '1px solid rgba(226,232,240,0.6)',
                                boxShadow: isActive
                                    ? `0 4px 14px ${color}35`
                                    : isRecommended
                                        ? `0 2px 8px ${color}18`
                                        : '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Recommended badge */}
                            {isRecommended && (
                                <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.8, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                                    style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
                                />
                            )}

                            <span className="text-[13px] leading-none">{sub.emoji}</span>
                            <span
                                className="text-[10px] font-black whitespace-nowrap"
                                style={{ color: isActive ? 'white' : isRecommended ? color : '#475569' }}
                            >
                                {sub.arabicName}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

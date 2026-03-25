import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AnatomicalRegion,
  anatomicalRegions,
  BODY_SILHOUETTE_FRONT,
  BODY_SILHOUETTE_BACK,
} from '@/data/anatomy/regions';

interface Props {
  viewMode: 'front' | 'back';
  selectedRegionId: string | null;
  onRegionSelect: (region: AnatomicalRegion) => void;
  onDeselect: () => void;
  scale: number;
  onScaleChange: (s: number) => void;
}

export default function AnatomicalSilhouette({
  viewMode,
  selectedRegionId,
  onRegionSelect,
  onDeselect,
  scale,
  onScaleChange,
}: Props) {
  const silhouettePath =
    viewMode === 'front' ? BODY_SILHOUETTE_FRONT : BODY_SILHOUETTE_BACK;
  const regions = anatomicalRegions.filter((r) => r.view === viewMode);

  // Background atlas images
  const backgroundImage = viewMode === 'front'
    ? '/images/atlas-front.png'
    : '/images/atlas-back.png';

  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const isPanningRef = useRef(false);

  // ── Wheel zoom ──
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const next = Math.max(1, Math.min(3.5, scale + delta));
      onScaleChange(next);
      if (next <= 1) setTranslate({ x: 0, y: 0 });
    },
    [scale, onScaleChange]
  );

  // ── Pinch zoom + pan ──
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        lastTouchRef.current = { x: 0, y: 0, dist };
      } else if (e.touches.length === 1 && scale > 1) {
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        isPanningRef.current = true;
      }
    },
    [scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchRef.current?.dist) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (dist - lastTouchRef.current.dist) * 0.008;
        const next = Math.max(1, Math.min(3.5, scale + delta));
        onScaleChange(next);
        lastTouchRef.current.dist = dist;
        if (next <= 1) setTranslate({ x: 0, y: 0 });
      } else if (
        isPanningRef.current &&
        e.touches.length === 1 &&
        lastTouchRef.current
      ) {
        const dx = e.touches[0].clientX - lastTouchRef.current.x;
        const dy = e.touches[0].clientY - lastTouchRef.current.y;
        setTranslate((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [scale, onScaleChange]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    isPanningRef.current = false;
  }, []);

  const lastTapRef = useRef(0);
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          onScaleChange(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          onScaleChange(2);
        }
      }
      lastTapRef.current = now;
    },
    [scale, onScaleChange]
  );

  const effectiveTranslate = scale <= 1 ? { x: 0, y: 0 } : translate;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60vh] md:h-[70vh] rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-[#050A10] dark:to-[#0A0F1C] border border-slate-200 dark:border-white/5 shadow-2xl flex items-center justify-center cursor-crosshair touch-none"
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== 'path') {
          onDeselect();
        }
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: scale > 1 ? 'none' : 'manipulation',
      }}
    >
      <svg
        viewBox="0 0 400 600"
        className="w-full h-full max-h-[75vh] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleTap}
        style={{
          transform: `scale(${scale}) translate(${effectiveTranslate.x / scale}px, ${effectiveTranslate.y / scale}px)`,
          transition: isPanningRef.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'center center',
          background: 'transparent'
        }}
      >
        <defs>
          <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="15" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="organSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="techGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2D9B83" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#2D9B83" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#2D9B83" stopOpacity="0" />
          </radialGradient>

          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Base Silhouette as fallback */}
        <path d={silhouettePath} fill="#f1f5f9" className="dark:fill-slate-800" />

        {/* 2. REAL ANATOMICAL PHOTOGRAPH */}
        <motion.image
          href={backgroundImage}
          x="0"
          y="0"
          width="400"
          height="600"
          preserveAspectRatio="xMidYMid slice"
          initial={false}
          style={{ pointerEvents: 'none' }}
          onError={(e: any) => {
            e.target.href.baseVal = '/images/atlas-front.png';
          }}
        />

        {/* 3. DIMMING MASK (Darts out everything EXCEPT the spotlighted area) */}
        <motion.rect
          x="0"
          y="0"
          width="400"
          height="600"
          fill="#000000"
          initial={false}
          animate={{ opacity: selectedRegionId ? 0.75 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'none', mixBlendMode: 'multiply' }}
        />

        {/* 4. Clickable Intangible Vectors & Spotlight Renders */}
        {regions.map((region) => {
          const isActive = selectedRegionId === region.id;

          return (
            <g key={region.id}>
              {/* SPOTLIGHT: Illuminates the real photograph from underneath the dimming layer (using screen/overlay) */}
              {isActive && (
                <motion.circle
                  cx={region.cx}
                  cy={region.cy}
                  r={50}
                  fill="url(#organSpotlight)"
                  initial={{ opacity: 0, r: 0 }}
                  animate={{ opacity: 1, r: Math.max(region.viewBoxBounds.w, region.viewBoxBounds.h) * 1.5 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
                />
              )}

              {/* TECH GLOW: A medical aqua glow for aesthetics */}
              {isActive && (
                <motion.circle
                  cx={region.cx}
                  cy={region.cy}
                  fill="url(#techGlow)"
                  initial={{ opacity: 0, r: 0 }}
                  animate={{ opacity: 1, r: Math.max(region.viewBoxBounds.w, region.viewBoxBounds.h) * 0.8 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}
                />
              )}

              {/* The Interaction Boundary */}
              <motion.path
                d={region.path_d}
                onClick={(e) => {
                  e.stopPropagation();
                  onRegionSelect(region);
                }}
                initial={false}
                // No fill! Let the real photograph shine through the spotlight.
                animate={{
                  fillOpacity: isActive ? 0.0 : 0,
                  strokeOpacity: isActive ? 0.9 : 0,
                  stroke: region.categoryColor || '#4ee6c2',
                  strokeWidth: isActive ? 1.5 : 0,
                  strokeDasharray: isActive ? "4 4" : "0 0", // Medical "scan" broken line
                }}
                whileHover={{
                  fillOpacity: isActive ? 0.0 : 0.0,
                  strokeOpacity: isActive ? 0.9 : 0.5,
                  strokeWidth: 1.5,
                  stroke: '#4ee6c2',
                  strokeDasharray: "2 4",
                }}
                transition={{ duration: 0.3 }}
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                role="button"
                aria-label={`${region.name} – ${region.label_en}`}
              />

              {/* Precise Targeting Pinpoint */}
              {(!selectedRegionId || isActive) && (
                <motion.g
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.3 }}
                  transition={{ duration: 0.5 }}
                  style={{ pointerEvents: 'none' }}
                >
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={isActive ? 3 : 1.5}
                    fill={isActive ? '#ffffff' : (region.categoryColor || '#2D9B83')}
                    filter={isActive ? 'url(#premiumGlow)' : 'none'}
                  />
                  {isActive && (
                    <motion.circle
                      cx={region.cx}
                      cy={region.cy}
                      r={15}
                      fill="none"
                      stroke={region.categoryColor || '#4ee6c2'}
                      strokeWidth="1.5"
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </motion.g>
              )}

              {/* Ultra-Refined Premium Label */}
              {isActive && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, type: "spring", bounce: 0.2 }}
                  style={{ pointerEvents: 'none' }}
                >
                  {/* Minimalist Connection Line */}
                  <path
                    d={`M ${region.cx} ${region.cy - 5} L ${region.cx} ${region.cy - 25}`}
                    stroke={region.categoryColor || '#ffffff'}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                  <rect
                    x={region.cx - 60}
                    y={region.cy - 50}
                    width={120}
                    height={26}
                    rx={13}
                    fill="rgba(5, 10, 20, 0.85)"
                    stroke={region.categoryColor || '#4ee6c2'}
                    strokeWidth="1"
                    style={{ backdropFilter: 'blur(12px)' }}
                    filter="url(#shadow)"
                  />
                  {/* Glowing Indicator Dot */}
                  <circle cx={region.cx - 45} cy={region.cy - 37} r={3} fill={region.categoryColor || '#4ee6c2'} filter="url(#premiumGlow)" />
                  <text
                    x={region.cx + 5}
                    y={region.cy - 33}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.06em"
                    fontFamily="inherit"
                  >
                    {region.name}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

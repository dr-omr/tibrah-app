import React, { useState, useCallback } from 'react';
import { AnatomicalRegion } from '@/data/anatomy/regions';
import AnatomicalSilhouette from './AnatomicalSilhouette';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface InteractiveBodyProps {
  onSelectPart: (partId: string, region?: AnatomicalRegion) => void;
  className?: string;
  viewMode?: 'front' | 'back';
  onViewChange?: (view: 'front' | 'back') => void;
}

export default function InteractiveBody({
  onSelectPart,
  className = '',
  viewMode = 'front',
  onViewChange,
}: InteractiveBodyProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>(viewMode);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const handleRegionSelect = useCallback(
    (region: AnatomicalRegion) => {
      setSelectedId(region.id);
      onSelectPart(region.id, region);
    },
    [onSelectPart]
  );

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    onSelectPart('');
  }, [onSelectPart]);

  const handleViewToggle = useCallback(
    (view: 'front' | 'back') => {
      setCurrentView(view);
      setSelectedId(null);
      setScale(1);
      onSelectPart('');
      onViewChange?.(view);
    },
    [onSelectPart, onViewChange]
  );

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Top controls row */}
      <div className="flex items-center justify-between w-full px-6">
        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle__btn ${currentView === 'front' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => handleViewToggle('front')}
          >
            أمام
          </button>
          <button
            className={`view-toggle__btn ${currentView === 'back' ? 'view-toggle__btn--active' : ''}`}
            onClick={() => handleViewToggle('back')}
          >
            خلف
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.min(3.5, s + 0.3))}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const next = Math.max(1, scale - 0.3);
              setScale(next);
            }}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {scale > 1 && (
            <button
              onClick={() => setScale(1)}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="إعادة ضبط"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {scale > 1 && (
            <span className="text-[10px] font-bold text-slate-400 mr-1">
              {Math.round(scale * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Zoom hint */}
      {scale <= 1 && (
        <p className="text-[10px] text-slate-400 font-medium">
          اسحب بإصبعين للتكبير • انقر مرتين للتقريب
        </p>
      )}

      {/* Anatomical SVG */}
      <AnatomicalSilhouette
        viewMode={currentView}
        selectedRegionId={selectedId}
        onRegionSelect={handleRegionSelect}
        onDeselect={handleDeselect}
        scale={scale}
        onScaleChange={setScale}
      />
    </div>
  );
}

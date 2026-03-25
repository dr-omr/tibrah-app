import React from 'react';
import { Play, Pause, Heart, Clock, Headphones, Sparkles, Crown, Zap } from 'lucide-react';
import { TherapeuticSession } from '@/types/therapeuticSessionTypes';
import { getCategoryById } from '@/data/therapeuticCategories';
import EvidenceBadge from './EvidenceBadge';

interface TherapeuticSessionCardProps {
  session: TherapeuticSession;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay: () => void;
  onShowDetails: () => void;
  onToggleFavorite?: () => void;
}

export default function TherapeuticSessionCard({
  session, isPlaying = false, isFavorite = false,
  onPlay, onShowDetails, onToggleFavorite,
}: TherapeuticSessionCardProps) {
  const category = getCategoryById(session.category);
  const gradientFrom = category?.color_from || 'from-slate-500';
  const gradientTo = category?.color_to || 'to-slate-600';

  return (
    <div
      onClick={onShowDetails}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer group
        ${isPlaying
          ? 'bg-white/80 dark:bg-slate-800/80 shadow-lg shadow-primary/10 ring-2 ring-primary/30'
          : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:shadow-lg'
        }
        backdrop-blur-sm border border-white/20 dark:border-slate-700/30
      `}
    >
      {/* Playing indicator bar */}
      {isPlaying && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      )}

      {/* Featured badge */}
      {session.featured && !isPlaying && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[9px] font-bold shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            مميزة
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Category Icon + Play */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo}
              flex items-center justify-center shadow-lg flex-shrink-0
              transition-all duration-300
              ${isPlaying ? 'scale-105 animate-pulse' : 'group-hover:scale-105'}
            `}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" fill="white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            )}
            {/* Small category icon overlay */}
            <span className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-[11px]">
              {session.icon || category?.icon || '🎵'}
            </span>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h3 className={`font-bold text-base leading-tight ${isPlaying ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>
                {session.title_ar}
              </h3>
              {/* Favorite */}
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                  className="p-1 -mt-0.5 flex-shrink-0 transition-transform active:scale-125"
                >
                  <Heart
                    className={`w-4.5 h-4.5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-300 dark:text-slate-600'}`}
                  />
                </button>
              )}
            </div>

            {/* English subtitle */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1 truncate">
              {session.title_en}
            </p>

            {/* Therapeutic purpose line */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
              {session.intended_outcome_ar}
            </p>

            {/* Bottom meta row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <EvidenceBadge level={session.evidence_level} size="sm" />

              {/* Duration */}
              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                {session.default_duration}د
              </span>

              {/* Headphone indicator */}
              {session.headphone_required && (
                <span className="text-blue-400" title="يُنصح بسماعات الرأس">
                  <Headphones className="w-3 h-3" />
                </span>
              )}

              {/* Frequency display */}
              {session.frequency_display && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {session.frequency_display}
                </span>
              )}

              {/* Depth level indicator */}
              {session.depth_level && session.depth_level !== 'beginner' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  session.depth_level === 'advanced'
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {session.depth_level === 'advanced' ? 'متقدم' : 'متوسط'}
                </span>
              )}

              {/* Premium badge */}
              {session.premium && (
                <span className="text-amber-500">
                  <Crown className="w-3 h-3" />
                </span>
              )}

              {/* Beginner friendly badge */}
              {session.beginner_friendly && session.depth_level === 'beginner' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  مبتدئ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

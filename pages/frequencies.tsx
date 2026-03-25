import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import {
  Search, Radio, Sparkles, Shield, ChevronLeft,
  Headphones, Star, Clock, X, Heart, History, Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Data & Types
import { TherapeuticSession, SessionCategory, TherapeuticProgram } from '@/types/therapeuticSessionTypes';
import {
  ALL_SESSIONS, ALL_PROGRAMS, FEATURED_COLLECTIONS, MOOD_DISCOVERY_CARDS,
  getSessionById, searchSessions, getFeaturedSessions,
  getSessionsByMood, getRecentSessionsById,
} from '@/data/therapeuticSessions';
import { THERAPEUTIC_CATEGORIES, getCategoryById } from '@/data/therapeuticCategories';

import dynamic from 'next/dynamic';

// Components — dynamically imported for code splitting
const TherapeuticSessionCard = dynamic(() => import('@/components/frequencies/TherapeuticSessionCard'), { ssr: false });
const SessionDetailSheet = dynamic(() => import('@/components/frequencies/SessionDetailSheet'), { ssr: false });
const TherapeuticPlayer = dynamic(() => import('@/components/frequencies/TherapeuticPlayer'), { ssr: false });
const ProgramCard = dynamic(() => import('@/components/frequencies/ProgramCard'), { ssr: false });
const EvidenceBadge = dynamic(() => import('@/components/frequencies/EvidenceBadge'), { ssr: false });

// ============================================================
// MAIN PAGE
// ============================================================
export default function Frequencies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'evidence_only'>('all');
  const [selectedSession, setSelectedSession] = useState<TherapeuticSession | null>(null);
  const [playingSession, setPlayingSession] = useState<TherapeuticSession | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerDuration, setPlayerDuration] = useState(15);
  const [selectedProgram, setSelectedProgram] = useState<TherapeuticProgram | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('therapeutic_favorites');
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch { return new Set(); }
    }
    return new Set();
  });
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const router = useRouter();

  // Load recent sessions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('therapeutic_recent');
        if (saved) setRecentIds(JSON.parse(saved));
      } catch {}
    }
  }, [playerOpen]); // Refresh when player closes (session completed saves recent)

  // Recent sessions
  const recentSessions = useMemo(() => {
    return getRecentSessionsById(recentIds).slice(0, 5);
  }, [recentIds]);

  // Favorite sessions
  const favoriteSessions = useMemo(() => {
    return ALL_SESSIONS.filter(s => favorites.has(s.id)).slice(0, 6);
  }, [favorites]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let sessions = ALL_SESSIONS;

    // Mood filter takes priority
    if (activeMood) {
      sessions = getSessionsByMood(activeMood);
    } else if (searchQuery.trim()) {
      sessions = searchSessions(searchQuery);
    }

    if (activeCategory !== 'all') {
      sessions = sessions.filter(s => s.category === activeCategory);
    }
    if (evidenceFilter === 'evidence_only') {
      sessions = sessions.filter(s =>
        s.evidence_level === 'evidence_supported' || s.evidence_level === 'emerging_evidence'
      );
    }
    return sessions;
  }, [searchQuery, activeCategory, evidenceFilter, activeMood]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('therapeutic_favorites', JSON.stringify([...next]));
      }
      return next;
    });
  }, []);

  // Play a session — opens the player directly
  const handlePlay = useCallback((session: TherapeuticSession, duration?: number) => {
    setPlayingSession(session);
    setPlayerDuration(duration || session.default_duration || 15);
    setPlayerOpen(true);
    setSelectedSession(null);
    setSelectedProgram(null);
  }, []);

  // Close player
  const handleClosePlayer = useCallback(() => {
    setPlayerOpen(false);
    setTimeout(() => setPlayingSession(null), 300);
  }, []);

  // Open program detail
  const handleOpenProgram = useCallback((program: TherapeuticProgram) => {
    setSelectedProgram(program);
  }, []);

  // Handle mood selection
  const handleMoodSelect = useCallback((moodKey: string) => {
    if (activeMood === moodKey) {
      setActiveMood(null); // Deselect
    } else {
      setActiveMood(moodKey);
      setSearchQuery('');
      setActiveCategory('all');
    }
  }, [activeMood]);

  const allCategories = [
    { id: 'all', label_ar: 'الكل', icon: '✨', color_from: 'from-slate-500', color_to: 'to-slate-600' },
    ...THERAPEUTIC_CATEGORIES,
  ];

  const isDiscoveryView = !searchQuery && activeCategory === 'all' && !activeMood;

  return (
    <div className="min-h-screen pb-40">
      {/* ──────── PREMIUM HERO HEADER ──────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 px-6 pt-8 pb-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
              <Radio className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">مركز الصوت العلاجي</h1>
              <p className="text-xs text-purple-300/70">Therapeutic Audio Hub</p>
            </div>
          </div>

          <p className="text-sm text-white/50 mb-1 leading-relaxed">
            جلسات صوتية مصممة للاسترخاء والنوم والتركيز — مبنية على مستويات أدلة واضحة
          </p>
          <p className="text-xs text-white/30 mb-4">
            {ALL_SESSIONS.length} جلسة • {ALL_PROGRAMS.length} برنامج • {THERAPEUTIC_CATEGORIES.length} فئة
          </p>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input
              placeholder="ابحث عن جلسة، نتيجة، أو فئة..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMood(null);
              }}
              className="bg-white/10 backdrop-blur-md border-white/10 rounded-xl pr-12 h-12 text-white placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* ──────── SAFETY BANNER ──────── */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            مركز داعم للعافية — ليس بديلاً عن التشخيص أو العلاج الطبي
          </p>
        </div>
      </div>

      {/* ──────── MOOD DISCOVERY ROW ──────── */}
      <div className="px-6 py-3">
        <div className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          كيف تشعر الآن؟
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {MOOD_DISCOVERY_CARDS.map(mood => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.mood_key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl transition-all active:scale-95 ${
                activeMood === mood.mood_key
                  ? `bg-gradient-to-r ${mood.color_from} ${mood.color_to} text-white shadow-lg scale-[1.02]`
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30'
              }`}
            >
              <span className="text-xl">{mood.icon}</span>
              <span className={`text-xs font-medium whitespace-nowrap ${
                activeMood === mood.mood_key ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              }`}>{mood.label_ar}</span>
            </button>
          ))}
        </div>
        {activeMood && (
          <button
            onClick={() => setActiveMood(null)}
            className="mt-2 text-xs text-primary flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            إلغاء فلتر المزاج
          </button>
        )}
      </div>

      {/* ──────── CONTINUE LISTENING / RECENT ──────── */}
      {isDiscoveryView && recentSessions.length > 0 && (
        <div className="px-6 py-3">
          <div className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            استمر بالاستماع
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {recentSessions.map(session => {
              const cat = getCategoryById(session.category);
              return (
                <button
                  key={session.id}
                  onClick={() => handlePlay(session)}
                  className="flex-shrink-0 w-36 bg-white dark:bg-slate-800 rounded-2xl p-3 text-right border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color_from || 'from-slate-500'} ${cat?.color_to || 'to-slate-600'} flex items-center justify-center mb-2 text-lg`}>
                    {session.icon || '🎵'}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-white line-clamp-1">{session.title_ar}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{session.title_en}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────── YOUR FAVORITES ──────── */}
      {isDiscoveryView && favoriteSessions.length > 0 && (
        <div className="px-6 py-3">
          <div className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            المفضلة
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {favoriteSessions.map(session => {
              const cat = getCategoryById(session.category);
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="flex-shrink-0 w-36 bg-white dark:bg-slate-800 rounded-2xl p-3 text-right border border-red-100 dark:border-red-900/30 hover:shadow-md transition-all active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color_from || 'from-slate-500'} ${cat?.color_to || 'to-slate-600'} flex items-center justify-center mb-2 text-lg`}>
                    {session.icon || '🎵'}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-white line-clamp-1">{session.title_ar}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{session.default_duration}د • {cat?.label_ar}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────── FEATURED COLLECTIONS ──────── */}
      {isDiscoveryView && (
        <div className="px-6 py-3">
          <div className="text-base font-bold text-slate-800 dark:text-white mb-3">مجموعات مختارة</div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {FEATURED_COLLECTIONS.map(col => {
              const colSessions = col.session_ids.map(id => getSessionById(id)).filter(Boolean) as TherapeuticSession[];
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    if (colSessions.length > 0) {
                      handlePlay(colSessions[0]);
                    }
                  }}
                  className={`flex-shrink-0 w-40 rounded-2xl bg-gradient-to-br ${col.color_from} ${col.color_to} p-4 text-right shadow-lg hover:shadow-xl transition-all active:scale-95`}
                >
                  <span className="text-2xl block mb-2">{col.icon}</span>
                  <h3 className="text-sm font-bold text-white leading-tight">{col.title_ar}</h3>
                  <p className="text-[10px] text-white/60 mt-1">{col.session_ids.length} جلسات</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────── PROGRAMS SECTION ──────── */}
      {isDiscoveryView && (
        <div className="px-6 py-3">
          <div className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            البرامج العلاجية
            <span className="text-[10px] font-normal text-slate-400 mr-1">{ALL_PROGRAMS.length} برنامج</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {ALL_PROGRAMS.map(prog => (
              <ProgramCard
                key={prog.id}
                program={prog}
                onClick={() => handleOpenProgram(prog)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ──────── CATEGORY CHIPS ──────── */}
      <div className="px-6 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {allCategories.map(cat => {
            const count = cat.id === 'all' 
              ? ALL_SESSIONS.length 
              : ALL_SESSIONS.filter(s => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveMood(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color_from} ${cat.color_to} text-white shadow-md`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/30'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label_ar}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────── EVIDENCE FILTER ──────── */}
      <div className="px-6 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvidenceFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              evidenceFilter === 'all'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            كل الجلسات
          </button>
          <button
            onClick={() => setEvidenceFilter('evidence_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              evidenceFilter === 'evidence_only'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <span>🟢</span>
            مدعوم بالأدلة فقط
          </button>
          <span className="text-xs text-slate-400 mr-auto">{filteredSessions.length} جلسة</span>
        </div>
      </div>

      {/* ──────── ACTIVE MOOD RESULTS HEADER ──────── */}
      {activeMood && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {MOOD_DISCOVERY_CARDS.find(m => m.mood_key === activeMood)?.icon}
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-white">
              جلسات مقترحة: {MOOD_DISCOVERY_CARDS.find(m => m.mood_key === activeMood)?.label_ar}
            </span>
          </div>
        </div>
      )}

      {/* ──────── SESSION LIST ──────── */}
      <div className="px-6 py-2 space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">لا توجد جلسات</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">جرب تغيير الفئة أو معايير البحث</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <TherapeuticSessionCard
              key={session.id}
              session={session}
              isPlaying={playerOpen && playingSession?.id === session.id}
              isFavorite={favorites.has(session.id)}
              onPlay={() => handlePlay(session)}
              onShowDetails={() => setSelectedSession(session)}
              onToggleFavorite={() => toggleFavorite(session.id)}
            />
          ))
        )}
      </div>

      {/* ──────── Rife Page Link ──────── */}
      <div className="px-6 py-6">
        <button
          onClick={() => router.push('/rife-frequencies')}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 p-5 text-right shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">ترددات رايف التكميلية</h3>
              <p className="text-xs text-white/70">Rife Frequencies — استكشافي فقط</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-white/50" />
          </div>
        </button>
      </div>

      {/* ──────── PORTALED MODALS — render directly on body ──────── */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {/* PROGRAM DETAIL */}
          {selectedProgram && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center" style={{ zIndex: 9990, direction: 'rtl' }} onClick={() => setSelectedProgram(null)}>
              <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedProgram.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedProgram.title_ar}</h3>
                      <p className="text-xs text-slate-400">{selectedProgram.title_en}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProgram(null)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{selectedProgram.description_ar}</p>
                <div className="flex items-center gap-3 mb-5 text-xs text-slate-400">
                  <span>📅 {selectedProgram.duration_days} أيام</span>
                  <span>🎵 {selectedProgram.sessions.length} جلسات</span>
                  <EvidenceBadge level={selectedProgram.evidence_level} size="sm" />
                </div>
                <div className="space-y-3">
                  {selectedProgram.sessions.map((ps, idx) => {
                    const sess = getSessionById(ps.session_id);
                    if (!sess) return null;
                    const cat = getCategoryById(sess.category);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color_from || 'from-slate-500'} ${cat?.color_to || 'to-slate-600'} flex items-center justify-center text-white text-sm font-bold`}>{ps.day}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-white truncate">{sess.title_ar}</p>
                          <p className="text-[11px] text-slate-400">{ps.note_ar || sess.title_en}</p>
                        </div>
                        <button onClick={() => { setSelectedProgram(null); handlePlay(sess); }}
                          className={`w-9 h-9 rounded-full bg-gradient-to-r ${cat?.color_from || 'from-purple-500'} ${cat?.color_to || 'to-pink-500'} flex items-center justify-center`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SESSION DETAIL */}
          <SessionDetailSheet
            session={selectedSession}
            isOpen={!!selectedSession}
            onClose={() => setSelectedSession(null)}
            onPlay={handlePlay}
            isFavorite={selectedSession ? favorites.has(selectedSession.id) : false}
            onToggleFavorite={selectedSession ? () => toggleFavorite(selectedSession.id) : undefined}
          />

          {/* PLAYER */}
          <TherapeuticPlayer
            session={playingSession}
            isOpen={playerOpen}
            onClose={handleClosePlayer}
            selectedDuration={playerDuration}
          />
        </>,
        document.body
      )}
    </div>
  );
}

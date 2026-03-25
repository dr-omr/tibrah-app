import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play, Pause, Volume2, VolumeX, X, Heart, Share2,
  Headphones, ChevronDown, Waves, Maximize2,
  SkipForward, SkipBack, Timer, List, Repeat, Sparkles
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TherapeuticSession } from '@/types/therapeuticSessionTypes';
import { getCategoryById } from '@/data/therapeuticCategories';
import { ALL_SESSIONS, getSessionsByCategory, getSessionById } from '@/data/therapeuticSessions';
import EvidenceBadge from './EvidenceBadge';

interface TherapeuticPlayerProps {
  session: TherapeuticSession | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDuration?: number;
}

export default function TherapeuticPlayer({
  session, isOpen, onClose, selectedDuration = 15,
}: TherapeuticPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [activeFreqIndex, setActiveFreqIndex] = useState(0);
  const [fadeEnabled, setFadeEnabled] = useState(true);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [activeDuration, setActiveDuration] = useState(selectedDuration);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState([3,5,7,4,6,8,5,3,6,4,7,5]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  // Audio engine refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rifeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const category = session ? getCategoryById(session.category) : undefined;
  const totalSeconds = activeDuration * 60;
  const progressPercent = totalSeconds > 0 ? Math.min((elapsed / totalSeconds) * 100, 100) : 0;

  // Up-next queue — related sessions
  const upNext = useMemo(() => {
    if (!session) return [];
    return getSessionsByCategory(session.category)
      .filter(s => s.id !== session.id)
      .slice(0, 5);
  }, [session]);

  // Check favorite
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      try {
        const favs = JSON.parse(localStorage.getItem('therapeutic_favorites') || '[]');
        setIsFavorite(favs.includes(session.id));
      } catch {}
    }
  }, [session?.id]);

  // Visualizer animation
  useEffect(() => {
    if (isPlaying) {
      visualizerIntervalRef.current = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.floor(Math.random() * 10) + 2));
      }, 200);
    }
    return () => { if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current); };
  }, [isPlaying]);

  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const stopAudio = useCallback(() => {
    if (rifeIntervalRef.current) { clearInterval(rifeIntervalRef.current); rifeIntervalRef.current = null; }
    if (oscRef.current) { try { oscRef.current.stop(); oscRef.current.disconnect(); } catch {} oscRef.current = null; }
    if (gainRef.current) { try { gainRef.current.disconnect(); } catch {} gainRef.current = null; }
  }, []);

  const playFrequency = useCallback((freq: number) => {
    const ctx = initAudioCtx();
    if (oscRef.current) { try { oscRef.current.stop(); oscRef.current.disconnect(); } catch {} }
    if (gainRef.current) { try { gainRef.current.disconnect(); } catch {} }
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(isMuted ? 0 : volume * 0.3, ctx.currentTime + (fadeEnabled ? 2.0 : 0.3));
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
  }, [initAudioCtx, volume, isMuted, fadeEnabled]);

  const startPlaying = useCallback(() => {
    if (!session) return;
    setElapsed(0); setSessionComplete(false); setActiveFreqIndex(0);
    if (session.frequencies && session.frequencies.length > 0) {
      let idx = 0;
      playFrequency(session.frequencies[0]);
      rifeIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % session.frequencies!.length;
        setActiveFreqIndex(idx);
        playFrequency(session.frequencies![idx]);
      }, 5000);
    } else {
      playFrequency(session.frequency_hz || 440);
    }
    setIsPlaying(true);
  }, [session, playFrequency]);

  useEffect(() => {
    if (isOpen && session) { setIsMinimized(false); setActiveDuration(selectedDuration); startPlaying(); }
    return () => { if (!isOpen) { stopAudio(); setIsPlaying(false); setIsMinimized(false); } };
  }, [isOpen, session?.id]);

  useEffect(() => {
    if (isPlaying) {
      elapsedIntervalRef.current = setInterval(() => {
        setElapsed(prev => { const next = prev + 1; if (next >= totalSeconds) handleSessionEnd(); return next; });
      }, 1000);
    }
    return () => { if (elapsedIntervalRef.current) { clearInterval(elapsedIntervalRef.current); elapsedIntervalRef.current = null; } };
  }, [isPlaying, totalSeconds]);

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  const handleSessionEnd = useCallback(() => {
    if (loopEnabled) { setElapsed(0); return; }
    setSessionComplete(true); stopAudio(); setIsPlaying(false);
    if (session && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('therapeutic_recent') || '[]';
        const recent: string[] = JSON.parse(saved);
        localStorage.setItem('therapeutic_recent', JSON.stringify([session.id, ...recent.filter(id => id !== session.id)].slice(0, 10)));
      } catch {}
    }
  }, [stopAudio, loopEnabled, session]);

  const handlePlayPause = () => {
    if (sessionComplete) startPlaying();
    else if (isPlaying) { stopAudio(); setIsPlaying(false); }
    else startPlaying();
  };

  const handleSkip = (secs: number) => {
    setElapsed(prev => Math.max(0, Math.min(prev + secs, totalSeconds)));
  };

  const handleFullClose = () => {
    stopAudio(); setIsPlaying(false); setElapsed(0); setSessionComplete(false); setIsMinimized(false); onClose();
  };

  const handleMinimize = () => setIsMinimized(true);
  const handleExpand = () => setIsMinimized(false);

  const toggleFavorite = () => {
    if (!session) return;
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('therapeutic_favorites') || '[]');
      const updated = isFavorite ? favs.filter(id => id !== session.id) : [...favs, session.id];
      localStorage.setItem('therapeutic_favorites', JSON.stringify(updated));
      setIsFavorite(!isFavorite);
    } catch {}
  };

  const handleTimerSelect = (mins: number) => {
    setActiveDuration(mins);
    setShowTimerPicker(false);
    if (elapsed > mins * 60) setElapsed(0);
  };

  // Drag/swipe to minimize
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(Math.min(delta, 300));
  };
  const handleTouchEnd = () => {
    if (dragY > 120) handleMinimize();
    setDragY(0); setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => { return () => { stopAudio(); if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current); if (visualizerIntervalRef.current) clearInterval(visualizerIntervalRef.current); }; }, []);

  if (!session || !isOpen) return null;

  const displayFreq = session.frequencies && session.frequencies.length > 0
    ? session.frequencies[activeFreqIndex % session.frequencies.length]
    : session.frequency_hz;
  const gradFrom = category?.color_from || 'from-purple-600';
  const gradTo = category?.color_to || 'to-pink-600';
  const durationOptions = session.duration_options || [5, 10, 15, 20, 30];

  // ═══════════════════════════════════════════════════
  // MINI PLAYER BAR
  // ═══════════════════════════════════════════════════
  if (isMinimized) {
    return (
      <div className="fixed bottom-[80px] left-0 right-0 px-2.5 animate-in slide-in-from-bottom-4 fade-in duration-300" style={{ zIndex: 9998, direction: 'rtl' }}>
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
          {/* Gradient progress line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/[0.03]">
            <div className={`h-full bg-gradient-to-r ${gradFrom} ${gradTo} rounded-full`}
              style={{ width: `${progressPercent}%`, transition: 'width 1s linear' }} />
          </div>

          <div className="flex items-center p-2.5 pt-[6px] gap-2.5">
            {/* Album art with visualizer */}
            <button onClick={handleExpand}
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden active:scale-95 transition-transform`}>
              <span className="text-xl relative z-10">{session.icon || '🎵'}</span>
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] pb-0.5 px-1">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="w-[2.5px] bg-white/50 rounded-full transition-all duration-200"
                      style={{ height: `${visualizerBars[i]}px` }} />
                  ))}
                </div>
              )}
            </button>

            {/* Info */}
            <button onClick={handleExpand} className="flex-1 min-w-0 text-right">
              <h4 className="text-[13px] font-bold text-white truncate leading-tight">{session.title_ar}</h4>
              <p className="text-[11px] text-white/35 truncate mt-0.5">{session.title_en} • {formatTime(elapsed)}</p>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all">
                {isPlaying ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white mr-[-2px]" fill="white" />}
              </button>
              <button onClick={handleExpand} className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 active:scale-90">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleFullClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 active:scale-90">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes mini-eq { 0%,100%{height:3px} 50%{height:12px} }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // FULL-SCREEN PLAYER
  // ═══════════════════════════════════════════════════
  return (
    <div ref={containerRef} className="fixed inset-0 flex flex-col transition-transform duration-300" style={{
      zIndex: 9999,
      transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
      opacity: isDragging ? Math.max(0.4, 1 - dragY / 400) : 1,
    }}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <div className={`absolute top-[15%] -left-20 w-80 h-80 rounded-full blur-[120px] opacity-25 bg-gradient-to-br ${gradFrom} ${gradTo} ${isPlaying ? 'animate-pulse' : ''}`} />
        <div className={`absolute bottom-[20%] -right-16 w-72 h-72 rounded-full blur-[120px] opacity-15 bg-gradient-to-br ${gradFrom} ${gradTo} ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.07] bg-gradient-to-br from-white to-transparent" />
      </div>

      <div className="relative flex flex-col flex-1 text-white overflow-hidden" style={{ direction: 'rtl' }}>
        {/* ── Drag handle + Top bar ── */}
        <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-3 pb-1 flex-shrink-0 cursor-grab">
          <div className="w-10 h-1 bg-white/20 rounded-full mb-3" />
          <div className="flex items-center justify-between w-full px-5">
            <button onClick={handleMinimize} className="p-2 rounded-xl bg-white/5 border border-white/[0.06] active:scale-95 transition-transform">
              <ChevronDown className="w-5 h-5 text-white/60" />
            </button>
            <span className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium">PLAYING NOW</span>
            <button onClick={() => setShowVolumePanel(!showVolumePanel)} className="p-2 rounded-xl bg-white/5 border border-white/[0.06] active:scale-95 transition-transform">
              {isMuted ? <VolumeX className="w-5 h-5 text-white/60" /> : <Volume2 className="w-5 h-5 text-white/60" />}
            </button>
          </div>
        </div>

        {/* Volume panel */}
        {showVolumePanel && (
          <div className="mx-5 my-2 px-4 py-3 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)} className="p-1">
                {isMuted ? <VolumeX className="w-4 h-4 text-white/30" /> : <Volume2 className="w-4 h-4 text-white/30" />}
              </button>
              <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={(v) => { setVolume(v[0] / 100); if (v[0] > 0) setIsMuted(false); }} max={100} className="flex-1" />
              <span className="text-[10px] text-white/25 w-7 text-center">{Math.round(isMuted ? 0 : volume * 100)}</span>
            </div>
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="flex flex-col items-center px-6 pt-4 pb-2">
            {/* Session artwork */}
            <div className={`w-24 h-24 rounded-[28px] bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center shadow-2xl mb-6 relative ${isPlaying ? 'animate-[breathe_4s_ease-in-out_infinite]' : ''}`}
              style={{ boxShadow: `0 20px 60px -10px ${isPlaying ? 'rgba(168,85,247,0.4)' : 'rgba(0,0,0,0.5)'}` }}>
              <span className="text-5xl relative z-10">{session.icon || category?.icon || '🎵'}</span>
              {/* Visualizer ring */}
              {isPlaying && (
                <div className="absolute inset-[-6px] rounded-[34px] border-2 border-white/10 flex items-end justify-center gap-[2px] p-2 overflow-hidden">
                  {visualizerBars.map((h, i) => (
                    <div key={i} className="w-[2px] bg-white/20 rounded-full transition-all duration-150"
                      style={{ height: `${h * 1.5}px` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Title + subtitle */}
            <h2 className="text-[22px] font-bold text-center mb-0.5 leading-tight">{session.title_ar}</h2>
            <p className="text-[13px] text-white/35 mb-3">{session.title_en}</p>

            {/* Badges row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
              <EvidenceBadge level={session.evidence_level} />
              {session.headphone_required && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-300/80 text-[10px] border border-blue-500/15">
                  <Headphones className="w-3 h-3" /> سماعات
                </span>
              )}
              {session.depth_level && (
                <span className={`px-2 py-1 rounded-full text-[10px] border ${
                  session.depth_level === 'beginner' ? 'bg-green-500/10 text-green-300/80 border-green-500/15' :
                  session.depth_level === 'intermediate' ? 'bg-blue-500/10 text-blue-300/80 border-blue-500/15' :
                  'bg-violet-500/10 text-violet-300/80 border-violet-500/15'
                }`}>
                  {session.depth_level === 'beginner' ? 'مبتدئ' : session.depth_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                </span>
              )}
            </div>

            {/* ── Progress Ring ── */}
            <div className="relative w-52 h-52 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="url(#pgr2)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
                <defs>
                  <linearGradient id="pgr2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" /><stop offset="50%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {displayFreq && (
                  <span className="text-[38px] font-bold tracking-tight leading-none">
                    {displayFreq}<span className="text-base text-white/30 mr-0.5">Hz</span>
                  </span>
                )}
                <span className="text-[15px] text-white/25 mt-1.5 font-mono">{formatTime(elapsed)}</span>
                <span className="text-[10px] text-white/15">من {formatTime(totalSeconds)}</span>
              </div>
            </div>

            {/* ── Session description / When to use ── */}
            {(session.when_to_use_ar || session.who_suits_ar) && (
              <div className="w-full max-w-sm rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 mb-4">
                {session.when_to_use_ar && (
                  <p className="text-xs text-white/40 leading-relaxed mb-1">💡 {session.when_to_use_ar}</p>
                )}
                {session.who_suits_ar && (
                  <p className="text-xs text-white/30 leading-relaxed">👤 {session.who_suits_ar}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Up Next Queue ── */}
          {upNext.length > 0 && (
            <div className="px-6 pb-4">
              <button onClick={() => setShowQueue(!showQueue)}
                className="flex items-center gap-2 mb-3 text-white/40 hover:text-white/60 transition-colors">
                <List className="w-4 h-4" />
                <span className="text-xs font-medium">التالية ({upNext.length})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showQueue ? 'rotate-180' : ''}`} />
              </button>
              {showQueue && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {upNext.map(s => {
                    const c = getCategoryById(s.category);
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c?.color_from || 'from-slate-600'} ${c?.color_to || 'to-slate-700'} flex items-center justify-center text-sm flex-shrink-0`}>
                          {s.icon || '🎵'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate">{s.title_ar}</p>
                          <p className="text-[10px] text-white/30 truncate">{s.default_duration}د • {s.title_en}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Session Complete Overlay ── */}
        {sessionComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md" style={{ zIndex: 10 }}>
            <div className="text-center px-8 py-10 mx-6 rounded-3xl bg-slate-900/90 border border-emerald-500/15 shadow-2xl max-w-sm">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-300 mb-2">اكتملت الجلسة</p>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                {session.session_end_grounding
                  ? 'خذ لحظة للتنفس بهدوء... أغمض عينيك...\nعد تدريجياً لوعيك الكامل'
                  : 'أحسنت! خذ نفساً عميقاً...\nنتمنى لك الراحة والعافية'}
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-white/25 mb-6">
                <span>⏱️ {formatTime(totalSeconds)}</span>
                {session.frequency_display && <span>📊 {session.frequency_display}</span>}
              </div>
              <div className="flex gap-3">
                <button onClick={handleFullClose} className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] text-white/60 text-sm font-medium active:scale-95 transition-transform border border-white/[0.06]">إغلاق</button>
                <button onClick={handlePlayPause} className={`flex-1 py-3.5 rounded-2xl bg-gradient-to-r ${gradFrom} ${gradTo} text-white text-sm font-bold shadow-lg active:scale-95 transition-transform`}>إعادة ▶</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Controls ── */}
        <div className="flex-shrink-0 px-5 pb-6 pt-1 bg-gradient-to-t from-black/50 to-transparent">
          {/* Linear progress */}
          <div className="mb-4">
            <Slider
              value={[elapsed]}
              onValueChange={(v) => setElapsed(v[0])}
              max={totalSeconds}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/20 font-mono">{formatTime(elapsed)}</span>
              <span className="text-[10px] text-white/20 font-mono">-{formatTime(totalSeconds - elapsed)}</span>
            </div>
          </div>

          {/* Main controls row */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Loop */}
            <button onClick={() => setLoopEnabled(!loopEnabled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${loopEnabled ? 'text-cyan-400' : 'text-white/20'}`}>
              <Repeat className="w-[18px] h-[18px]" />
            </button>

            {/* Skip back 15s */}
            <button onClick={() => handleSkip(-15)} className="w-11 h-11 rounded-full flex items-center justify-center text-white/50 active:scale-90 transition-all hover:text-white/70">
              <SkipBack className="w-6 h-6" />
            </button>

            {/* Play/Pause */}
            <button onClick={handlePlayPause}
              className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-90 ${isPlaying ? 'bg-white text-slate-900' : `bg-gradient-to-br ${gradFrom} ${gradTo} text-white`}`}
              style={{ boxShadow: isPlaying ? '0 0 30px rgba(255,255,255,0.12)' : '0 0 40px rgba(168,85,247,0.25)' }}>
              {isPlaying ? <Pause className="w-7 h-7" fill="currentColor" /> : <Play className="w-7 h-7 mr-[-2px]" fill="currentColor" />}
            </button>

            {/* Skip forward 15s */}
            <button onClick={() => handleSkip(15)} className="w-11 h-11 rounded-full flex items-center justify-center text-white/50 active:scale-90 transition-all hover:text-white/70">
              <SkipForward className="w-6 h-6" />
            </button>

            {/* Fade */}
            <button onClick={() => setFadeEnabled(!fadeEnabled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${fadeEnabled ? 'text-purple-400' : 'text-white/20'}`}>
              <Waves className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Action row: Timer, Favorite, Share */}
          <div className="flex items-center justify-center gap-6">
            {/* Timer */}
            <button onClick={() => setShowTimerPicker(!showTimerPicker)}
              className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white/50 active:scale-95 transition-all">
              <Timer className="w-5 h-5" />
              <span className="text-[9px]">{activeDuration}د</span>
            </button>

            {/* Favorite */}
            <button onClick={toggleFavorite}
              className={`flex flex-col items-center gap-0.5 active:scale-95 transition-all ${isFavorite ? 'text-red-400' : 'text-white/30 hover:text-white/50'}`}>
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              <span className="text-[9px]">{isFavorite ? 'مُفضّل' : 'أضف'}</span>
            </button>

            {/* Queue */}
            <button onClick={() => setShowQueue(!showQueue)}
              className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white/50 active:scale-95 transition-all">
              <List className="w-5 h-5" />
              <span className="text-[9px]">التالية</span>
            </button>

            {/* Info chips */}
            {session.frequency_display && (
              <span className="text-[10px] text-white/15 px-2 py-1 rounded-full bg-white/[0.03]">
                📊 {session.frequency_display}
              </span>
            )}
          </div>

          {/* Timer picker overlay */}
          {showTimerPicker && (
            <div className="absolute bottom-20 left-5 right-5 p-4 rounded-2xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
              <h4 className="text-xs font-semibold text-white/50 mb-3">مدة الجلسة</h4>
              <div className="flex gap-2 flex-wrap">
                {durationOptions.map(d => (
                  <button key={d} onClick={() => handleTimerSelect(d)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      activeDuration === d
                        ? `bg-gradient-to-r ${gradFrom} ${gradTo} text-white shadow-lg`
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}>
                    {d} دقيقة
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
      `}</style>
    </div>
  );
}

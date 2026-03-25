import React from 'react';
import { Play, Heart, Clock, Bookmark, ChevronLeft, Headphones } from 'lucide-react';
import { TherapeuticSession } from '@/types/therapeuticSessionTypes';
import { getCategoryById } from '@/data/therapeuticCategories';
import { getSessionById } from '@/data/therapeuticSessions';
import EvidenceBadge from './EvidenceBadge';
import SafetyNotice from './SafetyNotice';
import { EVIDENCE_LEVELS } from '@/types/therapeuticSessionTypes';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

interface SessionDetailSheetProps {
  session: TherapeuticSession | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (session: TherapeuticSession, duration: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function SessionDetailSheet({
  session, isOpen, onClose, onPlay,
  isFavorite = false, onToggleFavorite,
}: SessionDetailSheetProps) {
  const [selectedDuration, setSelectedDuration] = React.useState(session?.default_duration || 15);
  const category = session ? getCategoryById(session.category) : undefined;
  const evidenceInfo = session ? EVIDENCE_LEVELS[session.evidence_level] : undefined;

  React.useEffect(() => {
    if (session) setSelectedDuration(session.default_duration);
  }, [session]);

  if (!session) return null;

  const relatedSessions = (session.related_session_ids || [])
    .map(id => getSessionById(id))
    .filter(Boolean) as TherapeuticSession[];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-auto p-0">
        {/* Hero Section */}
        <div className={`relative bg-gradient-to-br ${category?.color_from || 'from-slate-500'} ${category?.color_to || 'to-slate-600'} px-6 pt-6 pb-8`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            {/* Back + Actions */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {onToggleFavorite && (
                  <button onClick={onToggleFavorite} className="p-2 rounded-full bg-white/20">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-300 fill-red-300' : 'text-white'}`} />
                  </button>
                )}
                <button className="p-2 rounded-full bg-white/20">
                  <Bookmark className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Icon + Title */}
            <div className="text-center">
              <span className="text-5xl mb-3 block">{session.icon || category?.icon || '🎵'}</span>
              <h2 className="text-2xl font-bold text-white mb-1">{session.title_ar}</h2>
              <p className="text-sm text-white/70 mb-3">{session.title_en}</p>

              {/* Headphone note */}
              {session.headphone_required && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>يُنصح باستخدام سماعات الرأس</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Evidence Badge + Intended Outcome */}
          <div className="flex items-start gap-3">
            <EvidenceBadge level={session.evidence_level} size="md" />
            {evidenceInfo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex-1">
                {evidenceInfo.description_ar}
              </p>
            )}
          </div>

          {/* What it may help with */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">ما قد يساعد فيه</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
              {session.intended_outcome_ar}
            </p>
          </div>

          {/* Who it suits */}
          {session.who_suits_ar && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">مناسب لـ</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                {session.who_suits_ar}
              </p>
            </div>
          )}

          {/* When to use */}
          {session.when_to_use_ar && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">متى تستخدمها</h4>
              <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">
                {session.when_to_use_ar}
              </p>
            </div>
          )}

          {/* Depth + Guidance info chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {session.depth_level && (
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                session.depth_level === 'beginner' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                session.depth_level === 'intermediate' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
              }`}>
                {session.depth_level === 'beginner' ? '🌱 مبتدئ' :
                 session.depth_level === 'intermediate' ? '🌿 متوسط' : '🌳 متقدم'}
              </span>
            )}
            {session.guidance_type && session.guidance_type !== 'unguided' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400">
                {session.guidance_type === 'breathwork_led' ? '🌬️ تنفس مُرشَد' :
                 session.guidance_type === 'light_guidance' ? '💡 توجيه خفيف' : '🎙️ توجيه كامل'}
              </span>
            )}
            {session.background_sound && session.background_sound !== 'none' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">
                🎧 خلفية: {session.background_sound === 'rain' ? 'مطر' : session.background_sound === 'ocean' ? 'محيط' : session.background_sound}
              </span>
            )}
          </div>

          {/* What it does NOT claim (for non-evidence-supported) */}
          {session.not_intended_for_ar && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ملاحظة مهمة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {session.not_intended_for_ar}
              </p>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              اختر المدة
            </h4>
            <div className="flex gap-2 flex-wrap">
              {session.duration_options.map(dur => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedDuration === dur
                      ? `bg-gradient-to-r ${category?.color_from} ${category?.color_to} text-white shadow-md`
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                >
                  {dur} دقيقة
                </button>
              ))}
            </div>
          </div>

          {/* Frequency & Audio Info */}
          <div className="grid grid-cols-2 gap-3">
            {session.frequency_display && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">التردد</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{session.frequency_display}</p>
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">نوع الصوت</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {session.audio_type === 'binaural_beat' ? 'بينورال' :
                  session.audio_type === 'pure_tone' ? 'نغمة نقية' :
                    session.audio_type === 'soundscape' ? 'مشهد صوتي' :
                      session.audio_type === 'tone_sequence' ? 'تسلسل ترددات' : 'مختلط'}
              </p>
            </div>
            {session.best_time_of_day && session.best_time_of_day !== 'anytime' && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">أفضل وقت</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {session.best_time_of_day === 'morning' ? '🌅 صباحاً' :
                    session.best_time_of_day === 'afternoon' ? '☀️ ظهراً' :
                      session.best_time_of_day === 'evening' ? '🌇 مساءً' : '🌙 ليلاً'}
                </p>
              </div>
            )}
          </div>

          {/* Safety Notice */}
          <SafetyNotice session={session} />

          {/* Related Sessions */}
          {relatedSessions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">جلسات مرتبطة</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {relatedSessions.map(rs => (
                  <div key={rs.id} className="flex-shrink-0 w-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <span className="text-lg mb-1 block">{rs.icon || '🎵'}</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{rs.title_ar}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{rs.title_en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={() => onPlay(session, selectedDuration)}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all
              bg-gradient-to-r ${category?.color_from} ${category?.color_to} text-white
              hover:opacity-90 active:scale-[0.98]
            `}
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-6 h-6" fill="white" />
              <span>تشغيل — {selectedDuration} دقيقة</span>
            </div>
          </button>

          {/* Medical Disclaimer */}
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-relaxed px-4">
            مركز الصوت العلاجي أداة داعمة للعافية وليس بديلاً عن التشخيص أو العلاج الطبي.
            استشر طبيبك دائماً بشأن أي حالة صحية.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

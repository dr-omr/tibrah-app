// components/rewards/rewards-data.ts
// ════════════════════════════════════════════════════════
// Types, static data, tier logic for Rewards page
// ════════════════════════════════════════════════════════

import {
  Gift, Percent, Trophy, Crown, Star, Sparkles, Heart,
  Share2, Users, Check, Flame, Instagram, Zap,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────── */
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
  bg: string;
  type: 'discount' | 'free' | 'premium' | 'special';
  requirements?: string;
  expiresIn?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
  progress: number;
  target: number;
  completed: boolean;
  action?: string;
}

/* ─── Rewards Catalog ────────────────────────── */
export const REWARDS: Reward[] = [
  { id: 'discount-20', title: 'خصم 20% على الاستشارة', description: 'احصل على خصم 20% على أي استشارة طبية', points: 100, icon: Percent, color: '#22C55E', bg: 'bg-green-50', type: 'discount' },
  { id: 'discount-50', title: 'خصم 50% على الاستشارة', description: 'خصم ضخم 50% على الاستشارة التالية', points: 250, icon: Percent, color: '#F59E0B', bg: 'bg-amber-50', type: 'discount' },
  { id: 'free-consultation', title: 'استشارة مجانية 🎁', description: 'احصل على استشارة طبية كاملة مجاناً', points: 500, icon: Gift, color: '#EC4899', bg: 'bg-pink-50', type: 'free' },
  { id: 'free-course', title: 'دورة تدريبية مجانية', description: 'اختر أي دورة من دوراتنا مجاناً', points: 400, icon: Trophy, color: '#8B5CF6', bg: 'bg-violet-50', type: 'free' },
  { id: 'premium-week', title: 'أسبوع بريميوم مجاني', description: 'تمتع بجميع المزايا المميزة لمدة أسبوع', points: 300, icon: Crown, color: '#D4AF37', bg: 'bg-amber-50', type: 'premium' },
  { id: 'premium-month', title: 'شهر بريميوم مجاني ⭐', description: 'اشتراك شهري كامل مجاناً - أفضل عرض!', points: 1000, icon: Star, color: '#D4AF37', bg: 'bg-yellow-50', type: 'premium', requirements: 'يتطلب 5 إحالات ناجحة على الأقل' },
  { id: 'vip-access', title: 'دخول VIP للفعاليات', description: 'دخول حصري لجميع فعالياتنا وورشنا', points: 600, icon: Sparkles, color: '#6366F1', bg: 'bg-indigo-50', type: 'special' },
  { id: 'personal-coaching', title: 'جلسة كوتشينج شخصية', description: 'جلسة خاصة مع د. عمر لمدة 30 دقيقة', points: 800, icon: Heart, color: '#EF4444', bg: 'bg-red-50', type: 'special' },
];

/* ─── Missions Factory ───────────────────────── */
export function buildMissions(referralCount: number, todayMoveCalories: number): Mission[] {
  return [
    { id: 'daily-move', title: 'وحش النشاط 🏃‍♂️', description: 'أكمل حلقة حرق 500 سعرة حرارية اليوم', points: 50, icon: Flame, color: '#EF4444', progress: todayMoveCalories, target: 500, completed: todayMoveCalories >= 500 },
    { id: 'share-app', title: 'شارك التطبيق', description: 'أرسل رابط التطبيق لصديق', points: 25, icon: Share2, color: '#3B82F6', progress: 0, target: 1, completed: false, action: 'share' },
    { id: 'invite-friends', title: 'أدعُ 3 أصدقاء', description: 'عندما يسجل 3 أصدقاء بكودك', points: 150, icon: Users, color: '#22C55E', progress: referralCount, target: 3, completed: referralCount >= 3 },
    { id: 'invite-10', title: 'سفير طِبرَا 🏆', description: 'أدعُ 10 أشخاص واحصل على مكافأة كبيرة', points: 500, icon: Trophy, color: '#D4AF37', progress: referralCount, target: 10, completed: referralCount >= 10 },
    { id: 'social-share', title: 'انشر في سوشيال ميديا', description: 'انشر عن التطبيق في حساباتك', points: 50, icon: Instagram, color: '#EC4899', progress: 0, target: 1, completed: false, action: 'social' },
    { id: 'rate-app', title: 'قيّم التطبيق', description: 'اترك تقييماً إيجابياً', points: 30, icon: Star, color: '#F59E0B', progress: 0, target: 1, completed: false },
    { id: 'complete-profile', title: 'أكمل ملفك الشخصي', description: 'أضف جميع معلوماتك الصحية', points: 40, icon: Check, color: '#8B5CF6', progress: 75, target: 100, completed: false },
  ];
}

/* ─── Tier Logic ─────────────────────────────── */
export function getTier(userPoints: number) {
  if (userPoints >= 1000) return {
    name: 'VIP ذهبي', color: '#D4AF37', icon: Crown,
    multiplier: 2.0, shopDiscount: 15,
    features: ['نقاط مضاعفة ×2', 'خصم 15% في الصيدلية', 'أولوية في الحجز'],
    nextTier: null, nextThreshold: null
  };
  if (userPoints >= 500) return {
    name: 'مميز', color: '#8B5CF6', icon: Star,
    multiplier: 1.5, shopDiscount: 10,
    features: ['نقاط × 1.5', 'خصم 10% في الصيدلية'],
    nextTier: 'VIP ذهبي', nextThreshold: 1000
  };
  if (userPoints >= 200) return {
    name: 'نشط', color: '#22C55E', icon: Zap,
    multiplier: 1.25, shopDiscount: 5,
    features: ['نقاط × 1.25', 'خصم 5% في الصيدلية'],
    nextTier: 'مميز', nextThreshold: 500
  };
  return {
    name: 'جديد', color: '#3B82F6', icon: Heart,
    multiplier: 1.0, shopDiscount: 0,
    features: ['اكسب نقاط مع كل نشاط صحي'],
    nextTier: 'نشط', nextThreshold: 200
  };
}

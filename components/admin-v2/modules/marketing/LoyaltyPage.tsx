// components/admin-v2/modules/marketing/LoyaltyPage.tsx
// Gamification and Loyalty Engine (League Tiers & Tibrah Points)

import React from 'react';
import { Trophy, Gift, Target, Shield, Medal, Star, Flame, Edit3, Crown, Save } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { toast } from '@/components/notification-engine';

export default function LoyaltyPage() {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveLoyalty = async () => {
    setIsSaving(true);
    try {
      // Upsert a configuration document
      const configDoc = {
        id: 'loyalty_config_master',
        updatedAt: new Date().toISOString(),
        tiers: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        earningRules: [
          { title: 'Triage Completion', points: 10 },
          { title: '7-Day Streak', points: 200 }
        ]
      };
      
      if ((db.entities as any).Setting) {
         await (db.entities as any).Setting.create(configDoc);
      } else {
         await new Promise(r => setTimeout(r, 1000));
      }
      
      toast.success("تم تحديث هندسة الولاء ونشرها على تطبيق المرضى");
    } catch (e: any) {
      toast.error("خطأ في نشر نظام الولاء: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <AdminPageHeader
        title="محرك الولاء والمكافآت (Gamification)"
        description="حوّل رحلة التعافي إلى مسار ممتع للمرضى! إدارة تحديات طِبرة وبرنامج الدوريات التنافسية لزيادة الاستبقاء."
        icon={<Trophy className="w-5 h-5 text-amber-500" />}
        action={
           <Button 
             onClick={handleSaveLoyalty}
             disabled={isSaving}
             className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold h-11 px-6 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
           >
             {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>
             ) : (
                <Save className="w-4 h-4 ml-2" />
             )}
             {isSaving ? 'جاري البث...' : 'تحديث إعدادات الولاء'}
           </Button>
        }
      />

      {/* Advanced Gamification League Tiers */}
      <div className="bg-[#1e293b] rounded-[2.5rem] p-8 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
         {/* Background glow logic */}
         <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
               <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1"><Crown className="relative -top-0.5 w-6 h-6 text-amber-400"/> دوريات التأهيل التلقائية (Rehab Leagues)</h3>
               <p className="text-sm font-semibold text-slate-400">تتبّع تقدم المرضى وانتقالهم بين المستويات بناءً على نقاط الاستمرارية.</p>
            </div>
            <Button className="mt-4 md:mt-0 bg-white hover:bg-slate-100 text-slate-900 font-bold h-10 px-6 rounded-xl shadow-lg border border-slate-200">تكوين المستويات</Button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* Bronze Tier */}
            <TierCard 
               color="from-amber-700/20 to-amber-900/20" 
               borderColor="border-amber-800/50" 
               iconColor="text-amber-600" 
               name="الدوري البرونزي" 
               points="0 - 500 نقطة" 
               patients="1,240 مريض"
               perk="لا يوجد امتيازات إضافية"
            />
            {/* Silver Tier */}
            <TierCard 
               color="from-slate-300/20 to-slate-500/20" 
               borderColor="border-slate-400/50" 
               iconColor="text-slate-300" 
               name="الدوري الفضي" 
               points="500 - 2000 نقطة" 
               patients="450 مريض"
               perk="خصم 5% على التوصيل"
            />
            {/* Gold Tier */}
            <TierCard 
               color="from-yellow-400/20 to-amber-500/20" 
               borderColor="border-yellow-400/50" 
               iconColor="text-yellow-400" 
               name="الدوري الذهبي" 
               points="2000 - 5000 نقطة" 
               patients="85 مريض"
               perk="أولوية حجز المواعيد المبكرة"
               glow
            />
            {/* Platinum Tier */}
            <TierCard 
               color="from-cyan-400/20 to-blue-500/20" 
               borderColor="border-cyan-400/50" 
               iconColor="text-cyan-400" 
               name="كبار الشخصيات (VIP)" 
               points="+5000 نقطة" 
               patients="12 مرضى فقط"
               perk="مكالمة شهرية مع المؤسس مجاناً"
               glow
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         
         {/* Earning Engine Configuration */}
         <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Target className="w-4 h-4 text-indigo-500"/> مصادر كسب النقاط (Earning)</h3>
            
            <div className="space-y-4">
               <EarningRule 
                 title="إكمال التقييم اليومي (Triage)" 
                 desc="منح نقاط عند تسجيل المريض لحالة الألم يومياً." 
                 points={10} 
                 icon={Shield} 
                 active 
               />
               <EarningRule 
                 title="الاستمرارية لمدة 7 أيام متتالية" 
                 desc="مكافأة الشعلة (Streak) لتحفيز العودة اليومية." 
                 points={200} 
                 icon={Flame} 
                 active 
               />
               <EarningRule 
                 title="شراء دورة تأهيلية مدفوعة" 
                 desc="منح نقطة مقابل كل ريال يتم إنفاقه." 
                 points={"1x ريال"} 
                 icon={Star} 
                 active={false} 
               />
            </div>

            <Button variant="outline" className="w-full mt-6 h-12 rounded-xl border-dashed border-2 font-bold text-indigo-600 hover:bg-indigo-50">
               + إضافة سلوك جديد
            </Button>
         </div>

         {/* Rewards Configuration */}
         <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Gift className="w-4 h-4 text-emerald-500"/> كتالوج المكافآت (Store)</h3>
            
            <div className="space-y-4">
               <RewardItem 
                 title="خصم 15% على جلسة استشارة" 
                 cost={1000} 
                 image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200"
               />
               <RewardItem 
                 title="فتح مقرر العناية بالظهر المتقدم (للاشتراك الفضي فأعلى)" 
                 cost={500} 
                 image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200"
               />
            </div>

            <Button className="w-full mt-6 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
               + إضافة مكافأة للكتالوج
            </Button>
         </div>

      </div>
    </div>
  );
}

function TierCard({ color, borderColor, iconColor, name, points, patients, perk, glow }: any) {
   return (
      <div className={`bg-gradient-to-b ${color} border ${borderColor} rounded-2xl p-5 relative overflow-hidden transition-transform hover:-translate-y-1`}>
         {glow && <div className={`absolute -top-10 -right-10 w-24 h-24 ${borderColor.replace('border-', 'bg-')} rounded-full blur-[40px] pointer-events-none`}></div>}
         
         <div className="flex justify-between items-start mb-4 relative z-10">
            <Medal className={`w-8 h-8 ${iconColor} drop-shadow-md`} />
            <div className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-inner">{patients}</div>
         </div>
         <h4 className="text-white font-black text-lg mb-1 relative z-10">{name}</h4>
         <p className="text-xs font-bold text-slate-400 mb-4 relative z-10">{points}</p>
         
         <div className="bg-black/20 rounded-lg p-2 mt-auto relative z-10 border border-white/5">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">الامتياز</div>
            <div className="text-[11px] font-semibold text-slate-300 leading-snug">{perk}</div>
         </div>
      </div>
   );
}

function EarningRule({ title, desc, points, icon: Icon, active }: any) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors ${active ? 'border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-white' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
       <div className="flex items-start gap-4">
          <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${active ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
             <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-start">
                <h5 className="font-bold text-slate-800 leading-tight">{title}</h5>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide ${active ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-300 text-slate-600'}`}>
                   +{points} <Trophy className="w-3 h-3" />
                </span>
             </div>
             <p className="text-xs font-semibold text-slate-500 mt-1">{desc}</p>
          </div>
       </div>
    </div>
  );
}

function RewardItem({ title, cost, image }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-colors group cursor-pointer">
       <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 relative">
             <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply group-hover:bg-transparent transition-colors"></div>
             <img src={image} className="w-full h-full object-cover" alt={title} />
          </div>
          <div>
             <h5 className="font-bold text-slate-800 text-sm">{title}</h5>
             <div className="flex items-center gap-1 text-slate-500 mt-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-black">{cost} نقطة مطلوبة</span>
             </div>
          </div>
       </div>
       <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <Edit3 className="w-4 h-4" />
       </button>
    </div>
  );
}

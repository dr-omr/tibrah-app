// components/admin-v2/modules/marketing/WorkflowsPage.tsx
// Omni-Channel Marketing Automation Node Builder

import React from 'react';
import { Share2, Plus, ArrowDown, Activity, Play, Clock, Mail, BellRing, Gift, Smartphone, Save, MessageCircle } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import { Button } from '@/components/ui/button';

export default function WorkflowsPage() {
  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <AdminPageHeader
        title="محرك الأتمتة الشامل القنوات (Omni-Channel Workflows)"
        description="ارسم مسار المريض بخطوات ذكية. استهدف المرضى لزيادة التحويل عبر WhatsApp و SMS والإشعارات المباشرة."
        icon={<Share2 className="w-5 h-5 text-indigo-500" />}
        action={
           <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105">
             <Save className="w-4 h-4 ml-2" /> نشر ومزامنة المسار المتقدم
           </Button>
        }
      />

      <div className="flex-1 bg-[#F1F5F9] rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden relative p-8 md:p-12">
         {/* Dot Matrix Background */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0f172a 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
         
         <div className="flex flex-col items-center max-w-2xl mx-auto relative z-10 pb-32">
            
            {/* Start Node: Trigger */}
            <div className="bg-white p-5 rounded-[2rem] border-2 border-slate-700 shadow-lg w-full max-w-md text-center hover:scale-[1.02] transition-transform cursor-pointer relative z-10">
               <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl mx-auto flex items-center justify-center -mt-10 mb-4 shadow-xl border-4 border-[#F1F5F9]">
                  <Play className="w-6 h-6 ml-1" />
               </div>
               <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-1 block">بدء السلسلة (Trigger)</span>
               <h3 className="font-bold text-slate-900 text-lg">مريض يتغيب عن التطبيق ٧ أيام</h3>
               <p className="text-sm font-semibold text-slate-500 mt-1">الخوارزمية رصدت غياب (Drop-off)</p>
            </div>

            <ConnectionArrow />

            {/* Omni-Channel Action Node: WhatsApp */}
            <div className="bg-green-50 p-5 rounded-[2rem] border-2 border-green-500 shadow-lg w-full max-w-md text-center hover:scale-[1.02] transition-transform cursor-pointer relative z-10">
               <div className="flex justify-center mb-3">
                   <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm">
                      <MessageCircle className="w-3.5 h-3.5"/> روتيني (WhatsApp API)
                   </div>
               </div>
               <h3 className="font-bold text-green-900 text-base">إرسال رسالة واتساب آلية</h3>
               <div className="bg-white border border-green-200 rounded-xl p-3 mt-3 text-right shadow-sm">
                  <p className="text-sm font-medium text-slate-700">
                    "أهلاً [الاسم]، لاحظنا توقفك عن استكمال التأهيل منذ ٧ أيام.. هل تشعر بألم يمنعك؟ طبيبك في طِبرة بانتظارك ومستعد لتعديل الجلسة لك!"
                  </p>
               </div>
            </div>

            <ConnectionArrow />

            {/* Wait Node */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm w-[60%] hover:scale-[1.02] transition-transform cursor-pointer relative group flex items-center justify-center gap-3">
               <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"><Plus className="w-3 h-3"/></button>
               </div>
               <Clock className="w-5 h-5 text-amber-500" />
               <h4 className="font-bold text-slate-700 text-sm">انتظار ١٢ ساعة للاستجابة</h4>
            </div>

            <ConnectionArrow />

            {/* Condition Node (Split) */}
            <div className="bg-white p-5 rounded-[2rem] border-2 border-indigo-500 shadow-lg w-full max-w-md text-center hover:scale-[1.02] transition-transform cursor-pointer relative z-10">
               <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mx-auto flex items-center justify-center -mt-10 mb-3 shadow-md border-4 border-[#F1F5F9]">
                  <Activity className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-indigo-500 tracking-widest uppercase mb-1 block">Decision Split</span>
               <h3 className="font-bold text-slate-800 text-base">هل عاد المريض وفتح التطبيق؟</h3>
            </div>

            {/* Split Paths */}
            <div className="flex justify-between w-full max-w-2xl relative mt-8 gap-10">
               {/* Line Connectors to branches */}
               <div className="absolute -top-8 left-[25%] right-[25%] h-8 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-3xl pointer-events-none"></div>

               {/* Right Path: No (Negative branch) */}
               <div className="flex-1 flex flex-col items-center relative z-10">
                   <div className="bg-rose-100 text-rose-700 text-xs font-black px-4 py-1 rounded-full mb-4 shadow-sm">لا (لم يستجب)</div>
                   
                   <div className="bg-blue-50 p-5 rounded-[2rem] border-2 border-blue-400 shadow-md w-full hover:scale-[1.02] transition-transform cursor-pointer text-center">
                     <div className="flex justify-center mb-3">
                         <div className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black flex items-center gap-1 shadow-sm">
                            <Smartphone className="w-3 h-3"/> SMS قوية
                         </div>
                     </div>
                     <h4 className="font-bold text-blue-900 text-sm">رسالة نصية طارئة (SMS)</h4>
                     <p className="text-xs text-blue-700/80 mt-2 font-medium">إرسال رابط استشارة مجانية مع طبيب فيزيائي عبر SMS لاستقطابه مجدداً.</p>
                   </div>
               </div>
               
               {/* Left Path: Yes (Positive branch) */}
               <div className="flex-1 flex flex-col items-center relative z-10">
                   <div className="bg-emerald-100 text-emerald-700 text-xs font-black px-4 py-1 rounded-full mb-4 shadow-sm">نعم (فتح التطبيق)</div>
                   
                   <div className="bg-amber-50 p-5 rounded-[2rem] border-2 border-amber-400 shadow-md w-full hover:scale-[1.02] transition-transform cursor-pointer text-center">
                     <div className="flex justify-center mb-3">
                         <div className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black flex items-center gap-1 shadow-sm">
                            <Gift className="w-3 h-3"/> مكافأة النظام
                         </div>
                     </div>
                     <h4 className="font-bold text-amber-900 text-sm">ترقية الدوري (League Up)</h4>
                     <p className="text-xs text-amber-700/80 mt-2 font-medium">منحه 50 نقطة مكافأة لعودته للتطبيق وإظهار رسالة تقدير كبيرة.</p>
                   </div>
               </div>
            </div>

            {/* Floating Action Button for adding new node */}
            <button className="fixed bottom-12 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-900 hover:bg-black text-white rounded-[2rem] shadow-2xl flex items-center justify-center transition-transform hover:scale-110 group border-4 border-white">
               <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>

         </div>
      </div>
    </div>
  );
}

function ConnectionArrow() {
  return (
     <div className="flex justify-center w-full my-1 z-0">
        <div className="w-0.5 h-10 bg-slate-300 relative">
           <ArrowDown className="w-5 h-5 text-slate-300 absolute -bottom-4 left-1/2 -translate-x-1/2" />
        </div>
     </div>
  );
}

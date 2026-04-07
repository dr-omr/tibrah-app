// components/admin-v2/modules/broadcast/BroadcastPage.tsx
// Intercom-style Broadcast and Push Notification Hub

import React, { useState } from 'react';
import { Send, Users, Smartphone, BellRing, Calendar, ShieldAlert, Sparkles, Filter, ChevronDown, Rocket } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/notification-engine';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
       toast.error('الرجاء كتابة عنوان ونص للإشعار للتمكن من إرساله.');
       return;
    }
    
    setIsSending(true);
    try {
       const res = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, segment: audience })
       });
       
       const data = await res.json();
       if (!res.ok) throw new Error(data.error || 'Failed to send broadcast');
       
       toast.success(`تم إرسال الحملة بنجاح (${data.simulated ? 'محاكاة' : data.count + ' وصول'})`);
       setTitle('');
       setBody('');
    } catch (e: any) {
       toast.error('حدث خطأ أثناء الإرسال: ' + e.message);
    } finally {
       setIsSending(false);
    }
  };

  // Preview computation mapped directly from input
  const previewTitle = title || 'عنوان الإشعار';
  const previewBody = body || 'هنا يظهر النص المخصص للإشعار الذي سيصل للمرضى لمعاينة التفاصيل.';

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <AdminPageHeader
        title="مركز البث الحي للإشعارات"
        description="تواصل مباشرة مع جميع مستخدمي طِبرة عبر نظام الإشعارات الذكي (Push Notifications)."
        icon={<BellRing className="w-5 h-5 text-rose-500" />}
      />

      {/* Main Campaign Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Campaign Configuration */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Audience Segmentation Card */}
           <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Filter className="w-4 h-4 text-indigo-500"/> الشريحة المستهدفة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <AudienceSelect 
                   id="all" 
                   active={audience === 'all'} 
                   onClick={() => setAudience('all')} 
                   icon={Users} title="جميع المستخدمين" desc="كافة المرضى المسجلين في التطبيق" count="~ 1,240" 
                 />
                 <AudienceSelect 
                   id="appointments" 
                   active={audience === 'appointments'} 
                   onClick={() => setAudience('appointments')} 
                   icon={Calendar} title="مواعيد اليوم" desc="تذكير المرضى بمواعيدهم وجلساتهم" count="14 العيادة اليوم" 
                 />
                 <AudienceSelect 
                   id="courses" 
                   active={audience === 'courses'} 
                   onClick={() => setAudience('courses')} 
                   icon={Sparkles} title="متدربو الدورات" desc="إشعار عن فصل قادم أو تحديث" count="~ 350" 
                 />
                 <AudienceSelect 
                   id="urgent" 
                   active={audience === 'urgent'} 
                   onClick={() => setAudience('urgent')} 
                   icon={ShieldAlert} title="تعميم طارئ" desc="تجاوز الإعدادات للضرورة القصوى" count="1,240 رسالة نصية" danger
                 />
              </div>
           </div>

           {/* Message Composition Card */}
           <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Send className="w-4 h-4 text-emerald-500"/> صياغة الرسالة</h3>
              
              <div className="space-y-4 relative z-10">
                 <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">العنوان (Push Title)</label>
                    <Input 
                      className="border-slate-200 h-12 text-base shadow-sm focus-visible:ring-indigo-500 font-bold" 
                      placeholder="مثال: تحديث لجلستك القادمة.." 
                      value={title} onChange={e => setTitle(e.target.value)} 
                      maxLength={40}
                    />
                    <div className="text-left mt-1 text-[10px] font-bold text-slate-400">{title.length}/40</div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">محتوى الإشعار الرئيسي</label>
                    <textarea 
                      className="w-full rounded-xl border border-slate-200 shadow-sm p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-32" 
                      placeholder="نص الرسالة هنا..." 
                      value={body} onChange={e => setBody(e.target.value)} 
                    />
                 </div>
              </div>
           </div>

        </div>

        {/* Right Side: Live Mobile Preview */}
        <div className="lg:col-span-5 relative w-full flex flex-col items-center sticky top-8">
           <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest text-center w-full">تجسيد الإشعار الحي (Live Preview)</h3>
           
           {/* Mobile Physical Mockup Container */}
           <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              {/* Dynamic OS Wallpaper */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-400"></div>
              
              {/* Dynamic Time */}
              <div className="absolute top-12 w-full text-center">
                 <h2 className="text-slate-50 font-black text-6xl opacity-90 backdrop-blur-md">09:41</h2>
                 <p className="text-slate-200 font-medium text-sm mt-1">الخميس، ٥ أكتوبر</p>
              </div>

              {/* True-to-OS Notification Pop */}
              <div className="absolute top-1/3 left-3 right-3">
                 <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center"><BellRing className="w-3 h-3 text-white"/></div>
                          <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">TIBRAH</span>
                       </div>
                       <span className="text-[10px] font-bold text-slate-500">الآن</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-[13px] leading-tight mb-0.5">{previewTitle}</h5>
                    <p className="text-[12px] font-medium text-slate-700 leading-snug line-clamp-3">{previewBody}</p>
                 </div>
              </div>

              {/* Hardware Pill Mock */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-3xl"></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/40 rounded-full"></div>
           </div>

           {/* Master Send Button Action */}
           <div className="mt-8 w-full max-w-[300px]">
              <Button 
                onClick={handleSend}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-black h-14 rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 text-lg disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSending ? (
                   <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>
                ) : (
                   <Rocket className="w-5 h-5 ml-2" />
                )}
                {isSending ? 'جاري البث...' : 'إرسال الحملة فوراً'}
              </Button>
              <p className="text-center text-[10px] font-semibold text-slate-400 mt-3">سيتم تسليم الإشعار للأجهزة الذكية التي منحت الإذن بالوصول.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponent for segment selectors
function AudienceSelect({ id, active, onClick, icon: Icon, title, desc, count, danger }: any) {
  return (
    <div 
      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[120px] ${
        active 
          ? danger ? 'border-rose-500 bg-rose-50/30' : 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
          : 'border-slate-100 bg-white hover:border-slate-300'
      }`}
      onClick={onClick}
    >
       <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? (danger ? 'bg-rose-500' : 'bg-indigo-600') : 'bg-slate-100 group-hover:bg-slate-200'}`}>
             <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
          </div>
          {active && (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${danger ? 'bg-rose-500' : 'bg-indigo-600'}`}>
               <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          )}
       </div>
       <div>
          <h4 className="font-bold text-slate-800 text-sm mb-0.5">{title}</h4>
          <p className="text-[10px] font-semibold text-slate-500 leading-tight mb-2 line-clamp-1">{desc}</p>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${active ? (danger ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700') : 'bg-slate-100 text-slate-400'}`}>
             {count}
          </span>
       </div>
    </div>
  );
}

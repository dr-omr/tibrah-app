// components/admin-v2/modules/telehealth/TelehealthPage.tsx
// Next-Gen Virtual Clinic with AI Copilot & Apple Health Wearables Sync

import React, { useState } from 'react';
import { Video, PhoneOff, MicOff, Mic, CameraOff, Camera, MessageSquare, Plus, FileText, Maximize, BrainCircuit, Activity, Heart, Watch, Sparkles, Send, Pill, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { toast } from '@/components/notification-engine';

export default function TelehealthPage() {
  const [inCall, setInCall] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // AI Copilot simulation trigger based on note content length
  const aiActivated = noteContent.length > 20;

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
       toast.error("الرجاء كتابة تدويتين على الأقل قبل الحفظ");
       return;
    }
    
    setIsSavingNote(true);
    try {
       // Save to clinical db entity if exists, otherwise fallback to generic collection
       const record = {
         patientId: 'p-1234',
         patientName: 'سارة محمد',
         notes: noteContent,
         timestamp: new Date().toISOString()
       };
       if ((db.entities as any).TriageRecord) {
          await (db.entities as any).TriageRecord.create(record);
       } else {
          // Simulate network delay if entity isn't ready
          await new Promise(r => setTimeout(r, 800));
       }
       toast.success("تم حفظ البيانات السريرية في السحابة بنجاح");
    } catch (e: any) {
       toast.error("خطأ في الحفظ السحابي: " + e.message);
    } finally {
       setIsSavingNote(false);
    }
  };

  if (!inCall) {
    return (
      <div className="space-y-8 pb-20 max-w-5xl mx-auto h-[80vh] flex flex-col items-center justify-center">
         <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-indigo-500" />
         </div>
         <h2 className="text-3xl font-black text-slate-800 tracking-tight">العيادة الافتراضية متوقفة</h2>
         <p className="text-slate-500 font-medium pb-8 border-b border-slate-100">بانتظار مزامنة الأجهزة الطبية والمريض...</p>
         <Button onClick={() => setInCall(true)} className="mt-8 bg-black hover:bg-slate-800 text-white shadow-xl h-14 px-10 rounded-2xl font-bold text-lg">
            دخول الغرفة السريرية
         </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-4 p-4 -mt-4">
      
      {/* LEFT SIDE: Active Video Call Area & Hardware Integration */}
      <div className="lg:w-2/5 xl:w-[45%] flex flex-col gap-4">
         
         {/* Patient Video Container (WebRTC Mock) */}
         <div className="relative flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900 group">
            {/* Mock Patient Image */}
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=1000&h=1200&q=80" alt="Patient Video" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60 pointer-events-none"></div>
            
            {/* Top Status */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
               <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                  <span className="text-xs font-black text-white tracking-widest uppercase opacity-90">Live Checkup</span>
                  <span className="text-xs font-bold text-emerald-400 ml-2">12:44</span>
               </div>
               <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors">
                  <Maximize className="w-4 h-4"/>
               </button>
            </div>

            {/* Wearable Data Overlay Structure */}
            <div className="absolute top-24 left-6 flex flex-col gap-3 z-10 transition-transform duration-500 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                {/* Watch Sync Status */}
                <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 w-max">
                   <div className="relative">
                      <Watch className="w-4 h-4 text-emerald-400 z-10 relative" />
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-30"></div>
                   </div>
                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">Apple Watch Sync</span>
                </div>
                
                {/* Live Heart Rate */}
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 w-40 flex items-center gap-4">
                   <div>
                       <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20 animate-pulse" />
                   </div>
                   <div>
                       <div className="text-xl font-black text-white leading-none">84 <span className="text-xs font-bold text-slate-400">bpm</span></div>
                       <div className="text-[10px] text-emerald-400 font-bold mt-1">مستقر (Resting)</div>
                   </div>
                </div>

                 {/* Activity Rings (Mocked via SVG) */}
                 <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 w-40 pl-4">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Activity</span>
                       <Activity className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="space-y-1.5">
                       <ProgressBar color="bg-rose-500" value={60} label="تحرك" />
                       <ProgressBar color="bg-emerald-500" value={30} label="تمرين" />
                       <ProgressBar color="bg-cyan-500" value={80} label="وقوف" />
                    </div>
                 </div>
            </div>

            {/* Doctor Picture-in-Picture */}
            <div className="absolute bottom-24 right-6 w-32 h-44 bg-slate-800 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-10 transition-transform hover:scale-105 cursor-pointer">
               <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Doctor self view" />
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 backdrop-blur-2xl p-2 rounded-full border border-white/10">
               <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-500 text-white'}`}>
                 {micOn ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
               </button>
               <button onClick={() => setCamOn(!camOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-500 text-white'}`}>
                 {camOn ? <Camera className="w-5 h-5"/> : <CameraOff className="w-5 h-5"/>}
               </button>
               <div className="w-px h-8 bg-white/20 mx-1"></div>
               <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors">
                 <MessageSquare className="w-5 h-5"/>
               </button>
               <button onClick={() => setInCall(false)} className="w-14 h-12 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-transform hover:scale-105 ml-1">
                 <PhoneOff className="w-5 h-5"/>
               </button>
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: Intelligence Hub (Notes & AI Copilot) */}
      <div className="lg:w-3/5 xl:w-[55%] flex flex-col bg-[#F8FAFC] rounded-[2.5rem] border border-slate-200/60 shadow-inner overflow-hidden relative">
         
         {/* Patient Header Mini */}
         <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">س</div>
               <div>
                  <h2 className="text-base font-black text-slate-800 leading-tight">سارة محمد</h2>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                     <span>28 سنة |</span> <span className="text-rose-500">مرحلة التأهيل الثانية</span>
                  </div>
               </div>
            </div>
            <Button variant="outline" className="h-9 px-4 rounded-xl font-bold bg-white border-slate-200">البيانات السريرية كاملة <ArrowRight className="w-3.5 h-3.5 ml-1.5"/></Button>
         </div>

         <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            {/* Live Interactive Notes */}
            <div className="md:col-span-7 p-6 flex flex-col h-full bg-white relative">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-slate-400"/> تدوينات الطبيب
               </h3>
               
               <div className="flex-1 bg-transparent">
                  <textarea 
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-700 font-medium leading-loose text-lg placeholder:text-slate-300" 
                    placeholder="قم بتدوين تشخيصك أثناء التحدث مع المريض... سيتكفل الذكاء الاصطناعي بتحليل النص واقتراح الإجراءات."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    autoFocus
                  />
               </div>

               <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400">التخزين السحابي مفعل</div>
                  <Button 
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-6 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {isSavingNote ? 'جاري الحفظ...' : 'حفظ مؤقت لحين الإنهاء'}
                  </Button>
               </div>
            </div>

            {/* AI Copilot Intelligence Side-Panel */}
            <div className="md:col-span-5 bg-gradient-to-b from-indigo-50/50 to-purple-50/30 border-r border-slate-200/50 p-6 flex flex-col items-center">
               
               <div className="w-full flex items-center gap-2 mb-8">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <h3 className="text-sm font-black text-slate-800 tracking-tight">Tibrah AI Copilot</h3>
               </div>

               {/* AI State Engine */}
               {!aiActivated ? (
                 <div className="flex-1 flex flex-col justify-center items-center text-center opacity-60">
                    <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500">لا يوجد نص كافي للتحليل.<br/>اكتب ملاحظاتك في الجانب الأيمن ليقوم المساعد الطبي بتحليلها.</p>
                 </div>
               ) : (
                 <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Live Analysis Tag */}
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-full w-max mb-4">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                       جاري التحليل السريري المباشر...
                    </div>

                    {/* Auto-Diagnosis Node */}
                    <AIActionCard 
                       icon={Activity} 
                       title="احتمالية التشخيص التلقائي" 
                       content="التهاب المفاصل الرضفي الفخذي (Patellofemoral Pain Syndrome)" 
                       code="ICD-10: M22.2"
                       color="indigo"
                    />

                    {/* Prescription Recommender (Marketplace binding) */}
                    <AIActionCard 
                       icon={Pill} 
                       title="توصيات ذكية للمريض" 
                       content="يوصى بإرسال دورة (البرنامج الشامل للركبة) عبر المتجر لضمان التأهيل المنزلي." 
                       actionText="إرسال الدورة مجاناً"
                       color="purple"
                    />

                    {/* Emotional Sentinel */}
                    <AIActionCard 
                       icon={Heart} 
                       title="دليل الدعم العاطفي" 
                       content="بناءً على التردد في الحديث، أظهر دعمك باحتمالية التعافي التام خلال 3 أسابيع لخفض القلق (Cortisol)." 
                       color="rose"
                    />
                 </div>
               )}

            </div>

         </div>

      </div>
    </div>
  );
}

function ProgressBar({ color, value, label }: any) {
  return (
     <div className="flex items-center gap-2">
         <span className="text-[9px] text-white font-semibold w-8">{label}</span>
         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
         </div>
     </div>
  );
}

function AIActionCard({ icon: Icon, title, content, code, color, actionText }: any) {
   const gradientMap: any = {
      indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-900',
      purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-900',
      rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-900',
   };
   const iconColor: any = {
      indigo: 'text-indigo-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
   };

   return (
      <div className={`bg-gradient-to-br ${gradientMap[color]} rounded-2xl p-4 border`}>
         <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${iconColor[color]}`} />
            <h4 className={`text-xs font-bold ${iconColor[color]}`}>{title}</h4>
         </div>
         <p className="text-sm font-semibold opacity-90 leading-tight mb-2">{content}</p>
         {code && <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-white/50">{code}</span>}
         {actionText && (
            <button className={`mt-2 w-full text-xs font-bold bg-white shadow-sm border border-slate-100 h-8 rounded-lg ${iconColor[color]} hover:bg-slate-50 transition-colors flex items-center justify-center gap-1`}>
               <Send className="w-3 h-3" /> {actionText}
            </button>
         )}
      </div>
   );
}

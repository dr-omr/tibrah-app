import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Eye, Database, UserCheck, Lock, Mail } from 'lucide-react';

export default function Privacy() {
    const lastUpdated = '2026-03-24';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-6">
                        <ArrowRight className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white">سياسة الخصوصية</h1>
                            <p className="text-sm text-slate-500">آخر تحديث: {lastUpdated}</p>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        تلتزم طِبرَا / Dr. Omar Clinic بحماية خصوصيتك وبياناتك الصحية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Section 1 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">١. البيانات التي نجمعها</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <p>عند استخدامك لتطبيق طِبرَا، قد نجمع الأنواع التالية من البيانات:</p>
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، وكلمة المرور المُشفّرة.</li>
                                <li><strong>البيانات الصحية:</strong> الأعراض المُسجّلة، نتائج الفحص الذاتي، سجلات المزاج والنوم والتغذية، والملف الطبي الذي تُدخله بنفسك.</li>
                                <li><strong>بيانات الاستخدام:</strong> الصفحات التي تزورها، الإجراءات التي تتخذها داخل التطبيق، ومعلومات الجهاز الأساسية.</li>
                                <li><strong>بيانات التواصل:</strong> رسائل الدعم، الاستفسارات الطبية، وتقارير الفحص المُرسلة عبر واتساب.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٢. كيف نستخدم بياناتك</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>تقديم الخدمات الصحية الرقمية المُتاحة في التطبيق.</li>
                                <li>تخصيص تجربتك بناءً على حالتك الصحية واستخدامك للتطبيق.</li>
                                <li>إعداد التقارير الصحية والتوصيات الأولية (غير التشخيصية).</li>
                                <li>إرسال إشعارات تتعلق بصحتك ونشاطك داخل التطبيق.</li>
                                <li>تحسين جودة التطبيق وأدائه بشكل مستمر.</li>
                            </ul>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 mt-4">
                                <p className="text-amber-800 dark:text-amber-300 text-xs font-bold">
                                    ⚕️ لا نبيع بياناتك الصحية لأي طرف ثالث. لا نستخدم بياناتك لأغراض إعلانية تجارية.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٣. حماية البيانات</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>لا تُخزّن كلمات المرور بصيغتها الأصلية — تُحوّل إلى صيغة مُشفّرة قبل الحفظ.</li>
                                <li>نسعى لنقل البيانات عبر اتصالات مُشفّرة (HTTPS) عند توفّرها.</li>
                                <li>نعمل باستمرار على تحسين إجراءات حماية البيانات ورفع مستوى الأمان.</li>
                                <li>نحدّ من الوصول إلى البيانات الصحية للفريق الطبي المعتمد فقط.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٤. حقوقك</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <p>يحق لك في أي وقت:</p>
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>الوصول إلى بياناتك الصحية المُخزّنة في التطبيق.</li>
                                <li>طلب تصحيح أو تحديث بياناتك.</li>
                                <li>طلب حذف حسابك وجميع بياناتك المرتبطة به.</li>
                                <li>تصدير بياناتك الصحية بصيغة مقروءة.</li>
                                <li>إلغاء الاشتراك في الإشعارات في أي وقت.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٥. التواصل معنا</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <p>لأي استفسار يتعلق بخصوصيتك أو بياناتك، يمكنك التواصل معنا عبر:</p>
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>البريد الإلكتروني: <a href="mailto:dr.omaralemad@gmail.com" className="text-teal-600 underline" dir="ltr">dr.omaralemad@gmail.com</a></li>
                                <li>صفحة <Link href="/help" className="text-teal-600 underline">المساعدة والدعم</Link> داخل التطبيق</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">٦. التغييرات على هذه السياسة</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            قد نُحدّث هذه السياسة من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني. استمرارك في استخدام التطبيق بعد التحديث يُعتبر موافقةً على السياسة المُحدّثة.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        طِبرَا / Dr. Omar Clinic — جميع الحقوق محفوظة
                    </p>
                    <Link href="/terms" className="text-xs text-teal-600 hover:underline mt-2 inline-block">
                        اقرأ الشروط والأحكام ←
                    </Link>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import { comparisons } from './data';

export const ComparisonSection = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black text-slate-800">ليش تختارني؟</h2>
            </div>

            <div className="glass rounded-3xl overflow-hidden shadow-xl">
                <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="text-sm font-medium text-slate-500">المقارنة</div>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-1 gradient-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            مع د. عمر
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs">
                            التقليدي
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {comparisons.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2 p-4 items-center">
                            <div className="text-sm text-slate-700 font-medium">{item.feature}</div>
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1 text-green-600 text-sm">
                                    <Check className="w-4 h-4" />
                                    <span className="text-xs">{item.doctor}</span>
                                </div>
                            </div>
                            <div className="text-center text-xs text-slate-400">
                                {item.traditional}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

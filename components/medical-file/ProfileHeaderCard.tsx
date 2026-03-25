import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, User, Droplets, Calendar, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PatientProfile } from '@/components/medical-file/MedicalFileForms';

interface ProfileHeaderCardProps {
    profile: PatientProfile;
    completeness: number;
    onEditClick: () => void;
}

export default function ProfileHeaderCard({ profile, completeness, onEditClick }: ProfileHeaderCardProps) {
    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-primary via-teal-500 to-emerald-500 text-white px-5 py-7 rounded-b-[2rem] shadow-xl shadow-primary/15"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Dot pattern */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                }}
            />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold">ملفي الطبي</h1>
                            <Shield className="w-4 h-4 text-white/60" />
                        </div>
                        <p className="text-white/60 text-xs font-medium">كل بياناتك الصحية في مكان واحد آمن</p>
                    </div>
                    <motion.div
                        className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10"
                        whileTap={{ scale: 0.9, rotate: 10 }}
                    >
                        <FileText className="w-5 h-5 text-white" />
                    </motion.div>
                </div>

                {/* Profile Card */}
                <motion.div
                    className="bg-white/12 backdrop-blur-md rounded-2xl p-4 border border-white/15"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-lg leading-tight">{profile.full_name || 'أدخل اسمك'}</h2>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {profile.blood_type && (
                                    <Badge className="bg-red-500/30 text-white border-0 text-xs font-semibold">
                                        <Droplets className="w-3 h-3 ml-1" />
                                        {profile.blood_type}
                                    </Badge>
                                )}
                                {profile.birth_date && (
                                    <Badge className="bg-white/20 border-0 text-xs font-semibold">
                                        <Calendar className="w-3 h-3 ml-1" />
                                        {calculateAge(profile.birth_date)} سنة
                                    </Badge>
                                )}
                                {/* Completeness badge */}
                                <Badge className={`border-0 text-xs font-semibold ${completeness === 100 ? 'bg-green-500/30' : 'bg-amber-500/30'}`}>
                                    {completeness}% مكتمل
                                </Badge>
                            </div>
                        </div>
                        <motion.button
                            className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/10"
                            whileTap={{ scale: 0.85 }}
                            onClick={onEditClick}
                        >
                            <Edit3 className="w-4.5 h-4.5 text-white" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

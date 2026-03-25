import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Share2, QrCode, User, Crown, Sparkles, Star, Award } from 'lucide-react';

interface UserData {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    settings?: any;
    created_at?: string;
}

interface ProfileHeaderProps {
    user: UserData | null;
    onShare: () => void;
    onQRCode: () => void;
}

export const ProfileHeader = ({ user, onShare, onQRCode }: ProfileHeaderProps) => {
    return (
        <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary">
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                    animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 8 }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl"
                    animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                />
            </div>

            <div className="relative pt-8 pb-24 px-6">
                {/* Top Actions */}
                <div className="flex justify-between items-center mb-6">
                    <motion.button
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                        whileTap={{ scale: 0.9 }}
                    >
                        <Settings className="w-5 h-5 text-white" />
                    </motion.button>
                    <div className="flex gap-2">
                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            whileTap={{ scale: 0.9 }}
                            onClick={onShare}
                        >
                            <Share2 className="w-5 h-5 text-white" />
                        </motion.button>
                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            whileTap={{ scale: 0.9 }}
                            onClick={onQRCode}
                        >
                            <QrCode className="w-5 h-5 text-white" />
                        </motion.button>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div
                    className="flex flex-col items-center text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Avatar with Ring */}
                    <motion.div
                        className="relative mb-4"
                        whileTap={{ scale: 0.95, rotate: 5 }}
                    >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center backdrop-blur-sm border-2 border-white/40 shadow-2xl overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-white" />
                            )}
                        </div>
                        {/* Crown Badge */}
                        <motion.div
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-xl flex items-center justify-center shadow-lg"
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                        >
                            <Crown className="w-4 h-4 text-white" />
                        </motion.div>
                        {/* Verified Badge */}
                        <motion.div
                            className="absolute -bottom-1 -left-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring' }}
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                        </motion.div>
                    </motion.div>

                    {/* User Name */}
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {user?.settings?.displayName || user?.full_name || 'مستخدم جديد'}
                    </h1>
                    <p className="text-white/60 text-sm mb-3">{user?.email || ''}</p>

                    {/* Membership Badge */}
                    <motion.div
                        className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full backdrop-blur-sm"
                        whileTap={{ scale: 0.95 }}
                    >
                        <Star className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white text-sm font-medium">عضو مميز</span>
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

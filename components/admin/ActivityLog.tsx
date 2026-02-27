// components/admin/ActivityLog.tsx
// Real-time activity log — tracks user activities from Firestore data

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ShoppingBag, CalendarDays, Star, BookOpen,
    Clock, Activity, Bell, UserPlus, CreditCard,
    FileText, MessageCircle, Zap
} from 'lucide-react';

interface ActivityLogEntry {
    id: string;
    text: string;
    time: string;
    icon: React.ElementType;
    color: string;
    type: 'user' | 'order' | 'appointment' | 'content' | 'system';
}

interface ActivityLogProps {
    users: any[];
    appointments: any[];
    products: any[];
    courses: any[];
}

function getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'مؤخراً';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
}

function LiveDot({ color }: { color: string }) {
    return (
        <span className="relative flex h-2 w-2">
            <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: color }}
            />
            <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: color }}
            />
        </span>
    );
}

export default function ActivityLog({ users, appointments, products, courses }: ActivityLogProps) {
    // Build activity feed from real data
    const activities: ActivityLogEntry[] = useMemo(() => {
        const entries: ActivityLogEntry[] = [];

        // Recent users
        users.slice(-5).reverse().forEach((user: any) => {
            entries.push({
                id: `user-${user.id}`,
                text: `مستخدم جديد سجّل: ${user.name || user.email?.split('@')[0] || 'مجهول'}`,
                time: user.created_at || user.createdAt || '',
                icon: UserPlus,
                color: '#2D9B83',
                type: 'user',
            });
        });

        // Recent appointments
        appointments.slice(0, 5).forEach((apt: any) => {
            const statusText = apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'pending' ? 'قيد الانتظار' : 'جديد';
            entries.push({
                id: `apt-${apt.id}`,
                text: `موعد ${statusText} — ${apt.service || apt.type || 'استشارة صحية'}`,
                time: apt.created_date || apt.createdAt || '',
                icon: CalendarDays,
                color: '#EC4899',
                type: 'appointment',
            });
        });

        // Recent products (as additions)
        products.slice(-3).reverse().forEach((product: any) => {
            entries.push({
                id: `prod-${product.id}`,
                text: `منتج نشط: ${product.name || product.title || 'منتج جديد'}`,
                time: product.created_at || product.createdAt || '',
                icon: ShoppingBag,
                color: '#6366F1',
                type: 'order',
            });
        });

        // Recent courses
        courses.slice(-2).reverse().forEach((course: any) => {
            entries.push({
                id: `course-${course.id}`,
                text: `دورة متاحة: ${course.title || 'دورة جديدة'}`,
                time: course.created_at || course.createdAt || '',
                icon: BookOpen,
                color: '#F59E0B',
                type: 'content',
            });
        });

        // Sort by time (most recent first)
        entries.sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        return entries.slice(0, 10);
    }, [users, appointments, products, courses]);

    const typeFilters = [
        { id: 'all', label: 'الكل', icon: Activity },
        { id: 'user', label: 'المستخدمين', icon: Users },
        { id: 'appointment', label: 'المواعيد', icon: CalendarDays },
        { id: 'order', label: 'المنتجات', icon: ShoppingBag },
    ];

    const [filter, setFilter] = React.useState('all');

    const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

    return (
        <motion.div
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/60 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">سجل النشاطات</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <LiveDot color="#10B981" />
                        <span className="text-[11px] text-slate-400">تحديث مباشر</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto">
                    {typeFilters.map(f => {
                        const Icon = f.icon;
                        return (
                            <motion.button
                                key={f.id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f.id
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilter(f.id)}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {f.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Activity List */}
            <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        filtered.map((entry, idx) => {
                            const Icon = entry.icon;
                            return (
                                <motion.div
                                    key={entry.id}
                                    className="flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 dark:border-slate-700/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: entry.color + '12' }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: entry.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {entry.text}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(entry.time)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            لا توجد نشاطات بعد
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center justify-around text-center">
                    <div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">{users.length}</span>
                        <p className="text-[10px] text-slate-400">مستخدم</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">{appointments.length}</span>
                        <p className="text-[10px] text-slate-400">موعد</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">{products.length}</span>
                        <p className="text-[10px] text-slate-400">منتج</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                    <div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">{courses.length}</span>
                        <p className="text-[10px] text-slate-400">دورة</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

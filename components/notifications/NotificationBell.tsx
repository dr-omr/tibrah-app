import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface NotificationBellProps {
    variant?: 'header' | 'mobile' | 'minimal';
    className?: string;
}

export default function NotificationBell({ variant = 'header', className = '' }: NotificationBellProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return new Date(timestamp).toLocaleDateString('ar-SA');
    };

    const getTypeStyles = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-600';
            case 'error':
                return 'bg-red-100 text-red-600';
            case 'warning':
                return 'bg-amber-100 text-amber-600';
            default:
                return 'bg-blue-100 text-blue-600';
        }
    };

    // Minimal variant for mobile bottom bar
    if (variant === 'minimal') {
        return (
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 ${className}`}
            >
                <Bell className="w-6 h-6 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Bell Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'text-[#2D9B83]' : 'text-slate-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    style={{ maxHeight: 'calc(100vh - 120px)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">الإشعارات</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAllAsRead()}
                                    className="text-xs text-[#2D9B83] hover:text-[#2D9B83] hover:bg-[#2D9B83]/10"
                                >
                                    <Check className="w-3 h-3 ml-1" />
                                    قراءة الكل
                                </Button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-500">لا توجد إشعارات</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.slice(0, 20).map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Type Icon */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeStyles(notif.type)}`}>
                                                <Bell className="w-4 h-4" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'text-slate-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                {notif.body && (
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-1">{formatTime(notif.timestamp)}</p>

                                                {/* Action Link */}
                                                {notif.action && (
                                                    <Link
                                                        href={notif.action.href}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsOpen(false);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-xs text-[#2D9B83] mt-2 hover:underline"
                                                    >
                                                        {notif.action.label}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearNotification(notif.id);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 20 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <Link href="/notifications">
                                <span className="text-sm text-[#2D9B83] hover:underline">
                                    عرض كل الإشعارات ({notifications.length})
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

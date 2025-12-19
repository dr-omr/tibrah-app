import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import {
    LayoutDashboard, Users, ShoppingBag, Calendar,
    FileText, Settings, LogOut, Menu, X, Bell, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    user?: any;
}

export default function AdminLayout({ children, activeTab, onTabChange, user }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'appointments', label: 'المواعيد', icon: Calendar },
        { id: 'products', label: 'المنتجات', icon: ShoppingBag },
        { id: 'users', label: 'المستخدمين', icon: Users },
        { id: 'courses', label: 'الدورات', icon: FileText },
        { id: 'articles', label: 'المحتوى', icon: FileText },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    } lg:static lg:block shadow-xl`}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">لوحة الإدارة</h1>
                            <p className="text-xs text-slate-400">د. عمر العماد</p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-white/70 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-[#2D9B83] text-white shadow-lg shadow-[#2D9B83]/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <Link href={createPageUrl('Home')}>
                        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-3">
                            <LogOut className="w-5 h-5" />
                            تسجيل خروج
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-hidden flex flex-col h-screen">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button size="icon" variant="ghost" className="relative text-slate-500">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full indicator" />
                        </Button>
                        <div className="flex items-center gap-3 pl-2 border-r border-slate-100 lg:border-none">
                            <div className="text-left hidden lg:block">
                                <p className="text-sm font-bold text-slate-700">{user?.name || 'Administrator'}</p>
                                <p className="text-xs text-slate-500">{user?.role || 'Super Admin'}</p>
                            </div>
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>OA</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

import React, { ReactNode } from 'react';

interface ProfileLayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
    quickActions?: ReactNode;
}

export default function ProfileLayout({ children, sidebar, quickActions }: ProfileLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Layout - CSS Grid */}
            <div className="hidden lg:grid lg:grid-cols-[280px_1fr_300px] gap-6 p-6 max-w-[1600px] mx-auto">
                {/* Left Sidebar */}
                <aside className="sticky top-6 h-fit">
                    {sidebar}
                </aside>

                {/* Main Content */}
                <main className="space-y-6">
                    {children}
                </main>

                {/* Right Sidebar - Quick Actions */}
                <aside className="sticky top-6 h-fit">
                    {quickActions}
                </aside>
            </div>

            {/* Tablet Layout - 2 Columns */}
            <div className="hidden md:grid md:grid-cols-[240px_1fr] lg:hidden gap-4 p-4">
                <aside className="sticky top-4 h-fit">
                    {sidebar}
                </aside>
                <main className="space-y-4">
                    {children}
                    {quickActions}
                </main>
            </div>

            {/* Mobile Layout - Single Column */}
            <div className="md:hidden pb-24">
                <main className="space-y-4 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AdminLink({ className = '' }: { className?: string }) {
    return (
        <div className={`mt-8 pt-6 border-t border-slate-100/50 text-center ${className}`}>
            <Link
                href="/admin-dashboard"
                className="text-xs text-slate-400 hover:text-[#2D9B83] transition-colors flex items-center justify-center gap-1 group"
            >
                <Lock className="w-3 h-3" />
                الدخول إلى لوحة الإدارة (للموظفين فقط)
            </Link>
        </div>
    );
}

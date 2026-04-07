import React from 'react';

export default function FormDivider() {
    return (
        <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">أو المتابعة عبر</span>
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
        </div>
    );
}

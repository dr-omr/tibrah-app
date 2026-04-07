// components/admin-v2/primitives/AdminPageHeader.tsx
// Page header with title, description, and action buttons

import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Action buttons
  icon?: React.ReactNode;
  action?: React.ReactNode; // Extra right-side actions
}

export default function AdminPageHeader({ title, description, children, icon, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
      {action && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

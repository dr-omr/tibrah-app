// components/admin-v2/primitives/AdminEmptyState.tsx
import React from 'react';
import { Inbox } from 'lucide-react';

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminEmptyState({
  icon,
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على نتائج',
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="admin-empty-state-title">{title}</div>
      <div className="admin-empty-state-description">{description}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

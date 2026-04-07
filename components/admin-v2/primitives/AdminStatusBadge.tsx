// components/admin-v2/primitives/AdminStatusBadge.tsx
// Unified status badge component with consistent semantics

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AdminStatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  // Orders
  pending: { variant: 'warning', label: 'قيد المراجعة' },
  confirmed: { variant: 'info', label: 'مؤكد' },
  processing: { variant: 'info', label: 'جاري التجهيز' },
  shipped: { variant: 'info', label: 'في الطريق' },
  delivered: { variant: 'success', label: 'مكتمل' },
  cancelled: { variant: 'danger', label: 'ملغي' },
  // Appointments
  completed: { variant: 'success', label: 'مكتمل' },
  // Users
  active: { variant: 'success', label: 'نشط' },
  inactive: { variant: 'neutral', label: 'غير نشط' },
  suspended: { variant: 'danger', label: 'موقوف' },
  // Content
  published: { variant: 'success', label: 'منشور' },
  draft: { variant: 'neutral', label: 'مسودة' },
  // Clinical
  low: { variant: 'success', label: 'مستقر' },
  moderate: { variant: 'warning', label: 'متوسط' },
  high: { variant: 'danger', label: 'مرتفع' },
  critical: { variant: 'danger', label: 'حرج' },
  // Triage
  pending_review: { variant: 'warning', label: 'بانتظار المراجعة' },
  reviewed: { variant: 'success', label: 'تمت المراجعة' },
  referred: { variant: 'info', label: 'محال' },
};

/**
 * Get variant and label from a status key.
 * Falls back to neutral if unknown.
 */
export function getStatusConfig(status: string) {
  return STATUS_MAP[status] || { variant: 'neutral' as BadgeVariant, label: status };
}

export default function AdminStatusBadge({
  label,
  variant = 'neutral',
  dot = true,
  pulse = false,
  size = 'md',
}: AdminStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0' : '';
  
  return (
    <span className={`admin-badge admin-badge-${variant} ${sizeClass}`}>
      {dot && (
        <span className={`admin-badge-dot ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  );
}

/**
 * Convenience component: auto-maps status key to badge.
 */
export function StatusBadgeAuto({ status, pulse }: { status: string; pulse?: boolean }) {
  const config = getStatusConfig(status);
  return <AdminStatusBadge label={config.label} variant={config.variant} pulse={pulse} />;
}

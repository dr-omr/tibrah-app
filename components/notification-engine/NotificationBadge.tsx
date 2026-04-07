import React from 'react';
import { useNotifications } from './NotificationContext';
import styles from './NotificationSystem.module.css';

interface NotificationBadgeProps {
  className?: string;
  max?: number;
}

export function NotificationBadge({ className = '', max = 99 }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();
  if (unreadCount === 0) return null;

  return (
    <span className={`${styles.badge} ${className}`} aria-label={`${unreadCount} إشعار غير مقروء`}>
      {unreadCount > max ? `${max}+` : unreadCount}
    </span>
  );
}

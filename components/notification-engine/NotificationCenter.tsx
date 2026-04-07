import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  useNotifications,
  EngineNotification,
  NotificationCategory,
} from './NotificationContext';
import { NotificationBadge } from './NotificationBadge';
import styles from './NotificationSystem.module.css';
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  X,
  ExternalLink,
  Pin,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings,
  MessageCircle,
  Calendar,
  CreditCard,
  Stethoscope,
} from 'lucide-react';

const ICON_MAP: Record<NotificationCategory, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  system: Settings,
  message: MessageCircle,
  booking: Calendar,
  payment: CreditCard,
  clinical: Stethoscope,
};

type TabFilter = 'all' | 'unread' | 'system';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'unread', label: 'غير مقروءة' },
  { key: 'system', label: 'النظام' },
];

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins}د`;
  if (hrs < 24) return `${hrs}س`;
  if (days < 7) return `${days}ي`;
  return new Date(ts).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function filterNotifications(list: EngineNotification[], tab: TabFilter): EngineNotification[] {
  switch (tab) {
    case 'unread': return list.filter(n => !n.isRead);
    case 'system': return list.filter(n => ['system', 'clinical', 'payment', 'booking'].includes(n.type));
    default: return list;
  }
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filteredList = filterNotifications(notifications, activeTab);

  // ─── Open / close ───
  const open = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 220);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // ─── Click outside ───
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // ─── Escape key ───
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // ─── Focus trap on open ───
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstBtn = panelRef.current.querySelector<HTMLElement>('button, a, [tabindex]');
      firstBtn?.focus();
    }
  }, [isOpen]);

  const handleItemClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className={styles.engine}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={toggle}
        data-active={isOpen || undefined}
        aria-label={`الإشعارات${unreadCount > 0 ? ` (${unreadCount} غير مقروءة)` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className={styles.triggerBadge}>
            <NotificationBadge max={99} />
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div
            className={styles.overlay}
            data-closing={isClosing || undefined}
            onClick={close}
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            className={styles.panel}
            data-closing={isClosing || undefined}
            role="dialog"
            aria-label="الإشعارات"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>الإشعارات</h2>
              <div className={styles.panelActions}>
                {unreadCount > 0 && (
                  <button
                    className={styles.panelActionBtn}
                    onClick={markAllAsRead}
                  >
                    <Check size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                    قراءة الكل
                  </button>
                )}
                <button className={styles.panelCloseBtn} onClick={close} aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.panelTabs} role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={styles.panelTab}
                  data-active={activeTab === tab.key || undefined}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                >
                  {tab.label}
                  {tab.key === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* List */}
            <ul className={styles.panelList} role="tabpanel">
              {filteredList.length === 0 ? (
                <li className={styles.panelEmpty}>
                  <BellOff className={styles.panelEmptyIcon} />
                  <p className={styles.panelEmptyText}>لا توجد إشعارات</p>
                  <p className={styles.panelEmptySub}>ستظهر إشعاراتك هنا عند وصولها</p>
                </li>
              ) : (
                filteredList.slice(0, 50).map(notif => {
                  const Icon = ICON_MAP[notif.type] || Info;
                  return (
                    <li
                      key={notif.id}
                      className={styles.panelItem}
                      data-unread={!notif.isRead || undefined}
                      onClick={() => handleItemClick(notif.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter') handleItemClick(notif.id); }}
                    >
                      {!notif.isRead && <span className={styles.unreadDot} />}

                      <div className={styles.panelItemIcon}>
                        <Icon size={18} strokeWidth={2} />
                      </div>

                      <div className={styles.panelItemContent}>
                        <div className={styles.panelItemRow}>
                          <h4 className={styles.panelItemTitle}>
                            {notif.pinned && <Pin size={12} className={styles.pinnedIcon} />}
                            {notif.title}
                          </h4>
                          <span className={styles.panelItemTime}>
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                        </div>
                        {notif.body && (
                          <p className={styles.panelItemBody}>{notif.body}</p>
                        )}
                        {notif.action?.href && (
                          <div className={styles.panelItemActions}>
                            <a
                              href={notif.action.href}
                              className={styles.panelItemActionLink}
                              onClick={e => {
                                e.stopPropagation();
                                close();
                              }}
                            >
                              {notif.action.label}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.panelItemDelete}
                        onClick={e => {
                          e.stopPropagation();
                          clearNotification(notif.id);
                        }}
                        aria-label="حذف الإشعار"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer */}
            {notifications.length > 50 && (
              <div className={styles.panelFooter}>
                <span className={styles.panelFooterLink}>
                  عرض كل الإشعارات ({notifications.length})
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

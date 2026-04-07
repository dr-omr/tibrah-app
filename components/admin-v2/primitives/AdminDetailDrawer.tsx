// components/admin-v2/primitives/AdminDetailDrawer.tsx
// Slide-over detail panel with header, body, and footer

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function AdminDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = '480px',
}: AdminDetailDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="admin-drawer-overlay"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="admin-drawer"
            style={{ maxWidth: width }}
          >
            {/* Header */}
            <div className="admin-drawer-header">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
              <div className="text-right flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-800 truncate">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="admin-drawer-body admin-scrollbar-thin">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="admin-drawer-footer">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

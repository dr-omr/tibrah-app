// Cloud Sync Indicator Component
// Shows real-time sync status with Firestore

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { SyncStatus, getSyncStatusDisplay } from '@/lib/useCloudSync';

interface CloudSyncIndicatorProps {
    status: SyncStatus;
    className?: string;
    showText?: boolean;
}

export function CloudSyncIndicator({
    status,
    className = '',
    showText = true
}: CloudSyncIndicatorProps) {
    const display = getSyncStatusDisplay(status);

    const getIcon = () => {
        switch (status) {
            case 'syncing':
                return <Loader2 className="w-4 h-4 animate-spin" />;
            case 'synced':
                return <Check className="w-4 h-4" />;
            case 'error':
                return <AlertCircle className="w-4 h-4" />;
            case 'offline':
                return <CloudOff className="w-4 h-4" />;
            default:
                return <Cloud className="w-4 h-4" />;
        }
    };

    const getStyles = () => {
        switch (status) {
            case 'syncing':
                return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'synced':
                return 'bg-green-100 text-green-600 border-green-200';
            case 'error':
                return 'bg-red-100 text-red-600 border-red-200';
            case 'offline':
                return 'bg-amber-100 text-amber-600 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
            >
                {getIcon()}
                {showText && <span>{display.text}</span>}
            </motion.div>
        </AnimatePresence>
    );
}

// Compact version for headers
export function CloudSyncDot({ status }: { status: SyncStatus }) {
    const getColor = () => {
        switch (status) {
            case 'syncing':
                return 'bg-blue-500';
            case 'synced':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'offline':
                return 'bg-amber-500';
            default:
                return 'bg-slate-400';
        }
    };

    return (
        <motion.div
            animate={status === 'syncing' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${getColor()}`}
            title={getSyncStatusDisplay(status).text}
        />
    );
}

// Floating sync button for mobile
export function CloudSyncButton({
    status,
    onSync
}: {
    status: SyncStatus;
    onSync: () => void;
}) {
    const isLoading = status === 'syncing';

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSync}
            disabled={isLoading}
            className={`
                fixed bottom-24 left-4 z-50
                w-12 h-12 rounded-full
                flex items-center justify-center
                shadow-lg transition-colors
                ${status === 'synced' ? 'bg-green-500' :
                    status === 'error' ? 'bg-red-500' :
                        status === 'offline' ? 'bg-amber-500' :
                            'bg-blue-500'}
                text-white
            `}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === 'synced' ? (
                <Check className="w-5 h-5" />
            ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5" />
            ) : (
                <Cloud className="w-5 h-5" />
            )}
        </motion.button>
    );
}

// Banner for sync status
export function CloudSyncBanner({
    status,
    onRetry,
    onDismiss
}: {
    status: SyncStatus;
    onRetry?: () => void;
    onDismiss?: () => void;
}) {
    if (status === 'synced' || status === 'idle') return null;

    const display = getSyncStatusDisplay(status);

    const getStyles = () => {
        switch (status) {
            case 'syncing':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'error':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'offline':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return '';
        }
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-b ${getStyles()}`}
        >
            <div className="px-4 py-2 flex items-center justify-between text-sm" dir="rtl">
                <div className="flex items-center gap-2">
                    <span>{display.icon}</span>
                    <span>{display.text}</span>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'error' && onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium"
                        >
                            إعادة المحاولة
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default CloudSyncIndicator;

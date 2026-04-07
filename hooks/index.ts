// Re-export notification engine for easy importing
export { useNotifications, toast } from '../components/notification-engine';
export type { EngineNotification as Notification, NotificationCategory } from '../components/notification-engine';
export { default as usePushNotifications } from './usePushNotifications';

// Native hooks
export { useNative } from '../contexts/NativeContext';
export { useAppLifecycle } from './useAppLifecycle';
export { useShareService } from './useShareService';
export { useHaptic } from '../lib/HapticFeedback';
export { useBiometricAuth } from './useBiometricAuth';
export { default as useNetworkStatus } from './useNetworkStatus';

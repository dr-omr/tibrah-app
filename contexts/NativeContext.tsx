/**
 * NativeContext — Context عالمي لكل بيانات النظام الناتف
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُوزَّع على كل التطبيق. يُحدَّث ديناميكياً عند تغيير:
 * - حالة الشبكة
 * - ارتفاع الكيبورد
 * - حالة التطبيق (active/background)
 * - Safe Area Insets الحقيقية
 * 
 * الاستخدام:
 *   const { platform, safeAreaInsets, keyboardHeight, isOnline } = useNative()
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { bridge, Platform, SafeAreaInsets, AppState, NetworkStatus } from '@/lib/native/NativeBridge';

// ─── Context Types ───────────────────────────────────────────────

interface NativeContextValue {
  /** المنصة الحالية */
  platform: Platform;
  /** هل التطبيق يعمل في WebView ناتف (iOS/Android) */
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  
  /** Safe Area Insets الحقيقية بالبكسل */
  safeAreaInsets: SafeAreaInsets;
  
  /** ارتفاع الكيبورد الحالي (0 إذا مخفي) */
  keyboardHeight: number;
  /** هل الكيبورد ظاهر الآن */
  isKeyboardVisible: boolean;
  
  /** حالة التطبيق */
  appState: AppState;
  /** هل التطبيق في الـ foreground */
  isAppActive: boolean;
  
  /** حالة الشبكة */
  networkStatus: NetworkStatus;
  isOnline: boolean;
  
  /** إخفاء الكيبورد برمجياً */
  hideKeyboard: () => void;
}

// ─── Defaults ───────────────────────────────────────────────────

const defaultInsets: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

const defaultValue: NativeContextValue = {
  platform: 'web',
  isNative: false,
  isIOS: false,
  isAndroid: false,
  safeAreaInsets: defaultInsets,
  keyboardHeight: 0,
  isKeyboardVisible: false,
  appState: 'active',
  isAppActive: true,
  networkStatus: { connected: true, connectionType: 'unknown' },
  isOnline: true,
  hideKeyboard: () => {},
};

// ─── Context ─────────────────────────────────────────────────────

const NativeContext = createContext<NativeContextValue>(defaultValue);

// ─── Provider ────────────────────────────────────────────────────

export function NativeProvider({ children }: { children: ReactNode }) {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>(defaultInsets);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [appState, setAppState] = useState<AppState>('active');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  const cleanupRefs = useRef<Array<() => void>>([]);

  // ─── تهيّئة Safe Area ──────────────────────────────────────
  useEffect(() => {
    // حقن CSS variables للـ Safe Area
    const injectSafeAreaVars = () => {
      const insets = bridge.getSafeAreaInsets();
      setSafeAreaInsets(insets);

      const root = document.documentElement;
      root.style.setProperty('--safe-top', `${insets.top}px`);
      root.style.setProperty('--safe-bottom', `${insets.bottom}px`);
      root.style.setProperty('--safe-left', `${insets.left}px`);
      root.style.setProperty('--safe-right', `${insets.right}px`);
    };

    // نقرأ مرة عند التحميل وبعد 100ms (بعد انتهاء الـ layout)
    injectSafeAreaVars();
    const timer = setTimeout(injectSafeAreaVars, 100);
    
    // نُعيد القراءة عند دوران الشاشة
    window.addEventListener('resize', injectSafeAreaVars);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', injectSafeAreaVars);
    };
  }, []);

  // ─── تهيّئة Native Lifecycle ───────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initNative = async () => {
      // App Lifecycle (foreground/background)
      const lifecycleHandle = await bridge.setupAppLifecycle();
      const removeAppState = bridge.addAppStateListener((state) => {
        if (mounted) setAppState(state);
      });

      // Android Back Button
      const backHandle = await bridge.setupBackButton();

      // Keyboard
      await bridge.setupKeyboard();
      const removeKeyboard = bridge.addKeyboardListener((height) => {
        if (mounted) setKeyboardHeight(height);
      });

      // Network
      const initialNetwork = await bridge.getNetworkStatus();
      if (mounted) setNetworkStatus(initialNetwork);

      await bridge.setupNetworkListener();
      const removeNetwork = bridge.addNetworkListener((status) => {
        if (mounted) setNetworkStatus(status);
      });

      // تسجيل cleanup
      cleanupRefs.current = [
        removeAppState,
        removeKeyboard,
        removeNetwork,
        () => lifecycleHandle?.remove(),
        () => backHandle?.remove(),
      ];
    };

    initNative();

    return () => {
      mounted = false;
      cleanupRefs.current.forEach(fn => fn());
    };
  }, []);

  // Fallback: Web network events
  useEffect(() => {
    if (bridge.isNative) return; // Native يُعالج هذا بنفسه

    const handleOnline = () => setNetworkStatus({ connected: true, connectionType: 'unknown' });
    const handleOffline = () => setNetworkStatus({ connected: false, connectionType: 'none' });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const hideKeyboard = useCallback(() => {
    bridge.hideKeyboard();
  }, []);

  const value: NativeContextValue = {
    platform: bridge.platform,
    isNative: bridge.isNative,
    isIOS: bridge.isIOS,
    isAndroid: bridge.isAndroid,
    safeAreaInsets,
    keyboardHeight,
    isKeyboardVisible: keyboardHeight > 0,
    appState,
    isAppActive: appState === 'active',
    networkStatus,
    isOnline: networkStatus.connected,
    hideKeyboard,
  };

  return (
    <NativeContext.Provider value={value}>
      {children}
    </NativeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useNative(): NativeContextValue {
  const ctx = useContext(NativeContext);
  if (!ctx) {
    throw new Error('useNative must be used inside NativeProvider');
  }
  return ctx;
}

export default NativeContext;

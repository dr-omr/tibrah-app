/**
 * NativeBridge — طبقة وسيطة موحدة لكل Native APIs
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Singleton يُكتشف البيئة مرة واحدة فقط عند التحميل.
 * كل استدعاء Native يمر من هنا لضمان التوحيد والأمان.
 * 
 * الاستخدام:
 *   import { bridge } from '@/lib/native/NativeBridge'
 *   bridge.setStatusBarStyle('dark', '#2D9B83')
 *   bridge.platform  // 'ios' | 'android' | 'web'
 */

import { Capacitor, PluginListenerHandle } from '@capacitor/core';

// ─── Types ───────────────────────────────────────────────────────

export type Platform = 'ios' | 'android' | 'web';
export type AppState = 'active' | 'inactive' | 'background';
export type StatusBarStyle = 'dark' | 'light';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

export interface DeviceInfo {
  model: string;
  platform: Platform;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  memUsed?: number;
}

export interface BatteryInfo {
  batteryLevel: number;
  isCharging: boolean;
}

// ─── NativeBridge Class ──────────────────────────────────────────

class NativeBridgeClass {
  readonly platform: Platform;
  readonly isNative: boolean;
  readonly isIOS: boolean;
  readonly isAndroid: boolean;
  readonly isWeb: boolean;

  private _appStateListeners: Array<(state: AppState) => void> = [];
  private _backButtonListeners: Array<() => boolean> = [];
  private _networkListeners: Array<(status: NetworkStatus) => void> = [];
  private _keyboardListeners: Array<(height: number) => void> = [];

  constructor() {
    this.platform = Capacitor.getPlatform() as Platform;
    this.isNative = Capacitor.isNativePlatform();
    this.isIOS = this.platform === 'ios';
    this.isAndroid = this.platform === 'android';
    this.isWeb = this.platform === 'web';
  }

  // ─── Status Bar ────────────────────────────────────────────────

  async setStatusBarStyle(style: StatusBarStyle, backgroundColor?: string): Promise<void> {
    if (!this.isNative) return;
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
      if (backgroundColor) {
        await StatusBar.setBackgroundColor({ color: backgroundColor });
      }
    } catch (e) {
      console.debug('[NativeBridge] StatusBar not available:', e);
    }
  }

  async showStatusBar(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.show();
    } catch { /* no-op */ }
  }

  async hideStatusBar(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch { /* no-op */ }
  }

  // ─── Safe Area Insets ──────────────────────────────────────────

  /**
   * يقرأ Safe Area Insets الحقيقية من CSS env() variables.
   * هذه الطريقة أدق من أي Plugin لأنها تأتي من WebKit مباشرة.
   */
  getSafeAreaInsets(): SafeAreaInsets {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    const parseEnv = (prop: string): number => {
      const val = style.getPropertyValue(prop).trim();
      return val ? parseFloat(val) : 0;
    };

    // نقرأ من CSS env() مباشرة — الأدق دائماً
    const top = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sat') || '0'
    ) || this._readCSSEnv('safe-area-inset-top') || (this.isIOS ? 44 : 24);

    const bottom = this._readCSSEnv('safe-area-inset-bottom') || (this.isIOS ? 34 : 0);
    const left = this._readCSSEnv('safe-area-inset-left') || 0;
    const right = this._readCSSEnv('safe-area-inset-right') || 0;

    return { top, bottom, left, right };
  }

  private _readCSSEnv(envVar: string): number {
    try {
      // نُنشئ element خفي لقراءة القيمة
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: env(${envVar}, 0px);
        height: env(${envVar}, 0px);
        pointer-events: none;
        visibility: hidden;
      `;
      document.body.appendChild(el);
      const rect = el.getBoundingClientRect();
      const val = Math.max(rect.width, rect.height);
      document.body.removeChild(el);
      return val;
    } catch {
      return 0;
    }
  }

  // ─── App Lifecycle ─────────────────────────────────────────────

  async setupAppLifecycle(): Promise<PluginListenerHandle | null> {
    if (!this.isNative) return null;
    try {
      const { App } = await import('@capacitor/app');

      // الاستماع لحالة التطبيق (foreground/background)
      const handle = await App.addListener('appStateChange', ({ isActive }) => {
        const state: AppState = isActive ? 'active' : 'background';
        this._appStateListeners.forEach(fn => fn(state));
      });

      return handle;
    } catch (e) {
      console.debug('[NativeBridge] App lifecycle not available:', e);
      return null;
    }
  }

  async setupBackButton(): Promise<PluginListenerHandle | null> {
    if (!this.isAndroid) return null;
    try {
      const { App } = await import('@capacitor/app');

      const handle = await App.addListener('backButton', ({ canGoBack }) => {
        // نُعطي الأولوية للـ listeners المُسجَّلة
        for (let i = this._backButtonListeners.length - 1; i >= 0; i--) {
          const handled = this._backButtonListeners[i]();
          if (handled) return;
        }
        // إذا لا يوجد handler وكان بإمكانه الرجوع
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      return handle;
    } catch (e) {
      console.debug('[NativeBridge] Back button not available:', e);
      return null;
    }
  }

  addAppStateListener(fn: (state: AppState) => void): () => void {
    this._appStateListeners.push(fn);
    return () => {
      this._appStateListeners = this._appStateListeners.filter(l => l !== fn);
    };
  }

  addBackButtonHandler(fn: () => boolean): () => void {
    this._backButtonListeners.push(fn);
    return () => {
      this._backButtonListeners = this._backButtonListeners.filter(l => l !== fn);
    };
  }

  // ─── Keyboard ─────────────────────────────────────────────────

  async setupKeyboard(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { Keyboard } = await import('@capacitor/keyboard');

      Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }) => {
        this._keyboardListeners.forEach(fn => fn(keyboardHeight));
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        this._keyboardListeners.forEach(fn => fn(0));
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      });
    } catch (e) {
      console.debug('[NativeBridge] Keyboard plugin not available:', e);
    }
  }

  addKeyboardListener(fn: (height: number) => void): () => void {
    this._keyboardListeners.push(fn);
    return () => {
      this._keyboardListeners = this._keyboardListeners.filter(l => l !== fn);
    };
  }

  async hideKeyboard(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      await Keyboard.hide();
    } catch { /* no-op */ }
  }

  // ─── Network ──────────────────────────────────────────────────

  async getNetworkStatus(): Promise<NetworkStatus> {
    if (!this.isNative) {
      return {
        connected: navigator.onLine,
        connectionType: 'unknown',
      };
    }
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: (status.connectionType as NetworkStatus['connectionType']) || 'unknown',
      };
    } catch {
      return { connected: navigator.onLine, connectionType: 'unknown' };
    }
  }

  async setupNetworkListener(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { Network } = await import('@capacitor/network');
      Network.addListener('networkStatusChange', (status) => {
        this._networkListeners.forEach(fn => fn({
          connected: status.connected,
          connectionType: (status.connectionType as NetworkStatus['connectionType']) || 'unknown',
        }));
      });
    } catch { /* no-op */ }
  }

  addNetworkListener(fn: (status: NetworkStatus) => void): () => void {
    this._networkListeners.push(fn);
    return () => {
      this._networkListeners = this._networkListeners.filter(l => l !== fn);
    };
  }

  // ─── Device Info ──────────────────────────────────────────────

  async getDeviceInfo(): Promise<DeviceInfo> {
    const fallback: DeviceInfo = {
      model: 'Unknown',
      platform: this.platform,
      operatingSystem: this.platform,
      osVersion: 'Unknown',
      manufacturer: 'Unknown',
      isVirtual: false,
    };

    if (!this.isNative) return fallback;

    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      return {
        model: info.model,
        platform: info.platform as Platform,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        memUsed: info.memUsed,
      };
    } catch {
      return fallback;
    }
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    if (!this.isNative) {
      return { batteryLevel: 1, isCharging: true };
    }
    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getBatteryInfo();
      return {
        batteryLevel: info.batteryLevel ?? 1,
        isCharging: info.isCharging ?? false,
      };
    } catch {
      return { batteryLevel: 1, isCharging: true };
    }
  }

  // ─── Share ────────────────────────────────────────────────────

  async share(options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }): Promise<boolean> {
    try {
      if (this.isNative) {
        const { Share } = await import('@capacitor/share');
        await Share.share(options);
        return true;
      } else if (navigator.share) {
        await navigator.share(options);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ─── App URL Open (Deep Links) ────────────────────────────────

  async setupDeepLinks(handler: (url: string) => void): Promise<PluginListenerHandle | null> {
    if (!this.isNative) return null;
    try {
      const { App } = await import('@capacitor/app');
      return await App.addListener('appUrlOpen', ({ url }) => handler(url));
    } catch {
      return null;
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────────

export const bridge = new NativeBridgeClass();
export default bridge;

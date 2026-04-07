/**
 * useHaptic — Capacitor Haptic Feedback Hook
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Wraps @capacitor/haptics gracefully.
 * No-ops on web silently (no console noise).
 *
 * Usage:
 *   const haptic = useHaptic();
 *   <button onPointerDown={() => haptic.light()}>Tap</button>
 *   <button onClick={() => haptic.success()}>Save</button>
 */

import { useCallback } from 'react';

type HapticLevel = 'light' | 'medium' | 'heavy';

interface HapticHook {
  /** Selection feedback — lightest, for every tap */
  light:   () => Promise<void>;
  /** Action feedback — for confirming/saving */
  medium:  () => Promise<void>;
  /** Impact feedback — for errors/destructive */
  heavy:   () => Promise<void>;
  /** Success notification pattern */
  success: () => Promise<void>;
  /** Warning notification pattern */
  warning: () => Promise<void>;
  /** Error notification pattern */
  error:   () => Promise<void>;
  /** Generic by level */
  impact:  (level?: HapticLevel) => Promise<void>;
}

export function useHaptic(): HapticHook {

  const isNative = typeof window !== 'undefined' && 'Capacitor' in window;

  const trigger = useCallback(async (fn: () => Promise<void>) => {
    if (!isNative) return; // Web: silently no-op
    try {
      await fn();
    } catch {
      // Haptic not supported on this device — swallow
    }
  }, [isNative]);

  const light = useCallback(() => trigger(async () => {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  }), [trigger]);

  const medium = useCallback(() => trigger(async () => {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  }), [trigger]);

  const heavy = useCallback(() => trigger(async () => {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }), [trigger]);

  const success = useCallback(() => trigger(async () => {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  }), [trigger]);

  const warning = useCallback(() => trigger(async () => {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Warning });
  }), [trigger]);

  const error = useCallback(() => trigger(async () => {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  }), [trigger]);

  const impact = useCallback((level: HapticLevel = 'light') => {
    switch (level) {
      case 'light':  return light();
      case 'medium': return medium();
      case 'heavy':  return heavy();
    }
  }, [light, medium, heavy]);

  return { light, medium, heavy, success, warning, error, impact };
}

export default useHaptic;

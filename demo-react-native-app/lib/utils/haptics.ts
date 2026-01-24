/**
 * Haptic feedback utility module.
 * Provides standardized haptic feedback for different interaction types.
 * Gracefully handles platforms where haptics are not available (e.g., web).
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Check if haptics are available on the current platform.
 * Haptics are only available on native platforms (iOS/Android).
 */
const isHapticsAvailable = Platform.OS !== 'web';

/**
 * Internal helper to safely execute haptic feedback.
 * Silently fails on platforms where haptics are not available.
 */
const safeHaptic = async (hapticFn: () => Promise<void>): Promise<void> => {
  if (!isHapticsAvailable) {
    return;
  }

  try {
    await hapticFn();
  } catch {
    // Silently fail if haptics are unavailable
    // This can happen on devices without haptic hardware
  }
};

/**
 * Haptic feedback utilities for the app.
 * Each method corresponds to a specific interaction type.
 *
 * Usage:
 * ```typescript
 * import { haptics } from '@/lib/utils/haptics';
 *
 * // Light tap for selection
 * haptics.light();
 *
 * // Success feedback for confirmation
 * haptics.success();
 * ```
 */
export const haptics = {
  /**
   * Light impact feedback - for selection actions.
   * Use when: selecting a suggestion, tapping a chip, etc.
   */
  light: (): Promise<void> =>
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Medium impact feedback - for notable actions.
   * Use when: adding to favorites, generating new ideas, etc.
   */
  medium: (): Promise<void> =>
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /**
   * Heavy impact feedback - for significant actions.
   * Use when: destructive actions, major state changes, etc.
   */
  heavy: (): Promise<void> =>
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  /**
   * Success notification feedback - for confirmations.
   * Use when: meal logged successfully, action completed, etc.
   */
  success: (): Promise<void> =>
    safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    ),

  /**
   * Warning notification feedback - for caution states.
   * Use when: validation warnings, approaching limits, etc.
   */
  warning: (): Promise<void> =>
    safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    ),

  /**
   * Error notification feedback - for failures.
   * Use when: action failed, validation error, etc.
   */
  error: (): Promise<void> =>
    safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    ),

  /**
   * Selection feedback - for UI element selection.
   * Use when: picker value changes, toggle switches, etc.
   */
  selection: (): Promise<void> =>
    safeHaptic(() => Haptics.selectionAsync()),
};

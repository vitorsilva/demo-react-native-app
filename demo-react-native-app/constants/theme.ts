/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// SaborSpin Brand Colors
const brandColors = {
  primary: '#FF6B35', // Orange - main brand color
  secondary: '#4CAF50', // Green - success, fresh/healthy
  accent: '#FFC107', // Yellow - warnings, highlights
};

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F8F9FA',
    tint: brandColors.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandColors.primary,
    // Brand colors
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1A2E',
    tint: brandColors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandColors.primary,
    // Brand colors
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

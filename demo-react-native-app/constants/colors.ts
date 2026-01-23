/**
 * App color palette - centralized color constants.
 * Reduces duplication and ensures consistency across the app.
 */

// Brand colors (from theme.ts)
export const brand = {
  primary: '#FF6B35', // Orange - main brand color
  secondary: '#4CAF50', // Green - success, fresh/healthy
  accent: '#FFC107', // Yellow - warnings, highlights
};

// UI colors used throughout the app
export const colors = {
  // Primary accent (buttons, links, active states)
  primary: '#3e96ef',
  primaryLight: '#4a96e3',

  // Backgrounds
  background: '#111418',
  backgroundDark: '#0a0e14',
  backgroundCard: '#1f2329',
  backgroundModal: '#1a1f25',
  backgroundInput: '#283039',
  backgroundInactive: '#283039',
  backgroundHighlight: '#1a2332',
  backgroundFooter: '#171b20',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9dabb9',
  textMuted: '#9BA1A6',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#283039',
  borderActive: '#3e96ef',
  borderFooter: '#283039',

  // States
  error: '#ff4444',
  errorLight: '#ff6b6b',
  errorBackground: '#2a1a1a',
  disabled: '#4a4a4a',
  disabledText: '#888888',

  // Switch/Slider
  switchTrackFalse: '#3e3e3e',
  switchTrackTrue: '#3e96ef',
  switchThumbActive: '#FFFFFF',
  switchThumbInactive: '#9dabb9',
  sliderTrack: '#4a5568',

  // Specific components
  historyCardBackground: '#1a1d23',
  historyDateBackground: '#1f2329',
  confirmationModalBackground: '#1c2127',
  confirmationDivider: '#9dabb9',
};

// Export individual colors for convenience
export const {
  primary,
  background,
  textPrimary,
  textSecondary,
  error,
} = colors;

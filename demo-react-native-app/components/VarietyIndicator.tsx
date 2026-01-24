import { StyleSheet, View, type ViewProps } from 'react-native';
import type { VarietyColor } from '../lib/utils/variety';

export type VarietyIndicatorProps = ViewProps & {
  /** The color indicator based on recency */
  color: VarietyColor;
};

/**
 * A color dot indicator for variety coding on suggestion cards.
 * Shows recency of ingredient combinations:
 * - Green: Fresh choice (3+ days ago or never logged)
 * - Yellow: Recent (1-2 days ago)
 * - Red: Very recent (today)
 */
export function VarietyIndicator({ color, style, ...rest }: VarietyIndicatorProps) {
  const colorStyle = styles[color];

  return (
    <View
      style={[styles.container, colorStyle, style]}
      testID={`variety-indicator-${color}`}
      accessibilityRole="image"
      accessibilityLabel={getAccessibilityLabel(color)}
      {...rest}
    />
  );
}

function getAccessibilityLabel(color: VarietyColor): string {
  switch (color) {
    case 'green':
      return 'Fresh choice';
    case 'yellow':
      return 'Had recently';
    case 'red':
      return 'Had today';
  }
}

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  green: {
    backgroundColor: '#4CAF50', // SaborSpin green
  },
  yellow: {
    backgroundColor: '#FFC107', // SaborSpin yellow
  },
  red: {
    backgroundColor: '#F44336', // Red for today
  },
});

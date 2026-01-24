import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import type { VarietyColor } from '../lib/utils/variety';

export type VarietyIndicatorProps = ViewProps & {
  /** The color indicator based on recency */
  color: VarietyColor;
};

/**
 * A color and shape indicator for variety coding on suggestion cards.
 * Shows recency of ingredient combinations with both color and icon for accessibility:
 * - Green with checkmark: Fresh choice (3+ days ago or never logged)
 * - Yellow with circle: Recent (1-2 days ago)
 * - Red with exclamation: Very recent (today)
 */
export function VarietyIndicator({ color, style, ...rest }: VarietyIndicatorProps) {
  const { t } = useTranslation('suggestions');
  const colorStyle = styles[color];
  const icon = getIcon(color);
  const accessibilityLabel = getAccessibilityLabel(color, t);

  return (
    <View
      style={[styles.container, colorStyle, style]}
      testID={`variety-indicator-${color}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      <Text style={styles.icon}>{icon}</Text>
    </View>
  );
}

function getIcon(color: VarietyColor): string {
  switch (color) {
    case 'green':
      return '✓'; // Checkmark - fresh/good choice
    case 'yellow':
      return '○'; // Circle - neutral/recent
    case 'red':
      return '!'; // Exclamation - warning/very recent
  }
}

function getAccessibilityLabel(
  color: VarietyColor,
  t: (key: string) => string
): string {
  switch (color) {
    case 'green':
      return t('varietyIndicator.fresh');
    case 'yellow':
      return t('varietyIndicator.recent');
    case 'red':
      return t('varietyIndicator.veryRecent');
  }
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
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

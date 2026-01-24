import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

export type NewBadgeProps = ViewProps & {
  /** Whether the badge should be visible */
  visible?: boolean;
};

/**
 * A "New!" badge component for indicating combinations the user hasn't tried recently.
 * Displays as a small pill with accent color, positioned by the parent container.
 */
export function NewBadge({ visible = true, style, ...rest }: NewBadgeProps) {
  const { t } = useTranslation('suggestions');

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, style]} testID="new-badge" {...rest}>
      <Text style={styles.text}>{t('newBadge')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B35', // SaborSpin orange accent color
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

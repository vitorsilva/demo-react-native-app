import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View, type ViewProps } from 'react-native';
import { colors } from '../constants/colors';
import type { VarietyStats as VarietyStatsType } from '../lib/utils/variety';

export type VarietyStatsProps = ViewProps & {
  /** The calculated variety statistics */
  stats: VarietyStatsType;
  /** Map of ingredient IDs to names for display */
  ingredientNames: Map<string, string>;
};

/**
 * A collapsible card component displaying variety statistics.
 * Shows unique combinations, most common combo, ingredient usage, and variety score.
 */
export function VarietyStats({ stats, ingredientNames, style, ...rest }: VarietyStatsProps) {
  const { t } = useTranslation('stats');
  const [isExpanded, setIsExpanded] = useState(true);

  // Format the most common combo for display
  const formatCombo = (ingredients: string[]): string => {
    return ingredients
      .map((id) => ingredientNames.get(id) || id)
      .join(' + ');
  };

  const hasData = stats.uniqueCombosThisMonth > 0 || stats.mostCommonCombo !== null;

  return (
    <View style={[styles.container, style]} testID="variety-stats-card" {...rest}>
      {/* Header with title and expand/collapse button */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        testID="variety-stats-toggle"
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? t('varietyStats.collapse') : t('varietyStats.expand')}
      >
        <Text style={styles.title}>{t('varietyStats.title')}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Stats content (collapsible) */}
      {isExpanded && (
        <View style={styles.content} testID="variety-stats-content">
          {!hasData ? (
            <Text style={styles.noData}>{t('varietyStats.noData')}</Text>
          ) : (
            <>
              {/* Unique combinations */}
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statText}>
                  {t('varietyStats.uniqueCombinations', { count: stats.uniqueCombosThisMonth })}
                </Text>
              </View>

              {/* Most common combo */}
              {stats.mostCommonCombo && (
                <View style={styles.statRow}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statText}>
                    {t('varietyStats.mostCommon', {
                      combination: formatCombo(stats.mostCommonCombo.ingredients),
                      count: stats.mostCommonCombo.count,
                    })}
                  </Text>
                </View>
              )}

              {/* Ingredients used */}
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>🥗</Text>
                <Text style={styles.statText}>
                  {t('varietyStats.ingredientsUsed', {
                    used: stats.ingredientsUsedThisWeek,
                    total: stats.totalIngredients,
                  })}
                </Text>
              </View>

              {/* Variety score */}
              <View style={styles.statRow}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statText}>
                  {t('varietyStats.varietyScore', { score: stats.varietyScore })}
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandIcon: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  statText: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  noData: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

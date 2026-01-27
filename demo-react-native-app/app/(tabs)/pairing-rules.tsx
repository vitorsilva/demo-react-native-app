import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AddPairingRuleModal } from '../../components/AddPairingRuleModal';
import { PairingRuleItem } from '../../components/PairingRuleItem';
import { colors } from '../../constants/colors';
import { useStore } from '../../lib/store';
import { trackScreenView } from '../../lib/telemetry/screenTracking';
import type { PairingRule } from '../../types/database';

type TabType = 'positive' | 'negative';

export default function PairingRulesScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();

  // Zustand store selectors
  const isDatabaseReady = useStore((state) => state.isDatabaseReady);
  const pairingRules = useStore((state) => state.pairingRules);
  const ingredients = useStore((state) => state.ingredients);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Store actions
  const loadPairingRules = useStore((state) => state.loadPairingRules);
  const loadIngredients = useStore((state) => state.loadIngredients);
  const addPairingRule = useStore((state) => state.addPairingRule);
  const deletePairingRule = useStore((state) => state.deletePairingRule);

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('positive');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Load data when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      loadPairingRules();
      loadIngredients();
    }
  }, [isDatabaseReady, loadPairingRules, loadIngredients]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      trackScreenView('pairing-rules');
      if (isDatabaseReady) {
        loadPairingRules();
        loadIngredients();
      }
    }, [isDatabaseReady, loadPairingRules, loadIngredients])
  );

  // Filter rules by type
  const filteredRules = pairingRules.filter(
    (rule) => rule.ruleType === activeTab
  );

  // Check if a pairing rule already exists between two ingredients (using store state)
  const ruleExistsForPair = (ingredientAId: string, ingredientBId: string): boolean => {
    return pairingRules.some(
      (rule) =>
        (rule.ingredientAId === ingredientAId && rule.ingredientBId === ingredientBId) ||
        (rule.ingredientAId === ingredientBId && rule.ingredientBId === ingredientAId)
    );
  };

  // Handle add rule
  const handleAddRule = async (ingredientAId: string, ingredientBId: string) => {
    try {
      // Check if rule already exists (using store state)
      if (ruleExistsForPair(ingredientAId, ingredientBId)) {
        Alert.alert(t('errors:generic.error'), t('pairingRules.validation.ruleExists'));
        return;
      }

      await addPairingRule(ingredientAId, ingredientBId, activeTab);
      setIsAddModalVisible(false);
    } catch {
      Alert.alert(t('errors:generic.error'), t('pairingRules.validation.ruleExists'));
    }
  };

  // Handle delete rule
  const handleDeleteRule = (rule: PairingRule) => {
    Alert.alert(
      t('pairingRules.delete'),
      t('pairingRules.deleteConfirm'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('pairingRules.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deletePairingRule(rule.id);
            if (!result.success && result.error) {
              Alert.alert(t('errors:generic.error'), result.error);
            }
          },
        },
      ]
    );
  };

  const addButtonText = activeTab === 'positive'
    ? t('pairingRules.addGoodPair')
    : t('pairingRules.addAvoidPair');

  const emptyText = activeTab === 'positive'
    ? t('pairingRules.emptyGood')
    : t('pairingRules.emptyAvoid');

  const descriptionText = activeTab === 'positive'
    ? t('pairingRules.goodPairsDescription')
    : t('pairingRules.avoidDescription');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <Text style={styles.backButtonText}>← {t('common:buttons.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('pairingRules.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'positive' && styles.tabActive]}
          onPress={() => setActiveTab('positive')}
          testID="tab-good-pairs"
        >
          <Text style={[styles.tabText, activeTab === 'positive' && styles.tabTextActive]}>
            ✓ {t('pairingRules.goodPairs')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'negative' && styles.tabActive]}
          onPress={() => setActiveTab('negative')}
          testID="tab-avoid"
        >
          <Text style={[styles.tabText, activeTab === 'negative' && styles.tabTextActive]}>
            ✗ {t('pairingRules.avoid')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Description */}
      <Text style={styles.description}>{descriptionText}</Text>

      {/* Loading state */}
      {isLoading && filteredRules.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common:loading')}</Text>
        </View>
      )}

      {/* Rules list */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredRules.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyText}</Text>
          </View>
        ) : (
          filteredRules.map((rule) => (
            <PairingRuleItem
              key={rule.id}
              rule={rule}
              ingredients={ingredients}
              onDelete={() => handleDeleteRule(rule)}
            />
          ))
        )}
      </ScrollView>

      {/* Add button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          testID="add-pairing-rule-button"
        >
          <Text style={styles.addButtonText}>+ {addButtonText}</Text>
        </TouchableOpacity>
      </View>

      {/* Add modal */}
      <AddPairingRuleModal
        visible={isAddModalVisible}
        ruleType={activeTab}
        ingredients={ingredients}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddRule}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 80, // Balance the back button
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.backgroundFooter,
    borderTopWidth: 1,
    borderTopColor: colors.borderFooter,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

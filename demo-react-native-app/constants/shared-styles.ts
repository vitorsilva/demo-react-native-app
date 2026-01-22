/**
 * Shared styles used across multiple screens.
 * Extracted to reduce duplication and ensure consistency.
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Modal styles for add/edit dialogs.
 * Used by: manage-categories, manage-ingredients, settings
 */
export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.backgroundModal,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.backgroundInput,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.backgroundInactive,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

/**
 * Common screen layout styles.
 * Used by: manage-categories, manage-ingredients
 */
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

/**
 * Common action button styles (edit/delete).
 * Used by: manage-categories, manage-ingredients
 */
export const actionButtonStyles = StyleSheet.create({
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.backgroundInactive,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonTextDisabled: {
    color: colors.disabledText,
  },
});

  import { initDatabase, resetDatabase, getDatabase } from '../index';
  import {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  } from '../categories';
  import { resetTestDatabase } from './testDb';

  jest.mock('../index');

  describe('Category Operations', () => {
    beforeEach(async () => {
      // Reset the mock database completely
      resetTestDatabase();
      resetDatabase();

      // Initialize a fresh database
      await initDatabase();
    });

    test('getAllCategories returns empty array when no categories', async () => {
      const db = getDatabase();
      const categories = await getAllCategories(db);
      expect(categories).toEqual([]);
    });

    test('addCategory creates category with generated ID', async () => {
      const db = getDatabase();
      const category = await addCategory(db, { name: 'Protein' });

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(typeof category.id).toBe('string');
      expect(category.id.length).toBeGreaterThan(0);
      expect(category.name).toBe('Protein');
      expect(category.created_at).toBeDefined();
      expect(category.updated_at).toBeDefined();
    });

    test('getAllCategories returns all added categories in alphabetical order', async () => {
      const db = getDatabase();
      await addCategory(db, { name: 'Vegetables' });
      await addCategory(db, { name: 'Protein' });
      await addCategory(db, { name: 'Grains' });

      const categories = await getAllCategories(db);
      expect(categories).toHaveLength(3);
      expect(categories[0].name).toBe('Grains');
      expect(categories[1].name).toBe('Protein');
      expect(categories[2].name).toBe('Vegetables');
    });

    test('getCategoryById returns the correct category', async () => {
      const db = getDatabase();
      const created = await addCategory(db, { name: 'Dairy' });

      const found = await getCategoryById(db, created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Dairy');
    });

    test('getCategoryById returns null for non-existent ID', async () => {
      const db = getDatabase();
      const found = await getCategoryById(db, 'non-existent-id');
      expect(found).toBeNull();
    });

    test('updateCategory updates the name and updated_at', async () => {
      const db = getDatabase();
      const created = await addCategory(db, { name: 'Protien' }); // typo

      // Small delay to ensure updated_at is different
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateCategory(db, created.id, { name: 'Protein' });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Protein');
      expect(updated?.created_at).toBe(created.created_at); // unchanged
      expect(updated?.updated_at).not.toBe(created.updated_at); // changed
    });

    test('deleteCategory removes category when no ingredients assigned', async () => {
      const db = getDatabase();
      const created = await addCategory(db, { name: 'Temporary' });

      let categories = await getAllCategories(db);
      expect(categories).toHaveLength(1);

      const result = await deleteCategory(db, created.id);
      expect(result.success).toBe(true);

      categories = await getAllCategories(db);
      expect(categories).toHaveLength(0);
    });
  });
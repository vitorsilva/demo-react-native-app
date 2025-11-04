import { resetTestDatabase, createExpoSQLiteAdapter } from '../testDb';

export async function openDatabaseAsync(name: string) {
  return createExpoSQLiteAdapter(); // ← No parameter needed now
}

export function resetMockDatabase(): void {
  resetTestDatabase();
}

export default {
  openDatabaseAsync,
};

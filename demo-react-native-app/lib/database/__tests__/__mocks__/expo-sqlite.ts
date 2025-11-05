import { createExpoSQLiteAdapter } from '../testDb';

export async function openDatabaseAsync(name: string) {
  return createExpoSQLiteAdapter(); // ← No parameter needed now
}

export default {
  openDatabaseAsync,
};

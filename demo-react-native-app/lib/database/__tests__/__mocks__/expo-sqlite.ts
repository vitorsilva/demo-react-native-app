import { createTestAdapter } from '../testDb';

export async function openDatabaseAsync(name: string) {
  return createTestAdapter(); // ← No parameter needed now
}

export default {
  openDatabaseAsync,
};

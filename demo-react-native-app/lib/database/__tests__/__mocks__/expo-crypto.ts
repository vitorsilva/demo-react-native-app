// Mock expo-crypto to use Node.js crypto in tests
export const randomUUID = (): string => {
  return crypto.randomUUID();
};

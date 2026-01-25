/**
 * Unit tests for haptics utility module.
 * Tests that haptic functions call expo-haptics correctly,
 * respect user preferences, and handle platform limitations.
 */

// Helper to create mock haptics module
const createHapticsMock = () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
});

// Helper to create mock store
const createStoreMock = (hapticEnabled: boolean) => ({
  useStore: {
    getState: jest.fn().mockReturnValue({
      preferences: { hapticEnabled },
    }),
  },
});

describe('haptics utility', () => {
  describe('when haptics are enabled and platform supports haptics (iOS)', () => {
    let haptics: typeof import('../haptics').haptics;
    let HapticsMock: ReturnType<typeof createHapticsMock>;

    beforeEach(() => {
      jest.resetModules();
      HapticsMock = createHapticsMock();

      jest.doMock('expo-haptics', () => HapticsMock);
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.doMock('@/lib/store', () => createStoreMock(true));

      haptics = require('../haptics').haptics;
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('light() calls impactAsync with Light style', async () => {
      await haptics.light();

      expect(HapticsMock.impactAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.impactAsync).toHaveBeenCalledWith(
        HapticsMock.ImpactFeedbackStyle.Light
      );
    });

    it('medium() calls impactAsync with Medium style', async () => {
      await haptics.medium();

      expect(HapticsMock.impactAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.impactAsync).toHaveBeenCalledWith(
        HapticsMock.ImpactFeedbackStyle.Medium
      );
    });

    it('heavy() calls impactAsync with Heavy style', async () => {
      await haptics.heavy();

      expect(HapticsMock.impactAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.impactAsync).toHaveBeenCalledWith(
        HapticsMock.ImpactFeedbackStyle.Heavy
      );
    });

    it('success() calls notificationAsync with Success type', async () => {
      await haptics.success();

      expect(HapticsMock.notificationAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.notificationAsync).toHaveBeenCalledWith(
        HapticsMock.NotificationFeedbackType.Success
      );
    });

    it('warning() calls notificationAsync with Warning type', async () => {
      await haptics.warning();

      expect(HapticsMock.notificationAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.notificationAsync).toHaveBeenCalledWith(
        HapticsMock.NotificationFeedbackType.Warning
      );
    });

    it('error() calls notificationAsync with Error type', async () => {
      await haptics.error();

      expect(HapticsMock.notificationAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.notificationAsync).toHaveBeenCalledWith(
        HapticsMock.NotificationFeedbackType.Error
      );
    });

    it('selection() calls selectionAsync', async () => {
      await haptics.selection();

      expect(HapticsMock.selectionAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('when haptics are disabled in preferences', () => {
    let haptics: typeof import('../haptics').haptics;
    let HapticsMock: ReturnType<typeof createHapticsMock>;

    beforeEach(() => {
      jest.resetModules();
      HapticsMock = createHapticsMock();

      jest.doMock('expo-haptics', () => HapticsMock);
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.doMock('@/lib/store', () => createStoreMock(false));

      haptics = require('../haptics').haptics;
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('light() does not call expo-haptics', async () => {
      await haptics.light();

      expect(HapticsMock.impactAsync).not.toHaveBeenCalled();
    });

    it('medium() does not call expo-haptics', async () => {
      await haptics.medium();

      expect(HapticsMock.impactAsync).not.toHaveBeenCalled();
    });

    it('heavy() does not call expo-haptics', async () => {
      await haptics.heavy();

      expect(HapticsMock.impactAsync).not.toHaveBeenCalled();
    });

    it('success() does not call expo-haptics', async () => {
      await haptics.success();

      expect(HapticsMock.notificationAsync).not.toHaveBeenCalled();
    });

    it('warning() does not call expo-haptics', async () => {
      await haptics.warning();

      expect(HapticsMock.notificationAsync).not.toHaveBeenCalled();
    });

    it('error() does not call expo-haptics', async () => {
      await haptics.error();

      expect(HapticsMock.notificationAsync).not.toHaveBeenCalled();
    });

    it('selection() does not call expo-haptics', async () => {
      await haptics.selection();

      expect(HapticsMock.selectionAsync).not.toHaveBeenCalled();
    });
  });

  describe('when platform is web (haptics unavailable)', () => {
    let haptics: typeof import('../haptics').haptics;
    let HapticsMock: ReturnType<typeof createHapticsMock>;

    beforeEach(() => {
      jest.resetModules();
      HapticsMock = createHapticsMock();

      jest.doMock('expo-haptics', () => HapticsMock);
      jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
      jest.doMock('@/lib/store', () => createStoreMock(true));

      haptics = require('../haptics').haptics;
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('light() does not call expo-haptics on web', async () => {
      await haptics.light();

      expect(HapticsMock.impactAsync).not.toHaveBeenCalled();
    });

    it('medium() does not call expo-haptics on web', async () => {
      await haptics.medium();

      expect(HapticsMock.impactAsync).not.toHaveBeenCalled();
    });

    it('success() does not call expo-haptics on web', async () => {
      await haptics.success();

      expect(HapticsMock.notificationAsync).not.toHaveBeenCalled();
    });

    it('error() does not call expo-haptics on web', async () => {
      await haptics.error();

      expect(HapticsMock.notificationAsync).not.toHaveBeenCalled();
    });

    it('selection() does not call expo-haptics on web', async () => {
      await haptics.selection();

      expect(HapticsMock.selectionAsync).not.toHaveBeenCalled();
    });
  });

  describe('when expo-haptics throws an error', () => {
    let haptics: typeof import('../haptics').haptics;
    let HapticsMock: ReturnType<typeof createHapticsMock>;

    beforeEach(() => {
      jest.resetModules();
      HapticsMock = createHapticsMock();

      // Make expo-haptics throw an error (e.g., device without haptic hardware)
      HapticsMock.impactAsync.mockRejectedValue(
        new Error('Haptics not supported')
      );
      HapticsMock.notificationAsync.mockRejectedValue(
        new Error('Haptics not supported')
      );
      HapticsMock.selectionAsync.mockRejectedValue(
        new Error('Haptics not supported')
      );

      jest.doMock('expo-haptics', () => HapticsMock);
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.doMock('@/lib/store', () => createStoreMock(true));

      haptics = require('../haptics').haptics;
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('light() does not throw when expo-haptics fails', async () => {
      await expect(haptics.light()).resolves.toBeUndefined();
    });

    it('medium() does not throw when expo-haptics fails', async () => {
      await expect(haptics.medium()).resolves.toBeUndefined();
    });

    it('heavy() does not throw when expo-haptics fails', async () => {
      await expect(haptics.heavy()).resolves.toBeUndefined();
    });

    it('success() does not throw when expo-haptics fails', async () => {
      await expect(haptics.success()).resolves.toBeUndefined();
    });

    it('warning() does not throw when expo-haptics fails', async () => {
      await expect(haptics.warning()).resolves.toBeUndefined();
    });

    it('error() does not throw when expo-haptics fails', async () => {
      await expect(haptics.error()).resolves.toBeUndefined();
    });

    it('selection() does not throw when expo-haptics fails', async () => {
      await expect(haptics.selection()).resolves.toBeUndefined();
    });
  });

  describe('platform android', () => {
    let haptics: typeof import('../haptics').haptics;
    let HapticsMock: ReturnType<typeof createHapticsMock>;

    beforeEach(() => {
      jest.resetModules();
      HapticsMock = createHapticsMock();

      jest.doMock('expo-haptics', () => HapticsMock);
      jest.doMock('react-native', () => ({ Platform: { OS: 'android' } }));
      jest.doMock('@/lib/store', () => createStoreMock(true));

      haptics = require('../haptics').haptics;
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('light() calls expo-haptics on Android', async () => {
      await haptics.light();

      expect(HapticsMock.impactAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.impactAsync).toHaveBeenCalledWith(
        HapticsMock.ImpactFeedbackStyle.Light
      );
    });

    it('success() calls expo-haptics on Android', async () => {
      await haptics.success();

      expect(HapticsMock.notificationAsync).toHaveBeenCalledTimes(1);
      expect(HapticsMock.notificationAsync).toHaveBeenCalledWith(
        HapticsMock.NotificationFeedbackType.Success
      );
    });
  });
});

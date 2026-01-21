import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      telemetryEnabled: true,
      telemetryEndpoint: 'https://test.com/telemetry',
      telemetryToken: 'test-token',
      telemetryBatchSize: 5,
      telemetryFlushInterval: 30000,
    },
    version: '1.0.0',
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Import after mocks
import { SaberloopSpanExporter } from '../SaberloopSpanExporter';

// Helper to create mock ReadableSpan
function createMockSpan(name: string, durationMs: number = 100) {
  const now = Date.now() / 1000;
  const startTime = [Math.floor(now), 0] as [number, number];
  const endTime = [Math.floor(now + durationMs / 1000), (durationMs % 1000) * 1e6] as [
    number,
    number,
  ];

  return {
    name,
    kind: SpanKind.INTERNAL,
    spanContext: () => ({
      traceId: 'trace-123',
      spanId: 'span-456',
      traceFlags: 1,
    }),
    parentSpanId: undefined,
    startTime,
    endTime,
    status: { code: SpanStatusCode.OK },
    attributes: { 'test.attr': 'value' },
    links: [],
    events: [],
    resource: { attributes: {} },
    instrumentationLibrary: { name: 'test' },
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
    ended: true,
    duration: [0, durationMs * 1e6] as [number, number],
  };
}

describe('SaberloopSpanExporter', () => {
  let exporter: SaberloopSpanExporter;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    exporter = new SaberloopSpanExporter();
  });

  afterEach(async () => {
    // Clean up timer
    await exporter.shutdown();
  });

  describe('export()', () => {
    it('should convert span to JSON event format', () => {
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);

      // Check callback was called with success
      expect(mockCallback).toHaveBeenCalledWith({ code: ExportResultCode.SUCCESS });
    });

    it('should include required event fields when flushing', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation', 250);

      // Export span and trigger flush by reaching batch size
      for (let i = 0; i < 5; i++) {
        exporter.export([span as any], mockCallback);
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(fetch).toHaveBeenCalled();
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);

      expect(body.events[0]).toMatchObject({
        type: 'span',
        app: 'saborspin',
        appVersion: '1.0.0',
        timestamp: expect.any(String),
        data: expect.objectContaining({
          traceId: 'trace-123',
          spanId: 'span-456',
          name: 'test.operation',
        }),
      });
    });

    it('should auto-flush when batch size reached', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      // Add 5 spans (batch size)
      for (let i = 0; i < 5; i++) {
        exporter.export([span as any], mockCallback);
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(fetch).toHaveBeenCalled();
    });

    it('should not flush before batch size reached', () => {
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      // Add 4 spans (less than batch size of 5)
      for (let i = 0; i < 4; i++) {
        exporter.export([span as any], mockCallback);
      }

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('forceFlush()', () => {
    it('should send events to endpoint with correct headers', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      expect(fetch).toHaveBeenCalledWith(
        'https://test.com/telemetry',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Telemetry-Token': 'test-token',
          }),
        })
      );
    });

    it('should include sentAt in payload', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.sentAt).toBeDefined();
    });

    it('should save to AsyncStorage on network failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'saborspin_telemetry_queue',
        expect.any(String)
      );
    });

    it('should re-queue events on HTTP error', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.forceFlush();

      // Should have saved to offline storage
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not send if queue is empty', async () => {
      await exporter.forceFlush();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('offline queue', () => {
    it('should load saved queue on initialization', async () => {
      const savedEvents = JSON.stringify([
        { type: 'span', data: { name: 'saved' }, timestamp: '2025-01-01' },
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      const newExporter = new SaberloopSpanExporter();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('saborspin_telemetry_queue');
      await newExporter.shutdown();
    });

    it('should remove saved queue after loading', async () => {
      const savedEvents = JSON.stringify([]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedEvents);

      const newExporter = new SaberloopSpanExporter();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('saborspin_telemetry_queue');
      await newExporter.shutdown();
    });
  });

  describe('shutdown()', () => {
    it('should flush remaining events', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      const mockCallback = jest.fn();
      const span = createMockSpan('test.operation');

      exporter.export([span as any], mockCallback);
      await exporter.shutdown();

      expect(fetch).toHaveBeenCalled();
    });
  });
});

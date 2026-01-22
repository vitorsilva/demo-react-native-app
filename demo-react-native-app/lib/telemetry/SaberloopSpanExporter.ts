import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration from app.json extra or defaults
const CONFIG = {
  endpoint: Constants.expoConfig?.extra?.telemetryEndpoint ?? '',
  token: Constants.expoConfig?.extra?.telemetryToken ?? '',
  batchSize: Constants.expoConfig?.extra?.telemetryBatchSize ?? 10,
  flushInterval: Constants.expoConfig?.extra?.telemetryFlushInterval ?? 30000,
};

const STORAGE_KEY = 'saborspin_telemetry_queue';

interface TelemetryEvent {
  type: 'span';
  data: {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    kind: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    attributes: Record<string, unknown>;
  };
  timestamp: string;
  app: string;
  appVersion: string;
}

/**
 * Custom SpanExporter that sends spans to Saberloop PHP backend.
 * Features:
 * - Batching: Events queued and sent when batch size reached
 * - Offline resilience: Events saved to AsyncStorage if network fails
 * - Flush timer: Periodic flush even if batch size not reached
 */
export class SaberloopSpanExporter implements SpanExporter {
  private queue: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadOfflineQueue();
    this.startFlushTimer();
  }

  /**
   * Load any events that were saved offline during previous session
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.queue = [...parsed, ...this.queue];
        }
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('[Telemetry] Failed to load offline queue:', error);
    }
  }

  /**
   * Save current queue to AsyncStorage for offline persistence
   */
  private async saveOfflineQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('[Telemetry] Failed to save offline queue:', error);
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.forceFlush(), CONFIG.flushInterval);
  }

  /**
   * Convert OTel span to simple JSON event format for Saberloop backend
   */
  private spanToEvent(span: ReadableSpan): TelemetryEvent {
    const startTime = span.startTime;
    const endTime = span.endTime;
    // OTel times are [seconds, nanoseconds] tuples
    const durationNs = (endTime[0] - startTime[0]) * 1e9 + (endTime[1] - startTime[1]);
    const durationMs = durationNs / 1e6;

    return {
      type: 'span',
      data: {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        kind: span.kind.toString(),
        startTime: new Date(startTime[0] * 1000 + startTime[1] / 1e6).toISOString(),
        endTime: new Date(endTime[0] * 1000 + endTime[1] / 1e6).toISOString(),
        duration: Math.round(durationMs),
        status: span.status.code.toString(),
        attributes: span.attributes as Record<string, unknown>,
      },
      timestamp: new Date().toISOString(),
      app: 'saborspin',
      appVersion: Constants.expoConfig?.version ?? 'unknown',
    };
  }

  /**
   * Export spans - called by OTel SDK
   */
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    // Convert spans to events and add to queue
    for (const span of spans) {
      this.queue.push(this.spanToEvent(span));
    }

    // Auto-flush if batch size reached
    if (this.queue.length >= CONFIG.batchSize) {
      this.forceFlush()
        .then(() => resultCallback({ code: ExportResultCode.SUCCESS }))
        .catch(() => resultCallback({ code: ExportResultCode.FAILED }));
    } else {
      resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  /**
   * Force flush all queued events to backend
   */
  async forceFlush(): Promise<void> {
    if (this.queue.length === 0 || !CONFIG.endpoint) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telemetry-Token': CONFIG.token,
        },
        body: JSON.stringify({
          events: eventsToSend,
          sentAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Re-queue failed events and save offline
      this.queue = [...eventsToSend, ...this.queue];
      await this.saveOfflineQueue();
      console.warn('[Telemetry] Flush failed, saved offline:', error);
    }
  }

  /**
   * Shutdown exporter - flush remaining events
   */
  shutdown(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    return this.forceFlush();
  }
}

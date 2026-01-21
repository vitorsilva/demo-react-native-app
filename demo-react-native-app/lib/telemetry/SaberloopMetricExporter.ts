import {
  PushMetricExporter,
  ResourceMetrics,
  AggregationTemporality,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import Constants from 'expo-constants';

// Configuration from app.json extra or defaults
const CONFIG = {
  endpoint: Constants.expoConfig?.extra?.telemetryEndpoint ?? '',
  token: Constants.expoConfig?.extra?.telemetryToken ?? '',
};

interface MetricEvent {
  type: 'metric';
  data: {
    name: string;
    description?: string;
    unit?: string;
    value: number;
    attributes: Record<string, unknown>;
  };
  timestamp: string;
  app: string;
  appVersion: string;
}

/**
 * Custom MetricExporter that sends metrics to Saberloop PHP backend.
 * Simpler than SpanExporter - metrics are sent immediately without batching
 * since the OTel SDK already handles periodic export.
 */
export class SaberloopMetricExporter implements PushMetricExporter {
  /**
   * Return aggregation temporality for the instrument type
   * Using CUMULATIVE means we send the total accumulated value
   */
  selectAggregationTemporality(_instrumentType: InstrumentType): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }

  /**
   * Export metrics - called by OTel SDK periodically
   */
  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    const events: MetricEvent[] = [];

    // Convert OTel metrics to simple JSON events
    for (const scopeMetrics of metrics.scopeMetrics) {
      for (const metric of scopeMetrics.metrics) {
        for (const dataPoint of metric.dataPoints) {
          // Handle different data point value types
          let value: number;
          if (typeof dataPoint.value === 'number') {
            value = dataPoint.value;
          } else if (typeof dataPoint.value === 'object' && dataPoint.value !== null) {
            // For histogram data points
            const histValue = dataPoint.value as { sum?: number; count?: number };
            value = histValue.sum ?? histValue.count ?? 0;
          } else {
            value = 0;
          }

          events.push({
            type: 'metric',
            data: {
              name: metric.descriptor.name,
              description: metric.descriptor.description,
              unit: metric.descriptor.unit,
              value,
              attributes: dataPoint.attributes as Record<string, unknown>,
            },
            timestamp: new Date().toISOString(),
            app: 'saborspin',
            appVersion: Constants.expoConfig?.version ?? 'unknown',
          });
        }
      }
    }

    // Don't send if no events or no endpoint configured
    if (events.length === 0 || !CONFIG.endpoint) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    // Send to backend
    fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telemetry-Token': CONFIG.token,
      },
      body: JSON.stringify({
        events,
        sentAt: new Date().toISOString(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          resultCallback({ code: ExportResultCode.SUCCESS });
        } else {
          console.warn('[Telemetry] Metric export failed:', response.status);
          resultCallback({ code: ExportResultCode.FAILED });
        }
      })
      .catch((error) => {
        console.warn('[Telemetry] Metric export error:', error);
        resultCallback({ code: ExportResultCode.FAILED });
      });
  }

  /**
   * Force flush - metrics are sent immediately so nothing to do
   */
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Shutdown exporter
   */
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

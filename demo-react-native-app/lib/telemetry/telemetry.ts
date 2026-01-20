import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

// Define metadata about your application
// This helps identify your app in observability backends
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'saborspin',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// === TRACER SETUP ===
// Create the tracer provider
const provider = new WebTracerProvider({
  resource,
});

// Configure where to send traces (local for now, will update later)
const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// Add the exporter to the provider with batching
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// === METRICS SETUP ===
// Configure where to send metrics (same server, different endpoint)
const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4319/v1/metrics',
});

// Create the meter provider (uses same resource as traces!)
const meterProvider = new MeterProvider({
  resource,
});

// Add metric reader - exports metrics every 60 seconds
meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // 60 seconds
  })
);

// Register the provider globally so the whole app can use it
provider.register();

// Export a tracer that other files can import and use
export const tracer = provider.getTracer('saborspin');

// Export a metric that other files can import and use
export const meter = meterProvider.getMeter('saborspin');

import { Resource } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import Constants from 'expo-constants';

// Import custom Saberloop exporters
import { SaberloopMetricExporter } from './SaberloopMetricExporter';
import { SaberloopSpanExporter } from './SaberloopSpanExporter';

// Check if telemetry is enabled via app.json config
const isEnabled = Constants.expoConfig?.extra?.telemetryEnabled ?? false;

// Define metadata about your application
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'saborspin',
  [ATTR_SERVICE_VERSION]: Constants.expoConfig?.version ?? '1.0.0',
});

// === TRACER SETUP ===
const provider = new WebTracerProvider({ resource });

if (isEnabled) {
  // Use custom Saberloop exporter
  const spanExporter = new SaberloopSpanExporter();
  provider.addSpanProcessor(new BatchSpanProcessor(spanExporter));
}

provider.register();

// === METRICS SETUP ===
const meterProvider = new MeterProvider({ resource });

if (isEnabled) {
  // Use custom Saberloop exporter
  const metricExporter = new SaberloopMetricExporter();
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // 60 seconds
    })
  );
}

// Export tracer and meter for use throughout the app
export const tracer = provider.getTracer('saborspin');
export const meter = meterProvider.getMeter('saborspin');

// Export enabled status for conditional logging
export const isTelemetryEnabled = isEnabled;

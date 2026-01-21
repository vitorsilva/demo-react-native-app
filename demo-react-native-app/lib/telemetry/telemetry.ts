import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { MeterProvider } from '@opentelemetry/sdk-metrics';

// TODO: Step 5.1-5.3 will add custom Saberloop exporters

// Define metadata about your application
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'saborspin',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// === TRACER SETUP ===
const provider = new WebTracerProvider({
  resource,
});

// TODO: Custom exporter will be added in Step 5.1-5.3
// provider.addSpanProcessor(new BatchSpanProcessor(spanExporter));

provider.register();

// === METRICS SETUP ===
const meterProvider = new MeterProvider({
  resource,
});

// TODO: Custom metric exporter will be added in Step 5.1-5.3

// Export tracer and meter for use throughout the app
export const tracer = provider.getTracer('saborspin');
export const meter = meterProvider.getMeter('saborspin');

// Export enabled status (will be configured in Step 5.12)
export const isTelemetryEnabled = false;

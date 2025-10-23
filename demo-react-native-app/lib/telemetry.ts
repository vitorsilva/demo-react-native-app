import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// Define metadata about your application
// This helps identify your app in observability backends
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'demo-react-native-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

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

// Register the provider globally so the whole app can use it
provider.register();

// Export a tracer that other files can import and use
export const tracer = provider.getTracer('demo-react-native-app');

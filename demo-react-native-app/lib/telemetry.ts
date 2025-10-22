import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Create the tracer provider
const provider = new WebTracerProvider();

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

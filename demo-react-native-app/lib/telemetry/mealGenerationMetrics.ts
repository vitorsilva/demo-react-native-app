import { meter } from './telemetry';

// Counter: How many times meal suggestions were generated
export const mealGenerationCounter = meter.createCounter('meal_generation_total', {
  description: 'Total number of meal suggestion generations',
});

// Histogram: How long generation takes (in milliseconds)
export const mealGenerationDuration = meter.createHistogram('meal_generation_duration_ms', {
  description: 'Time taken to generate meal suggestions',
  unit: 'ms',
});

// Counter: Track how many suggestions were returned
export const suggestionsGeneratedCounter = meter.createCounter('suggestions_generated_total', {
  description: 'Total number of meal suggestions generated',
});

/**
 * @blue/telemetry/web — browser telemetry entry point.
 *
 * Aggregates the browser configuration (`configureBrowserTelemetry`) and the
 * platform-web instrumentations (e.g. `RouterInstrumentation`).
 *
 * Import this path (`@blue/telemetry/web`) instead of the root when you need
 * browser setup, so node-only bundles never pull the browser SDK config.
 *
 * @module
 * @since 1.0.0
 */

export { configureBrowserTelemetry, type BrowserTelemetryConfig } from './browser-config';
export { RouterInstrumentation } from './instrumentation/router/router';
export { ContextInstrumentation } from './instrumentation/context/context';
export { DispatcherInstrumentation } from './instrumentation/dispatcher/dispatcher';
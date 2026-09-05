/**
 * @blue/telemetry-web — browser telemetry entry point.
 *
 * Browser telemetry configuration and web instrumentations:
 * - `configureBrowserTelemetry` (console providers, resource from attributes)
 * - `RouterInstrumentation`, `DispatcherInstrumentation`, `ContextInstrumentation`
 *
 * Import `@blue/telemetry` (root) for the isomorphic API — logger, metrics,
 * severity, and tracing decorators with zero browser SDK weight.
 *
 * @module
 * @since 1.0.0
 */

export { configureBrowserTelemetry, type BrowserTelemetryConfig } from './browser-config';
export { RouterInstrumentation } from './instrumentation/router/router';
export { DispatcherInstrumentation } from './instrumentation/dispatcher/dispatcher';
export { ContextInstrumentation } from './instrumentation/context/context';

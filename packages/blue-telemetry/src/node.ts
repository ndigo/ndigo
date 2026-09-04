/**
 * Node.js telemetry entry point.
 *
 * Aggregates the Node-specific configuration and the platform-node
 * instrumentations (`HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`).
 *
 * Import this path (`@blue/telemetry/node`) instead of the root when you need
 * server instrumentation, so browser bundles don't pull in `@blue/platform-node`.
 *
 * @module
 * @since 1.0.0
 */

export { configureTelemetry, type TelemetryConfig } from './node-config';
export { HTTPServerInstrumentation } from './instrumentation/http-server/http-server';
export { HTTPResponseViewTargetInstrumentation } from './instrumentation/http-response-view-target/http-response-view-target';
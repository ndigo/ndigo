/**
 * @blue/telemetry-node — Node.js telemetry entry point.
 *
 * NodeSDK configuration and the Node platform instrumentations:
 * - `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`,
 *   `ServerSentEventViewInstrumentation`
 * - `DispatcherInstrumentation`, `ContextInstrumentation`, `CountedRegistry`
 *   instrumentation bases (isomorphic, re-exported for Node setup paths)
 *
 * Import `@blue/telemetry` (root) for the isomorphic API — logger, metrics,
 * severity, and tracing decorators with zero Node SDK weight.
 *
 * @module
 * @since 1.0.0
 */

export { configureTelemetry, type TelemetryConfig } from './node-config';
export { HTTPServerInstrumentation } from './instrumentation/http-server/http-server';
export { HTTPResponseViewTargetInstrumentation } from './instrumentation/http-response-view-target/http-response-view-target';
export { ServerSentEventViewInstrumentation } from './instrumentation/server-sent-event-view/server-sent-event-view';
export { ContextInstrumentation } from './instrumentation/context/context';
export { SeverityFilterLogRecordProcessor } from './severity-filter-log-record-processor';

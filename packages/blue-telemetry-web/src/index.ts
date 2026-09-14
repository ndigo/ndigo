/**
 * Browser telemetry configuration and web instrumentations:.
 * * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
export { configureBrowserTelemetry, type BrowserTelemetryConfig } from './browser-config';
export { RouterInstrumentation } from './instrumentation/router/router';
export { DispatcherInstrumentation } from './instrumentation/dispatcher/dispatcher';
export { ContextInstrumentation } from './instrumentation/context/context';

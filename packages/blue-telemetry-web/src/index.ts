/**
 * Browser telemetry configuration and web instrumentations.
 *
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
export { configureBrowserTelemetry, type BrowserTelemetryConfig, type BrowserTelemetryHandle } from './browser-config';
export { RouterInstrumentation } from './instrumentation/router/router';
export { ContextInstrumentation, DispatcherInstrumentation } from '@blue/telemetry';
export {
    WebSocketClientInstrumentation,
    countSocketClientStatus,
    countSocketClientBytes,
} from './instrumentation/websocket-client/websocket-client';

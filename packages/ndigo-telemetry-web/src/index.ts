/**
 * Browser telemetry configuration and web instrumentations.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export { configureBrowserTelemetry, type BrowserTelemetryConfig, type BrowserTelemetryHandle } from './browser-config';
export { RouterInstrumentation } from './instrumentation/router/router';
export { ContextInstrumentation, DispatcherInstrumentation } from '@ndigo/telemetry';
export {
    WebSocketClientInstrumentation,
    countSocketClientStatus,
    countSocketClientBytes,
} from './instrumentation/websocket-client/websocket-client';

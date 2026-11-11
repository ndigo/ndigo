/**
 * Browser telemetry configuration and web instrumentations.
 */
export { configureBrowserTelemetry, type BrowserTelemetryConfig, type BrowserTelemetryHandle } from './browser-config';
export { AuthClientInstrumentation } from './instrumentation/auth-client/auth-client';
export { RouterInstrumentation } from './instrumentation/router/router';
export { ContextInstrumentation, DispatcherInstrumentation } from '@ndigo/telemetry';
export {
    WebSocketClientInstrumentation,
    countSocketClientStatus,
    countSocketClientBytes,
} from './instrumentation/websocket-client/websocket-client';

/**
 * NodeSDK configuration and the Node platform instrumentations:.
 * * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
export { configureTelemetry, type TelemetryConfig } from './node-config';
export { HTTPServerInstrumentation } from './instrumentation/http-server/http-server';
export { HTTPResponseViewTargetInstrumentation } from './instrumentation/http-response-view-target/http-response-view-target';
export { ServerSentEventViewInstrumentation } from './instrumentation/server-sent-event-view/server-sent-event-view';
export {
    WebSocketServerInstrumentation,
    type WebSocketServerInstrumentationOptions,
} from './instrumentation/websocket-server/websocket-server';
export { ContextInstrumentation } from './instrumentation/context/context';
export { SeverityFilterLogRecordProcessor } from './severity-filter-log-record-processor';

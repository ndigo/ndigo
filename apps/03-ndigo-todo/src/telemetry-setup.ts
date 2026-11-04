/**
 * Browser telemetry bootstrap for the Ndigo Demo application.
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configureBrowserTelemetry } from '@ndigo/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'ndigo-todo',
    useConsoleExporters: true,
});

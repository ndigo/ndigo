/**
 * Browser telemetry bootstrap for the Ndigo Demo application.
 */
import { configureBrowserTelemetry } from '@ndigo/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'ndigo-todo-web',
    useConsoleExporters: true,
});

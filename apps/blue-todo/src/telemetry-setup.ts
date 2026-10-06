/**
 * Browser telemetry bootstrap for the Blue Demo application.
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configureBrowserTelemetry } from '@blue/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'blue-todo',
    useConsoleExporters: true,
});

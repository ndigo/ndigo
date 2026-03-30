/**
 * Browser telemetry bootstrap for the Blue Demo application.
 *
 * This module must be imported before any other application code to ensure
 * OpenTelemetry providers are registered before `@traced` decorators or
 * `getLogger` calls execute.
 */
import { configureBrowserTelemetry } from '@blue/telemetry/browser';

configureBrowserTelemetry({
    serviceName: 'blue-demo',
    useConsoleExporters: true,
});

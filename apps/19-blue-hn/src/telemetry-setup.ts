/**
 * Browser telemetry bootstrap for the HN reader.
 *
 * Registers the global tracer/meter providers (console exporters in the demo)
 * before any span is started, so the feed/item load spans in `HnService` are
 * actually recorded — and routes the browser `fetch`/document-load signals the
 * `@blue/telemetry-web` instrumentations provide onto the same providers.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configureBrowserTelemetry } from '@blue/telemetry-web';

configureBrowserTelemetry({
    serviceName: 'blue-hn',
    useConsoleExporters: true,
});

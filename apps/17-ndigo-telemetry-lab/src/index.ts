/**
 * Ndigo Telemetry Lab — one process that shows the whole observability journey:
 * a browser action propagates W3C trace context, the server continues the
 * trace and instruments the handler, a scheduled task emits its own spans and
 * counters, and a socket pushes the metric snapshot back to the page — all
 * exported to the console, or to an OTLP collector when
 * `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
 *
 * Telemetry is configured here, at boot, before any context exists:
 * OpenTelemetry's global providers register once per process (AD-32), so
 * `configureTelemetry` must run first and wins. The app configuration class
 * never touches the OTel API, which is what keeps `bootApp`-based tests
 * hermetic.
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@ndigo/platform-node';
import { TASK_SCHEDULER } from '@ndigo/scheduler';
import { getLogger } from '@ndigo/log';
import { configureTelemetry } from '@ndigo/telemetry-node';
import { getErrorMessage } from '@ndigo/util';
import { TelemetryLabConfiguration, applyLabSecurityHeaders } from './telemetry-lab-configuration';
import { resolveLabTelemetry } from './telemetry-config';

// The managed server reads its port from `process.env.PORT` at construction
// (readIntEnv), so surface the app's default before any context is built.
process.env['PORT'] ??= '3090';
const PORT = Number(getEnv('PORT', '3090'));
const logger = getLogger('ndigo-telemetry-lab');

async function main() {
    // Resolve and apply the exporter/sampler choice before refresh: the
    // instrumentations enabled here wrap the platform's HTTP server, socket
    // adapter, and dispatcher, so the spans of the very first request nest
    // under a continued trace.
    const telemetry = resolveLabTelemetry();
    const sdk = configureTelemetry(telemetry.config);

    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        TelemetryLabConfiguration,
    ]).run();

    // SEC-C: widen `connect-src` for the page's WebSocket (and the collector,
    // when one is configured) — the handler mapping entry exists post-refresh.
    applyLabSecurityHeaders(context, telemetry);

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    // Shutdown order matters, and this is the lab's own lesson: closing the
    // HTTP server tears down the socket session registry it shares with the
    // controllers (PLN-F10), while `@scheduled` tasks keep firing until the
    // context closes. A push tick landing in that window throws
    // `Socket session registry is closed` — observed as an Error-status
    // scheduler task span. Stopping the registry first closes the window:
    // no task runs after the resources start closing.
    //
    // OP-9: batched telemetry is dropped on exit unless the SDK shuts down —
    // flush after the server stops (capturing its shutdown spans) and before
    // the context tears its entries down. `configureTelemetry` returns
    // `undefined` only when a provider was already registered in this process.
    const schedules = context.getValue(TASK_SCHEDULER);
    gracefulShutdown(context, {
        resources: [{ close: () => schedules.stop() }, server, ...(sdk ? [{ close: () => sdk.shutdown() }] : [])],
    });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`telemetry: sampler=${telemetry.sampler}`);
    logger.info(
        `           exporters trace=${telemetry.exporters.trace} metric=${telemetry.exporters.metric} log=${telemetry.exporters.log}`
    );
    logger.info('Available routes:');
    logger.info(`  GET  http://localhost:${PORT}/            (page: browser spans, socket pushes, console)`);
    logger.info(`  GET  http://localhost:${PORT}/work?payload=ndigo&units=1`);
    logger.info(`  POST http://localhost:${PORT}/work        ({"payload":"ndigo","units":2})`);
    logger.info(`  GET  http://localhost:${PORT}/lab/state   (counters, gauges, tick count)`);
    logger.info(`  GET  http://localhost:${PORT}/lab/config  (resolved sampler + exporter targets)`);
    logger.info(`  WS   ws://localhost:${PORT}/ws/telemetry  (snapshot pushed every 3 s)`);
    logger.info(`  GET  http://localhost:${PORT}/health      (management)`);
    logger.info(`  GET  http://localhost:${PORT}/metrics     (management: feature 'telemetry-lab')`);
    logger.info(`  GET  http://localhost:${PORT}/static/client.js  (built browser bundle)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});

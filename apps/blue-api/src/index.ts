import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { configureTelemetry, HTTPServerInstrumentation } from '@blue/telemetry-node';
import { getLogger } from '@blue/telemetry';
import { NodeAppConfiguration } from './node-app-configuration';
import { ServerConfig } from './server-config';
import { initAuth } from './auth-store';

const PORT = Number(process.env['PORT'] ?? '3000');
const logger = getLogger('blue-api');

async function main() {
    initAuth();

    // Telemetry (browser→server journey): when an OTel Collector endpoint is
    // configured (standard env var), export traces/metrics/logs there and
    // instrument inbound HTTP — the server span CONTINUES the client trace
    // carried by `TraceHeaderInterceptor`-injected traceparent headers.
    if (process.env['OTEL_EXPORTER_OTLP_ENDPOINT']) {
        configureTelemetry({
            traceExporter: { url: `${process.env['OTEL_EXPORTER_OTLP_ENDPOINT']}/v1/traces` },
            instrumentations: [new HTTPServerInstrumentation()],
        });
    }

    // Spring-style bootstrap: platform auto-config + app config (management
    // endpoints wired in NodeAppConfiguration) + `ServerConfig`
    // (`@configurationProperties`). Profiles and properties exercise the
    // environment property sources (AD-13/14/15): the `devInfo` bean exists
    // only under the `dev` profile, and `server.port`/`server.name` bind
    // from the builder property source with `@defaultValue` fallbacks.
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        ServerConfig,
        NodeAppConfiguration,
    ])
        .profiles('dev')
        .properties({ 'server.port': String(PORT), 'server.name': 'blue-api' })
        .run();

    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    const serverConfig = context.getValue<ServerConfig>('serverConfig');
    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`configured server: ${serverConfig.name} on :${serverConfig.port}`);
    logger.info('Available routes:');
    logger.info(`  GET  http://localhost:${PORT}/api/hello?name=Alice`);
    logger.info(`  GET  http://localhost:${PORT}/api/greet/Alice`);
    logger.info(`  GET  http://localhost:${PORT}/api/greeting?name=Ada  (Accept-Language aware)`);
    logger.info(`  POST http://localhost:${PORT}/api/echo   (JSON body)`);
    logger.info(`  GET  http://localhost:${PORT}/api/products/42;color=red`);
    logger.info(`  GET  http://localhost:${PORT}/api/products/42   (no matrix)`);
    logger.info(`  POST http://localhost:${PORT}/auth/login  ({"username":"admin","password":"demo"})`);
    logger.info(`  GET  http://localhost:${PORT}/notes  (Authorization: Bearer <token>)`);
    logger.info(`  GET  http://localhost:${PORT}/static/    (serves ./public)`);
    logger.info(`  GET  http://localhost:${PORT}/health   (management)`);
    logger.info(`  GET  http://localhost:${PORT}/metrics  (management)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});

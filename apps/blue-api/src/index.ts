/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';
import { AESGCMCipher, NodeAutoConfiguration, HTTP_SERVER, gracefulShutdown } from '@blue/platform-node';
import { configureTelemetry, HTTPServerInstrumentation, WebSocketServerInstrumentation } from '@blue/telemetry-node';
import { getLogger } from '@blue/telemetry';
import { NodeAppConfiguration } from './node-app-configuration';
import { ServerConfig, SecretsConfig, SERVER_CONFIG } from './server-config';
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
            traceExporter: {
                url: `${process.env['OTEL_EXPORTER_OTLP_ENDPOINT']}/v1/traces`,
            },
            instrumentations: [new HTTPServerInstrumentation(), new WebSocketServerInstrumentation()],
        });
    }

    // Spring-style bootstrap: platform auto-config + app config (management
    // endpoints wired in NodeAppConfiguration) + `ServerConfig`
    // (`@configurationProperties`). Profiles and properties exercise the
    // environment property sources (AD-13/14/15): the `devInfo` bean exists
    // only under the `dev` profile, and `server.port`/`server.name` bind
    // from the builder property source with `@defaultValue` fallbacks.
    const builder = new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        ServerConfig,
        SecretsConfig,
        NodeAppConfiguration,
    ])
        .profiles('dev')
        .properties({ 'server.port': String(PORT), 'server.name': 'blue-api' });

    // At-rest config secrets (AD-29 Wave 2): when BLUE_SECRET_KEY is set,
    // {cipher:...} values anywhere in the environment resolve to plaintext.
    // Without the key, boot still proceeds — markers would bind raw and only
    // fail loud if a lookup/binding actually requires decryption.
    if (process.env['BLUE_SECRET_KEY']) {
        builder.secrets(AESGCMCipher.fromEnvironment());
    }
    // Remote config source (AD-29 Wave 3): when a config-server URL is set,
    // fetch (and poll) a plain JSON document at the `configServer`
    // precedence slot. The self-served demo endpoint `/api/config.json`
    // works out of the box; point this at a real server in production.
    if (process.env['BLUE_CONFIG_SERVER_URL']) {
        builder.configServer({
            url: process.env['BLUE_CONFIG_SERVER_URL'],
            pollMs:
                Number(process.env['BLUE_CONFIG_SERVER_POLL_MS'] ?? '0') > 0
                    ? Number(process.env['BLUE_CONFIG_SERVER_POLL_MS'] ?? '0')
                    : undefined,
            headers: process.env['BLUE_CONFIG_SERVER_TOKEN']
                ? { Authorization: `Bearer ${process.env['BLUE_CONFIG_SERVER_TOKEN']}` }
                : undefined,
        });
    }

    const context = await builder.run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    const serverConfig = context.getValue(SERVER_CONFIG);
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
    logger.info(`  POST http://localhost:${PORT}/api/upload  (multipart/form-data: file + optional meta)`);
    logger.info(`  GET  http://localhost:${PORT}/api/config.json  (self-served remote config document)`);
    logger.info(`  GET  http://localhost:${PORT}/api/config/remote  (live resolved remote value)`);
    logger.info(`  GET  http://localhost:${PORT}/api/config/secrets  (Authorization: Bearer <token>, decrypted)`);
    logger.info(`  GET  http://localhost:${PORT}/api/cached-report  (60 s cached report, AD-24)`);
    logger.info(`  WS   ws://localhost:${PORT}/stomp/chat?token=<login token>  (STOMP, @authenticated)`);
    logger.info(`  WS   ws://localhost:${PORT}/ws/chat  (public socket contrast)`);
    logger.info(`  GET  http://localhost:${PORT}/static/    (serves ./public)`);
    logger.info(`  GET  http://localhost:${PORT}/health   (management)`);
    logger.info(`  GET  http://localhost:${PORT}/metrics  (management)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});

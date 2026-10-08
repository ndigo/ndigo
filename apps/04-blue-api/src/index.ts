/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { getEnv } from '@blue/context';
import { AESGCMCipher, NodeAutoConfiguration, HTTP_SERVER, gracefulShutdown } from '@blue/platform-node';
import { configureTelemetry, HTTPServerInstrumentation, WebSocketServerInstrumentation } from '@blue/telemetry-node';
import { getLogger } from '@blue/log';
import { interception } from '@blue/proxy';
import { getErrorMessage } from '@blue/util';
import { NodeAppConfiguration } from './node-app-configuration';
import { AuditInterceptor } from './audit-interceptor';
import { SecureDocsConfiguration } from './secure-docs-configuration';
import { ManagementConfiguration } from './management-configuration';
import { ServerConfig, SecretsConfig, SERVER_CONFIG } from './server-config';
import { initAuth } from './auth-store';

const PORT = Number(getEnv('PORT', '3000'));
const logger = getLogger('blue-api');

async function main() {
    initAuth();

    // Telemetry (browser→server journey): when an OTel Collector endpoint is
    // configured (standard env var), export traces/metrics/logs there and
    // instrument inbound HTTP — the server span CONTINUES the client trace
    // carried by `TraceHeaderInterceptor`-injected traceparent headers.
    const otelEndpoint = getEnv('OTEL_EXPORTER_OTLP_ENDPOINT');
    const sdk = otelEndpoint
        ? configureTelemetry({
              traceExporter: {
                  url: `${otelEndpoint}/v1/traces`,
              },
              instrumentations: [new HTTPServerInstrumentation(), new WebSocketServerInstrumentation()],
          })
        : undefined;

    // Spring-style bootstrap: platform auto-config + app config (management
    // endpoints wired in NodeAppConfiguration) + `ServerConfig`
    // (`@configurationProperties`). Profiles and properties exercise the
    // environment property sources (AD-13/14/15): the `devInfo` bean exists
    // only under the `dev` profile, and `server.port`/`server.name` bind
    // from the builder property source with schema (`z.default()`) fallbacks.
    // The OpenAPI docs run behind `SecureDocsConfiguration` (SEC-4): the
    // same Bearer-token check the protected handlers apply, so anonymous
    // `/v3/api-docs` + `/swagger-ui/` are denied 401.
    const builder = new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementConfiguration,
        SecureDocsConfiguration,
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
    if (getEnv('BLUE_SECRET_KEY')) {
        builder.secrets(AESGCMCipher.fromEnvironment());
    }
    // Remote config source (AD-29 Wave 3): when a config-server URL is set,
    // fetch (and poll) a plain JSON document at the `configServer`
    // precedence slot. The self-served demo endpoint `/api/config.json`
    // works out of the box; point this at a real server in production.
    const configServerUrl = getEnv('BLUE_CONFIG_SERVER_URL');
    if (configServerUrl) {
        const pollMs = Number(getEnv('BLUE_CONFIG_SERVER_POLL_MS', '0'));
        const token = getEnv('BLUE_CONFIG_SERVER_TOKEN');
        builder.configServer({
            url: configServerUrl,
            pollMs: pollMs > 0 ? pollMs : undefined,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    }

    // Method-interception demo gate (AD-42 D-8): the audit interceptor is a
    // first-class builder registration — the context receives it before
    // refresh, so even constructor entries eagerly created at refresh end
    // (like `orderService`) are woven at creation.
    const audit = new AuditInterceptor();
    builder.processors(interception([audit]));

    const context = await builder.run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    // OP-9: batched telemetry is dropped on exit unless the SDK shuts down.
    // Flush after the server stops (capturing its shutdown spans) and before
    // the context tears its beans down.
    gracefulShutdown(context, {
        resources: [server, ...(sdk ? [{ close: () => sdk.shutdown() }] : [])],
    });

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
    logger.info(`  GET  http://localhost:${PORT}/v3/api-docs   (OpenAPI spec, AD-35; Bearer-gated, SEC-4)`);
    logger.info(`  GET  http://localhost:${PORT}/swagger-ui/   (Swagger UI, AD-35; Bearer-gated, SEC-4)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});

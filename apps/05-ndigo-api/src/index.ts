/**
 */
import 'node:process';
import { getEnv } from '@ndigo/context';
import { AESGCMCipher, runNodeApplication } from '@ndigo/platform-node';
import {
    CacheInstrumentation,
    ContextInstrumentation,
    DispatcherInstrumentation,
    HTTPClientInstrumentation,
} from '@ndigo/telemetry';
import {
    AuthServerInstrumentation,
    configureTelemetry,
    DrizzleInstrumentation,
    HTTPResponseViewTargetInstrumentation,
    HTTPServerInstrumentation,
    RedisInstrumentation,
    ServerSentEventViewInstrumentation,
    WebSocketServerInstrumentation,
} from '@ndigo/telemetry-node';
import { getLogger } from '@ndigo/log';
import { interception } from '@ndigo/proxy';
import { getErrorMessage } from '@ndigo/util';
import { migrateOnBoot } from '@ndigo/orm-drizzle';
import { fileURLToPath } from 'node:url';
import { NodeAppConfiguration } from './node-app-configuration';
import { AuditInterceptor } from './audit-interceptor';
import { SecureDocsConfiguration } from './secure-docs-configuration';
import { ManagementConfiguration } from './management-configuration';
import { ServerConfig, SecretsConfig, MigrationsConfig, MIGRATIONS_CONFIG, SERVER_CONFIG } from './server-config';
import { ensureDbDir, getDrizzleDataSource } from './drizzle-data-source';
import { initAuth } from './auth-store';

const PORT = Number(getEnv('PORT', '3000'));
const logger = getLogger('ndigo-api');

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
              instrumentations: [
                  new HTTPServerInstrumentation(),
                  new WebSocketServerInstrumentation(),
                  new HTTPResponseViewTargetInstrumentation(),
                  new ServerSentEventViewInstrumentation(),
                  new DispatcherInstrumentation(),
                  new ContextInstrumentation(),
                  new AuthServerInstrumentation(),
                  new RedisInstrumentation(),
                  new DrizzleInstrumentation(),
                  new HTTPClientInstrumentation(),
                  new CacheInstrumentation(),
              ],
          })
        : undefined;

    // Lifecycle preset (AD-90): builds the same context this app used to
    // assemble by hand — NodeAutoConfiguration, config files (the platform
    // reader replaces the hand-written adapter), the `dev` profile, and the
    // `server.*` properties — then starts the managed server and wires
    // SIGINT/SIGTERM. Builder-level app wiring rides `configureBuilder`;
    // post-refresh boot work rides `beforeStart`.
    //
    // The OpenAPI docs run behind `SecureDocsConfiguration` (SEC-4): the
    // same Bearer-token check the protected handlers apply, so anonymous
    // `/v3/api-docs` + `/swagger-ui/` are denied 401. Management endpoints
    // are wired in `NodeAppConfiguration`.
    const app = await runNodeApplication(
        [
            ManagementConfiguration,
            SecureDocsConfiguration,
            ServerConfig,
            SecretsConfig,
            MigrationsConfig,
            NodeAppConfiguration,
        ],
        {
            port: PORT,
            profiles: ['dev'],
            properties: { 'server.name': 'ndigo-api' },
            configureBuilder: (builder) => {
                // At-rest config secrets (AD-29 Wave 2): when NDIGO_SECRET_KEY
                // is set, {cipher:...} values anywhere in the environment
                // resolve to plaintext. Without the key, boot still proceeds —
                // markers would bind raw and only fail loud if a lookup or
                // binding actually requires decryption.
                if (getEnv('NDIGO_SECRET_KEY')) {
                    builder.secrets(AESGCMCipher.fromEnvironment());
                }

                // Remote config source (AD-29 Wave 3): when a config-server
                // URL is set, fetch (and poll) a plain JSON document at the
                // `configServer` precedence slot. The self-served demo
                // endpoint `/api/config.json` works out of the box; point
                // this at a real server in production.
                const configServerUrl = getEnv('NDIGO_CONFIG_SERVER_URL');
                if (configServerUrl) {
                    const pollMs = Number(getEnv('NDIGO_CONFIG_SERVER_POLL_MS', '0'));
                    const token = getEnv('NDIGO_CONFIG_SERVER_TOKEN');
                    builder.configServer({
                        url: configServerUrl,
                        pollMs: pollMs > 0 ? pollMs : undefined,
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    });
                }

                // Method-interception demo gate (AD-42 D-8): the audit
                // interceptor is a first-class builder registration — the
                // context receives it before refresh, so even constructor
                // entries eagerly created at refresh end (like
                // `orderService`) are woven at creation.
                builder.processors(interception([new AuditInterceptor()]));
            },
            beforeStart: async (context) => {
                // AD-78 D-4: apply pending journaled migrations at boot when
                // opted in (`migrations.runOnBoot`), against the same store
                // the Drizzle routes read. Fail-closed: any migration error
                // aborts startup.
                const migrationsConfig = context.getValue(MIGRATIONS_CONFIG);
                if (migrationsConfig.runOnBoot) {
                    await ensureDbDir();
                    await migrateOnBoot({
                        dataSource: getDrizzleDataSource(),
                        dir: fileURLToPath(new URL(`../${migrationsConfig.dir}`, import.meta.url)),
                    });
                    logger.info(`applied pending migrations from ${migrationsConfig.dir}`);
                }
            },
            // OP-9: batched telemetry is dropped on exit unless the SDK shuts
            // down. The preset closes it after the server (capturing its
            // shutdown spans) and before the context tears its entries down.
            resources: sdk ? [{ close: () => sdk.shutdown() }] : [],
        }
    );

    const serverConfig = app.context.getValue(SERVER_CONFIG);
    logger.info(`listening on http://localhost:${app.port}`);
    logger.info(`configured server: ${serverConfig.name} on :${serverConfig.port}`);
    logger.info('Available routes:');
    logger.info(`  GET  http://localhost:${app.port}/api/hello?name=Alice`);
    logger.info(`  GET  http://localhost:${app.port}/api/greet/Alice`);
    logger.info(`  GET  http://localhost:${app.port}/api/greeting?name=Ada  (Accept-Language aware)`);
    logger.info(`  POST http://localhost:${app.port}/api/echo   (JSON body)`);
    logger.info(`  GET  http://localhost:${app.port}/api/products/42;color=red`);
    logger.info(`  GET  http://localhost:${app.port}/api/products/42   (no matrix)`);
    logger.info(`  POST http://localhost:${app.port}/auth/login  ({"username":"admin","password":"demo"})`);
    logger.info(`  GET  http://localhost:${app.port}/notes  (Authorization: Bearer <token>)`);
    logger.info(`  POST http://localhost:${app.port}/api/upload  (multipart/form-data: file + optional meta)`);
    logger.info(`  GET  http://localhost:${app.port}/api/config.json  (self-served remote config document)`);
    logger.info(`  GET  http://localhost:${app.port}/api/config/remote  (live resolved remote value)`);
    logger.info(`  GET  http://localhost:${app.port}/api/config/secrets  (Authorization: Bearer <token>, decrypted)`);
    logger.info(`  GET  http://localhost:${app.port}/api/cached-report  (60 s cached report, AD-24)`);
    logger.info(`  WS   ws://localhost:${app.port}/stomp/chat?token=<login token>  (STOMP, @authenticated)`);
    logger.info(`  WS   ws://localhost:${app.port}/ws/chat  (public socket contrast)`);
    logger.info(`  GET  http://localhost:${app.port}/static/    (serves ./public)`);
    logger.info(`  GET  http://localhost:${app.port}/health   (management)`);
    logger.info(`  GET  http://localhost:${app.port}/metrics  (management)`);
    logger.info(`  GET  http://localhost:${app.port}/v3/api-docs   (OpenAPI spec, AD-35; Bearer-gated, SEC-4)`);
    logger.info(`  GET  http://localhost:${app.port}/swagger-ui/   (Swagger UI, AD-35; Bearer-gated, SEC-4)`);
}

main().catch((error) => {
    logger.error(`failed to start: ${getErrorMessage(error)}`);
    process.exit(1);
});

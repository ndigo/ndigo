/**
 * Ndigo Auth Playground — six authentication modes side by side in one process.
 *
 * The bootstrap wires the auth stack first (demo accounts, durable LibSQL
 * session store, both adapters), optionally starts the embedded OIDC issuer on
 * its own loopback listener, then refreshes the DI-container context
 * (`NodeAutoConfiguration` + `ManagementAutoConfiguration` + the app's beans),
 * installs the app's two pipeline interceptors on the platform's handler
 * mapping, and starts listening.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { gracefulShutdown, HTTP_SERVER, NodeAutoConfiguration } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { applyAuthPipeline } from './http-pipeline';
import { LOGIN_RATE_LIMIT } from './config';
import { startEmbeddedIssuer } from './oidc-issuer';
import { PlaygroundConfiguration } from './playground-configuration';
import { createRuntime } from './runtime';

// The managed HTTP server reads its port from `process.env.PORT`; surface the
// app's default there before any context is built (an explicit PORT wins).
process.env['PORT'] ??= '3110';
const logger = getLogger('ndigo-auth-playground');

async function main() {
    // Async wiring first: hash the demo accounts and provision the durable
    // session table (`ndigo_sessions`), then publish the runtime the
    // configuration class reads at refresh time.
    const runtime = await createRuntime();
    const { config, stack } = runtime;

    // Mode 6's issuer: a real authorization server inside this process, on its
    // own loopback port (see `oidc-issuer.ts` for why it is not mounted on the
    // managed server).
    const issuer = config.oidc.enabled ? await startEmbeddedIssuer(config) : null;

    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        PlaygroundConfiguration,
    ])
        .properties({ 'server.port': String(config.port), 'server.name': 'ndigo-auth-playground' })
        .run();

    // Session restoration + the dual-scheme authorization guard, on top of the
    // platform's security headers and rate limiter.
    applyAuthPipeline(context, stack, config);

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, {
        resources: [server, stack, ...(issuer ? [{ close: () => issuer.stop() }] : [])],
    });

    logger.info(`listening on http://127.0.0.1:${config.port}`);
    logger.info(`  GET  /                      the auth matrix UI (built client from /static/client.js)`);
    logger.info('  mode 1 — credentials + opaque session cookie:');
    logger.info(
        `  POST /auth/login            {"username":"admin","password":"demo"}  (JSON only; ${LOGIN_RATE_LIMIT.limit}/${LOGIN_RATE_LIMIT.windowMs / 60_000} min → 429 + Retry-After)`
    );
    logger.info(`  GET  /auth/me               session cookie in, principal out`);
    logger.info(`  POST /auth/elevate          privilege change: rotates the session id (fixation-safe)`);
    logger.info(`  POST /auth/logout           invalidates the session and clears the cookie`);
    logger.info(
        `                              cookie: ${config.cookieName} HttpOnly SameSite=Lax Path=/ Secure=${config.cookieSecure}`
    );
    logger.info('  mode 2 — JWT access + refresh:');
    logger.info(`  POST /jwt/login             {"username":"alice","password":"demo"} → 60 s access + refresh token`);
    logger.info(
        '  GET  /jwt/me                Authorization: Bearer <accessToken> (401 code: token_expired/token_invalid)'
    );
    logger.info('  POST /jwt/refresh           {"refreshToken":"…"} → rotated pair (older tokens die)');
    logger.info('  mode 3 — roles (admin-only vs user-only, HTTP + socket):');
    logger.info('  GET  /roles/authenticated   any credential (401 without, both schemes accepted)');
    logger.info('  GET  /roles/admin           @authorized(admin) → 403 for alice');
    logger.info('  GET  /roles/user            @authorized(user) → 403 for admin');
    logger.info(
        `  WS   ws://127.0.0.1:${config.port}/roles/socket?token=<session id | access token>  (@authenticated + admin; denial = 1008)`
    );
    logger.info('  mode 4 — rate limiting:');
    logger.info(
        `  POST /auth/login, /jwt/login  one budget per client address (${LOGIN_RATE_LIMIT.limit}/${LOGIN_RATE_LIMIT.windowMs / 60_000} min) → 429 + Retry-After`
    );
    logger.info('  mode 5 — durable sessions:');
    logger.info(
        `                              ${config.sessionDbUrl} (restart the process and /auth/me still answers)`
    );
    logger.info('  mode 6 — OIDC authorization code + PKCE:');
    logger.info('  GET  /oidc/start            → 302 to the embedded issuer');
    logger.info('  GET  /oidc/callback         exchanges the code, verifies the ID token, issues a session');
    logger.info('  management:');
    logger.info(`  GET  http://127.0.0.1:${config.port}/health   (boot-smoke probe)`);
    if (issuer) {
        logger.info(
            `embedded OIDC issuer: ${issuer.url} (client ${config.oidc.clientId}, account ${config.oidc.accountId})`
        );
    } else {
        logger.info('embedded OIDC issuer: disabled (OIDC_ENABLED=false)');
    }
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});

/**
 * The playground test harness.
 *
 * Every spec boots the **real** composition — `NodeAutoConfiguration`,
 * `ManagementAutoConfiguration` and {@link PlaygroundConfiguration} — against a
 * temporary, file-backed session database, then installs the production
 * pipeline ({@link applyAuthPipeline}), so tests dispatch through the same
 * interceptors, the same adapters and the same durable store the running server
 * uses. Configuration is driven through the environment exactly as in
 * production (`SESSION_DB_URL`, `AUTH_COOKIE_SECURE`, `JWT_ACCESS_TTL_MS`,
 * `PORT`, …), which is also what makes the restart-durability spec honest: the
 * second boot differs from the first only in being a second process-shaped boot.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { createServer } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';
import { HTTP_SERVER, NodeAutoConfiguration } from '@blue/platform-node';
import { bootApp, MockHTTP, type BlueTestApp } from '@blue/test';
import { SESSION_DB_URL_ENV, type PlaygroundConfig } from '../src/config';
import { applyAuthPipeline } from '../src/http-pipeline';
import { startEmbeddedIssuer, type EmbeddedIssuer } from '../src/oidc-issuer';
import { PlaygroundConfiguration } from '../src/playground-configuration';
import { createRuntime, type PlaygroundRuntime } from '../src/runtime';

/** Harness options; every one of them is an environment override. */
export interface HarnessOptions {
    /** Reuse an existing database file instead of a throwaway one. */
    readonly sessionDbUrl?: string;
    /** Emit the session cookie without `Secure` (the `AUTH_COOKIE_SECURE=false` mode). */
    readonly cookieSecure?: boolean;
    /** Access-token lifetime override in milliseconds. */
    readonly jwtAccessTtlMs?: number;
    /** Disable the embedded issuer (`OIDC_ENABLED=false`). */
    readonly oidcEnabled?: boolean;
    /** Start the embedded issuer on its own listener (real-server harness only). */
    readonly startIssuer?: boolean;
    /** A fixed HTTP port; a free one is allocated when omitted. */
    readonly port?: number;
}

/** A booted playground reachable through `@blue/test`'s in-process dispatch. */
export interface MockHarness {
    readonly app: BlueTestApp;
    readonly http: MockHTTP;
    readonly runtime: PlaygroundRuntime;
    readonly config: PlaygroundConfig;
    close(): void;
}

/** A booted playground listening on a real port. */
export interface ServerHarness {
    readonly port: number;
    readonly baseUrl: string;
    readonly runtime: PlaygroundRuntime;
    readonly config: PlaygroundConfig;
    readonly issuer: EmbeddedIssuer | null;
    close(): Promise<void>;
}

/**
 * Allocates a free loopback TCP port by binding and releasing it.
 *
 * @returns The port the OS handed out.
 */
export async function freePort(): Promise<number> {
    const probe = createServer();
    await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
    const address = probe.address();
    await new Promise<void>((resolve) => probe.close(() => resolve()));
    if (address === null || typeof address === 'string') {
        throw new Error('no TCP port was allocated');
    }
    return address.port;
}

/**
 * Publishes the harness options into the environment the app reads at boot.
 *
 * @param options - The harness options.
 * @param sessionDbUrl - The resolved session database URL.
 * @param port - The HTTP port for a real listener, or `null` for mock dispatch.
 * @param oidcIssuerPort - The embedded issuer's port, when one was allocated.
 */
function applyEnv(
    options: HarnessOptions,
    sessionDbUrl: string,
    port: number | null,
    oidcIssuerPort: number | null
): void {
    process.env[SESSION_DB_URL_ENV] = sessionDbUrl;
    process.env['AUTH_COOKIE_SECURE'] = options.cookieSecure === false ? 'false' : 'true';
    process.env['OIDC_ENABLED'] = options.oidcEnabled === false ? 'false' : 'true';
    if (options.jwtAccessTtlMs !== undefined) {
        process.env['JWT_ACCESS_TTL_MS'] = String(options.jwtAccessTtlMs);
    }
    if (port !== null) {
        process.env['PORT'] = String(port);
        // Both URLs are pinned to the loopback IP the server and the embedded
        // issuer actually bind, so the redirect_uri registered at the issuer and
        // the origin the spec calls are the same string.
        process.env['OIDC_REDIRECT_URI'] = `http://127.0.0.1:${port}/oidc/callback`;
        if (oidcIssuerPort !== null) {
            process.env['OIDC_ISSUER_PORT'] = String(oidcIssuerPort);
            process.env['OIDC_ISSUER_URL'] = `http://127.0.0.1:${oidcIssuerPort}`;
        }
    }
}

/** Creates the throwaway database directory (unless the caller supplied a URL). */
function tempDir(options: HarnessOptions): { dir: string | null; sessionDbUrl: string } {
    if (options.sessionDbUrl !== undefined) {
        return { dir: null, sessionDbUrl: options.sessionDbUrl };
    }
    const dir = mkdtempSync(join(tmpdir(), 'blue-auth-playground-'));
    return { dir, sessionDbUrl: `file:${join(dir, 'sessions.db')}` };
}

/**
 * Boots the playground for in-process `MockHTTP` dispatch.
 *
 * @param options - The harness options.
 * @returns The booted harness (close it when the spec finishes).
 */
export async function bootMockPlayground(options: HarnessOptions = {}): Promise<MockHarness> {
    const { dir, sessionDbUrl } = tempDir(options);
    applyEnv(options, sessionDbUrl, null, null);
    const runtime = await createRuntime();
    const app = bootApp([ManagementAutoConfiguration, PlaygroundConfiguration]);
    applyAuthPipeline(app.context, runtime.stack, runtime.config);
    return {
        app,
        http: new MockHTTP(app),
        runtime,
        config: runtime.config,
        close() {
            app.close();
            runtime.stack.close();
            if (dir !== null) rmSync(dir, { recursive: true, force: true });
        },
    };
}

/**
 * Boots the playground on a real HTTP listener (sockets, static bytes, the OIDC
 * redirect chain — anything `MockHTTP` cannot carry).
 *
 * @param options - The harness options.
 * @returns The booted harness (close it when the spec finishes).
 */
export async function startPlaygroundServer(options: HarnessOptions = {}): Promise<ServerHarness> {
    const port = options.port ?? (await freePort());
    const oidcIssuerPort = options.startIssuer === true ? await freePort() : null;
    const { dir, sessionDbUrl } = tempDir(options);
    applyEnv(options, sessionDbUrl, port, oidcIssuerPort);
    const runtime = await createRuntime();
    const issuer = options.startIssuer === true ? await startEmbeddedIssuer(runtime.config) : null;
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        PlaygroundConfiguration,
    ])
        .properties({ 'server.port': String(port), 'server.name': 'blue-auth-playground-spec' })
        .run();
    applyAuthPipeline(context, runtime.stack, runtime.config);
    const server = context.getValue(HTTP_SERVER);
    await server.start();
    return {
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        runtime,
        config: runtime.config,
        issuer,
        async close() {
            await server.close();
            context.close();
            runtime.stack.close();
            if (issuer !== null) {
                await issuer.stop();
            }
            if (dir !== null) rmSync(dir, { recursive: true, force: true });
        },
    };
}

/** The session cookie header as a single string, whichever shape it arrived in. */
export function setCookieOf(response: { headers: Record<string, string | string[]> }): string {
    const header = response.headers['set-cookie'];
    return Array.isArray(header) ? header.join('; ') : (header ?? '');
}

/**
 * Narrows a parsed body to a string-keyed record — a checked conversion that
 * assumes no field shape, so every later read is still `typeof`-guarded.
 *
 * @param value - The parsed value.
 * @returns The record, or `null` when the value was not an object.
 */
export function recordOf(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    return Object.fromEntries(Object.entries(value));
}

/** The session id a login response body reports. */
export function sessionIdOf(body: unknown): string {
    const session = recordOf(recordOf(body)?.['session']);
    const id = session?.['id'];
    if (typeof id !== 'string' || id === '') {
        throw new Error(`login body carried no session id: ${JSON.stringify(body)}`);
    }
    return id;
}

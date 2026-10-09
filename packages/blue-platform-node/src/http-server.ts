/**
 * Managed HTTP server for Node.js platform applications.
 *
 * The origin listener serves HTTP/1.1 by default; opt-in TLS material
 * ({@link TLSServerOptions}) upgrades it to ALPN h2 with an HTTP/1.1
 * fallback (AD-81). HTTP/3 terminates at an edge proxy in front of it
 * (AD-80).
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { $aware, type SmartLifecycle } from '@blue/factory';
import { getEnv, type ApplicationContext, type ApplicationContextAware } from '@blue/context';
import { DISPATCHER } from '@blue/dispatcher';
import type { NodeDispatcher } from './node-dispatcher';
import { NodeHTTPServerAdapter, type NodeHTTPServerAdapterOptions } from './node-http-server-adapter';
import type { SocketLimits } from './node-socket-session';
import { NodeSocketSessionRegistry } from './node-socket-session-registry';
import { SOCKET_SESSION_REGISTRY, SOCKET_REQUEST_AUTHENTICATOR } from './context-tokens';
import { readIntEnv } from './read-int-env';

/**
 * Adapter interface for platform HTTP servers.
 * The default implementation wraps `node:http.createServer()`.
 */
export interface HTTPServerAdapter {
    /** Start listening on the given port and host. */
    listen(port: number, host?: string): Promise<void>;
    /** Stop the server gracefully. */
    close(): Promise<void>;
    /** The underlying server instance (for integration tests, etc.). */
    readonly server: unknown;
}

/**
 * TLS material for the secure origin listener (AD-81).
 *
 * `key`, `cert` and `ca` accept either inline PEM (detected by a
 * `-----BEGIN` prefix) or a filesystem path, read by the adapter at bind
 * time (Node's tls options take PEM content only). Present when the
 * origin should terminate TLS and negotiate HTTP/2; absent, the origin
 * stays plaintext HTTP/1.1 for the edge-terminated topology (AD-80).
 */
export interface TLSServerOptions {
    /** PEM private key (inline) or path to the key file. */
    key: string;
    /** PEM certificate chain (inline) or path to the certificate file. */
    cert: string;
    /**
     * Optional CA bundle (inline PEM or path) that presented client
     * certificates verify against when {@link TLSServerOptions.clientAuth}
     * is set (REV-101); without `clientAuth` this entry has no effect —
     * Node never requests a client certificate on `ca` alone.
     */
    ca?: string;
    /** Minimum TLS version. Defaults to Node's baseline (`TLSv1.2`). */
    minVersion?: 'TLSv1.2' | 'TLSv1.3';
    /** OpenSSL cipher list. Defaults to Node's baseline. */
    ciphers?: string;
    /**
     * Client-certificate authentication (mutual TLS, REV-101). `'none'`
     * (the default) never requests a certificate; `'request'` asks for one
     * but admits clients that present none; `'require'` rejects connections
     * without a certificate that verifies against {@link TLSServerOptions.ca}
     * (Node's baseline trust store when `ca` is absent — which typically
     * rejects every presented certificate). Maps to Node's server-side
     * `requestCert` / `rejectUnauthorized` options.
     */
    clientAuth?: 'none' | 'request' | 'require';
    /**
     * Maximum concurrent HTTP/2 streams per connection (the HTTP/2 SETTINGS
     * `maxConcurrentStreams` value, REV-104). Absent, Node's default
     * applies — which is unbounded (up to 2^32-1): a single client can open
     * any number of concurrent streams, each a full dispatcher request.
     * Set a bounded value for production (128 is the nginx default).
     */
    maxConcurrentStreams?: number;
}

/**
 * Options for creating an {@link HTTPServer}.
 */
export interface HTTPServerOptions {
    /** TCP port to listen on. Defaults to `3000` or `process.env.PORT`. */
    port?: number;
    /** Host to bind to. Defaults to `'127.0.0.1'`. */
    host?: string;
    /** Custom adapter. Defaults to `NodeHTTPServerAdapter`. */
    adapter?: HTTPServerAdapter;
    /**
     * TLS material for the default adapter (AD-81). When set, the origin
     * listener is an `http2.createSecureServer` in `allowHTTP1` mode:
     * ALPN negotiates `h2` with an HTTP/1.1 fallback, and WebSocket
     * upgrades keep working over the h1.1 path (RFC 8441 is not
     * implemented by `ws` or browsers — WebSockets cannot ride h2).
     * Ignored when a custom {@link HTTPServerOptions.adapter} is passed.
     *
     * Env fallback when omitted: `BLUE_TLS_KEY` + `BLUE_TLS_CERT` (both
     * required together — a half-configured pair throws rather than
     * silently serving plaintext) and optional `BLUE_TLS_CA`. Blank env
     * values count as unset, and the env is consulted for the default
     * adapter only — a custom {@link HTTPServerOptions.adapter} is never
     * TLS-configured through it (REV-102).
     */
    tls?: TLSServerOptions;
    /**
     * Socket transport bounds (frame payload, inbound queue cap). When
     * omitted, env `BLUE_SOCKET_MAX_PAYLOAD_BYTES` / `BLUE_SOCKET_MAX_QUEUED_MESSAGES`
     * are honored by the default adapter.
     */
    socketLimits?: SocketLimits;
    /**
     * WebSocket Origin allowlist handed to the default adapter. When
     * omitted, env `BLUE_SOCKET_ALLOWED_ORIGINS` (comma-separated bare
     * origins) is honored; absent both, any origin may upgrade (public
     * socket endpoints).
     */
    allowedWebSocketOrigins?: string[];
    /**
     * Upgrade-time authentication hook for the default adapter — see
     * {@link NodeHTTPServerAdapterOptions.authenticate}. When omitted, the
     * default adapter uses the application-context
     * `socketRequestAuthenticator` bean.
     */
    authenticate?: NodeHTTPServerAdapterOptions['authenticate'];
    /**
     * Trusted-proxy allowlist handed to the default adapter (AD-37): IP
     * literals and CIDR prefixes (IPv4/IPv6) whose `X-Forwarded-For`
     * header the server may believe. Env-tunable via `BLUE_TRUSTED_PROXIES`
     * (comma-separated) when the option is absent; an explicit option wins
     * over the env. Empty = trust nobody: the socket address stands and
     * the header is never consulted.
     */
    trustedProxies?: string[];
    /**
     * Maximum concurrent socket connections for the default adapter — see
     * {@link NodeHTTPServerAdapterOptions.maxConnections}.
     */
    maxConnections?: number;
    /**
     * Milliseconds the default adapter waits for its authentication hook —
     * see {@link NodeHTTPServerAdapterOptions.authenticateTimeoutMs}.
     */
    authenticateTimeoutMs?: number;
    /**
     * Socket session registry shared with the default adapter (AD-21 D4).
     * When omitted, the registry is resolved from the application context
     * (`socketSessionRegistry` bean) at start, falling back to a fresh
     * instance — so broadcasts from the bean reach the adapter's sessions.
     */
    socketRegistry?: NodeSocketSessionRegistry;
}

/**
 * A managed HTTP server that delegates incoming requests to a {@link NodeDispatcher}.
 *
 * Implements `SmartLifecycle` so the context stops it on `close()`, and
 * `ApplicationContextAware` so it can resolve the dispatcher from the context
 * when none is supplied to the constructor. `isAutoStartup` is `false`:
 * registering a `NodeAutoConfiguration` context must not bind ports during
 * `refresh()` — applications start the server explicitly once their handler
 * mapping and dispatcher strategies are ready.
 *
 * @example
 * ```ts
 * const server = context.getValue<HTTPServer>('httpServer');
 * await server.start();
 * // ... later
 * context.close(); // stops the server
 * ```
 */
export class HTTPServer implements SmartLifecycle, ApplicationContextAware {
    #adapter: HTTPServerAdapter | null;
    #port: number;
    #host: string;
    #started: boolean;
    #dispatcher: NodeDispatcher | null;
    #socketRegistry: NodeSocketSessionRegistry | null;
    #tls: TLSServerOptions | null;
    #socketLimits: SocketLimits | undefined;
    #allowedWebSocketOrigins: string[] | undefined;
    #authenticate: NodeHTTPServerAdapterOptions['authenticate'];
    #maxConnections: number | undefined;
    #authenticateTimeoutMs: number | undefined;
    #trustedProxies: string[] | undefined;
    #applicationContext: ApplicationContext | null = null;
    #startPromise: Promise<void> | null = null;

    /**
     * The port the server is listening on, or `0` if not yet started.
     */
    get port(): number {
        return this.#port;
    }

    /**
     * Whether the server has been started.
     */
    get started(): boolean {
        return this.#started;
    }

    /**
     * The underlying adapter (e.g. the `http.Server` instance).
     */
    get server(): unknown {
        return this.#adapter?.server;
    }

    /** `SmartLifecycle` — whether the server is currently listening. */
    get isRunning(): boolean {
        return this.#started;
    }

    /** `SmartLifecycle` — start/stop ordering. */
    readonly phase = 0;

    /** `SmartLifecycle` — never auto-start; the application starts the server explicitly. */
    readonly isAutoStartup = false;

    /**
     * Create a new HTTP server.
     *
     * @param dispatcher - The dispatcher to handle incoming requests. When
     * omitted, the dispatcher is resolved from the application context at
     * start time.
     * @param options - Server configuration.
     */
    constructor(dispatcher: NodeDispatcher | null = null, options: HTTPServerOptions = {}) {
        if (options.adapter !== undefined && options.socketRegistry !== undefined) {
            // The registry is passed to the DEFAULT adapter; a custom adapter
            // owns its own registry. Accepting both silently would leave the
            // context bean and the adapter's registry disjoint — broadcasts
            // via the bean would reach no live sessions, with no warning.
            throw new RangeError(
                'HTTPServer: socketRegistry is shared with the default adapter only — pass it to your custom adapter instead'
            );
        }
        // HG-9: strict env parse (`Number('')`/`Number(' 80 ')` traps) — 0 is
        // still a valid ephemeral-port request, so `allowZero` is set.
        const rawPort = options.port ?? readIntEnv(process.env, 'PORT', { allowZero: true }) ?? 3000;
        if (!Number.isInteger(rawPort) || rawPort < 0 || rawPort > 65_535) {
            throw new RangeError(`HTTPServer: invalid port ${String(rawPort)} — must be an integer in [0, 65535]`);
        }
        this.#port = rawPort;
        this.#host = options.host ?? '127.0.0.1';
        this.#dispatcher = dispatcher;
        this.#socketRegistry = options.socketRegistry ?? null;
        // AD-81: explicit TLS material wins; otherwise the env pair
        // (`BLUE_TLS_KEY`/`BLUE_TLS_CERT`, plus optional `BLUE_TLS_CA`) is
        // read — all-or-nothing, so a half-configured pair fails loud
        // instead of silently keeping the plaintext listener. REV-102: the
        // env applies to the default adapter only — a custom adapter owns
        // its own TLS story, so a stale `BLUE_TLS_KEY` export must not
        // break or secretly reconfigure it.
        this.#tls =
            options.tls ??
            (options.adapter === undefined ? readTLSOptionsFromEnv(process.env) : undefined) ??
            null;
        this.#socketLimits = options.socketLimits;
        // Env-tunable origin allowlist for the default adapter: comma-
        // separated bare origins (`BLUE_SOCKET_ALLOWED_ORIGINS`). Absent
        // both, any origin may upgrade — the explicit public-socket
        // posture.
        this.#allowedWebSocketOrigins =
            options.allowedWebSocketOrigins ?? parseCSVEnv(getEnv('BLUE_SOCKET_ALLOWED_ORIGINS'));
        this.#authenticate = options.authenticate ?? undefined;
        this.#maxConnections = options.maxConnections;
        this.#authenticateTimeoutMs = options.authenticateTimeoutMs;
        // Env-tunable trusted-proxy allowlist for the default adapter:
        // comma-separated IPs/CIDRs (`BLUE_TRUSTED_PROXIES`). Explicit
        // option wins over the env. Empty = trust nobody (AD-37).
        this.#trustedProxies = options.trustedProxies ?? parseCSVEnv(getEnv('BLUE_TRUSTED_PROXIES'));
        this.#adapter = options.adapter ?? null;
        this.#started = false;
    }

    /**
     * Injects the owning application context, used to resolve the dispatcher.
     *
     * @param context - The application context that owns this server.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#applicationContext = context;
    }

    /**
     * Start listening. Idempotent: concurrent callers share the same start
     * until the server is closed, after which a fresh start can be issued.
     */
    start(): Promise<void> {
        if (!this.#startPromise) {
            this.#startPromise = this.#doStart();
        }
        return this.#startPromise;
    }

    async #doStart(): Promise<void> {
        if (this.#started) {
            return;
        }
        if (!this.#adapter) {
            const registry = this.#socketRegistry ?? this.#resolveSocketRegistry() ?? new NodeSocketSessionRegistry();
            this.#adapter = new NodeHTTPServerAdapter(this.#resolveDispatcher(), {
                socketRegistry: registry,
                socketLimits: this.#socketLimits,
                allowedWebSocketOrigins: this.#allowedWebSocketOrigins,
                authenticate: this.#resolveAuthenticateHook(),
                maxConnections: this.#maxConnections,
                authenticateTimeoutMs: this.#authenticateTimeoutMs,
                trustedProxies: this.#trustedProxies,
                tls: this.#tls ?? undefined,
            });
        }
        await this.#adapter.listen(this.#port, this.#host);
        this.#started = true;
    }

    /**
     * `SmartLifecycle` — stop the server, delegated to {@link close}.
     */
    stop(): Promise<void> {
        return this.close();
    }

    /**
     * Stop the server gracefully. Idempotent.
     */
    async close(): Promise<void> {
        if (!this.#adapter || !this.#started) {
            return;
        }
        await this.#adapter.close();
        // The adapter's teardown closes its socket registry (PLN-F10), and a
        // closed registry cannot be reconnected — drop the adapter so the
        // documented "fresh start can be issued after close" rebuilds one
        // (with a fresh default registry) instead of reusing a dead one.
        this.#adapter = null;
        this.#started = false;
        this.#startPromise = null;
    }

    /**
     * Marks the value as `Aware` for the factory's aware injection, so
     * `setApplicationContext` is invoked when the entry is registered.
     */
    get [$aware](): boolean {
        return true;
    }

    #resolveDispatcher(): NodeDispatcher {
        if (this.#dispatcher) {
            return this.#dispatcher;
        }
        if (this.#applicationContext) {
            return this.#applicationContext.getValue(DISPATCHER) as NodeDispatcher;
        }
        throw new Error(
            'HTTPServer: no dispatcher provided and no application context available — pass a dispatcher to the ' +
                'constructor or register the server as a context entry'
        );
    }

    #resolveSocketRegistry(): NodeSocketSessionRegistry | null {
        if (this.#applicationContext?.hasValue?.(SOCKET_SESSION_REGISTRY)) {
            return this.#applicationContext.getValue(SOCKET_SESSION_REGISTRY);
        }
        return null;
    }

    /**
     * Resolves the upgrade authentication hook for the default adapter: the
     * explicit `authenticate` option wins; otherwise the
     * `socketRequestAuthenticator` application-context bean supplies
     * identity (SEC-3). The bean's method is invoked on its own receiver, so
     * a class-based authenticator keeps `this`.
     *
     * @returns The hook to hand the adapter, or `undefined` (public sockets).
     */
    #resolveAuthenticateHook(): NodeHTTPServerAdapterOptions['authenticate'] {
        if (this.#authenticate) {
            return this.#authenticate;
        }
        if (this.#applicationContext?.hasValue?.(SOCKET_REQUEST_AUTHENTICATOR)) {
            const authenticator = this.#applicationContext.getValue(SOCKET_REQUEST_AUTHENTICATOR);
            return (sources) => authenticator.authenticate(sources);
        }
        return undefined;
    }
}

/**
 * Reads optional TLS material from the environment (AD-81):
 * `BLUE_TLS_KEY` + `BLUE_TLS_CERT` (both required together) and optional
 * `BLUE_TLS_CA`. Absent both required keys → `undefined` (plaintext
 * origin, the AD-80 edge-terminated topology). Blank/whitespace-only
 * values count as unset (REV-103) — an empty `BLUE_TLS_KEY=` export is a
 * shell default, not a broken credential. One key without the other →
 * `RangeError`: a half-configured TLS listener must fail loud rather
 * than silently serve plaintext.
 */
function readTLSOptionsFromEnv(env: NodeJS.ProcessEnv): TLSServerOptions | undefined {
    const key = env['BLUE_TLS_KEY']?.trim() ?? '';
    const cert = env['BLUE_TLS_CERT']?.trim() ?? '';
    if (key === '' && cert === '') {
        return undefined;
    }
    if (key === '' || cert === '') {
        throw new RangeError(
            'HTTPServer: BLUE_TLS_KEY and BLUE_TLS_CERT must be set together — a half-configured TLS listener would silently serve plaintext'
        );
    }
    const tls: TLSServerOptions = { key, cert };
    const ca = env['BLUE_TLS_CA']?.trim() ?? '';
    if (ca !== '') {
        tls.ca = ca;
    }
    return tls;
}

/**
 * Parses a comma-separated env list (e.g. `BLUE_SOCKET_ALLOWED_ORIGINS`,
 * `BLUE_TRUSTED_PROXIES`) into trimmed entries. Empty/whitespace input →
 * `undefined` (unconstrained / trust-nobody posture); empty entries are
 * dropped. Malformed entries surface as a `RangeError` when the consumer
 * validates them at construction.
 */
function parseCSVEnv(raw: string | undefined): string[] | undefined {
    if (raw === undefined || raw.trim() === '') {
        return undefined;
    }
    const entries = raw
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return entries.length > 0 ? entries : undefined;
}

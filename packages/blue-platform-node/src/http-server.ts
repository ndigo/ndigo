/**
 * Managed HTTP server for Node.js platform applications.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { $aware, type SmartLifecycle } from '@blue/factory';
import type { ApplicationContext, ApplicationContextAware } from '@blue/context';
import { DISPATCHER } from '@blue/dispatcher';
import type { NodeDispatcher } from './node-dispatcher';
import { NodeHTTPServerAdapter, type NodeHTTPServerAdapterOptions } from './node-http-server-adapter';
import type { SocketLimits } from './node-socket-session';
import { NodeSocketSessionRegistry } from './node-socket-session-registry';
import { SOCKET_SESSION_REGISTRY, SOCKET_REQUEST_AUTHENTICATOR } from './context-tokens';

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
        const rawPort = options.port ?? Number(process.env['PORT'] ?? '3000');
        if (!Number.isInteger(rawPort) || rawPort < 0 || rawPort > 65_535) {
            throw new RangeError(`HTTPServer: invalid port ${String(rawPort)} — must be an integer in [0, 65535]`);
        }
        this.#port = rawPort;
        this.#host = options.host ?? '127.0.0.1';
        this.#dispatcher = dispatcher;
        this.#socketRegistry = options.socketRegistry ?? null;
        this.#socketLimits = options.socketLimits;
        // Env-tunable origin allowlist for the default adapter: comma-
        // separated bare origins (`BLUE_SOCKET_ALLOWED_ORIGINS`). Absent
        // both, any origin may upgrade — the explicit public-socket
        // posture.
        this.#allowedWebSocketOrigins =
            options.allowedWebSocketOrigins ?? parseCSVEnv(process.env['BLUE_SOCKET_ALLOWED_ORIGINS']);
        this.#authenticate = options.authenticate ?? undefined;
        this.#maxConnections = options.maxConnections;
        this.#authenticateTimeoutMs = options.authenticateTimeoutMs;
        // Env-tunable trusted-proxy allowlist for the default adapter:
        // comma-separated IPs/CIDRs (`BLUE_TRUSTED_PROXIES`). Explicit
        // option wins over the env. Empty = trust nobody (AD-37).
        this.#trustedProxies = options.trustedProxies ?? parseCSVEnv(process.env['BLUE_TRUSTED_PROXIES']);
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

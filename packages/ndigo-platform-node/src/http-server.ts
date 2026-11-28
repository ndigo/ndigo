/**
 * Managed HTTP server for Node.js platform applications.
 *
 * The origin listener serves HTTP/1.1 by default; opt-in TLS material
 * ({@link TLSServerOptions}) upgrades it to ALPN h2 with an HTTP/1.1
 * fallback. HTTP/3 terminates at an edge proxy in front of it.
 */
import { $aware, type ManagedLifecycle } from '@ndigo/factory';
import { IllegalStateError } from '@ndigo/core';
import { getEnv, type ApplicationContext, type ApplicationContextAware } from '@ndigo/context';
import { DISPATCHER } from '@ndigo/dispatcher';
import type { NodeDispatcher } from './node-dispatcher.js';
import { NodeHTTPServerAdapter, type NodeHTTPServerAdapterOptions } from './node-http-server-adapter.js';
import type { SocketLimits } from './node-socket-session.js';
import { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import { SOCKET_SESSION_REGISTRY, SOCKET_REQUEST_AUTHENTICATOR } from './context-tokens.js';
import { readIntEnv } from './read-int-env.js';
import { readTLSOptionsFromEnv, parseCSVEnv } from './_http-server-env.js';
import type { HTTPServerAdapter, HTTPServerOptions, TLSServerOptions } from './http-server-types.js';

export * from './http-server-types.js';

/**
 * A managed HTTP server that delegates incoming requests to a {@link NodeDispatcher}.
 *
 * Implements `ManagedLifecycle` so the context stops it on `close()`, and
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
 *
 * Deliberately NOT `Closeable`: shutdown is owned by `ManagedLifecycle` — the
 * adapter's close is invoked through `stop()`, not the context entry close.
 */
export class HTTPServer implements ManagedLifecycle, ApplicationContextAware {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "HTTPServer".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object HTTPServer]"
     */
    get [Symbol.toStringTag](): string {
        return 'HTTPServer';
    }

    #adapter: HTTPServerAdapter | null;
    #port: number;
    #boundPort: number | null;
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
     * The port the server is listening on: the kernel-assigned port once
     * started (the ephemeral port when `port: 0` was requested), otherwise
     * the configured port (before start and after close).
     */
    get port(): number {
        return this.#boundPort ?? this.#port;
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

    /** `ManagedLifecycle` — whether the server is currently listening. */
    get isRunning(): boolean {
        return this.#started;
    }

    /** `ManagedLifecycle` — start/stop ordering. */
    readonly phase = 0;

    /** `ManagedLifecycle` — never auto-start; the application starts the server explicitly. */
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
            // context entry and the adapter's registry disjoint — broadcasts
            // via the entry would reach no live sessions, with no warning.
            throw new RangeError(
                'HTTPServer: socketRegistry is shared with the default adapter only — pass it to your custom adapter instead'
            );
        }
        // Strict env parse (`Number('')`/`Number(' 80 ')` traps) — 0 is
        // still a valid ephemeral-port request, so `allowZero` is set.
        const rawPort = options.port ?? readIntEnv(process.env, 'PORT', { allowZero: true }) ?? 3000;
        if (!Number.isInteger(rawPort) || rawPort < 0 || rawPort > 65_535) {
            throw new RangeError(`HTTPServer: invalid port ${String(rawPort)} — must be an integer in [0, 65535]`);
        }
        this.#port = rawPort;
        this.#boundPort = null;
        this.#host = options.host ?? '127.0.0.1';
        this.#dispatcher = dispatcher;
        this.#socketRegistry = options.socketRegistry ?? null;
        // Explicit TLS material wins; otherwise the env pair
        // (`NDIGO_TLS_KEY`/`NDIGO_TLS_CERT`, plus optional `NDIGO_TLS_CA`) is
        // read — all-or-nothing, so a half-configured pair fails loud
        // instead of silently keeping the plaintext listener. REV-102: the
        // env applies to the default adapter only — a custom adapter owns
        // its own TLS story, so a stale `NDIGO_TLS_KEY` export must not
        // break or secretly reconfigure it.
        this.#tls =
            options.tls ?? (options.adapter === undefined ? readTLSOptionsFromEnv(process.env) : undefined) ?? null;
        this.#socketLimits = options.socketLimits;
        // Env-tunable origin allowlist for the default adapter: comma-
        // separated bare origins (`NDIGO_SOCKET_ALLOWED_ORIGINS`). Absent
        // both, any origin may upgrade — the explicit public-socket
        // posture.
        this.#allowedWebSocketOrigins =
            options.allowedWebSocketOrigins ?? parseCSVEnv(getEnv('NDIGO_SOCKET_ALLOWED_ORIGINS'));
        this.#authenticate = options.authenticate ?? undefined;
        this.#maxConnections = options.maxConnections;
        this.#authenticateTimeoutMs = options.authenticateTimeoutMs;
        // Env-tunable trusted-proxy allowlist for the default adapter:
        // comma-separated IPs/CIDRs (`NDIGO_TRUSTED_PROXIES`). Explicit
        // option wins over the env. Empty = trust nobody.
        this.#trustedProxies = options.trustedProxies ?? parseCSVEnv(getEnv('NDIGO_TRUSTED_PROXIES'));
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
     *
     * @returns A promise that resolves once listening.
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
        // The adapter surface is `unknown` by design (custom adapters); the
        // default Node http/http2 servers expose `net.Server#address()` with
        // the kernel-assigned port for a `port: 0` bind.
        const address = (
            this.#adapter.server as { address?: () => string | { port: number } | null } | undefined
        )?.address?.();
        this.#boundPort = typeof address === 'object' && address !== null ? address.port : this.#port;
    }

    /**
     * `ManagedLifecycle` — stop the server, delegated to {@link close}.
     *
     * @returns A promise that resolves once stopped.
     */
    stop(): Promise<void> {
        return this.close();
    }

    /**
     * Stop the server gracefully. Idempotent.
     *
     * @returns A promise that resolves once closed.
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
        this.#boundPort = null;
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
        throw new IllegalStateError(
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
     * `socketRequestAuthenticator` application-context entry supplies
     * identity. The entry's method is invoked on its own receiver, so
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

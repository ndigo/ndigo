/**
 * Managed HTTP server for Node.js platform applications.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { $aware, type SmartLifecycle } from '@blue/factory';
import type { ApplicationContext, ApplicationContextAware } from '@blue/context';
import type { NodeDispatcher } from './node-dispatcher';
import { NodeHTTPServerAdapter } from './node-http-server-adapter';
import { NodeSocketSessionRegistry } from './node-socket-session-registry';

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
        const rawPort = options.port ?? Number(process.env['PORT'] ?? '3000');
        if (!Number.isInteger(rawPort) || rawPort < 0 || rawPort > 65_535) {
            throw new RangeError(`HTTPServer: invalid port ${String(rawPort)} — must be an integer in [0, 65535]`);
        }
        this.#port = rawPort;
        this.#host = options.host ?? '127.0.0.1';
        this.#dispatcher = dispatcher;
        this.#socketRegistry = options.socketRegistry ?? null;
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
            this.#adapter = new NodeHTTPServerAdapter(this.#resolveDispatcher(), { socketRegistry: registry });
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
            return this.#applicationContext.getValue<NodeDispatcher>('dispatcher');
        }
        throw new Error(
            'HTTPServer: no dispatcher provided and no application context available — pass a dispatcher to the ' +
                'constructor or register the server as a context entry'
        );
    }

    #resolveSocketRegistry(): NodeSocketSessionRegistry | null {
        if (this.#applicationContext?.hasValue?.('socketSessionRegistry')) {
            return this.#applicationContext.getValue<NodeSocketSessionRegistry>('socketSessionRegistry');
        }
        return null;
    }
}

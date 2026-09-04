/**
 * Managed HTTP server for Node.js platform applications.
 *
 * Integrates with the `ApplicationContext` lifecycle: created as a bean during
 * refresh, auto-started on the `started` event, shut down on `close`/`destroy`.
 *
 * @module
 * @since 1.0.0
 */

import type { NodeDispatcher } from './node-dispatcher';
import { NodeHTTPServerAdapter } from './node-http-server-adapter';

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
}

/**
 * A managed HTTP server that delegates incoming requests to a {@link NodeDispatcher}.
 *
 * @example
 * ```ts
 * const server = new HTTPServer(dispatcher, { port: 3000 });
 * await server.start();
 * // ... later
 * await server.close();
 * ```
 */
export class HTTPServer {
    #adapter: HTTPServerAdapter;
    #dispatcher: NodeDispatcher;
    #port: number;
    #host: string;
    #started: boolean;

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
        return this.#adapter.server;
    }

    /**
     * Create a new HTTP server.
     *
     * @param dispatcher - The dispatcher to handle incoming requests.
     * @param options - Server configuration.
     */
    constructor(dispatcher: NodeDispatcher, options: HTTPServerOptions = {}) {
        this.#dispatcher = dispatcher;
        this.#port = options.port ?? Number(process.env['PORT'] ?? '3000');
        this.#host = options.host ?? '127.0.0.1';
        this.#adapter = options.adapter ?? new NodeHTTPServerAdapter(dispatcher);
        this.#started = false;
    }

    /**
     * Start listening. Safe to call multiple times — subsequent calls are no-ops.
     */
    async start(): Promise<void> {
        if (this.#started) {
            return;
        }
        await this.#adapter.listen(this.#port, this.#host);
        this.#started = true;
    }

    /**
     * Stop the server gracefully.
     */
    async close(): Promise<void> {
        if (!this.#started) {
            return;
        }
        await this.#adapter.close();
        this.#started = false;
    }
}
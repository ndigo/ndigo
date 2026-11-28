/**
 * Node HTTP server adapter for the dispatcher.
 */
/**
 * Node.js HTTP server adapter wrapping `node:http.createServer()`.
 *
 * Parses the incoming `IncomingMessage` into a `NodeRequest`, creates a `Route`,
 * and dispatches through the `NodeDispatcher`. The dispatcher's render output
 * is written to the `ServerResponse`.
 *
 * The origin is HTTP/1.1 only — put an edge proxy (trusted, TLS
 * terminated) in front for production deployments.
 *
 * Every request passes through one error boundary: URL construction, body
 * streaming, parsing, dispatch, and response finalization all terminate with
 * a deterministic status (`400` malformed input, `408` timeout, `413`
 * oversized body, generic `500` otherwise — internal details logged, never
 * returned to the client).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

import { TrustedProxySet } from './trusted-proxy';
import { resolveSocketLimits, type ResolvedSocketLimits } from './node-socket-session';
import { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import { NodeHTTPRequestPipeline } from './_node-http-server-request.js';
import { NodeSocketDispatcher } from './_node-http-server-socket.js';
import { NodeHTTPListener } from './_node-http-server-listener.js';
import { SocketRouteIndex } from './_node-http-server-socket-routes.js';
import {
    DEFAULT_AUTHENTICATE_TIMEOUT_MS,
    DEFAULT_MAX_CONNECTIONS,
    normalizeOrigin,
    type NodeHTTPServerAdapterOptions,
} from './node-http-server-adapter-options.js';
import type { MultipartLimits } from './parse-multipart';
import type { NodeDispatcher } from './node-dispatcher';
import type { HTTPServerAdapter, TLSServerOptions } from './http-server';
import { type ResolvedHTTPRequestLimits, resolveHTTPRequestLimits } from './http-request-limits';

export { THEME_COOKIE_NAME } from './node-http-server-adapter-options.js';
export type { NodeHTTPServerAdapterOptions, SocketRequestAuthenticator } from './node-http-server-adapter-options.js';

/**
 * Default HTTP server adapter using raw `node:http`.
 *
 * @example
 * ```ts
 * const adapter = new NodeHTTPServerAdapter(dispatcher);
 * await adapter.listen(3000);
 * ```
 */
export class NodeHTTPServerAdapter implements HTTPServerAdapter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NodeHTTPServerAdapter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NodeHTTPServerAdapter]"
     */
    get [Symbol.toStringTag](): string {
        return 'NodeHTTPServerAdapter';
    }

    #dispatcher: NodeDispatcher;
    readonly #limits: ResolvedHTTPRequestLimits;
    readonly #socketLimits: ResolvedSocketLimits;
    readonly #multipartLimits: Partial<MultipartLimits> | undefined;
    /** Normalized allowed WebSocket origins, or `null` when unconstrained. */
    readonly #allowedWebSocketOrigins: Record<string, true> | null;
    readonly #authenticate: NodeHTTPServerAdapterOptions['authenticate'];
    /**
     * Admitted upgrades, from the `connection` event until the socket
     * closes — the `maxConnections` ledger. Includes sockets still
     * resolving parameters or awaiting authentication, which the registry
     * does not yet track.
     */
    readonly #openConnections: Set<unknown> = new Set();
    readonly #maxConnections: number;
    readonly #authenticateTimeoutMs: number;
    readonly #socketRegistry: NodeSocketSessionRegistry;
    /** Trusted-proxy allowlist; empty = trust nobody. */
    readonly #trustedProxies: TrustedProxySet;
    /** TLS material for the secure origin listener, or `null` for plaintext h1.1. */
    readonly #tls: TLSServerOptions | null;
    readonly #requests: NodeHTTPRequestPipeline;
    readonly #listener: NodeHTTPListener;
    readonly #sockets: NodeSocketDispatcher;
    readonly #socketRoutes: SocketRouteIndex;

    /** The underlying Node server. */
    get server(): unknown {
        return this.#listener.server;
    }

    /**
     * The session registry backing this adapter's sockets (broadcast, rooms,
     * heartbeat). Shared with the application so any service can push to a
     * room.
     */
    get socketRegistry(): NodeSocketSessionRegistry {
        return this.#socketRegistry;
    }

    /**
     * Creates the adapter.
     *
     * @param dispatcher - The dispatcher to invoke for each incoming request.
     * @param options - Optional request limits and timeouts.
     */
    constructor(dispatcher: NodeDispatcher, options: NodeHTTPServerAdapterOptions = {}) {
        this.#dispatcher = dispatcher;
        this.#limits = resolveHTTPRequestLimits(options.limits);
        this.#multipartLimits = options.multipart;
        this.#socketLimits = resolveSocketLimits(options.socketLimits);
        this.#authenticate = options.authenticate ?? undefined;
        this.#tls = options.tls ?? null;
        const maxConnections = options.maxConnections ?? DEFAULT_MAX_CONNECTIONS;
        if (maxConnections !== Number.POSITIVE_INFINITY && (!Number.isInteger(maxConnections) || maxConnections <= 0)) {
            throw new RangeError(
                `NodeHTTPServerAdapter maxConnections must be a positive integer or Infinity, received ${String(maxConnections)}`
            );
        }
        this.#maxConnections = maxConnections;
        const authenticateTimeoutMs = options.authenticateTimeoutMs ?? DEFAULT_AUTHENTICATE_TIMEOUT_MS;
        if (!Number.isInteger(authenticateTimeoutMs) || authenticateTimeoutMs <= 0) {
            throw new RangeError(
                `NodeHTTPServerAdapter authenticateTimeoutMs must be a positive integer (ms), received ${String(authenticateTimeoutMs)}`
            );
        }
        this.#authenticateTimeoutMs = authenticateTimeoutMs;
        this.#trustedProxies = new TrustedProxySet(options.trustedProxies);
        this.#socketRegistry = options.socketRegistry ?? new NodeSocketSessionRegistry();
        const origins: Record<string, true> = {};
        for (const entry of options.allowedWebSocketOrigins ?? []) {
            const normalized = normalizeOrigin(entry);
            if (normalized === null) {
                throw new RangeError(
                    `NodeHTTPServerAdapter allowedWebSocketOrigins entry is not a bare origin (scheme://host[:port]): ${entry}`
                );
            }
            origins[normalized] = true;
        }
        this.#allowedWebSocketOrigins = options.allowedWebSocketOrigins === undefined ? null : origins;
        this.#socketRoutes = new SocketRouteIndex(this.#dispatcher);
        this.#requests = new NodeHTTPRequestPipeline({
            dispatcher: this.#dispatcher,
            limits: this.#limits,
            multipartLimits: this.#multipartLimits,
            trustedProxies: this.#trustedProxies,
            hasSocketHandler: (path, parameterized): boolean => this.#socketRoutes.has(path, parameterized),
        });
        this.#sockets = new NodeSocketDispatcher({
            dispatcher: this.#dispatcher,
            socketRegistry: this.#socketRegistry,
            socketLimits: this.#socketLimits,
            authenticate: this.#authenticate,
            authenticateTimeoutMs: this.#authenticateTimeoutMs,
            openConnections: this.#openConnections,
            maxConnections: this.#maxConnections,
            findSocketHandler: (path, query) => this.#socketRoutes.find(path, query),
        });
        this.#listener = new NodeHTTPListener({
            limits: this.#limits,
            socketLimits: this.#socketLimits,
            tls: this.#tls,
            allowedWebSocketOrigins: this.#allowedWebSocketOrigins,
            socketRegistry: this.#socketRegistry,
            handleRequest: (req, res): void => void this.handleRequest(req, res),
            findSocketHandler: (path, query) => this.#socketRoutes.find(path, query),
            dispatchSocket: (ws, path, sources): void => void this.#sockets.dispatchSocket(ws, path, sources),
            clearSocketPathMemo: (): void => this.#socketRoutes.clear(),
            clearConnections: (): void => this.#openConnections.clear(),
        });
    }
    /**
     * Binds the server. Rejects on bind errors (port in use, bad host, …)
     * instead of resolving silently.
     *
     * @param port - The port to bind.
     * @param host - The bind host.
     * @returns A promise that resolves once listening.
     */
    listen(port: number, host?: string): Promise<void> {
        return this.#listener.listen(port, host);
    }

    /**
     * Stops the server gracefully: stop accepting new connections, then wait
     * up to `shutdownTimeoutMs` for in-flight requests to drain before
     * destroying remaining sockets.
     *
     * @returns A promise that resolves once closed.
     */
    close(): Promise<void> {
        return this.#listener.close();
    }

    /**
     * Handles one incoming request through the dispatch pipeline.
     *
     * @param req - The Node request.
     * @param res - The Node response.
     * @returns A promise that resolves once the response is written.
     */
    handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        return this.#requests.handle(req, res);
    }
}

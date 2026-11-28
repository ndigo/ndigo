/**
 * Server lifecycle for the Node HTTP server adapter: bind, TLS/HTTP2 flavor,
 * WebSocket upgrade wiring, and graceful close.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { SocketRequestSources } from '@ndigo/dispatcher';
import * as http2 from 'node:http2';
import type { Socket } from 'node:net';
import type { WebSocketServer } from 'ws';
import { IllegalStateError } from '@ndigo/core';

import type { TLSServerOptions } from './http-server.js';
import type { ResolvedHTTPRequestLimits } from './http-request-limits.js';
import type { ResolvedSocketLimits } from './node-socket-session.js';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import type { SocketHandlerTarget } from './_node-http-server-socket.js';
import { readPemMaterial } from './node-http-server-adapter-options.js';
import { createWebSocketServer } from './_node-http-server-upgrade.js';

/** The adapter state the listener reads and drives. */
export interface NodeHTTPListenerHost {
    /** Request limits and the shutdown deadline. */
    readonly limits: ResolvedHTTPRequestLimits;
    /** Socket transport bounds. */
    readonly socketLimits: ResolvedSocketLimits;
    /** TLS material, or `null` for plaintext HTTP/1.1. */
    readonly tls: TLSServerOptions | null;
    /** Normalized upgrade origin allowlist, or `null` when unconstrained. */
    readonly allowedWebSocketOrigins: Record<string, true> | null;
    /** Session registry (destroyed on close). */
    readonly socketRegistry: NodeSocketSessionRegistry;
    /** The HTTP request pipeline. */
    handleRequest(req: IncomingMessage, res: ServerResponse): void;
    /** Resolves a socket-mapped handler. */
    findSocketHandler(path: string, query?: Record<string, string | string[]>): SocketHandlerTarget | null;
    /** Dispatches an accepted upgrade. */
    dispatchSocket(ws: unknown, path: string, sources: SocketRequestSources): void;
    /** Clears the socket-path probe memo. */
    clearSocketPathMemo(): void;
    /** Clears the admitted-connection ledger. */
    clearConnections(): void;
}

/** Owns the bound server, WebSocket server, and teardown path. */
export class NodeHTTPListener {
    readonly #host: NodeHTTPListenerHost;
    #server: Server | http2.Http2SecureServer | null = null;
    #websocket: WebSocketServer | null = null;
    #forceClose: (() => void) | null = null;

    /**
     * @param host - The adapter state the listener reads.
     */
    constructor(host: NodeHTTPListenerHost) {
        this.#host = host;
    }

    /** The underlying Node server. */
    get server(): unknown {
        return this.#server;
    }

    /**
     * Binds the server. Rejects on bind errors (port in use, bad host, …)
     * instead of resolving silently.
     *
     * @param port - The port to bind.
     * @param host - The bind host.
     * @returns A promise that resolves once listening.
     */
    async listen(port: number, host?: string): Promise<void> {
        if (this.#server) {
            throw new IllegalStateError('NodeHTTPServerAdapter is already listening — close it before listening again');
        }
        return new Promise<void>((resolve, reject) => {
            const onError = (error: Error): void => reject(error);
            let server: Server | http2.Http2SecureServer;
            // Per-flavor connection teardown, committed to `#forceClose`
            // only when the bind succeeds (REV-107).
            let forceClose: () => void;
            if (this.#host.tls === null) {
                const plain = createServer((req: IncomingMessage, res: ServerResponse) => {
                    this.#host.handleRequest(req, res);
                });
                plain.requestTimeout = this.#host.limits.requestTimeoutMs;
                plain.headersTimeout = this.#host.limits.headersTimeoutMs;
                plain.keepAliveTimeout = this.#host.limits.keepAliveTimeoutMs;
                plain.maxRequestsPerSocket = this.#host.limits.maxRequestsPerSocket;
                forceClose = () => plain.closeAllConnections();
                server = plain;
            } else {
                const { key, cert, ca, minVersion, ciphers, clientAuth, maxConcurrentStreams } = this.#host.tls;
                // REV-104: the settings value is our API boundary — Node
                // accepts out-of-range values silently at creation, so a
                // typed rejection here beats a silently-ignored setting.
                if (
                    maxConcurrentStreams !== undefined &&
                    (!Number.isInteger(maxConcurrentStreams) || maxConcurrentStreams < 0)
                ) {
                    throw new RangeError(
                        `NodeHTTPServerAdapter maxConcurrentStreams must be a non-negative integer (HTTP/2 SETTINGS), received ${String(maxConcurrentStreams)}`
                    );
                }
                server = http2.createSecureServer({
                    key: readPemMaterial(key),
                    cert: readPemMaterial(cert),
                    ...(ca !== undefined ? { ca: readPemMaterial(ca) } : {}),
                    ...(minVersion !== undefined ? { minVersion } : {}),
                    ...(ciphers !== undefined ? { ciphers } : {}),
                    // REV-101: mutual TLS — `requestCert` asks for a client
                    // certificate, `rejectUnauthorized` (default `true`)
                    // enforces it: `'request'` opts out of the rejection so
                    // anonymous clients still connect; `ca` supplies the
                    // verification chain.
                    ...(clientAuth !== undefined && clientAuth !== 'none'
                        ? { requestCert: true, rejectUnauthorized: clientAuth === 'require' }
                        : {}),
                    // REV-104: Node's `maxConcurrentStreams` default is
                    // unbounded (up to 2^32-1 per connection) — a bounded
                    // ceiling here guards against stream-exhaustion
                    // amplification by a single client.
                    ...(maxConcurrentStreams !== undefined ? { settings: { maxConcurrentStreams } } : {}),
                    allowHTTP1: true,
                    ALPNProtocols: ['h2', 'http/1.1'],
                });
                server.on('request', (req, res) => {
                    // The http2 compatibility layer presents h2
                    // requests through the http.Server-shaped surface
                    // (url/method/headers in, writeHead/write/end out), so
                    // the same pipeline consumes both flavors
                    // (runtime-verified 2026-10-09 on Node 22).
                    this.#host.handleRequest(req as unknown as IncomingMessage, res as unknown as ServerResponse);
                });
                // Runtime-supported on the h2 server (verified 2026-10-09);
                // `@types/node` exposes them on `http.Server` only, hence
                // the local cast. Keep-alive/per-socket caps are h1.1-only
                // and stay on the plaintext branch.
                const timed = server as unknown as { requestTimeout: number; headersTimeout: number };
                timed.requestTimeout = this.#host.limits.requestTimeoutMs;
                timed.headersTimeout = this.#host.limits.headersTimeoutMs;
                // Draining the secure flavor needs tracked sockets —
                // destroying them kills h2 sessions and the h1.1 fallback
                // alike (see #forceClose).
                const connections = new Set<Socket>();
                server.on('connection', (socket) => {
                    connections.add(socket);
                    socket.once('close', () => connections.delete(socket));
                });
                forceClose = () => {
                    for (const socket of connections) {
                        socket.destroy();
                    }
                };
            }
            server.once('error', onError);
            server.listen(port, host, () => {
                server.off('error', onError);
                // REV-107: commit adapter state only on a successful bind —
                // a failed bind (EADDRINUSE, bad host, …) leaves the adapter
                // reusable for a retry instead of poisoned with a server and
                // ledger that never listened; `close()` after the failure is
                // a clean no-op.
                this.#server = server;
                this.#forceClose = forceClose;
                this.#websocket = websocket;
                resolve();
            });
            const websocket = createWebSocketServer(this.#host, server as unknown as Server);
        });
    }

    /**
     * Whether a path has a socket-mapped handler. Memoized per path —
     * handler mappings are static for the dispatcher's lifetime, and
     * `handleRequest` needs this probe on every request (the memo turns a
     * full second radix lookup into a Map read after the first hit).
     *
     * Parameterized matches are deliberately not memoized: their `path` is
     * the concrete request path (`/items/1`, `/items/2`, …), so caching
     * would add one entry per distinct path — unbounded growth from
     * ordinary traffic. Re-probing costs the same radix lookup a first-time
     * static path already pays, and keeps the memo bounded by the
     * registered static patterns.
     *
     * @param path - The request path.
     * @param parameterized - Whether the matched mapping captured path params.
     * @returns Whether the path resolves to a socket handler.


    /**
     * Stops the server gracefully: stop accepting new connections, then wait
     * up to `shutdownTimeoutMs` for in-flight requests to drain before
     * destroying remaining sockets.
     *
     * @returns A promise that resolves once closed.
     */
    async close(): Promise<void> {
        const server = this.#server;
        if (!server) return;
        this.#server = null;
        // Stop accepting upgrades and close connected sockets.
        const wss = this.#websocket;
        this.#websocket = null;
        this.#host.clearSocketPathMemo();
        // The adapter is not listening any more; a later `listen()` starts
        // from an empty ledger (pending close events are no-ops).
        this.#host.clearConnections();
        if (wss) {
            // The compiler cannot model this runtime-guaranteed shape; the assertion is confined here.
            const clients = wss.clients as unknown as Set<{ close(code: number, reason: string): void }> | undefined;
            clients?.forEach((client) => client.close(1001, 'server shutting down'));
        }
        // PLN-F10: release the registry's fanout subscriptions on teardown,
        // not just its heartbeat — otherwise every closed adapter leaks its
        // path/room subscriptions. `close()` is idempotent (cached promise)
        // and also stops the heartbeat, replacing the old `stop()` call.
        await this.#host.socketRegistry.destroy();
        // `server.close()` resolves only once every connection ends —
        // an open SSE stream, slow download, or stalled request would hang
        // `close()` forever. Arm the drain deadline *before* the wait and race
        // it: when the deadline wins, destroy the remaining connections and
        // let the server's own completion callback resolve the await.
        const deadline = this.#host.limits.shutdownTimeoutMs;
        const forceClose = this.#forceClose;
        this.#forceClose = null;
        await new Promise<void>((resolve) => {
            let timer: NodeJS.Timeout | null = null;
            let finished = false;
            const finish = (): void => {
                if (finished) {
                    return;
                }
                finished = true;
                if (timer !== null) {
                    clearTimeout(timer);
                    timer = null;
                }
                resolve();
            };
            server.close(() => finish());
            if (deadline > 0 && forceClose !== null && !finished) {
                timer = setTimeout(() => {
                    if (!finished) {
                        forceClose();
                    }
                }, deadline);
                timer.unref?.();
            }
        });
    }
}

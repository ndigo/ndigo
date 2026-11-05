/**
 * @since 1.0.0
 * @author Jeff Rose
 */
/**
 * Node.js HTTP server adapter wrapping `node:http.createServer()`.
 *
 * Parses the incoming `IncomingMessage` into a `NodeRequest`, creates a `Route`,
 * and dispatches through the `NodeDispatcher`. The dispatcher's render output
 * is written to the `ServerResponse`.
 *
 * The origin is HTTP/1.1 only — put an edge proxy (trusted per AD-37, TLS
 * terminated per AD-80) in front for production deployments.
 *
 * Every request passes through one error boundary: URL construction, body
 * streaming, parsing, dispatch, and response finalization all terminate with
 * a deterministic status (`400` malformed input, `408` timeout, `413`
 * oversized body, generic `500` otherwise — internal details logged, never
 * returned to the client).
 *
 * @since 1.0.0
 */
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import * as http2 from 'node:http2';
import type { Socket } from 'node:net';
import { WebSocketServer } from 'ws';
import { Route, RouteSegment, ACCEPT_LANGUAGE_ATTRIBUTE } from '@ndigo/router';
import { ARGUMENT_RESOLVERS } from '@ndigo/dispatcher';
import {
    getDispatchError,
    getInterceptorDenial,
    getMethodNotAllowed,
    isSocketMapping,
    isStompMapping,
    type SocketRequestSources,
    type SocketSession,
    type MethodParameter,
    type HandlerMethodArgumentResolver,
    MethodParameterType,
} from '@ndigo/dispatcher';
import { NodeRequest, NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { TrustedProxySet, resolveClientAddress } from './trusted-proxy';
import {
    nodeSocketSession,
    resolveSocketLimits,
    type ResolvedSocketLimits,
    type SocketLimits,
} from './node-socket-session';
import { NodeSocketSessionRegistry } from './node-socket-session-registry';
import { parseMultipart } from './parse-multipart';
import type { MultipartLimits } from './parse-multipart';
import type { MultipartContext } from './multipart-file';
import { contentTypeBase, MULTIPART_FORM_DATA, HTTPHeaders } from '@ndigo/http';
import { ProblemTypes, writeProblem } from './problem-details';
import { finalizeInterceptorDenial } from './finalize-denial';
import type { NodeDispatcher } from './node-dispatcher';
import type { HTTPServerAdapter, TLSServerOptions } from './http-server';
import type { WebSocket } from 'ws';
import {
    type HTTPRequestLimits,
    type ResolvedHTTPRequestLimits,
    resolveHTTPRequestLimits,
    parseBodyRecord,
    RequestLimitError,
} from './http-request-limits';
import { parseCookies } from './cookie-parser';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@ndigo/auth-core';
import { getSymbolMetadata } from '@ndigo/core';
import { NotAcceptableError } from '@ndigo/view';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-platform-node:node-http-server-adapter');

/**
 * STOMP WebSocket subprotocols, best to worst (AD-23 D4). Reference clients and
 * STOMP.js clients offer these on upgrade; the adapter selects the best
 * mutual match.
 */
const STOMP_SUBPROTOCOLS: readonly string[] = ['v12.stomp', 'v11.stomp', 'v10.stomp'];

/** Default concurrent-connection cap (SEC-9). */
const DEFAULT_MAX_CONNECTIONS = 10_000;

/** Default upgrade-authentication budget in milliseconds (SEC-9). */
const DEFAULT_AUTHENTICATE_TIMEOUT_MS = 10_000;

/**
 * Shape guard for the identity bag's `principal`: the socket auth check
 * needs the `hasRole` contract only (session attributes are
 * `unknown`-valued), not the full `Principal` interface —
 * `@ndigo/auth-core` owns that interface, this package must not depend on
 * its concrete implementations.
 */
function likeRolePrincipal(value: unknown): value is { hasRole(role: string): boolean } {
    if (typeof value !== 'object' || value === null || !('hasRole' in value)) {
        return false;
    }
    return typeof value.hasRole === 'function';
}

/**
 * Upgrade-time identity provider for socket endpoints.
 *
 * The returned bag is merged into `session.attributes`. Returning `null`
 * rejects the upgrade with `1008` (policy violation). Socket handlers
 * marked `@authenticated`/`@authorized` additionally require the bag to
 * carry a `principal` with a `hasRole(role)` method — authentication or
 * authorization failures close the socket with `1008`.
 *
 * {@link NodeHTTPServerAdapterOptions.authenticate} is the direct wiring;
 * `HTTPServer` also resolves an application-context bean named
 * `socketRequestAuthenticator` implementing this interface, so bean-based
 * applications wire identity without constructing the adapter.
 */
export interface SocketRequestAuthenticator {
    /**
     * Authenticates an accepted WebSocket upgrade from its request sources.
     *
     * @param sources - Query parameters, headers, and cookies captured from the handshake.
     * @returns The attribute bag to merge into `session.attributes`, or `null` to reject the upgrade with `1008`.
     */
    authenticate(
        sources: SocketRequestSources
    ): Record<string, unknown> | null | Promise<Record<string, unknown> | null>;
}

/**
 * Options for {@link NodeHTTPServerAdapter}.
 */
export interface NodeHTTPServerAdapterOptions {
    /** Request pipeline limits/timeouts. Defaults are conservative and safe. */
    limits?: HTTPRequestLimits;
    /**
     * Multipart parser bounds (per-file/field/part/request limits, spill
     * threshold), passed through to {@link parseMultipart}. Defaults are the
     * parser's 10 MiB request cap — NOTE this is independent of
     * {@link HTTPRequestLimits.maxBodyBytes} (1 MiB default), which caps only
     * non-multipart bodies; align the two when one budget for every body
     * shape is intended.
     */
    multipart?: Partial<MultipartLimits>;
    /**
     * Socket transport bounds (frame payload, inbound queue cap). Defaults
     * are conservative and safe; env-tunable via `NDIGO_SOCKET_MAX_PAYLOAD_BYTES`
     * and `NDIGO_SOCKET_MAX_QUEUED_MESSAGES`.
     */
    socketLimits?: SocketLimits;
    /**
     * When set, WebSocket upgrades must carry an `Origin` (or
     * `Sec-WebSocket-Origin`) header whose scheme/host/port match one of
     * these bare origins exactly (implicit default ports compare equal).
     * Upgrades from any other origin — or with no Origin header at all —
     * are rejected with `403` before the `connection` event fires. Omit for
     * public socket endpoints that must accept any client.
     */
    allowedWebSocketOrigins?: string[];
    /**
     * Optional upgrade-time authentication hook. Invoked on every accepted
     * upgrade before the socket handler runs, with the request sources
     * (query/headers/cookies) captured from the handshake.
     *
     * Returning an object populates `session.attributes` — the identity
     * binding point (e.g. `{ principal }`) REST handlers get via the auth
     * session. Returning `null` rejects the upgrade with `1008` (policy
     * violation). An `async` hook is awaited, up to
     * {@link NodeHTTPServerAdapterOptions.authenticateTimeoutMs}. Absent,
     * sockets accept any client (public endpoint posture).
     *
     * This is also where `@authenticated`/`@authorized` socket handlers get
     * the `principal` they require — see {@link SocketRequestAuthenticator}.
     */
    authenticate?: SocketRequestAuthenticator['authenticate'];
    /**
     * Maximum concurrent WebSocket connections this adapter admits, counted
     * from the accepted upgrade until the connection closes (so sockets
     * still resolving parameters or identity hold their slot). An upgrade
     * over the cap is closed with `1013` ("try again later") before
     * dispatch. Default `10_000`; `Infinity` disables the cap.
     */
    maxConnections?: number;
    /**
     * Milliseconds an {@link NodeHTTPServerAdapterOptions.authenticate}
     * hook may take before the socket is closed with `1011` and the
     * session is dropped. The session is deliberately untracked while
     * authentication is in flight, so an identity provider that never
     * settles would otherwise pin the connection for the process's
     * lifetime. Default `10_000`.
     */
    authenticateTimeoutMs?: number;
    /**
     * Trusted-proxy addresses/ranges (IP literal or CIDR, IPv4/IPv6) whose
     * `X-Forwarded-For` header the server may believe. The direct socket
     * peer must match this set before the header is even read — a client
     * reaching the server directly can never spoof an address (AD-37).
     * Empty (default) trusts nobody: `NodeRequest.remoteAddress` stays the
     * socket address. Malformed entries (hostnames, ports, bad prefixes)
     * fail loud at construction.
     */
    trustedProxies?: string[];
    /**
     * Session registry tracking open sockets (broadcast, rooms, heartbeat;
     * AD-21). When omitted, the adapter creates a default registry with
     * standard heartbeat defaults — heartbeats are on unless explicitly
     * disabled.
     */
    socketRegistry?: NodeSocketSessionRegistry;
    /**
     * TLS material for the origin listener (AD-81). When set, the adapter
     * binds `http2.createSecureServer` with `allowHTTP1: true` — ALPN
     * negotiates h2 with an HTTP/1.1 fallback, and WebSocket upgrades keep
     * flowing over the h1.1 path (RFC 8441 is not implemented by `ws` or
     * browsers). Omit for the plaintext HTTP/1.1 origin.
     */
    tls?: TLSServerOptions;
}

/**
 * TLS material from a {@link TLSServerOptions} entry (AD-81): inline PEM
 * (detected by the `-----BEGIN` prefix after trimming surrounding
 * whitespace — env-dumped values often carry indentation or quoting)
 * passes through; anything else is a file path read here, so a missing or
 * unreadable file surfaces as a typed `listen()` rejection instead of a
 * later TLS handshake failure. Node's tls options accept PEM content only
 * — path support is this framework's convenience, resolved at bind time.
 */
function readPemMaterial(value: string): string | Buffer {
    const trimmed = value.trim();
    if (trimmed === '') {
        throw new RangeError(
            'NodeHTTPServerAdapter: TLS material must be inline PEM or a file path, received an empty value'
        );
    }
    return trimmed.startsWith('-----BEGIN') ? trimmed : readFileSync(trimmed);
}

/**
 * Normalizes a bare `Origin` header value (`scheme://host[:port]`) into a
 * canonical comparison key — lowercase host, default ports dropped (e.g.
 * `http://EXAMPLE.com:80` → `http://example.com`). Returns `null` for
 * anything that is not a bare origin (credentials, path, query, fragment,
 * out-of-range port, or unparseable input).
 */
function normalizeOrigin(origin: string): string | null {
    try {
        const url = new URL(origin);
        if (
            url.username !== '' ||
            url.password !== '' ||
            url.pathname !== '/' ||
            url.search !== '' ||
            url.hash !== ''
        ) {
            return null;
        }
        return url.origin;
    } catch {
        return null;
    }
}

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
     * Pending upgrade sources, keyed by the upgrade `IncomingMessage`:
     * `shouldHandle(req)` runs before `handleUpgrade`/`connection` for each
     * upgrade, so store the parsed request sources keyed by its request and
     * the `connection` handler (which receives the same request) consumes
     * them. Keying — not a FIFO — means a handshake that aborts after
     * `shouldHandle` (client FIN before the 101 write, protocol/extensions
     * parse failures, server closing) can never misattribute its path or
     * sources to a later connection: the stale entry is unreachable.
     */
    #pendingUpgrades: Map<IncomingMessage, { path: string; sources: SocketRequestSources }> = new Map();
    /**
     * Static-path → has-socket-handler memo (probe cache). `handleRequest`
     * runs a second full radix lookup per request to distinguish socket-only
     * paths (404) from HTTP 405s; handler mappings are static for the
     * lifetime of the dispatcher, so the probe result is stable — cache it
     * and clear on close so re-listening re-resolves. Only static paths are
     * keyed (see {@link #hasSocketHandler}); a
     * parameterized mapping matches every concrete path, so memoizing it
     * would add one entry per distinct request path (unbounded growth).
     */
    #socketPathMemo: Map<string, boolean> = new Map();
    #dispatcher: NodeDispatcher;
    readonly #limits: ResolvedHTTPRequestLimits;
    readonly #socketLimits: ResolvedSocketLimits;
    readonly #multipartLimits: Partial<MultipartLimits> | undefined;
    /** Normalized allowed WebSocket origins, or `null` when unconstrained. */
    readonly #allowedWebSocketOrigins: Record<string, true> | null;
    readonly #authenticate: NodeHTTPServerAdapterOptions['authenticate'];
    /**
     * Admitted upgrades, from the `connection` event until the socket
     * closes — the `maxConnections` ledger (SEC-9). Includes sockets still
     * resolving parameters or awaiting authentication, which the registry
     * does not yet track.
     */
    readonly #openConnections: Set<unknown> = new Set();
    readonly #maxConnections: number;
    readonly #authenticateTimeoutMs: number;
    #server: Server | http2.Http2SecureServer | null;
    #websocket: WebSocketServer | null = null;
    readonly #socketRegistry: NodeSocketSessionRegistry;
    /** Trusted-proxy allowlist (AD-37); empty = trust nobody. */
    readonly #trustedProxies: TrustedProxySet;
    /** TLS material for the secure origin listener (AD-81), or `null` for plaintext h1.1. */
    readonly #tls: TLSServerOptions | null;
    /**
     * Force-closes the remaining connections when the shutdown drain
     * deadline wins. The h1.1 flavor uses `server.closeAllConnections()`;
     * the tls/h2 flavor has no such method (probe 2026-10-09 — neither
     * `Http2SecureServer` nor `tls.Server` exposes it), so it destroys the
     * tracked sockets instead.
     */
    #forceClose: (() => void) | null = null;

    get server(): unknown {
        return this.#server;
    }

    /**
     * The session registry backing this adapter's sockets (broadcast, rooms,
     * heartbeat). Shared with the application so any service can push to a
     * room (AD-21 D4).
     */
    get socketRegistry(): NodeSocketSessionRegistry {
        return this.#socketRegistry;
    }

    /**
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
        this.#server = null;
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
    }

    /**
     * Binds the server. Rejects on bind errors (port in use, bad host, …)
     * instead of resolving silently.
     */
    async listen(port: number, host?: string): Promise<void> {
        if (this.#server) {
            throw new Error('NodeHTTPServerAdapter is already listening — close it before listening again');
        }
        return new Promise<void>((resolve, reject) => {
            const onError = (error: Error): void => reject(error);
            let server: Server | http2.Http2SecureServer;
            // Per-flavor connection teardown, committed to `#forceClose`
            // only when the bind succeeds (REV-107).
            let forceClose: () => void;
            if (this.#tls === null) {
                const plain = createServer((req: IncomingMessage, res: ServerResponse) => {
                    void this.handleRequest(req, res);
                });
                plain.requestTimeout = this.#limits.requestTimeoutMs;
                plain.headersTimeout = this.#limits.headersTimeoutMs;
                plain.keepAliveTimeout = this.#limits.keepAliveTimeoutMs;
                plain.maxRequestsPerSocket = this.#limits.maxRequestsPerSocket;
                forceClose = () => plain.closeAllConnections();
                server = plain;
            } else {
                const { key, cert, ca, minVersion, ciphers, clientAuth, maxConcurrentStreams } = this.#tls;
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
                    // AD-81: the http2 compatibility layer presents h2
                    // requests through the http.Server-shaped surface
                    // (url/method/headers in, writeHead/write/end out), so
                    // the same pipeline consumes both flavors
                    // (runtime-verified 2026-10-09 on Node 22).
                    void this.handleRequest(req as unknown as IncomingMessage, res as unknown as ServerResponse);
                });
                // Runtime-supported on the h2 server (verified 2026-10-09);
                // `@types/node` exposes them on `http.Server` only, hence
                // the local cast. Keep-alive/per-socket caps are h1.1-only
                // and stay on the plaintext branch.
                const timed = server as unknown as { requestTimeout: number; headersTimeout: number };
                timed.requestTimeout = this.#limits.requestTimeoutMs;
                timed.headersTimeout = this.#limits.headersTimeoutMs;
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
            // WebSocket upgrades (RFC 6455 via `ws`): attach an `upgrade`
            // listener to this http.Server; `shouldHandle` gates by path so
            // only socket-mapped routes upgrade, then `connection` dispatches.
            // When `allowedWebSocketOrigins` is configured, `verifyClient`
            // rejects forged-origin upgrades with `403` before `connection`
            // fires (default fail-closed once configured; absent the option
            // any origin may upgrade — intended for public sockets).
            // ws forwards the server's `error` onto itself unconditionally
            // (its `error` option does not apply to the http server); without
            // a listener here, a bind failure would re-emit and crash the
            // process as an uncaught exception. Bind errors are already
            // surfaced by the server `error` path above (reject).
            //
            // The secure h2 flavor is runtime-compatible with ws — it emits
            // `upgrade` for h1.1 clients under `allowHTTP1` (probe
            // 2026-10-09) — but is typed as `tls.Server`, which `@types/ws`
            // does not accept, hence the cast.
            const websocket = new WebSocketServer({
                server: server as unknown as Server,
                maxPayload: this.#socketLimits.maxPayloadBytes,
                // STOMP subprotocol negotiation (AD-23 D4): a stomp-mapped
                // path answers `v12.stomp`/`v11.stomp`/`v10.stomp` when the
                // client offers any of them; every other path keeps ws's
                // stock behavior (first offered protocol echoed). A falsy
                // return merely omits the response header — the handshake
                // never aborts from this hook.
                handleProtocols: (protocols: Set<string>, req: IncomingMessage): string | false => {
                    const [path] = (req.url ?? '').split('?', 2);
                    const target = this.#findSocketHandler(path);
                    if (target !== null && isStompMapping(Object.getPrototypeOf(target.instance), target.method)) {
                        for (const candidate of STOMP_SUBPROTOCOLS) {
                            if (protocols.has(candidate)) {
                                return candidate;
                            }
                        }
                        // No mutual subprotocol: no response header (the
                        // handshake still completes; STOMP version lives
                        // in the CONNECT/CONNECTED frames).
                        return false;
                    }
                    const first = protocols.values().next().value;
                    return first ?? false;
                },
                verifyClient:
                    this.#allowedWebSocketOrigins === null
                        ? undefined
                        : (info, callback) => {
                              const normalized = typeof info.origin === 'string' ? normalizeOrigin(info.origin) : null;
                              const allowed =
                                  normalized !== null &&
                                  this.#allowedWebSocketOrigins !== null &&
                                  this.#allowedWebSocketOrigins[normalized] === true;
                              if (!allowed) {
                                  // Discard the pending entry `shouldHandle`
                                  // stored for this request: ws aborts the
                                  // handshake straight to the client, so the
                                  // `connection` event that would consume it
                                  // never fires. Keyed by the request, so
                                  // only this upgrade's entry is dropped.
                                  this.#pendingUpgrades.delete(info.req);
                              }
                              callback(allowed, 403, 'WebSocket origin not allowed');
                          },
            });
            websocket.on('error', () => undefined);
            websocket.shouldHandle = (req: IncomingMessage): boolean => {
                // SEC-10/SEC-3: the upgrade path runs the same header/cookie
                // bounds as `handleRequest` (Node's 16 KiB `maxHeaderSize`
                // is the only other bound). A `false` return aborts the
                // handshake with `400` — an oversized handshake is never
                // upgraded, and a cookie-bound `RangeError` can never escape
                // the handshake.
                let cookies: Record<string, string>;
                try {
                    this.#assertHeaderLimits(req);
                    cookies = this.#parseRequestCookies(req);
                } catch {
                    return false;
                }
                const [path, queryString] = (req.url ?? '').split('?', 2);
                // SEC-8: null-prototype map. `?__proto__=a&__proto__=b` on a
                // plain `{}` takes the inherited `__proto__` accessor path
                // (the `in` test is true for the inherited accessor), so the
                // assignment replaces the map's prototype instead of
                // accumulating a value. `Object.hasOwn` + a null prototype
                // keep `__proto__` an ordinary key (the codec's idiom).
                const query: Record<string, string | string[]> = Object.create(null);
                if (queryString) {
                    for (const [key, value] of new URLSearchParams(queryString)) {
                        if (Object.hasOwn(query, key)) {
                            const existing = query[key];
                            query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
                        } else {
                            query[key] = value;
                        }
                    }
                }
                const sources: SocketRequestSources = {
                    query,
                    headers: req.headers as Record<string, string | string[] | undefined>,
                    cookies,
                };
                const accepts = this.#findSocketHandler(path, query) !== null;
                // Only track accepted upgrades: when `shouldHandle` returns
                // false, ws aborts the handshake and `connection` never fires,
                // so storing first would leave a stale entry. The `connection`
                // handler receives the same request and consumes its entry.
                // Handshakes that abort after this point (client FIN before
                // the 101 write, protocol/extensions parse failures, server
                // closing) never fire `connection` — reap the entry when the
                // underlying socket closes so aborted upgrades cannot grow
                // the map (each holds the request's headers/cookies).
                if (accepts) {
                    this.#pendingUpgrades.set(req, { path, sources });
                    req.socket.once('close', () => this.#pendingUpgrades.delete(req));
                }
                return accepts;
            };
            websocket.on('connection', (ws: unknown, req: IncomingMessage) => {
                const pending = this.#pendingUpgrades.get(req);
                this.#pendingUpgrades.delete(req);
                void this.#dispatchSocket(
                    ws,
                    pending?.path ?? '',
                    pending?.sources ?? { query: {}, headers: {}, cookies: {} }
                );
            });
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
     */
    #hasSocketHandler(path: string, parameterized: boolean): boolean {
        if (parameterized) {
            return this.#findSocketHandler(path) !== null;
        }
        if (!this.#socketPathMemo.has(path)) {
            this.#socketPathMemo.set(path, this.#findSocketHandler(path) !== null);
        }
        return this.#socketPathMemo.get(path) ?? false;
    }

    /**
     * Resolve a controller instance (and its socket method) for a request
     * path, through the dispatcher's handler mapping.
     *
     * The upgrade request's query parameters are parsed into the route's
     * `data` so the mapping's `queryParams`/`matrixParams` conditions apply
     * to WebSocket upgrades exactly as they do to HTTP requests — e.g.
     * `@socketMapping({ value: '/room', queryParams: 'token=abc' })` gates
     * the upgrade by query string.
     *
     * @param path - The request path (e.g. `/chat/room`).
     * @param query - Parsed query parameters from the upgrade URL.
     * @returns `{ instance, method }` for the socket-mapped method, or `null`.
     */
    #findSocketHandler(
        path: string,
        query: Record<string, string | string[]> = {}
    ): { instance: object; method: string; parameters: MethodParameter[]; pathParams: Record<string, string> } | null {
        const route: Route = {
            path,
            raw: path,
            data: query,
            params: null,
            id: crypto.randomUUID(),
            attributes: {},
            length: 0,
        };
        const chain = this.#dispatcher.getHandler(route);
        const handler = chain?.handler;
        if (!handler) return null;
        // The chain's handler is a RouteHandlerMethod wrapping the controller
        // instance + the selected method name + its @parameters metadata.
        const candidate = handler as {
            handler: object;
            method: string;
            parameters: MethodParameter[];
        };
        const controller = candidate.handler;
        const methodName = candidate.method;
        if (
            controller &&
            typeof methodName === 'string' &&
            isSocketMapping(Object.getPrototypeOf(controller), methodName)
        ) {
            return {
                instance: controller,
                method: methodName,
                parameters: candidate.parameters ?? [],
                // The mapping mutates the matched route with the path segments.
                pathParams: (route.params as Record<string, string> | null) ?? {},
            };
        }
        return null;
    }

    /**
     * Resolve a socket method's `@parameters` against the upgrade request
     * sources, through the same argument resolvers the HTTP path uses.
     *
     * Each declared parameter is resolved by its supporting resolver
     * (`queryValue` → query string, `pathVariable` → path segment, `headerValue`
     * / `cookieValue` → handshake sources) and the value is coerced/validated
     * (including Zod hooks). A missing required parameter closes the socket
     * with `1008` (policy violation) instead of invoking the handler.
     *
     * @param parameters - The socket method's `@parameters`.
     * @param pathParams - Path-segment values captured from the mapping match.
     * @param sources - The upgrade request sources.
     * @returns The resolved param values keyed by extractor name.
     */
    #socketRoute(parameter: MethodParameter, pathParams: Record<string, string>, sources: SocketRequestSources): Route {
        return {
            path: '',
            raw: '',
            data: sources.query,
            params: pathParams,
            id: crypto.randomUUID(),
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: {
                    headers: sources.headers,
                    body: {},
                    cookies: sources.cookies,
                    session: {},
                },
                [ACCEPT_LANGUAGE_ATTRIBUTE]: HTTPHeaders.ACCEPT_LANGUAGE.get(sources.headers) ?? undefined,
            },
            length: 0,
        };
    }

    #findResolver(parameter: MethodParameter): HandlerMethodArgumentResolver | undefined {
        const context = this.#dispatcher.applicationContext;
        if (!context) return undefined;
        const resolvers =
            (context.hasValue?.(ARGUMENT_RESOLVERS) ? context.getValue(ARGUMENT_RESOLVERS) : undefined) ?? [];
        return resolvers.find((candidate) => candidate.supportsParameter(parameter));
    }

    /**
     * Reads a socket handler's `@authenticated`/`@authorized` metadata — the
     * same `AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY` contract `AuthRouteGuard`
     * enforces on HTTP requests. Both decorators are class- and
     * method-scoped; the method form writes `${key}:${methodName}` into the
     * class's `Symbol.metadata` record.
     *
     * @param target - The resolved socket handler (controller instance + method name).
     * @returns Whether authentication is required and the roles the principal must hold.
     */
    #socketAuthRequirements(target: { instance: object; method: string }): {
        requiresAuth: boolean;
        requiredRoles: string[];
    } {
        const metadata = getSymbolMetadata(target.instance);
        const method = target.method;
        const classRequiresAuth = metadata[AUTH_REQUIRED_KEY] === true;
        const methodRequiresAuth = metadata[`${AUTH_REQUIRED_KEY}:${method}`] === true;
        const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
        const methodRoles = (metadata[`${AUTH_ROLES_KEY}:${method}`] as string[] | undefined) ?? [];
        return {
            requiresAuth: classRequiresAuth || methodRequiresAuth,
            requiredRoles: [...classRoles, ...methodRoles],
        };
    }

    /**
     * Dispatch an upgraded WebSocket to its socket-mapped handler.
     *
     * Builds a `SocketSession` from the `ws` connection, invokes the handler
     * (an async-iterable producer-consumer), and drains inbound + yields
     * outbound until the connection closes.
     *
     * Fail-closed paths: an upgrade over {@link
     * NodeHTTPServerAdapterOptions.maxConnections} closes `1013`; a missing
     * required `@parameters` value, a rejecting `authenticate` hook, or an
     * unmet `@authenticated`/`@authorized` requirement closes `1008`; a
     * throwing or timing-out hook closes `1011`.
     *
     * @param rawWs - The upgraded `ws` connection.
     * @param path - The socket-mapped request path.
     * @param sources - Query/headers/cookies captured from the handshake.
     */
    async #dispatchSocket(rawWs: unknown, path: string, sources: SocketRequestSources): Promise<void> {
        // The `ws` server hands us a `WebSocket` (RFC 6455 connection) which
        // we only partially surface through SocketSession; the structural
        // surface is all we touch, so a boundary cast to the library type is
        // deliberate (the upgrade path is the only wire into this hook).
        const ws = rawWs as WebSocket;
        // SEC-9: the connection cap is counted from the accepted upgrade
        // until the socket closes — sockets still resolving parameters or
        // awaiting authentication hold a slot, which the registry (registered
        // later) does not yet account for.
        if (this.#openConnections.size >= this.#maxConnections) {
            ws.close(1013, 'connection limit reached');
            return;
        }
        this.#openConnections.add(ws);
        ws.once('close', () => this.#openConnections.delete(ws));
        const target = this.#findSocketHandler(path, sources.query);
        if (!target) {
            ws.close(1011, 'no socket handler');
            return;
        }
        // Bind @parameters positionally (validated, coerced — including Zod):
        // a socketSessionValue() extractor yields the session; the other extractors
        // resolve against the upgrade sources. The handler is invoked with the
        // declared args in signature order — no implicit session injection.
        const args: unknown[] = [];
        let session: SocketSession | null = null;
        if (target.parameters.length > 0) {
            try {
                for (const param of target.parameters) {
                    if (param.type === MethodParameterType.SOCKET_SESSION) {
                        session = nodeSocketSession(ws, path, sources, this.#socketRegistry, this.#socketLimits);
                        args.push(session);
                    } else {
                        const resolver = this.#findResolver(param);
                        if (resolver)
                            args.push(
                                resolver.resolveArgument(
                                    param,
                                    this.#socketRoute(param, target.pathParams, sources),
                                    null
                                )
                            );
                        else args.push(undefined);
                    }
                }
            } catch {
                ws.close(1008, 'missing required parameter');
                return;
            }
        }
        if (!session) session = nodeSocketSession(ws, path, sources, this.#socketRegistry, this.#socketLimits);
        // Attach the removal listener before any await: a peer closing while
        // authentication is pending must not leave a registry entry for a
        // dead session (remove is idempotent, so this also covers the
        // register below). The close code flows into `remove` for
        // observability (e.g. 1013 backpressure closes) — AD-21 D4 +
        // socket telemetry.
        ws.on('close', (code: number) => this.#socketRegistry.remove(session, code));
        // Upgrade-time authentication: the adapter-level hook binds identity
        // before the handler runs (REST gets this via the interceptor chain;
        // sockets are dispatched directly, so this is the auth seam). A null
        // result rejects with 1008; an async hook is awaited under
        // `authenticateTimeoutMs` (SEC-9). A hook that throws must not become
        // an unhandled rejection (this dispatch is fire-and-forget from the
        // connection event — Node ≥15 terminates on unhandled rejections) —
        // close 1011 instead, as does a hook that never settles. Rejected
        // upgrades are never tracked by the registry or observable to the
        // handler.
        const authenticate = this.#authenticate;
        if (authenticate) {
            let attributes: Record<string, unknown> | null;
            let timedOut = false;
            let timer: NodeJS.Timeout | undefined;
            const timeout = new Promise<never>((_resolve, reject) => {
                timer = setTimeout(() => {
                    timedOut = true;
                    reject(new Error('authentication timeout'));
                }, this.#authenticateTimeoutMs);
                timer.unref?.();
            });
            try {
                attributes = await Promise.race([authenticate(sources), timeout]);
            } catch {
                ws.close(1011, timedOut ? 'authentication timeout' : 'authentication failed');
                return;
            } finally {
                clearTimeout(timer);
            }
            if (attributes === null) {
                ws.close(1008, 'authentication required');
                return;
            }
            Object.assign(session.attributes, attributes);
        }
        if (session.isClosed) {
            // Closed while authentication was pending — the close listener
            // above already removed it from the registry.
            return;
        }
        // SEC-3 (decision D-B): enforce the `@authenticated`/`@authorized`
        // metadata on the socket dispatch path. HTTP requests get this from
        // the interceptor chain (`AuthRouteGuard`); sockets are dispatched
        // directly, so without this check the decorators are inert and every
        // socket endpoint is open by construction. The identity source is
        // the `authenticate` hook / `socketRequestAuthenticator` bean whose
        // bag lands in `session.attributes`. No metadata ⇒ unchanged
        // behavior (a public socket endpoint).
        const { requiresAuth, requiredRoles } = this.#socketAuthRequirements(target);
        if (requiresAuth || requiredRoles.length > 0) {
            const principal = session.attributes['principal'];
            if (!likeRolePrincipal(principal)) {
                ws.close(1008, 'authentication required');
                return;
            }
            if (requiredRoles.length > 0 && !requiredRoles.every((role) => principal.hasRole(role))) {
                ws.close(1008, 'insufficient role');
                return;
            }
        }
        // Track the session before the handler runs so broadcasts from the
        // handler (or any service with the registry) reach it immediately;
        // the close event drops it from the registry (AD-21 D3/D4).
        this.#socketRegistry.register(session, path, ws);
        const handlerMethod = (target.instance as Record<string, unknown>)[target.method] as unknown;
        if (typeof handlerMethod !== 'function') {
            ws.close(1011, 'socket handler is not a function');
            return;
        }
        try {
            const result: unknown = handlerMethod.call(target.instance, ...args);
            // Async-generator handler: pump inbound → yielded outbound until
            // the stream (connection) ends.
            if (
                result &&
                typeof (result as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function'
            ) {
                await this.#pumpFunction(result as AsyncGenerator<unknown>, session);
            } else if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
                // Broadcast-style handler (e.g. the chat demo's `async`
                // handler that consumes `session.messages` without yielding):
                // a Promise must be awaited and its rejection routed to the
                // session-close path — otherwise it becomes an unhandled
                // rejection and Node ≥15 terminates the process.
                await (result as Promise<unknown>);
            }
        } catch (error) {
            logger.error(`handler failed: ${(error as Error).message}`);
            session.close(1011, 'handler error');
        }
    }

    /**
     * Drain a socket handler's async generator: each yielded value is sent;
     * the loop ends when the connection closes (the inbound reader completes).
     *
     * @param gen - The handler's async-iterable result.
     * @param session - The session to send/poll.
     */
    async #pumpFunction(
        gen: AsyncGenerator<unknown>,
        session: {
            messages: AsyncIterable<unknown>;
            send(data: unknown): void;
            close(code?: number, reason?: string): void;
        }
    ): Promise<void> {
        const iterator = gen[Symbol.asyncIterator]();
        try {
            for await (const value of iterator) {
                const outbound = value === undefined ? null : value;
                session.send(outbound);
            }
        } catch (error) {
            // A stream-time failure leaves the session with a dead consumer:
            // close it so the registry drops the session and the inbound
            // queue stops accumulating (the per-yield send tolerance above
            // only applies to individual sends, which send() absorbs).
            logger.error('socket generator error:', (error as Error).message);
            session.close(1011, 'handler error');
        }
    }

    /**
     * Stops the server gracefully: stop accepting new connections, then wait
     * up to `shutdownTimeoutMs` for in-flight requests to drain before
     * destroying remaining sockets.
     */
    async close(): Promise<void> {
        const server = this.#server;
        if (!server) return;
        this.#server = null;
        // Stop accepting upgrades and close connected sockets.
        const wss = this.#websocket;
        this.#websocket = null;
        this.#socketPathMemo.clear();
        // The adapter is not listening any more; a later `listen()` starts
        // from an empty ledger (pending close events are no-ops).
        this.#openConnections.clear();
        if (wss) {
            const clients = wss.clients as unknown as Set<{ close(code: number, reason: string): void }> | undefined;
            clients?.forEach((client) => client.close(1001, 'server shutting down'));
        }
        // PLN-F10: release the registry's fanout subscriptions on teardown,
        // not just its heartbeat — otherwise every closed adapter leaks its
        // path/room subscriptions. `close()` is idempotent (cached promise)
        // and also stops the heartbeat, replacing the old `stop()` call.
        await this.#socketRegistry.close();
        // COR-14: `server.close()` resolves only once every connection ends —
        // an open SSE stream, slow download, or stalled request would hang
        // `close()` forever. Arm the drain deadline *before* the wait and race
        // it: when the deadline wins, destroy the remaining connections and
        // let the server's own completion callback resolve the await.
        const deadline = this.#limits.shutdownTimeoutMs;
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

    async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let multipart: MultipartContext | undefined;
        try {
            const urlObj = this.#buildUrl(req);
            this.#assertHeaderLimits(req);
            const contentType = String(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? '').toLowerCase();
            let bodyRecord: Record<string, unknown>;
            if (contentTypeBase(contentType) === MULTIPART_FORM_DATA) {
                multipart = await parseMultipart(req, { limits: this.#multipartLimits });
                bodyRecord = multipart.fields;
            } else {
                bodyRecord = this.#parseBodyRecord(req, await this.#readBody(req));
            }

            const nodeRequest: NodeRequest = {
                headers: req.headers as Record<string, string | string[] | undefined>,
                body: bodyRecord,
                cookies: this.#parseRequestCookies(req),
                // AD-37: resolved through the trusted-proxy allowlist; the
                // direct socket address stands unless the peer is trusted.
                remoteAddress: resolveClientAddress(
                    req.socket?.remoteAddress,
                    req.headers as Record<string, string | string[] | undefined>,
                    this.#trustedProxies
                ),
                session: {},
            };
            if (multipart) {
                nodeRequest.multipart = multipart;
            }
            // SEC-8: null-prototype map — see the upgrade path. `?__proto__=a`
            // must stay an ordinary parameter, not swap the map's prototype.
            const data: Record<string, string | string[]> = Object.create(null);

            const { segments, cleanedPath } = this.#parseMatrixParams(urlObj.pathname);
            urlObj.searchParams.forEach((value, key) => {
                // Preserve repeated query parameters using the multi-value
                // contract (`data[key]` becomes an array on repeats).
                if (Object.hasOwn(data, key)) {
                    const existing = data[key];
                    data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
                } else {
                    data[key] = value;
                }
            });

            const route: Route = {
                length: segments.length,
                id: crypto.randomUUID(),
                path: cleanedPath,
                raw: req.url ?? '/',
                data,
                params: null,
                method: req.method as Route['method'],
                attributes: {
                    [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
                    [NODE_RESPONSE_ATTRIBUTE]: res,
                    [ACCEPT_LANGUAGE_ATTRIBUTE]: HTTPHeaders.ACCEPT_LANGUAGE.get(req.headers) ?? undefined,
                },
            };

            const segmentsLength = segments.length;
            for (let index = 0; index < segmentsLength; index++) {
                route[index] = segments[index];
            }

            const chain = this.#dispatcher.getHandler(route);
            const noHandler = !chain?.handler || Object.keys(chain.handler).length === 0;

            // `route.params` is non-null exactly when the matched mapping is
            // parameterized (the radix mapping writes the captured segments),
            // so those probes stay out of the path-keyed memo (PL-8).
            if (!noHandler && this.#hasSocketHandler(route.path, route.params !== null)) {
                // A WebSocket-only endpoint (socketMapped) reached through a
                // plain HTTP request: the method exists but only for upgraded
                // sockets. Respond 404 — this path is not served over HTTP.
                writeProblem(res, {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    instance: route.path,
                });
                return;
            }

            if (noHandler) {
                const allowed = getMethodNotAllowed(route);
                if (allowed) {
                    writeProblem(
                        res,
                        {
                            type: ProblemTypes.methodNotAllowed,
                            title: 'Method Not Allowed',
                            status: 405,
                            instance: route.path,
                        },
                        { [HTTPHeaders.ALLOW.name]: allowed }
                    );
                    return;
                }
                if (route.method !== 'OPTIONS') {
                    // RFC 9110 §15.5.6: unmatched request → 404. Dispatching a
                    // non-OPTIONS unmatched route would fall into the error path
                    // (a deterministic 500) instead of the correct 404.
                    writeProblem(res, {
                        type: ProblemTypes.notFound,
                        title: 'Not Found',
                        status: 404,
                        instance: route.path,
                    });
                    res.end();
                    return;
                }
                // OPTIONS is always allowable and the CORS interceptor on the
                // fallback chain finalizes preflights — dispatch so it runs.
            }

            // The mapping strategy's fallback chain carries interceptors even
            // for unmatched routes, so interceptor-only concerns (CORS
            // preflight short-circuiting) can finalize the request. Dispatch
            // always; denial finalizes immediately.
            await this.#dispatcher.dispatch(route);
            // An interceptor denial (auth guard, CSRF, CORS preflight, …)
            // leaves no rendered view — finalize a deterministic response so
            // the request never stays open.
            const denial = getInterceptorDenial(route);
            if (denial) {
                finalizeInterceptorDenial(res, denial);
                return;
            }

            if (noHandler) {
                // OPTIONS preflight that no interceptor finalized: default to 404.
                writeProblem(res, {
                    type: ProblemTypes.notFound,
                    title: 'Not Found',
                    status: 404,
                    instance: route.path,
                });
                res.end();
            }

            // DSV-B1: the dispatcher swallows a handler-adapter, view-resolution,
            // or render failure (it must not reject fire-and-forget callers) and
            // records it on the route. Finalize a deterministic 500 when the
            // response is still open and nothing else finalized it — a denial is
            // handled above, and `noHandler` keeps its own 404/405 contract.
            const dispatchError = getDispatchError(route);
            if (dispatchError && !noHandler) {
                this.#writeErrorResponse(res, dispatchError);
                return;
            }
        } catch (error: unknown) {
            this.#writeErrorResponse(res, error);
        } finally {
            // SEC-6: every parsed multipart context is disposed once the
            // request has finished dispatching — success, early return
            // (404/405/denial), or error — so spilled temp parts never leak.
            // cleanup() is idempotent and never throws; handlers have already
            // run transferTo() (a copy), so the temp file is still owned here.
            if (multipart) {
                await multipart.cleanup();
            }
        }
    }

    /**
     * Central safe error response: maps transport errors to deterministic
     * problem documents; everything else is a generic 500 with internal
     * details logged, never leaked to the client.
     */
    #writeErrorResponse(res: ServerResponse, error: unknown): void {
        if (res.writableEnded || res.destroyed) return;
        if (res.headersSent) {
            // The response already began streaming, so a problem document can
            // no longer be written: `writeHead` would throw
            // ERR_HTTP_HEADERS_SENT and escape as an unhandled rejection
            // (PLN-F5). A mid-stream failure is not a 500 candidate (PLN-F4) —
            // log and abort the socket so the client sees a closed connection,
            // never a hang.
            const streamMessage = error instanceof Error ? (error.stack ?? error.message) : String(error);
            logger.error('dispatch failure after headers were sent; destroying response:', streamMessage);
            res.destroy();
            return;
        }
        if (error instanceof RequestLimitError) {
            if (error.code === 'malformed_body') {
                // Same registered problem type as the JSON-syntax path so
                // clients see one contract for malformed bodies.
                writeProblem(res, {
                    type: ProblemTypes.malformedBody,
                    title: 'Bad Request',
                    status: 400,
                    detail: 'malformed_body',
                });
                return;
            }
            writeProblem(res, {
                type: `urn:ndigo:${error.code}`,
                status: error.statusCode,
                detail: error.code,
            });
            return;
        }
        if (error instanceof SyntaxError) {
            writeProblem(res, {
                type: ProblemTypes.malformedBody,
                title: 'Bad Request',
                status: 400,
                detail: 'malformed_body',
            });
            return;
        }
        if (error instanceof URIError) {
            writeProblem(res, {
                type: ProblemTypes.malformedUrl,
                title: 'Bad Request',
                status: 400,
                detail: 'malformed_url',
            });
            return;
        }
        if (error instanceof NotAcceptableError) {
            // Content negotiation resolved candidates but none served the
            // request's accepted media types: the route/handler exists, so
            // this is 406 — never the 404 used for a missing view.
            writeProblem(res, {
                type: ProblemTypes.notAcceptable,
                title: 'Not Acceptable',
                status: 406,
                detail: error.message,
            });
            return;
        }
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
        logger.error('dispatch failure:', message);
        writeProblem(res, {
            type: ProblemTypes.internalError,
            title: 'Internal Server Error',
            status: 500,
        });
    }

    /**
     * Builds the request URL, rejecting malformed `Host` headers with `400`.
     */
    #buildUrl(req: IncomingMessage): URL {
        const host = HTTPHeaders.HOST.get(req.headers);
        const url = req.url ?? '/';
        try {
            return new URL(url, `http://${host ?? 'localhost'}`);
        } catch {
            throw new RequestLimitError(400, 'malformed_url', `Malformed request URL: ${url}`);
        }
    }

    /**
     * Parses the request's `Cookie` header under the parser's bounds,
     * re-classifying a bound violation (`RangeError` past 50 entries or
     * 4 KiB values) as the same `431` {@link RequestLimitError} the
     * header-size check produces — never a generic 500 (SEC-3).
     */
    #parseRequestCookies(req: IncomingMessage): Record<string, string> {
        try {
            return parseCookies(HTTPHeaders.COOKIE.get(req.headers) ?? undefined);
        } catch (error) {
            if (error instanceof RangeError) {
                throw new RequestLimitError(431, 'headers_too_large', 'Cookie header exceeds the configured limit');
            }
            throw error;
        }
    }

    #assertHeaderLimits(req: IncomingMessage): void {
        const rawHeaders = req.rawHeaders;
        let cookieBytes = 0;
        const rawHeadersLength = rawHeaders.length;
        for (let index = 0; index < rawHeadersLength; index += 2) {
            if (rawHeaders[index].toLowerCase() === 'cookie') {
                cookieBytes += Buffer.byteLength(rawHeaders[index + 1] ?? '', 'utf-8');
            }
        }
        if (cookieBytes > this.#limits.maxHeaderBytes) {
            throw new RequestLimitError(431, 'headers_too_large', 'Cookie header exceeds the configured limit');
        }
    }

    /**
     * Streams the body with a hard byte cap enforced *inside* the loop:
     * reading stops at the limit, so a client streaming past `maxBodyBytes`
     * is cut off immediately (memory stays bounded) and gets `413` while the
     * socket is still writable. `408` when the client stalls. The stream is
     * not destroyed on overflow — a destroyed request cannot deliver the
     * `413` response to the client (verified), and the socket is simply
     * discarded once the response is flushed, so no further garbage is read.
     */
    async #readBody(req: IncomingMessage): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            let received = 0;
            let settled = false;

            const settleError = (error: unknown): void => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                reject(error);
            };

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                req.destroy();
                reject(new RequestLimitError(408, 'request_timeout', 'Request body timed out'));
            }, this.#limits.requestTimeoutMs);
            timer.unref?.();

            const onAbort = (): void =>
                settleError(new RequestLimitError(400, 'request_aborted', 'Request aborted before completion'));
            req.once('aborted', onAbort);

            void (async () => {
                try {
                    for await (const chunk of req) {
                        const bytes = (chunk as Buffer).byteLength;
                        if (received + bytes > this.#limits.maxBodyBytes) {
                            // Over the cap: stop reading now, respond 413,
                            // and let the response flush on the still-alive
                            // socket. Remaining body bytes are discarded by
                            // the server when the response completes without
                            // ever being buffered here.
                            settleError(
                                new RequestLimitError(
                                    413,
                                    'body_too_large',
                                    'Request body exceeds the configured limit'
                                )
                            );
                            return;
                        }
                        received += bytes;
                        chunks.push(chunk as Buffer);
                    }
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        resolve(Buffer.concat(chunks));
                    }
                } catch (error) {
                    settleError(error);
                }
            })();

            req.once('close', () => {
                if (!settled && req.errored) onAbort();
            });
        });
    }

    /**
     * Applies content-type-aware parsing. JSON is strict; other types fall
     * back to raw text under the `'*'` key (no silent reshaping).
     */
    #parseBodyRecord(req: IncomingMessage, raw: Buffer): Record<string, unknown> {
        return parseBodyRecord(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? undefined, raw);
    }

    /**
     * Parse matrix parameters (e.g. `/products/42;color=red`) from a pathname.
     * Returns a cleaned path (matrix params stripped) and per-segment data maps.
     */
    #parseMatrixParams(pathname: string): {
        cleanedPath: string;
        segments: RouteSegment[];
    } {
        const segments: RouteSegment[] = [];
        const pathParts = pathname.split('/').filter((part) => part !== '');

        let cleanedPath = '';
        const pathPartsLength = pathParts.length;
        for (let index = 0; index < pathPartsLength; index++) {
            const part = pathParts[index];
            const [segmentValue, ...matrixParams] = part.split(';');

            cleanedPath = index === 0 ? segmentValue : `${cleanedPath}/${segmentValue}`;

            const data: Record<string, string> = {};
            for (const param of matrixParams) {
                const [key, value] = param.split('=');
                data[key] = value ?? '';
            }

            segments.push({ name: segmentValue, raw: part, data });
        }

        return { cleanedPath: cleanedPath ? `/${cleanedPath}` : '/', segments };
    }
}

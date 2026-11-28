/**
 * WebSocket upgrade wiring for the Node HTTP server adapter.
 */
import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer } from 'ws';
import { isStompMapping, type SocketRequestSources } from '@ndigo/dispatcher';
import type { ResolvedHTTPRequestLimits } from './http-request-limits.js';
import type { ResolvedSocketLimits } from './node-socket-session.js';
import type { SocketHandlerTarget } from './_node-http-server-socket.js';
import { STOMP_SUBPROTOCOLS, normalizeOrigin } from './node-http-server-adapter-options.js';
import { assertHeaderLimits, parseRequestCookies } from './_node-http-server-adapter-helpers.js';

/** The adapter state upgrade wiring reads. */
export interface NodeUpgradeHost {
    /** Request header/timeout limits. */
    readonly limits: ResolvedHTTPRequestLimits;
    /** Socket transport bounds. */
    readonly socketLimits: ResolvedSocketLimits;
    /** Normalized upgrade origin allowlist, or `null` when unconstrained. */
    readonly allowedWebSocketOrigins: Record<string, true> | null;
    /** Resolves a socket-mapped handler. */
    findSocketHandler(path: string, query?: Record<string, string | string[]>): SocketHandlerTarget | null;
    /** Dispatches an accepted upgrade. */
    dispatchSocket(ws: unknown, path: string, sources: SocketRequestSources): void;
}

/**
 * Attaches a WebSocket server to the HTTP origin: path-gated upgrades,
 * origin verification, and dispatch.
 *
 * @param host - The adapter state upgrade wiring reads.
 * @param server - The bound HTTP/HTTPS origin.
 * @returns The attached WebSocket server.
 */
export function createWebSocketServer(host: NodeUpgradeHost, server: Server): WebSocketServer {
    /**
     * Pending upgrade sources, keyed by the upgrade `IncomingMessage`:
     * `shouldHandle(req)` runs before `handleUpgrade`/`connection` for each
     * upgrade, so store the parsed request sources keyed by its request and
     * the `connection` handler (which receives the same request) consumes
     * them. Keying — not a FIFO — means a handshake that aborts after
     * `shouldHandle` can never misattribute its path or sources to a later
     * connection.
     */
    const pendingUpgrades: Map<IncomingMessage, { path: string; sources: SocketRequestSources }> = new Map();

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
        // The source type is wider than this consumer's contract; the assertion is confined to this boundary.
        server: server as unknown as Server,
        maxPayload: host.socketLimits.maxPayloadBytes,
        // STOMP subprotocol negotiation: a stomp-mapped
        // path answers `v12.stomp`/`v11.stomp`/`v10.stomp` when the
        // client offers any of them; every other path keeps ws's
        // stock behavior (first offered protocol echoed). A falsy
        // return merely omits the response header — the handshake
        // never aborts from this hook.
        handleProtocols: (protocols: Set<string>, req: IncomingMessage): string | false => {
            const [path] = (req.url ?? '').split('?', 2);
            const target = host.findSocketHandler(path);
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
            host.allowedWebSocketOrigins === null
                ? undefined
                : (info, callback) => {
                      const normalized = typeof info.origin === 'string' ? normalizeOrigin(info.origin) : null;
                      const allowed =
                          normalized !== null &&
                          host.allowedWebSocketOrigins !== null &&
                          host.allowedWebSocketOrigins[normalized] === true;
                      if (!allowed) {
                          // Discard the pending entry `shouldHandle`
                          // stored for this request: ws aborts the
                          // handshake straight to the client, so the
                          // `connection` event that would consume it
                          // never fires. Keyed by the request, so
                          // only this upgrade's entry is dropped.
                          pendingUpgrades.delete(info.req);
                      }
                      callback(allowed, 403, 'WebSocket origin not allowed');
                  },
    });
    websocket.on('error', () => undefined);
    websocket.shouldHandle = (req: IncomingMessage): boolean => {
        // The upgrade path runs the same header/cookie
        // bounds as `handleRequest` (Node's 16 KiB `maxHeaderSize`
        // is the only other bound). A `false` return aborts the
        // handshake with `400` — an oversized handshake is never
        // upgraded, and a cookie-bound `RangeError` can never escape
        // the handshake.
        let cookies: Record<string, string>;
        try {
            assertHeaderLimits(req, host.limits);
            cookies = parseRequestCookies(req);
        } catch {
            return false;
        }
        const [path, queryString] = (req.url ?? '').split('?', 2);
        // Null-prototype map. `?__proto__=a&__proto__=b` on a
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
        const accepts = host.findSocketHandler(path, query) !== null;
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
            pendingUpgrades.set(req, { path, sources });
            req.socket.once('close', () => pendingUpgrades.delete(req));
        }
        return accepts;
    };
    websocket.on('connection', (ws: unknown, req: IncomingMessage) => {
        const pending = pendingUpgrades.get(req);
        pendingUpgrades.delete(req);
        host.dispatchSocket(ws, pending?.path ?? '', pending?.sources ?? { query: {}, headers: {}, cookies: {} });
    });
    return websocket;
}

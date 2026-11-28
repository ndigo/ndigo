/**
 * Public options and helpers for the Node HTTP server adapter.
 */
import { readFileSync } from 'node:fs';
import { like } from '@ndigo/util/types';
import type { SocketRequestSources } from '@ndigo/dispatcher';
import type { HTTPRequestLimits } from './http-request-limits.js';
import type { MultipartLimits } from './parse-multipart.js';
import type { TLSServerOptions } from './http-server.js';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import type { SocketLimits } from './node-socket-session.js';

export const THEME_COOKIE_NAME = 'theme';

/**
 * STOMP WebSocket subprotocols, best to worst. Reference clients and
 * STOMP.js clients offer these on upgrade; the adapter selects the best
 * mutual match.
 */
export const STOMP_SUBPROTOCOLS: readonly string[] = ['v12.stomp', 'v11.stomp', 'v10.stomp'];

/** Default concurrent-connection cap. */
export const DEFAULT_MAX_CONNECTIONS = 10_000;

/** Default upgrade-authentication budget in milliseconds. */
export const DEFAULT_AUTHENTICATE_TIMEOUT_MS = 10_000;

/**
 * Shape guard for the identity bag's `principal`: the socket auth check
 * needs the `hasRole` contract only (session attributes are
 * `unknown`-valued), not the full `Principal` interface —
 * `@ndigo/auth-core` owns that interface, this package must not depend on
 * its concrete implementations.
 *
 * @param value - The candidate identity.
 * @returns `true` when the value exposes `hasRole`.
 */
export function likeRolePrincipal(value: unknown): value is { hasRole(role: string): boolean } {
    return like({ hasRole: Function })(value);
}

/**
 * Shape guard for the identity bag's `principal` when a socket endpoint
 * declares `@authorizedScopes`: the scope check needs the `hasScope` contract
 * only, not the full `Principal` interface.
 *
 * @param value - The candidate identity.
 * @returns `true` when the value exposes `hasScope`.
 */
export function likeScopePrincipal(value: unknown): value is { hasScope(scope: string): boolean } {
    return like({ hasScope: Function })(value);
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
 * `HTTPServer` also resolves an application-context entry named
 * `socketRequestAuthenticator` implementing this interface, so entry-based
 * applications wire identity without constructing the adapter.
 *
 * @example
 * ```ts
 * const value = {} as SocketRequestAuthenticator;
 * ```
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
 * Options for `NodeHTTPServerAdapter`.
 *
 * @example
 * ```ts
 * const value = {} as NodeHTTPServerAdapterOptions;
 * ```
 */
export interface NodeHTTPServerAdapterOptions {
    /** Request pipeline limits/timeouts. Defaults are conservative and safe. */
    limits?: HTTPRequestLimits;
    /**
     * Multipart parser bounds (per-file/field/part/request limits, spill
     * threshold), passed through to `parseMultipart`. Defaults are the
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
     * reaching the server directly can never spoof an address.
     * Empty (default) trusts nobody: `NodeRequest.remoteAddress` stays the
     * socket address. Malformed entries (hostnames, ports, bad prefixes)
     * fail loud at construction.
     */
    trustedProxies?: string[];
    /**
     * Session registry tracking open sockets (broadcast, rooms, heartbeat).
     * When omitted, the adapter creates a default registry with
     * standard heartbeat defaults — heartbeats are on unless explicitly
     * disabled.
     */
    socketRegistry?: NodeSocketSessionRegistry;
    /**
     * TLS material for the origin listener. When set, the adapter
     * binds `http2.createSecureServer` with `allowHTTP1: true` — ALPN
     * negotiates h2 with an HTTP/1.1 fallback, and WebSocket upgrades keep
     * flowing over the h1.1 path (RFC 8441 is not implemented by `ws` or
     * browsers). Omit for the plaintext HTTP/1.1 origin.
     */
    tls?: TLSServerOptions;
}

/**
 * TLS material from a {@link TLSServerOptions} entry: inline PEM
 * (detected by the `-----BEGIN` prefix after trimming surrounding
 * whitespace — env-dumped values often carry indentation or quoting)
 * passes through; anything else is a file path read here, so a missing or
 * unreadable file surfaces as a typed `listen()` rejection instead of a
 * later TLS handshake failure. Node's tls options accept PEM content only
 * — path support is this framework's convenience, resolved at bind time.
 *
 * @param value - Inline PEM or a path to a PEM file.
 * @returns The PEM content.
 */
export function readPemMaterial(value: string): string | Buffer {
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
 *
 * @param origin - The raw `Origin` header value.
 * @returns The canonical origin key, or `null` when invalid.
 */
export function normalizeOrigin(origin: string): string | null {
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

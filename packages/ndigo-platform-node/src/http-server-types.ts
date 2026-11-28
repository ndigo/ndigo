/**
 * Public contracts for the managed HTTP server.
 */
import type { NodeHTTPServerAdapterOptions } from './node-http-server-adapter.js';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import type { SocketLimits } from './node-socket-session.js';

/**
 * Adapter interface for platform HTTP servers.
 * The default implementation wraps `node:http.createServer()`.
 *
 * @example
 * ```ts
 * const value = {} as HTTPServerAdapter;
 * ```
 */
export interface HTTPServerAdapter {
    /** Start listening on the given port and host. @param port - The port. @param host - The bind host. */
    listen(port: number, host?: string): Promise<void>;
    /** Stop the server gracefully. */
    close(): Promise<void>;
    /** The underlying server instance (for integration tests, etc.). */
    readonly server: unknown;
}

/**
 * TLS material for the secure origin listener.
 *
 * `key`, `cert` and `ca` accept either inline PEM (detected by a
 * `-----BEGIN` prefix) or a filesystem path, read by the adapter at bind
 * time (Node's tls options take PEM content only). Present when the
 * origin should terminate TLS and negotiate HTTP/2; absent, the origin
 * stays plaintext HTTP/1.1 for the edge-terminated topology.
 *
 * @example
 * ```ts
 * const value = {} as TLSServerOptions;
 * ```
 */
export interface TLSServerOptions {
    /** PEM private key (inline) or path to the key file. */
    key: string;
    /** PEM certificate chain (inline) or path to the certificate file. */
    cert: string;
    /**
     * Optional CA bundle (inline PEM or path) that presented client
     * certificates verify against when {@link TLSServerOptions.clientAuth}
     * is set; without `clientAuth` this entry has no effect —
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
 * Options for creating an `HTTPServer`.
 *
 * @example
 * ```ts
 * const value = {} as HTTPServerOptions;
 * ```
 */
export interface HTTPServerOptions {
    /** TCP port to listen on. Defaults to `3000` or `process.env.PORT`. */
    port?: number;
    /** Host to bind to. Defaults to `'127.0.0.1'`. */
    host?: string;
    /** Custom adapter. Defaults to `NodeHTTPServerAdapter`. */
    adapter?: HTTPServerAdapter;
    /**
     * TLS material for the default adapter. When set, the origin
     * listener is an `http2.createSecureServer` in `allowHTTP1` mode:
     * ALPN negotiates `h2` with an HTTP/1.1 fallback, and WebSocket
     * upgrades keep working over the h1.1 path (RFC 8441 is not
     * implemented by `ws` or browsers — WebSockets cannot ride h2).
     * Ignored when a custom {@link HTTPServerOptions.adapter} is passed.
     *
     * Env fallback when omitted: `NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` (both
     * required together — a half-configured pair throws rather than
     * silently serving plaintext) and optional `NDIGO_TLS_CA`. Blank env
     * values count as unset, and the env is consulted for the default
     * adapter only — a custom {@link HTTPServerOptions.adapter} is never
     * TLS-configured through it.
     */
    tls?: TLSServerOptions;
    /**
     * Socket transport bounds (frame payload, inbound queue cap). When
     * omitted, env `NDIGO_SOCKET_MAX_PAYLOAD_BYTES` / `NDIGO_SOCKET_MAX_QUEUED_MESSAGES`
     * are honored by the default adapter.
     */
    socketLimits?: SocketLimits;
    /**
     * WebSocket Origin allowlist handed to the default adapter. When
     * omitted, env `NDIGO_SOCKET_ALLOWED_ORIGINS` (comma-separated bare
     * origins) is honored; absent both, any origin may upgrade (public
     * socket endpoints).
     */
    allowedWebSocketOrigins?: string[];
    /**
     * Upgrade-time authentication hook for the default adapter — see
     * {@link NodeHTTPServerAdapterOptions.authenticate}. When omitted, the
     * default adapter uses the application-context
     * `socketRequestAuthenticator` entry.
     */
    authenticate?: NodeHTTPServerAdapterOptions['authenticate'];
    /**
     * Trusted-proxy allowlist handed to the default adapter: IP
     * literals and CIDR prefixes (IPv4/IPv6) whose `X-Forwarded-For`
     * header the server may believe. Env-tunable via `NDIGO_TRUSTED_PROXIES`
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
     * Socket session registry shared with the default adapter.
     * When omitted, the registry is resolved from the application context
     * (`socketSessionRegistry` entry) at start, falling back to a fresh
     * instance — so broadcasts from the entry reach the adapter's sessions.
     */
    socketRegistry?: NodeSocketSessionRegistry;
}

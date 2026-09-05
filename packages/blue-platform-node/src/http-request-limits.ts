/**
 * Request-pipeline limits and timeouts for {@link NodeHTTPServerAdapter}.
 *
 * All limits are conservative by default so an unconfigured server is safe
 * against slow-loris style attacks, oversized payloads, and hung connections.
 *
 * @module
 * @since 1.0.0
 */

/**
 * Tunable bounds for the Node HTTP request pipeline.
 */
export interface HTTPRequestLimits {
    /** Maximum request body size in bytes (default 1 MiB). Oversized bodies produce `413`. */
    maxBodyBytes?: number;
    /** Maximum combined size of the `Cookie` header (default 16 KiB). */
    maxHeaderBytes?: number;
    /** Time to receive the complete request, headers + body, in ms (default 30s). Produces `408`. */
    requestTimeoutMs?: number;
    /** Time to receive the request headers in ms (default 10s). Produces `408`. */
    headersTimeoutMs?: number;
    /** Socket keep-alive timeout in ms (default 5s; Node default is 5s only when set). */
    keepAliveTimeoutMs?: number;
    /** Grace period, in ms, for in-flight requests during shutdown (default 10s). */
    shutdownTimeoutMs?: number;
    /** Maximum number of pending requests per socket (default 100). */
    maxRequestsPerSocket?: number;
}

/** Resolved, read-only limits with defaults applied. */
export interface ResolvedHTTPRequestLimits {
    readonly maxBodyBytes: number;
    readonly maxHeaderBytes: number;
    readonly requestTimeoutMs: number;
    readonly headersTimeoutMs: number;
    readonly keepAliveTimeoutMs: number;
    readonly shutdownTimeoutMs: number;
    readonly maxRequestsPerSocket: number;
}

/** Conservative defaults: 1 MiB bodies, 30s total request window, 10s drain. */
export const DEFAULT_HTTP_REQUEST_LIMITS: ResolvedHTTPRequestLimits = {
    maxBodyBytes: 1_048_576,
    maxHeaderBytes: 16_384,
    requestTimeoutMs: 30_000,
    headersTimeoutMs: 10_000,
    keepAliveTimeoutMs: 5_000,
    shutdownTimeoutMs: 10_000,
    maxRequestsPerSocket: 100,
};

/**
 * Validates and resolves user-provided limits, filling defaults. Throws a
 * `RangeError` for non-positive or non-finite values.
 */
export function resolveHTTPRequestLimits(limits?: HTTPRequestLimits): ResolvedHTTPRequestLimits {
    const resolved: ResolvedHTTPRequestLimits = { ...DEFAULT_HTTP_REQUEST_LIMITS };
    if (limits === undefined) return resolved;
    for (const key of Object.keys(DEFAULT_HTTP_REQUEST_LIMITS) as Array<keyof ResolvedHTTPRequestLimits>) {
        const value = limits[key];
        if (value === undefined) continue;
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
            throw new RangeError(
                `HTTPRequestLimits.${key} must be a positive finite number, received ${String(value)}`
            );
        }
        (resolved as unknown as Record<string, number>)[key] = value;
    }
    return resolved;
}

/**
 * Body parse outcomes. Malformed input is a `400` (never silently reshaped).
 */
export type BodyParseResult =
    | { readonly kind: 'empty' }
    | { readonly kind: 'json'; readonly value: Record<string, unknown> }
    | { readonly kind: 'raw'; readonly raw: string };

/**
 * Parses a request body according to its declared `Content-Type`.
 * Supported: `application/json` (strict — malformed JSON is rejected),
 * `text/*`, `application/x-www-form-urlencoded` (into `Record`), and any
 * other type as raw text under the wildcard `'*'` key.
 */
export function parseBody(contentType: string | undefined, raw: Buffer): BodyParseResult {
    if (raw.length === 0) return { kind: 'empty' };
    const mime = (contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';

    if (mime === 'application/json' || mime === 'text/json' || mime.endsWith('+json')) {
        const text = raw.toString('utf-8');
        const parsed: unknown = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new TypeError('JSON body must be an object');
        }
        return { kind: 'json', value: parsed as Record<string, unknown> };
    }

    if (mime === 'application/x-www-form-urlencoded') {
        const params = new URLSearchParams(raw.toString('utf-8'));
        const value: Record<string, unknown> = {};
        for (const [key, val] of params) {
            if (key in value) {
                const existing = value[key];
                value[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
            } else {
                value[key] = val;
            }
        }
        return { kind: 'json', value };
    }

    const text = raw.toString('utf-8');
    return { kind: 'raw', raw: text };
}

/**
 * Server-side CORS enforcement for Node applications.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ServerResponse } from 'node:http';
import {
    ACCESS_CONTROL_ALLOW_CREDENTIALS,
    ACCESS_CONTROL_ALLOW_HEADERS,
    ACCESS_CONTROL_ALLOW_METHODS,
    ACCESS_CONTROL_ALLOW_ORIGIN,
    ACCESS_CONTROL_EXPOSE_HEADERS,
    ACCESS_CONTROL_MAX_AGE,
    VARY,
} from '@blue/http';
import { type InterceptorDenial, type RouteHandlerInterceptor, type ModelAndView, denialOf } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Configuration for the server-side CORS interceptor.
 */
export interface CORSInterceptorOptions {
    /**
     * Allowed origins (scheme://host[:port], case-insensitive). Defaults to
     * `[]` — no cross-origin requests are allowed unless configured. Use
     * `['*']` for a public API WITHOUT credentials.
     */
    allowedOrigins?: string[];
    /**
     * Allowed methods for preflight. Defaults to
     * `['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`.
     */
    allowedMethods?: string[];
    /**
     * Allowed request headers for preflight. Defaults to
     * `['Content-Type', 'Authorization', 'X-Requested-With']`.
     */
    allowedHeaders?: string[];
    /**
     * Whether credentialed requests are allowed. When `true`, `*` origins are
     * rejected at construction (a wildcard cannot be combined with
     * credentials) and the echoed origin is returned instead.
     */
    allowCredentials?: boolean;
    /** Headers exposed to browser JS via `Access-Control-Expose-Headers`. */
    exposedHeaders?: string[];
    /** Preflight cache lifetime in seconds (default 86400). */
    maxAgeSeconds?: number;
}

/** Preflight short-circuit: `OPTIONS` with `Access-Control-Request-Method`. */
const PREFLIGHT_STATUS = 204;

/** Default allowed methods. */
const DEFAULT_ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

/** Default allowed request headers. */
const DEFAULT_ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

/**
 * A {@link RouteHandlerInterceptor} enforcing the configured CORS policy on
 * the Node HTTP pipeline: preflights are short-circuited with 204 and actual
 * responses receive the allow headers.
 *
 * @throws {TypeError} when `allowedOrigins: ['*']` is combined with
 *   `allowCredentials: true` — the browser forbids that combination and the
 *   misconfiguration must fail at startup, not at request time.
 */
export class CORSInterceptor implements RouteHandlerInterceptor {
    readonly #allowedOrigins: string[];
    readonly #allowedMethods: string[];
    readonly #allowedHeaders: string[];
    readonly #allowCredentials: boolean;
    readonly #exposedHeaders: string[];
    readonly #maxAgeSeconds: number;
    readonly #allowAnyOrigin: boolean;

    constructor(options: CORSInterceptorOptions = {}) {
        const allowedOrigins = (options.allowedOrigins ?? []).map((origin) => normalizeOrigin(origin));
        const allowCredentials = options.allowCredentials ?? false;

        if (allowCredentials && allowedOrigins.includes('*')) {
            throw new TypeError(
                "CORSInterceptor: allowCredentials cannot be combined with a wildcard allowedOrigins ('*'). " +
                    'List explicit origins when credentials are enabled.'
            );
        }

        this.#allowedOrigins = allowedOrigins;
        this.#allowAnyOrigin = allowedOrigins.includes('*');
        this.#allowedMethods = options.allowedMethods ?? DEFAULT_ALLOWED_METHODS;
        this.#allowedHeaders = options.allowedHeaders ?? DEFAULT_ALLOWED_HEADERS;
        this.#allowCredentials = allowCredentials;
        this.#exposedHeaders = options.exposedHeaders ?? [];
        this.#maxAgeSeconds = options.maxAgeSeconds ?? 86_400;
    }

    /**
     * Attaches CORS headers and short-circuits preflight requests.
     */
    async preHandle(route: Route, _handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (!res || res.headersSent) return true;

        const request = getNodeRequest(route);
        const originHeader = request?.headers?.['origin'];
        const origin = typeof originHeader === 'string' ? normalizeOrigin(originHeader) : null;

        // No Origin → same-origin request: no CORS processing.
        if (origin === null) return true;
        // Disallowed origin → attach nothing; the browser enforces the block.
        if (!this.#allows(origin)) return true;

        this.#attachAllowHeaders(res, origin);

        const method = route.method ?? '';
        const requestedMethod = request?.headers?.['access-control-request-method'];
        const isPreflight = method === 'OPTIONS' && typeof requestedMethod === 'string';

        if (isPreflight) {
            res.setHeader(ACCESS_CONTROL_ALLOW_METHODS.name, this.#allowedMethods.join(', '));
            res.setHeader(ACCESS_CONTROL_ALLOW_HEADERS.name, this.#allowedHeaders.join(', '));
            res.setHeader(ACCESS_CONTROL_MAX_AGE.name, String(this.#maxAgeSeconds));
            return denialOf(PREFLIGHT_STATUS);
        }

        return true;
    }

    /**
     * Ensures the allow headers reach actual (non-preflight) responses.
     */
    async postHandle(route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (!res || res.headersSent) return;
        const request = getNodeRequest(route);
        const originHeader = request?.headers?.['origin'];
        const origin = typeof originHeader === 'string' ? normalizeOrigin(originHeader) : null;
        if (origin !== null && this.#allows(origin)) {
            this.#attachAllowHeaders(res, origin);
        }
    }

    /**
     * Completion hook is not needed for CORS.
     */
    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op
    }

    #allows(origin: string): boolean {
        return this.#allowAnyOrigin || this.#allowedOrigins.includes(origin);
    }

    #attachAllowHeaders(res: ServerResponse, origin: string): void {
        // Echo the actual origin (never `*` with credentials); always Vary on
        // Origin so shared caches do not serve a cross-origin response.
        res.setHeader(ACCESS_CONTROL_ALLOW_ORIGIN.name, this.#allowAnyOrigin && !this.#allowCredentials ? '*' : origin);
        res.setHeader(VARY.name, 'Origin');
        if (this.#allowCredentials) {
            res.setHeader(ACCESS_CONTROL_ALLOW_CREDENTIALS.name, 'true');
        }
        if (this.#exposedHeaders.length > 0) {
            res.setHeader(ACCESS_CONTROL_EXPOSE_HEADERS.name, this.#exposedHeaders.join(', '));
        }
    }
}

/** Normalizes an origin for comparison: lowercase, trailing slash stripped. */
function normalizeOrigin(origin: string): string {
    return origin.trim().toLowerCase().replace(/\/+$/, '');
}

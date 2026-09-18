/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { PreHandleOutcome, RouteHandlerInterceptor } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Per-request security-header middleware shape — Helmet's own
 * `(req, res, next)` signature, usable without Express (AD-25 D1).
 */
type HeaderMiddleware = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void;

/**
 * Configuration for the security-headers interceptor.
 *
 * `headers` mirrors Helmet's option surface: each key accepts `false` to
 * disable that header, `true`/omitted for the framework default, or the
 * header's own option object. Construction validates (malformed options
 * throw a TypeError — Helmet's behavior, moved to bean startup).
 */
export interface SecurityHeadersInterceptorOptions {
    /**
     * Master switch: `false` sends no security headers at all.
     * Default: `true`.
     */
    enabled?: boolean;
    /**
     * Per-header configuration (see the interface doc). Omitted = the full
     * framework default set (AD-25 D3).
     */
    headers?: HelmetOptions;
}

/**
 * The framework's default CSP `connect-src`: Helmet's defaults admit
 * `'self'` only, and WebSocket `ws:`/`wss:` streams against the same origin
 * are not reliably covered by `'self'` (browser-divergent). Blue ships a
 * WebSocket server, so the default must not break it.
 */
const DEFAULT_CONNECT_SRC = ["'self'", 'ws:', 'wss:'];

/**
 * A {@link RouteHandlerInterceptor} that attaches the security-header set on
 * every HTTP response (AD-25): Helmet middlewares built at construction and
 * invoked against the route's `ServerResponse` in `preHandle`.
 *
 * - **Default-on via `NodeAutoConfiguration (the mapping prepends a default
 * instance, so every Node app gets the set without wiring) — the CORS
 * short-circuit and CSRF denial run after it, and the fallback chain covers
 * unmatched routes (404s and errors included).
 * - Never denies: always returns `true`; skips when no response is attached
 * (socket upgrades) or headers were already flushed.
 * - Error handling: middleware invocation failures propagate synchronously
 * and surface through the pipeline's normal error path; header-writing is
 * last-write-wins with app-level `setHeader` calls that run later.
 */
export class SecurityHeadersInterceptor implements RouteHandlerInterceptor {
    readonly #middlewares: HeaderMiddleware[];

    /**
     * @param options - Header configuration (see
     *   {@link SecurityHeadersInterceptorOptions}).
     */
    constructor(options: SecurityHeadersInterceptorOptions = {}) {
        if (options.enabled === false) {
            this.#middlewares = [];
            return;
        }
        const headers = options.headers ?? {};
        const middlewares: HeaderMiddleware[] = [];

        // Content-Security-Policy — the default deviates from Helmet's only
        // in `connect-src` (see DEFAULT_CONNECT_SRC); supplied directives
        // are the caller's full directive set unless they opt into
        // `useDefaults: true`.
        const csp = headers.contentSecurityPolicy;
        if (csp !== false) {
            middlewares.push(
                helmet.contentSecurityPolicy(
                    csp === true || csp === undefined
                        ? { useDefaults: true, directives: { 'connect-src': DEFAULT_CONNECT_SRC } }
                        : csp
                )
            );
        }

        const hsts = headers.strictTransportSecurity;
        if (hsts !== false) {
            middlewares.push(helmet.strictTransportSecurity(hsts === true || hsts === undefined ? undefined : hsts));
        }
        if (headers.xFrameOptions !== false) {
            middlewares.push(helmet.xFrameOptions());
        }
        if (headers.xContentTypeOptions !== false) {
            middlewares.push(helmet.xContentTypeOptions());
        }
        const referrer = headers.referrerPolicy;
        if (referrer !== false) {
            middlewares.push(helmet.referrerPolicy(referrer === true || referrer === undefined ? undefined : referrer));
        }
        const corp = headers.crossOriginResourcePolicy;
        if (corp !== false) {
            middlewares.push(
                helmet.crossOriginResourcePolicy(corp === true || corp === undefined ? undefined : corp)
            );
        }
        const coop = headers.crossOriginOpenerPolicy;
        if (coop !== false) {
            middlewares.push(helmet.crossOriginOpenerPolicy(coop === true || coop === undefined ? undefined : coop));
        }
        if (headers.originAgentCluster !== false) {
            middlewares.push(helmet.originAgentCluster());
        }
        const dnsPrefetch = headers.xDnsPrefetchControl;
        if (dnsPrefetch !== false) {
            middlewares.push(
                helmet.xDnsPrefetchControl(dnsPrefetch === true || dnsPrefetch === undefined ? undefined : dnsPrefetch)
            );
        }
        if (headers.xDownloadOptions !== false) {
            middlewares.push(helmet.xDownloadOptions());
        }
        const permitted = headers.xPermittedCrossDomainPolicies;
        if (permitted !== false) {
            middlewares.push(
                helmet.xPermittedCrossDomainPolicies(
                    permitted === true || permitted === undefined ? undefined : permitted
                )
            );
        }
        if (headers.xXssProtection !== false) {
            middlewares.push(helmet.xXssProtection());
        }
        if (headers.xPoweredBy !== false) {
            middlewares.push(helmet.xPoweredBy());
        }

        this.#middlewares = middlewares;
    }

    /**
     * Attaches the configured headers to the route's response (CORS-interceptor
     * idiom: response resolved from the route attributes). Skips when no
     * response is attached or the head was already flushed (e.g. socket
     * upgrades). Always allows the request through.
     */
    async preHandle(route: Route, _handler: object | undefined): Promise<PreHandleOutcome> {
        if (this.#middlewares.length === 0) {
            return true;
        }
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (!res || res.headersSent) {
            return true;
        }
        const request = getNodeRequest(route);
        if (!request) {
            return true;
        }
        // Helmet's middlewares type `req` as IncomingMessage but read nothing
        // off it under static directive configuration (no nonce/report
        // function directives) — the framework's normalized NodeRequest fills
        // the slot for signature compatibility.
        const req = request as unknown as IncomingMessage;
        for (const middleware of this.#middlewares) {
            middleware(req, res, () => undefined);
        }
        return true;
    }

    postHandle(): void | Promise<void> {
        // Header interceptor: nothing to finalize.
    }

    completeHandle(): void | Promise<void> {
        // Header interceptor: nothing to finalize (errors already carry the
        // headers — written in preHandle before any denial/failure path).
    }
}
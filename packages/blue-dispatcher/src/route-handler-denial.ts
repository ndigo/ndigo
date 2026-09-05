/**
 * Interceptor-denial contract: a {@link RouteHandlerInterceptor} may deny a
 * request with an explicit result instead of a bare `false`, so the platform
 * adapter can finalize a deterministic response (e.g. `401`/`403` on Node,
 * a redirect in the browser).
 *
 * Fail-closed: a bare `false` from `preHandle` maps to the platform's default
 * denial (Node: `403 Forbidden`); an explicit {@link InterceptorDenial}
 * carries its own status.
 *
 * @module
 * @since 1.0.0
 */

import { Route } from '@blue/router';

/**
 * The outcome of a denied `preHandle`. `statusCode` is the HTTP status the
 * platform adapter finalizes; `body` is a JSON-safe payload (never internal
 * detail); `redirect` optionally names a client-side redirect target.
 */
export interface InterceptorDenial {
    /** HTTP status code for the finalized denial response (default `403`). */
    readonly statusCode?: number;
    /** JSON-safe response body. Callers receive only this — never stack traces. */
    readonly body?: Record<string, unknown>;
    /** Optional redirect target for browser denials. */
    readonly redirect?: string;
}

/** Route attribute key under which a denial outcome is stored after denial. */
export const INTERCEPTOR_DENIAL_ATTRIBUTE = '__interceptor:denial';

/** Well-known denial statuses. */
export const DENIAL_STATUS = {
    /** Not authenticated. */
    UNAUTHENTICATED: 401,
    /** Authenticated but insufficient permission. */
    FORBIDDEN: 403,
} as const;

/**
 * Creates an explicit {@link InterceptorDenial}.
 *
 * @param statusCode - HTTP status for the finalized denial (`401`/`403`).
 * @param options - Body and redirect for the denial outcome.
 */
export function denialOf(
    statusCode: number,
    options: { body?: Record<string, unknown>; redirect?: string } = {}
): InterceptorDenial {
    return { statusCode, body: options.body, redirect: options.redirect };
}

/**
 * Stores a denial on the route so the platform adapter can finalize it.
 */
export function setInterceptorDenial(route: Route, denial: InterceptorDenial): void {
    route.attributes ??= {};
    route.attributes[INTERCEPTOR_DENIAL_ATTRIBUTE] = denial;
}

/**
 * Reads the denial stored on the route, if any.
 */
export function getInterceptorDenial(route: Route): InterceptorDenial | null {
    return (route.attributes?.[INTERCEPTOR_DENIAL_ATTRIBUTE] as InterceptorDenial | undefined) ?? null;
}

/**
 * Normalizes a `preHandle` outcome: `true` allows; `false` is the default
 * denial; an {@link InterceptorDenial} is an explicit denial (stored on the
 * route). Both denials return `false` for chain compatibility.
 */
export function resolvePreHandleOutcome(route: Route, outcome: boolean | InterceptorDenial): boolean {
    if (outcome === true) return true;
    if (outcome === false) return false;
    setInterceptorDenial(route, outcome);
    return false;
}

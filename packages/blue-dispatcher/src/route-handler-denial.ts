/**
 * Interceptor-denial contract: a {@link RouteHandlerInterceptor} may deny a.
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
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

/**
 * Route attribute key under which the `Allow` header value is stored when a
 * path resolves but the request method matches none of its handlers (RFC
 * 9110 §15.5.6). The platform adapter finalizes the response as `405 Method
 * Not Allowed` with this `Allow` value.
 */
export const METHOD_NOT_ALLOWED_ATTRIBUTE = '__mapping:methodNotAllowed';

/**
 * Records a method-mismatch on the route: the path exists but the request
 * method is not among the handlers' allowed methods.
 *
 * @param route - The route being resolved.
 * @param allow - The `Allow` header value (comma-separated methods).
 */
export function setMethodNotAllowed(route: Route, allow: string): void {
    route.attributes ??= {};
    route.attributes[METHOD_NOT_ALLOWED_ATTRIBUTE] = allow;
}

/**
 * Reads the recorded `Allow` value for a method-mismatch, if any.
 *
 * @param route - The resolved route.
 * @returns The `Allow` header value, or `null` when no method-mismatch occurred.
 */
export function getMethodNotAllowed(route: Route): string | null {
    return (route.attributes?.[METHOD_NOT_ALLOWED_ATTRIBUTE] as string | undefined) ?? null;
}

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

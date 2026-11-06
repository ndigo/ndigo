/**
 */
import type { Route } from '@ndigo/router';
import {
    type ModelAndView,
    type InterceptorDenial,
    type RouteHandlerInterceptor,
    type RouteHandlerMethod,
    denialOf,
} from '@ndigo/dispatcher';
import { getSymbolMetadata } from '@ndigo/core';
import { getNodeRequest } from './node-request';
import { HTTPHeaders } from '@ndigo/http';
import { type RateLimiter, type RateLimitPolicy, validateRateLimitPolicy } from '@ndigo/rate-limit';
import { ProblemTypes, writeProblem } from './problem-details';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Metadata key for `@rateLimit` — class-level under `RATE_LIMIT_KEY`,
 * method-level under `${RATE_LIMIT_KEY}:<methodName>` (method wins).
 */
export const RATE_LIMIT_KEY = 'rate:limit';

/**
 * Declares a rate-limit policy for a class or method (passive metadata —
 * enforcement is {@link RateLimitInterceptor}, default-on in the node
 * platform mapping since Wave 3 / SEC-6).
 *
 * ```ts
 * @postMapping('/login')
 * @rateLimit({ limit: 5, windowMs: 60_000 })
 * async login(credentials: unknown) { … }
 * ```
 *
 * The policy is validated at decoration time (fail loud at definition).
 */
export function rateLimit(options: RateLimitPolicy) {
    validateRateLimitPolicy(options, '@rateLimit');
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        const kind = context.kind;
        if (kind !== 'class' && kind !== 'method') {
            throw new TypeError(`@rateLimit can only be applied to a class or method — received '${kind}'.`);
        }
        context.metadata[kind === 'class' ? RATE_LIMIT_KEY : `${RATE_LIMIT_KEY}:${String(context.name)}`] = options;
    };
}

/**
 * Enforces `@rateLimit` policies (SEC-6): a fixed-window budget per client
 * key, denied as **429 + `Retry-After`** problem documents.
 *
 * - **Key**: `NodeRequest.remoteAddress` — the socket peer unless the
 *   direct connection matches the adapter's `trustedProxies` allowlist
 *   (`NDIGO_TRUSTED_PROXIES` env; see node-request.ts:35 and guide 11
 *   §9): then `X-Forwarded-For` is walked rightmost-first and the first
 *   non-trusted valid IP wins, so spoofed leftmost values can never win;
 *   with no trusted proxies configured the socket peer is used.
 *   Requests without an address share the `'unknown'` key (fail-safe:
 *   they can never bypass a budget, only share one).
 * - **Opt-in**: handlers without `@rateLimit` metadata are untouched —
 *   the interceptor is a metadata gate, so registering it on the default
 *   mapping changes no existing route's behavior.
 */
export class RateLimitInterceptor implements RouteHandlerInterceptor {
    readonly #limiter: RateLimiter;

    constructor(limiter: RateLimiter) {
        this.#limiter = limiter;
    }

    async preHandle(route: Route, handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const policy = this.#policyFor(handler);
        if (!policy) return true;

        const request = getNodeRequest(route);
        const key = request?.remoteAddress ?? 'unknown';
        const result = await this.#limiter.consume(key, policy);
        if (result.allowed) return true;

        this.#reject(route, result.retryAfterMs);
        return denialOf(429, { body: { error: 'Too Many Requests' } });
    }

    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op — rate limiting is a pre-handler concern.
    }

    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op.
    }

    /**
     * Reads `@rateLimit` metadata: method-level policy wins over
     * class-level; none → `undefined` (allow).
     */
    #policyFor(handler: object | undefined): RateLimitPolicy | undefined {
        const methodHandler = handler as RouteHandlerMethod | undefined;
        const metadata: Record<string, unknown> = getSymbolMetadata(methodHandler?.handler);
        const methodName: string | null = typeof methodHandler?.method === 'string' ? methodHandler.method : null;

        const methodPolicy = methodName
            ? (metadata[`${RATE_LIMIT_KEY}:${methodName}`] as RateLimitPolicy | undefined)
            : undefined;
        if (methodPolicy) return methodPolicy;
        return (metadata[RATE_LIMIT_KEY] as RateLimitPolicy | undefined) ?? undefined;
    }

    /**
     * Writes the 429 problem document with `Retry-After` (seconds) and
     * ends the response — the platform denial finalizer skips ended
     * responses, so the header survives.
     */
    #reject(route: Route, retryAfterMs: number): void {
        const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.writableEnded && !res.destroyed) {
            writeProblem(
                res,
                {
                    type: ProblemTypes.rateLimited,
                    title: 'Too Many Requests',
                    status: 429,
                    detail: `Rate limit exceeded — retry in ${seconds} second${seconds === 1 ? '' : 's'}`,
                },
                { [String(HTTPHeaders.RETRY_AFTER)]: String(seconds) }
            );
        }
    }
}

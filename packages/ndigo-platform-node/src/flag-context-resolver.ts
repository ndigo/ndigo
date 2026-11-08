/**
 * The flag targeting-context seam (AD-87 companion): the
 * `FLAG_CONTEXT_RESOLVER` bean builds the `FlagEvaluationContext` for a
 * `@whenFeature` gate check. The platform default resolves the session-bag
 * principal when one is present, falling back to the client address; apps
 * register their own resolver for tenant/attribute targeting from anywhere
 * else in the request.
 */
import { likePrincipal } from '@ndigo/auth-core';
import type { FlagEvaluationContext } from '@ndigo/flags';
import type { Route } from '@ndigo/router';
import { createHash } from 'node:crypto';
import { getNodeRequest } from './node-request';

/**
 * Builds the `FlagEvaluationContext` for a request's flag evaluation.
 * Implementations run on the request path: keep them synchronous and
 * side-effect-free.
 */
export interface FlagEvaluationContextResolver {
    /**
     * Resolves the evaluation context for a route.
     *
     * @param route - The route being gated.
     * @returns The context, or `undefined` for no targeting (percentage
     *   rollouts stay closed for untargeted requests).
     */
    resolve(route: Route): FlagEvaluationContext | undefined;
}

/**
 * The client-address resolver: targeting key = the `NodeRequest`'s
 * `remoteAddress` — the AD-37 trusted-proxy-resolved client IP, the same
 * key the rate limiter uses. An absent address yields no context.
 */
export class ClientAddressFlagContextResolver implements FlagEvaluationContextResolver {
    /**
     * Resolves the flag context from the trusted client address.
     *
     * @param route - The current route.
     * @returns The evaluation context, or `undefined`.
     */
    resolve(route: Route): FlagEvaluationContext | undefined {
        const address = getNodeRequest(route)?.remoteAddress;
        if (typeof address !== 'string' || address === '') return undefined;
        // Hash the client address before it becomes a targeting key: the key is
        // forwarded to (possibly third-party) flag providers, and a raw IP is
        // personal data under GDPR/CCPA. Hashing keeps per-IP bucketing stable
        // without leaking the address. (AD-87 companion)
        const hashed = createHash('sha256').update(address).digest('hex');
        return { targetingKey: `ip:${hashed}` };
    }
}

/**
 * The platform default (`FLAG_CONTEXT_RESOLVER`): the **session principal**
 * when one is present, otherwise {@link ClientAddressFlagContextResolver}.
 *
 * The principal is read from `NodeRequest.session['principal']` — the bag
 * a session/identity interceptor fills before dispatch — so it is visible
 * only when that interceptor runs **before** the feature gate. Pipelines
 * that restore sessions after the platform's gate simply keep address
 * targeting; apps that want principal targeting move their session
 * interceptor ahead of the gate or register their own resolver.
 *
 * Targeting key = `principal.id`: a stable identity is a better rollout
 * bucket than the network address. Attributes carry the principal's roles
 * for provider targeting.
 */
export class SessionPrincipalFlagContextResolver implements FlagEvaluationContextResolver {
    readonly #fallback: FlagEvaluationContextResolver;

    /**
     * @param fallback - The resolver used when no principal is available
     *   (default: {@link ClientAddressFlagContextResolver}).
     */
    constructor(fallback: FlagEvaluationContextResolver = new ClientAddressFlagContextResolver()) {
        this.#fallback = fallback;
    }

    /**
     * Resolves the flag context from the session principal, falling back to
     * the client address.
     *
     * @param route - The current route.
     * @returns The evaluation context.
     */
    resolve(route: Route): FlagEvaluationContext | undefined {
        const principal = getNodeRequest(route)?.session?.['principal'];
        if (likePrincipal(principal)) {
            return { targetingKey: principal.id, attributes: { roles: [...principal.roles] } };
        }
        return this.#fallback.resolve(route);
    }
}
